import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiTrackPageView, type PageViewPayload } from "../lib/api";

const VISITOR_ID_KEY = "sl_analytics_visitor_id";
const SESSION_ID_KEY = "sl_analytics_session_id";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStoredId(storage: Storage, key: string): string {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = createId();
    storage.setItem(key, created);
    return created;
  } catch {
    return createId();
  }
}

function getReferrerOrigin(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? undefined : referrer.origin;
  } catch {
    return undefined;
  }
}

function getUtmParams(): Record<string, string> | undefined {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = params.get(key)?.trim();
      return value ? [[key, value]] : [];
    })
  );
  return Object.keys(utm).length ? utm : undefined;
}

export function AnalyticsTracker() {
  const location = useLocation();
  const lastTrackedRoute = useRef<string>();

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || navigator.doNotTrack === "1") return;

    const routeKey = `${location.pathname}${location.search}`;
    if (lastTrackedRoute.current === routeKey) return;
    lastTrackedRoute.current = routeKey;

    const payload: PageViewPayload = {
      visitor_id: getStoredId(window.localStorage, VISITOR_ID_KEY),
      session_id: getStoredId(window.sessionStorage, SESSION_ID_KEY),
      path: location.pathname,
      title: document.title || undefined,
      referrer: getReferrerOrigin(),
      utm: getUtmParams(),
    };

    void apiTrackPageView(payload).catch(() => {
      // Analytics must never interrupt the visitor's experience.
    });
  }, [location.pathname, location.search]);

  return null;
}
