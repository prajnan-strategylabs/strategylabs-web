import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

/**
 * New Supabase key naming (sb_publishable_...) is preferred.
 * We also accept VITE_SUPABASE_ANON_KEY as a fallback so older deployments
 * keep working — but new setups should use VITE_SUPABASE_PUBLISHABLE_KEY.
 */
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY        as string | undefined);

/**
 * `supabase` is null when env vars are missing — the UI degrades gracefully
 * (waitlist falls back to localStorage in dev). Production builds log an error.
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

if (!supabaseReady && import.meta.env.PROD) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in production build.",
  );
}
