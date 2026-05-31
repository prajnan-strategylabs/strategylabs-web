import { useEffect, useState } from "react";
import { Bell, Check, Pause, Play, Send, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  apiGetTelegramStatus,
  apiCreateTelegramLink,
  apiSetTelegramPaused,
  apiUnlinkTelegram,
  type TelegramStatus,
} from "../lib/api";
import { Pill } from "./MobileUI";

const TIER_ORDER = ["free", "explorer", "trader", "pro", "auto"] as const;

function tierAtLeast(userTier: string, minTier: string): boolean {
  return TIER_ORDER.indexOf(userTier as any) >= TIER_ORDER.indexOf(minTier as any);
}

/** Returns the access token for the signed-in user, or null in sandbox/dev. */
async function getToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function ConnectTelegram() {
  const { user, isSandbox } = useAuth();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load — and re-poll every 5s while a link is in progress (waiting
  // for the user to hit /start in Telegram).
  const [polling, setPolling] = useState(false);

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
        const s = await apiGetTelegramStatus(token);
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
    if (polling) {
      const id = window.setInterval(load, 5000);
      return () => {
        cancelled = true;
        window.clearInterval(id);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [polling, isSandbox]);

  // Stop polling once we see verification land
  useEffect(() => {
    if (status?.is_linked && polling) setPolling(false);
  }, [status?.is_linked, polling]);

  // Don't render anything until we know
  if (loading) {
    return (
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 flex items-center gap-2 text-[12px] text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking Telegram link…
      </div>
    );
  }

  // Sandbox / no auth — show a teaser instead of breaking the page
  if (isSandbox || !user) {
    return (
      <div className="rounded-2xl border border-line/60 bg-bg-card/30 p-4 flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-none"
          style={{ background: "rgba(34,211,170,0.15)", color: "var(--accent)" }}
        >
          <Send className="h-4 w-4" />
        </div>
        <div className="text-[12px] text-ink-muted">
          <div className="font-bold text-ink text-[13px] mb-0.5">
            Telegram signal alerts
          </div>
          Sign in to link your Telegram and get every V22 entry pushed to your phone.
        </div>
      </div>
    );
  }

  const userTier = user.tier;
  const rawMinTier = status?.signal_min_tier ?? "trader";
  const minTier = rawMinTier === "explorer" ? "trader" : rawMinTier;
  const hasAccess = tierAtLeast(userTier, minTier);
  const linked = !!status?.is_linked;
  const enabled = !!status?.enabled;

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const link = await apiCreateTelegramLink(token);
      // Open in a new tab so the desktop user can scan a QR or click; mobile
      // users get bounced into the Telegram app via deep-link.
      window.open(link.url, "_blank", "noopener,noreferrer");
      // Start polling for verification — webhook will flip is_linked when
      // the user runs /start in the bot.
      setPolling(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start linking");
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
      const res = await apiSetTelegramPaused(token, !status.enabled);
      setStatus({ ...status, enabled: res.enabled });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      await apiUnlinkTelegram(token);
      setStatus({
        ...(status ?? ({} as TelegramStatus)),
        is_linked: false,
        enabled: true,
        telegram_handle: null,
        verified_at: null,
        last_sent_at: null,
        bot_username: status?.bot_username ?? null,
        signal_min_tier: minTier,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unlink");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        borderColor: linked ? "rgba(34,211,170,0.30)" : "var(--line)",
        background: linked
          ? "linear-gradient(135deg, rgba(34,211,170,0.07), rgba(34,211,170,0.01))"
          : "rgba(15,21,37,0.30)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-none"
          style={{
            background: linked
              ? "rgba(34,211,170,0.18)"
              : "rgba(34,211,170,0.10)",
            color: "var(--accent)",
          }}
        >
          {linked ? <Check className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-[13px]">Telegram alerts</div>
            {linked && enabled && (
              <Pill tone="accent">
                <Bell className="h-[9px] w-[9px]" /> live
              </Pill>
            )}
            {linked && !enabled && <Pill tone="warn">paused</Pill>}
            {!linked && hasAccess && <Pill>not connected</Pill>}
            {!hasAccess && (
              <Pill tone="warn">{minTier}+ plan</Pill>
            )}
          </div>
          <div className="text-[11px] text-ink-muted mt-1 leading-relaxed">
            {linked
              ? (
                <>
                  Linked to <span className="text-ink">@{status?.telegram_handle ?? "telegram"}</span>.
                  {" "}You'll get every V22 entry pushed to this chat.
                </>
              ) : hasAccess ? (
                <>
                  Get every V22 entry as a Telegram push the moment it fires.
                  One click to link your account.
                </>
              ) : (
                <>
                  Available on {minTier.charAt(0).toUpperCase() + minTier.slice(1)} plan and above.
                  Upgrade to unlock V22 push alerts.
                </>
              )}
          </div>
        </div>
      </div>

      {polling && !linked && (
        <div className="rounded-lg bg-bg-elev/50 border border-line/40 px-3 py-2 flex items-center gap-2 text-[11px] text-ink-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--accent)" }} />
          Waiting for you to tap <span className="font-mono text-ink">/start</span> in Telegram…
        </div>
      )}

      {error && (
        <div className="rounded-lg border px-3 py-2 flex items-start gap-2 text-[11px]"
             style={{ borderColor: "rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.04)" }}>
          <AlertCircle className="h-3.5 w-3.5 flex-none mt-0.5" style={{ color: "#fda4af" }} />
          <span className="text-ink-muted">{error}</span>
        </div>
      )}

      {/* Action row */}
      {hasAccess && !linked && (
        <button
          onClick={connect}
          disabled={busy}
          className="w-full h-10 rounded-xl font-bold text-[12px] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {busy ? "Generating link…" : "Connect Telegram"}
        </button>
      )}
      {hasAccess && linked && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={togglePause}
            disabled={busy}
            className="h-10 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[12px] flex items-center justify-center gap-1.5 text-ink-muted hover:text-ink active:scale-[0.98] transition disabled:opacity-50"
          >
            {enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {enabled ? "Pause" : "Resume"}
          </button>
          <button
            onClick={unlink}
            disabled={busy}
            className="h-10 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[12px] flex items-center justify-center gap-1.5 text-ink-muted hover:text-red-400 active:scale-[0.98] transition disabled:opacity-50"
          >
            Unlink
          </button>
        </div>
      )}
    </div>
  );
}
