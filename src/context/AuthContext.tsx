import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase";

export type UserTier = "free" | "explorer" | "trader" | "pro" | "auto";

export interface AppUser {
  id: string;
  email: string;
  display_name?: string;
  tier: UserTier;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isSandbox: boolean;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateSandboxTier: (tier: UserTier) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);

  // Helper to fetch user tier from profile table
  const fetchUserTier = async (userId: string, email: string): Promise<AppUser> => {
    try {
      if (supabaseReady && supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", userId)
          .single();

        if (!error && data) {
          return { id: userId, email, tier: data.tier as UserTier };
        }
      }
    } catch {
      // ignore profiles error, default to free
    }
    return { id: userId, email, tier: "free" };
  };

  useEffect(() => {
    // Check if the URL hash contains a Supabase auth error
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
      return;
    }

    // Set up real Supabase auth state change listener
    const getSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session?.user) {
        // Optimistic set + background tier fetch (same pattern as the listener)
        setUser({ id: session.user.id, email: session.user.email || "", tier: "free" });
        setLoading(false);
        void fetchUserTier(session.user.id, session.user.email || "").then((appUser) => {
          setUser(appUser);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      // CRITICAL: do NOT make this callback async or await anything heavy here.
      // Supabase JS awaits its subscribers, so a slow callback (e.g. a stalled
      // `profiles` query) deadlocks setSession / verifyOtp.
      if (session?.user) {
        // Optimistically set the user from session data — fetchUserTier runs
        // in the background to upgrade the tier from "free" once profiles loads.
        setUser({ id: session.user.id, email: session.user.email || "", tier: "free" });
        setLoading(false);
        void fetchUserTier(session.user.id, session.user.email || "").then((appUser) => {
          setUser(appUser);
        });
      } else {
        setUser(null);
        setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, isSandbox, signIn, verifyOtp, signOut, updateSandboxTier }}>
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
