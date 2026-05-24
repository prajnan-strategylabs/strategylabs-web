import { useEffect, useState } from "react";
import { apiGetConfig } from "./api";

export type AppConfig = {
  is_launched: boolean;
  waitlist_full: boolean;
};

const DEFAULT: AppConfig = { is_launched: false, waitlist_full: false };

let cached: AppConfig | null = null;
let inflight: Promise<AppConfig> | null = null;

async function fetchOnce(): Promise<AppConfig> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await apiGetConfig();
      cached = {
        is_launched: !!(res as AppConfig).is_launched,
        waitlist_full: !!(res as AppConfig).waitlist_full,
      };
      return cached;
    } catch {
      // Fail-safe: never block the UI on a backend hiccup
      return DEFAULT;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Returns the global app config (is_launched, waitlist_full).
 * Cached process-wide so multiple components reading it = one network call.
 */
export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(cached || DEFAULT);

  useEffect(() => {
    let cancelled = false;
    void fetchOnce().then((c) => {
      if (!cancelled) setConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
