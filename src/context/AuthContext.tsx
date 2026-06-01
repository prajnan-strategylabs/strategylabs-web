import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase";
import { clearWaitlistCache } from "../lib/useWaitlistStatus";
import { configurePurchases, determineActiveTier, addSubscriptionListener, tierFromCustomerInfo } from "../lib/purchases";

export type UserTier = "free" | "trader" | "auto";

export interface AppUser {
  id: string;
  email: string;
  display_name?: string;
  tier: UserTier;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  /** True once we've either confirmed the user's tier from `profiles` or
   *  hydrated it from localStorage. Until this is true, gated pages should
   *  show a placeholder rather than committing to render either the gate
   *  or the real content. */
  tierResolved: boolean;
  isSandbox: boolean;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateSandboxTier: (tier: UserTier) => void;
  updateDisplayName: (displayName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ────────────────────────────────────────────────────────────────────────
   Tier cache (localStorage)
   Keyed by user_id so multi-account sessions stay isolated. Lets returning
   users hydrate with their real tier on first paint — no "free" flash.
   ──────────────────────────────────────────────────────────────────────── */
const TIER_CACHE_KEY = (uid: string) => `sl_tier_${uid}`;
function readCachedTier(uid: string): UserTier | null {
  try {
    const raw = window.localStorage.getItem(TIER_CACHE_KEY(uid));
    if (!raw) return null;
    if (raw === "free" || raw === "trader" || raw === "auto") {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}
function writeCachedTier(uid: string, tier: UserTier): void {
  try {
    window.localStorage.setItem(TIER_CACHE_KEY(uid), tier);
  } catch {
    /* private mode / quota — fine to skip */
  }
}
function normalizeTier(tier: unknown): UserTier {
  return tier === "trader" || tier === "auto" ? tier : "free";
}
function clearAllTierCache(): void {
  try {
    const toClear: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("sl_tier_")) toClear.push(k);
    }
    toClear.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierResolved, setTierResolved] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);

  // --- RevenueCat Capacitor Integration ---
  useEffect(() => {
    if (!user || isSandbox) return;
    
    // 1. Initialize RevenueCat Purchases SDK
    void configurePurchases(user.id);
    
    // 2. Initial entitlement check
    void determineActiveTier().then((activeTier) => {
      const targetTier = activeTier !== "free" ? activeTier : (user.tier === "trader" || user.tier === "auto") ? "free" : user.tier;
      if (user.tier !== targetTier) {
        setUser((prev) => prev ? { ...prev, tier: targetTier as UserTier } : null);
        if (supabaseReady && supabase) {
          void supabase
            .from("profiles")
            .update({ tier: targetTier })
            .eq("id", user.id)
            .then(({ error }) => {
              if (!error) writeCachedTier(user.id, targetTier as UserTier);
            });
        }
      }
    });

    // 3. Register real-time CustomerInfo changes listener
    const unsubscribe = addSubscriptionListener((customerInfo) => {
      const targetTier = tierFromCustomerInfo(customerInfo);
      
      setUser((prev) => {
        if (!prev) return null;
        if (prev.tier !== targetTier) {
          // Sync to Supabase database profiles table
          if (supabaseReady && supabase) {
            void supabase
              .from("profiles")
              .update({ tier: targetTier })
              .eq("id", prev.id)
              .then(({ error }) => {
                if (error) {
                  console.error("Failed to sync tier to Supabase profiles:", error);
                } else {
                  console.log("Successfully synced tier to Supabase profiles:", targetTier);
                  writeCachedTier(prev.id, targetTier as UserTier);
                }
              });
          }
          return { ...prev, tier: targetTier as UserTier };
        }
        return prev;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, isSandbox]);  // Helper to fetch user tier and display_name from profile table. Writes to cache on success.
  const fetchUserTier = async (userId: string, email: string): Promise<AppUser> => {
    try {
      if (supabaseReady && supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("tier, display_name")
          .eq("id", userId)
          .single();

        if (!error && data) {
          const tier = normalizeTier(data.tier);
          const display_name = data.display_name || undefined;
          writeCachedTier(userId, tier);
          if (display_name) {
            window.localStorage.setItem(`sl_name_${userId}`, display_name);
          } else {
            window.localStorage.removeItem(`sl_name_${userId}`);
          }
          return { id: userId, email, tier, display_name };
        }
      }
    } catch {
      // ignore profiles error, default to free
    }
    return { id: userId, email, tier: "free" };
  };

  useEffect(() => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const errorCode = hashParams.get("error_code");
      const errorMsg = hashParams.get("error_description");
      
      if (errorCode || errorMsg) {
        // Clear hash from history
        window.history.replaceState(null, "", window.location.pathname);
        // Redirect back to login with query strings
        const redirectUrl = `/login?error=${encodeURIComponent(errorCode || "auth_failure")}&desc=${encodeURIComponent(errorMsg || "Authentication failed")}`;
        window.location.href = redirectUrl;
        return;
      }
    }

    if (!supabaseReady || !supabase) {
      // Sandbox fallback in local dev when Supabase keys are missing
      setIsSandbox(true);
      setUser({
        id: "sandbox-usr-99",
        email: "sandbox@strategylabs.trade",
        display_name: "Lab Sandbox Mode",
        tier: "free", // Default to Free tier
      });
      setLoading(false);
      setTierResolved(true);
      return;
    }

    // Helper: hydrate the user state with the best tier we know about — cached
    // first (so returning users skip the optimistic "free" flash), then fall
    // back to "free" for first-timers. Either way, always trigger a background
    // refresh from the profiles table so the cache stays accurate.
    const hydrateFromSession = (sessionUser: { id: string; email?: string | null }) => {
      const uid = sessionUser.id;
      const email = sessionUser.email || "";
      const cachedTier = readCachedTier(uid);
      const cachedName = window.localStorage.getItem(`sl_name_${uid}`) || undefined;
      if (cachedTier) {
        // Returning user — render with the real tier immediately
        setUser({ id: uid, email, tier: cachedTier, display_name: cachedName });
        setTierResolved(true);
      } else {
        // First-time on this device — fall back to "free", keep tierResolved
        // false so gated pages show a placeholder until the real fetch returns
        setUser({ id: uid, email, tier: "free", display_name: cachedName });
        setTierResolved(false);
      }
      setLoading(false);
      void fetchUserTier(uid, email).then((appUser) => {
        setUser(appUser);
        setTierResolved(true);
      });
    };

    // Set up real Supabase auth state change listener
    const getSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session?.user) {
        hydrateFromSession(session.user);
      } else {
        setUser(null);
        setLoading(false);
        setTierResolved(true); // no user → nothing to resolve
      }
    };

    getSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      // CRITICAL: do NOT make this callback async or await anything heavy here.
      // Supabase JS awaits its subscribers, so a slow callback (e.g. a stalled
      // `profiles` query) deadlocks setSession / verifyOtp.
      if (session?.user) {
        hydrateFromSession(session.user);
      } else {
        setUser(null);
        setLoading(false);
        setTierResolved(true);
      }
    });

    // Defensive cross-tab sync: when ANY tab writes the Supabase session to
    // localStorage, re-pull the session in this tab. Supabase's internal
    // BroadcastChannel sync sometimes misses, especially during hot reloads.
    const onStorage = (e: StorageEvent) => {
      // Supabase stores sessions under keys like "sb-<project-ref>-auth-token"
      if (e.key && e.key.startsWith("sb-") && e.key.endsWith("-auth-token")) {
        // eslint-disable-next-line no-console
        console.log("[auth] storage event detected — refreshing session");
        void getSession();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const signIn = async (email: string): Promise<{ error: Error | null }> => {
    if (isSandbox) {
      setUser({
        id: "sandbox-usr-99",
        email: email.trim().toLowerCase(),
        display_name: "Lab Sandbox User",
        tier: "free",
      });
      return { error: null };
    }

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          // Email template appends "/login?token_hash=…&type=…" itself, so
          // .RedirectTo must be ORIGIN ONLY (no /login suffix).
          // First-time emails get the "Confirm signup" template (type=signup);
          // subsequent emails get the "Magic link or OTP" template (type=magiclink).
          // Both customized to use the same token_hash flow.
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error ? new Error(error.message) : null };
    }

    return { error: new Error("Auth system not ready.") };
  };

  const verifyOtp = async (email: string, token: string): Promise<{ error: Error | null }> => {
    if (isSandbox) {
      if (token.trim() === "123456" || token.trim() === "654321") {
        setUser({
          id: "sandbox-usr-99",
          email: email.trim().toLowerCase(),
          display_name: "Lab Sandbox User",
          tier: "free",
        });
        return { error: null };
      }
      return { error: new Error("Invalid code. In Sandbox dev mode, use '123456' as code.") };
    }

    if (supabase) {
      // In modern Supabase JS v2, 'email' is the standard type for verifying 6-digit numeric OTP codes.
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });
      return { error: error ? new Error(error.message) : null };
    }

    return { error: new Error("Auth system not ready.") };
  };

  const signOut = async () => {
    // Drop cached SWR state so the next signed-in user doesn't inherit it
    clearWaitlistCache();
    clearAllTierCache();
    if (isSandbox) {
      setUser(null);
      return;
    }
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  // Handy dev utility to dynamically toggle tier behaviors
  const updateSandboxTier = (tier: UserTier) => {
    if (user) {
      setUser({ ...user, tier });
    }
  };

  const updateDisplayName = (displayName: string) => {
    if (user) {
      setUser({ ...user, display_name: displayName });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, tierResolved, isSandbox, signIn, verifyOtp, signOut, updateSandboxTier, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
