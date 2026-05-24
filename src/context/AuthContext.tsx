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
        const appUser = await fetchUserTier(session.user.id, session.user.email || "");
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser = await fetchUserTier(session.user.id, session.user.email || "");
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
          emailRedirectTo: window.location.origin,
        },
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
    <AuthContext.Provider value={{ user, loading, isSandbox, signIn, signOut, updateSandboxTier }}>
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
