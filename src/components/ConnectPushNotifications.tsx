import { useEffect, useState } from "react";
import { Bell, Check, Pause, Play, AlertCircle, Loader2, Smartphone } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  apiGetPushStatus,
  apiSetPushPaused,
  type PushStatus,
} from "../lib/api";
import { initPushNotifications } from "../lib/push";
import { Pill } from "./MobileUI";

const TIER_ORDER = ["free", "trader", "auto"] as const;

function tierAtLeast(userTier: string, minTier: string): boolean {
  return TIER_ORDER.indexOf(userTier as any) >= TIER_ORDER.indexOf(minTier as any);
}

async function getToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function ConnectPushNotifications() {
  const { user, isSandbox } = useAuth();
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isSandbox) {
        if (!cancelled) setLoading(false);
        return;
      }
      const token = await getToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const s = await apiGetPushStatus(token);
        if (!cancelled) {
          setStatus(s);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isSandbox]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 flex items-center gap-2 text-[12px] text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking push notification status…
      </div>
    );
  }

  // Web build — push notifications only exist on the native app
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-none"
          style={{ background: "rgba(34,211,170,0.15)", color: "var(--accent)" }}
        >
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="text-[12px] text-ink-muted">
          <div className="font-bold text-ink text-[13px] mb-0.5">Push notifications</div>
          Install the Strategy Labs Android app to get every V22 entry and exit pushed straight to your phone.
        </div>
      </div>
    );
  }

  if (isSandbox || !user) {
    return (
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-none"
          style={{ background: "rgba(34,211,170,0.15)", color: "var(--accent)" }}
        >
          <Bell className="h-4 w-4" />
        </div>
        <div className="text-[12px] text-ink-muted">
          <div className="font-bold text-ink text-[13px] mb-0.5">Push notifications</div>
          Sign in to get every V22 entry and exit pushed to this device.
        </div>
      </div>
    );
  }

  const userTier = user.tier;
  const minTier = status?.signal_min_tier ?? "trader";
  const hasAccess = tierAtLeast(userTier, minTier);
  const registered = !!status?.is_registered;
  const enabled = !!status?.enabled;

  async function enablePush() {
    setBusy(true);
    setError(null);
    try {
      await initPushNotifications();
      const token = await getToken();
      if (token) setStatus(await apiGetPushStatus(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enable push notifications");
    } finally {
      setBusy(false);
    }
  }

  async function togglePause() {
    if (!status) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const res = await apiSetPushPaused(token, !status.enabled);
      setStatus({ ...status, enabled: res.enabled });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        borderColor: registered ? "rgba(34,211,170,0.30)" : "var(--line)",
        background: registered
          ? "linear-gradient(135deg, rgba(34,211,170,0.07), rgba(34,211,170,0.01))"
          : "rgba(15,21,37,0.30)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-none"
          style={{
            background: registered ? "rgba(34,211,170,0.18)" : "rgba(34,211,170,0.10)",
            color: "var(--accent)",
          }}
        >
          {registered ? <Check className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-[13px]">Push notifications</div>
            {registered && enabled && (
              <Pill tone="accent">
                <Bell className="h-[9px] w-[9px]" /> live
              </Pill>
            )}
            {registered && !enabled && <Pill tone="warn">paused</Pill>}
            {!registered && hasAccess && <Pill>not enabled</Pill>}
            {!hasAccess && <Pill tone="warn">{minTier}+ plan</Pill>}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            {registered
              ? "You'll get a phone notification the moment a V22 signal opens or closes."
              : hasAccess
                ? "Get an instant phone notification every time a V22 signal opens or closes."
                : (
                  <>
                    Available on {minTier.charAt(0).toUpperCase() + minTier.slice(1)} plan and above.
                    Upgrade to unlock push alerts.
                  </>
                )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border px-3 py-2 flex items-start gap-2 text-[11px]"
             style={{ borderColor: "rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.04)" }}>
          <AlertCircle className="h-3.5 w-3.5 flex-none mt-0.5" style={{ color: "#fda4af" }} />
          <span className="text-ink-muted">{error}</span>
        </div>
      )}

      {hasAccess && !registered && (
        <button
          onClick={enablePush}
          disabled={busy}
          className="w-full h-10 rounded-xl font-bold text-[12px] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
          {busy ? "Requesting permission…" : "Enable push notifications"}
        </button>
      )}
      {hasAccess && registered && (
        <button
          onClick={togglePause}
          disabled={busy}
          className="w-full h-10 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[12px] flex items-center justify-center gap-1.5 text-ink-muted hover:text-ink active:scale-[0.98] transition disabled:opacity-50"
        >
          {enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {enabled ? "Pause" : "Resume"}
        </button>
      )}
    </div>
  );
}
