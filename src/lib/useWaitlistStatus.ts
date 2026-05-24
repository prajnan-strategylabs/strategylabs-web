import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { apiGetWaitlistStatus, type WaitlistMeResponse } from "./api";

export type WaitlistStatus =
  | { state: "loading" }
  | { state: "error"; error: string }
  | { state: "ok"; data: WaitlistMeResponse };

/**
 * Fetches the logged-in user's waitlist status from the backend.
 * Returns { state, data?, error? } so the UI can show loading / gated / approved.
 */
export function useWaitlistStatus(): WaitlistStatus {
  const [status, setStatus] = useState<WaitlistStatus>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) {
        // Dev sandbox without Supabase configured — pretend everyone is on the list
        if (!cancelled) setStatus({ state: "ok", data: { on_waitlist: true, position: 1, source: "sandbox" } });
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        if (!cancelled) setStatus({ state: "error", error: "Not authenticated" });
        return;
      }

      try {
        const res = await apiGetWaitlistStatus(token);
        if (!cancelled) setStatus({ state: "ok", data: res });
      } catch (err) {
        if (!cancelled) {
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
