import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A missing Supabase client makes AuthContext boot into its "local dev sandbox"
// fallback (fake sandbox-usr-99, no real login, tier locked to free) — see
// AuthContext.tsx's supabaseReady check. That's correct for `npm run dev` with
// no env file, but it silently produced a live-shippable OTA bundle once: this
// same repo was built and `publish:ota`'d from a worktree whose `.env.local`
// had these left blank on purpose for local design review, and every device
// that installed that bundle woke up sandboxed. No store review catches an OTA
// build the way it would a native release, so a silent bad default here reaches
// real devices directly.
//
// The publishable key is meant to be public (that's what "publishable" means —
// same trust model as a Stripe publishable key; Supabase's own RLS policies are
// the actual security boundary, not key secrecy), so — mirroring API_BASE's
// existing PROD fallback in src/lib/api.ts — production builds fall back to the
// real project instead of silently degrading to sandbox mode. Local dev without
// a `.env.local` still gets the sandbox (import.meta.env.PROD is false then).
const PROD_SUPABASE_URL = "https://oipgxivmfhmcsfazdbgp.supabase.co";
const PROD_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_h6kP-anZ1EkWpXqHfBrePQ_jNxFmaJO";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.PROD ? PROD_SUPABASE_URL : undefined);

/**
 * New Supabase key naming (sb_publishable_...) is preferred.
 * We also accept VITE_SUPABASE_ANON_KEY as a fallback so older deployments
 * keep working — but new setups should use VITE_SUPABASE_PUBLISHABLE_KEY.
 */
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY        as string | undefined) ||
  (import.meta.env.PROD ? PROD_SUPABASE_PUBLISHABLE_KEY : undefined);

/**
 * `supabase` is null when env vars are missing — the UI degrades gracefully
 * (waitlist falls back to localStorage in dev).
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const supabaseReady = supabase !== null;
