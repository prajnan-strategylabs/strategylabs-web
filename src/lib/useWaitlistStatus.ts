import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { apiGetWaitlistStatus, type WaitlistMeResponse } from "./api";

export type WaitlistStatus =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "ok"; data: WaitlistMeResponse };

/* ────────────────────────────────────────────────────────────────────────
   Stale-while-revalidate cache.

   Why: the waitlist status doesn't change on every SPA route change. Without
   caching, navigating from /dashboard → /signals → /lab unmounts/remounts
   <WaitlistGate>, which re-fires the network call and briefly shows the
   loading spinner each time — a perceptible flicker.

   Strategy:
     1. Mount → return cached value instantly (no spinner)
     2. If cache is fresh (≤ TTL), skip the network call entirely
     3. Otherwise revalidate in the background, write to cache + state
     4. On error, keep showing cached data (don't downgrade UX on transient
        backend hiccups)

   Cache is keyed by user_id so a different signed-in user gets their own
   cached state, and a sign-out + sign-in-as-different-user works cleanly.
   ──────────────────────────────────────────────────────────────────────── */

type Cached = { data: WaitlistMeResponse; cachedAt: number };

const TTL_MS = 5 * 60 * 1000;   // re-fetch in background past this
const STORAGE_KEY = (uid: string) => `sl_wl_status_${uid}`;

// SPA-lifetime cache, primed from localStorage on first read.
const memCache = new Map<string, Cached>();

function readCache(uid: string): Cached | null {
  const mem = memCache.get(uid);
  if (mem) return mem;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (
      typeof parsed?.cachedAt !== "number" ||
      typeof parsed?.data !== "object"
    ) {
      return null;
    }
    memCache.set(uid, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(uid: string, data: WaitlistMeResponse) {
  const entry: Cached = { data, cachedAt: Date.now() };
  memCache.set(uid, entry);
  try {
    window.localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(entry));
  } catch {
    /* quota or private mode — fall through to in-memory only */
  }
}

/** Call from AuthContext.signOut() to drop any cached waitlist state. */
export function clearWaitlistCache(uid?: string): void {
  if (uid) {
    memCache.delete(uid);
    try {
      window.localStorage.removeItem(STORAGE_KEY(uid));
    } catch {
      /* ignore */
    }
    return;
  }
  memCache.clear();
  try {
    const toClear: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("sl_wl_status_")) toClear.push(k);
    }
    toClear.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/**
 * Fetches the logged-in user's waitlist status from the backend.
 * Returns { state, data?, error? } so the UI can show loading / gated / approved.
 * Stale-while-revalidate: cached results render instantly on route changes.
 */
export function useWaitlistStatus(): WaitlistStatus {
  const [status, setStatus] = useState<WaitlistStatus>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) {
        // Dev sandbox without Supabase — pretend everyone is on the list
        if (!cancelled) {
          setStatus({
            state: "ok",
            data: { on_waitlist: true, position: 1, source: "sandbox" },
          });
        }
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const uid = sessionData.session?.user?.id;
      if (!token || !uid) {
        if (!cancelled) {
          setStatus({ state: "error", error: "Not authenticated" });
        }
        return;
      }

      // 1) Serve cached value immediately if we have one
      const cached = readCache(uid);
      if (cached && !cancelled) {
        setStatus({ state: "ok", data: cached.data });
        // Fresh cache → skip revalidation entirely
        if (Date.now() - cached.cachedAt < TTL_MS) return;
      }

      // 2) Revalidate in the background
      try {
        const res = await apiGetWaitlistStatus(token);
        if (cancelled) return;
        writeCache(uid, res);
        setStatus({ state: "ok", data: res });
      } catch (err) {
        // Only surface the error if we have no cache to fall back on —
        // otherwise stay on the stale-but-valid data.
        if (cancelled) return;
        if (!cached) {
          setStatus({
            state: "error",
            error: err instanceof Error ? err.message : "Could not check waitlist status.",
          });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
