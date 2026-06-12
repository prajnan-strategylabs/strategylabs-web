import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { V22RecentCall } from "../lib/api";
import { LiveDot, Pill } from "./MobileUI";
import { useBinanceTradeStreams } from "../lib/useBinanceStreams";

interface Props {
  call: V22RecentCall | null;
  onClose: () => void;
}

function formatPrice(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1000) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (v >= 1) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
}

function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "—";
  try {
    const ms = now - new Date(iso).getTime();
    return formatDurationMs(ms, { minOneMinute: false });
  } catch {
    return "—";
  }
}

function formatDurationMs(
  ms: number,
  options: { minOneMinute?: boolean } = {},
): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return options.minOneMinute ? "1m" : `${s}s`;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

function getHeldDuration(call: V22RecentCall, isOpen: boolean): string {
  try {
    const start = new Date(call.entry_time).getTime();
    const end = isOpen
      ? Date.now()
      : call.exit_time
        ? new Date(call.exit_time).getTime()
        : null;

    if (!Number.isNaN(start) && end != null && !Number.isNaN(end)) {
      return formatDurationMs(Math.max(0, end - start), { minOneMinute: true });
    }
  } catch {
    // Fall through to stored hold fields.
  }

  if (!isOpen && call.hold_hours != null) {
    return formatDurationMs(call.hold_hours * 3_600_000, { minOneMinute: true });
  }
  if (!isOpen && call.hold_days != null) {
    return `${Math.max(1, call.hold_days)}d`;
  }
  return "—";
}

export function LiveSignalDrawer({ call: propCall, onClose }: Props) {
  const [localCall, setLocalCall] = useState<V22RecentCall | null>(null);
  const [active, setActive] = useState(false);

  // Synchronize localCall and active states with the parent's call prop
  useEffect(() => {
    if (propCall) {
      setLocalCall(propCall);
      const timer = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(timer);
    } else if (localCall) {
      setActive(false);
      const timer = setTimeout(() => setLocalCall(null), 300);
      return () => clearTimeout(timer);
    }
  }, [propCall]);

  const handleClose = () => {
    setActive(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const call = localCall;

  // Heartbeat to keep the "Xh running" label refreshing once a second
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    if (!call) return;
    const id = window.setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [call]);

  // ── Binance trade stream (tick-by-tick) for open positions ────────────────
  const isOpenPosition = !!(call && call.status === "open" && call.symbol);
  const streamSymbols = useMemo(
    () => (isOpenPosition && call?.symbol ? [call.symbol] : []),
    [isOpenPosition, call?.symbol],
  );
  const ticks = useBinanceTradeStreams(streamSymbols);
  const liveTick = call?.symbol ? ticks[call.symbol] : undefined;
  const livePrice = liveTick?.price ?? null;
  const livePriceUpdatedAt = liveTick?.lastTickAt ?? null;
  const tickDir = liveTick?.tickDir ?? "flat";

  // Briefly highlight the price block when the price changes
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (livePriceUpdatedAt) setFlashKey((k) => k + 1);
  }, [livePriceUpdatedAt]);

  // Lock body scroll while drawer is open (mobile)
  useEffect(() => {
    if (!call) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [call]);

  // Close on Escape
  useEffect(() => {
    if (!call) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [call]);

  // Derived metrics
  const derived = useMemo(() => {
    if (!call) return null;
    const long = call.dir === "LONG";
    const entry = call.entry ?? null;
    const sl = call.stop_loss ?? null;
    const tp1 = call.tp1 ?? null;
    const tp2 = call.tp2 ?? null;
    const riskDist = entry != null && sl != null ? Math.abs(entry - sl) : null;

    // Current mark: live for open, exit_price for closed
    const isOpen = call.status === "open";
    const mark =
      isOpen && livePrice != null
        ? livePrice
        : call.exit_price ??
          (call.ret_pct != null && entry != null
            ? entry * (1 + (call.ret_pct / 100) * (long ? 1 : -1))
            : null);

    // Unrealized / realized return %
    const retPct =
      isOpen && livePrice != null && entry != null && entry > 0
        ? ((livePrice - entry) / entry) * (long ? 1 : -1) * 100
        : call.ret_pct ?? null;

    // R-multiple realized so far
    const r =
      mark != null && entry != null && entry > 0 && riskDist != null && riskDist > 0
        ? ((mark - entry) * (long ? 1 : -1)) / riskDist
        : null;

    // Signed progress from entry: 0 = at entry (center), +1 = at TP1 (right),
    // −1 = at SL (left). Direction-agnostic — "toward profit" is always right.
    const progress = (() => {
      if (mark == null || entry == null || sl == null || tp1 == null) return null;
      const gain = (mark - entry) * (long ? 1 : -1);
      if (gain >= 0) {
        const denom = Math.abs(tp1 - entry);
        if (denom === 0) return 0;
        return Math.min(1, gain / denom);
      }
      const denom = Math.abs(entry - sl);
      if (denom === 0) return 0;
      return Math.max(-1, gain / denom);
    })();

    // Dollar P&L — uses the actual risk_usd from the signal row when
    // available, otherwise falls back to V22's default ($50 on $5K account).
    // For closed positions we prefer the realized pnl stored at exit time.
    const riskUsd = call.risk_usd ?? 50;
    const unrealizedUsd = (() => {
      if (!isOpen && call.pnl != null) return call.pnl;
      if (r == null) return null;
      return r * riskUsd;
    })();

    return {
      long,
      isOpen,
      entry,
      sl,
      tp1,
      tp2,
      riskDist,
      mark,
      retPct,
      r,
      progress,
      hasTradeLevels: entry != null && sl != null && tp1 != null,
      riskUsd,
      unrealizedUsd,
    };
  }, [call, livePrice, clockTick]);

  if (!call || !derived) return null;

  const {
    long,
    isOpen,
    entry,
    sl,
    tp1,
    tp2,
    mark,
    retPct,
    r,
    progress,
    hasTradeLevels,
    riskUsd,
    unrealizedUsd,
  } = derived;

  const pnlColor =
    retPct == null
      ? "var(--ink-muted)"
      : retPct >= 0
        ? "var(--accent)"
        : "#fda4af";

  const heldDuration = getHeldDuration(call, isOpen);
  const heldLabel = isOpen
    ? `${heldDuration} running`
    : `held ${heldDuration}`;

  const outcomeLabel = (() => {
    if (isOpen) return "Live position";
    switch (call.outcome) {
      case "tp1":
      case "tp1+trail":
        return "Hit TP1";
      case "tp2":
        return "Hit TP2";
      case "sl":
      case "stop_loss":
        return "Stopped out";
      case "trail":
      case "trail_stop":
        return "Trail close";
      case "timeout":
        return "Timed out";
      default:
        return "Closed";
    }
  })();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border-t md:border bg-bg-card overflow-hidden transition-all duration-300 ease-out ${
          active
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-full opacity-0 md:scale-95"
        }`}
        style={{ borderColor: "var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line/40 bg-bg/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-bg-elev border border-line/50 flex items-center justify-center flex-none">
              <span className="font-mono text-[9px] font-bold text-ink-muted">
                {call.asset}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[14px]">
                  {call.symbol ?? `${call.asset}/USDT`}
                </span>
                <Pill tone={long ? "accent" : "danger"} className="!py-[1px]">
                  {long ? (
                    <TrendingUp className="h-[9px] w-[9px]" />
                  ) : (
                    <TrendingDown className="h-[9px] w-[9px]" />
                  )}{" "}
                  {call.dir}
                </Pill>
                {call.strategy && (
                  <span className="text-[9px] font-mono font-bold text-ink-subtle">
                    {call.strategy}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-ink-subtle font-mono mt-0.5">
                {heldLabel}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="h-9 w-9 rounded-lg border border-line/60 bg-bg-elev/60 flex items-center justify-center text-ink-muted hover:text-ink active:scale-95 transition flex-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Unrealized $ P&L hero (the headline) ── */}
        <div
          className="relative px-5 py-5 border-b border-line/40 overflow-hidden"
          style={{
            background: isOpen
              ? "radial-gradient(120% 80% at 50% 0%, rgba(34,211,170,0.10), transparent 60%)"
              : undefined,
          }}
        >
          {/* Status pill anchored top-right */}
          <div className="absolute top-4 right-4 text-right">
            <Pill
              tone={
                isOpen
                  ? "accent"
                  : call.outcome?.startsWith("tp") ||
                      call.outcome?.startsWith("trail")
                    ? "accent"
                    : call.outcome?.startsWith("sl") ||
                        call.outcome === "stop_loss"
                      ? "danger"
                      : "warn"
              }
            >
              {isOpen && <LiveDot size={4} />} {outcomeLabel}
            </Pill>
          </div>

          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold">
            {isOpen ? "Unrealized P&L" : "Realized P&L"}
          </div>

          {/* Big dollar P&L — the headline */}
          <div
            key={`pnl-${flashKey}`}
            className="font-mono tabular-nums font-extrabold leading-none mt-2 sl-tick-flash"
            style={{
              color: pnlColor,
              fontSize: "44px",
              letterSpacing: "-0.02em",
            }}
          >
            {unrealizedUsd != null
              ? `${unrealizedUsd >= 0 ? "+" : "-"}$${Math.abs(unrealizedUsd).toFixed(2)}`
              : "—"}
          </div>

          {/* Secondary metrics row */}
          <div className="flex items-center gap-3 mt-2 text-[12px] font-mono tabular-nums flex-wrap">
            {retPct != null && (
              <span
                className="font-bold"
                style={{ color: pnlColor }}
              >
                {retPct >= 0 ? "+" : ""}
                {retPct.toFixed(2)}%
              </span>
            )}
            {r != null && (
              <span className="text-ink-muted">
                <span style={{ color: pnlColor, opacity: 0.85 }}>
                  {r >= 0 ? "+" : ""}
                  {r.toFixed(2)}R
                </span>
              </span>
            )}
            <span className="text-ink-subtle">·  on ${riskUsd.toFixed(0)} risk</span>
          </div>

          {/* Live mark price strip */}
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold flex items-center gap-1.5">
                {isOpen ? (
                  <>
                    <LiveDot size={5} /> Mark · live
                  </>
                ) : (
                  "Exit price"
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div
                  key={`mark-${flashKey}`}
                  className="font-mono tabular-nums font-extrabold text-[22px] leading-none sl-tick-flash"
                  style={{
                    color:
                      isOpen && tickDir === "up"
                        ? "var(--accent)"
                        : isOpen && tickDir === "down"
                          ? "#fda4af"
                          : "var(--ink)",
                  }}
                >
                  {formatPrice(mark)}
                </div>
                {isOpen && tickDir === "up" && (
                  <ArrowUp className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                )}
                {isOpen && tickDir === "down" && (
                  <ArrowDown className="h-3.5 w-3.5" style={{ color: "#fda4af" }} />
                )}
              </div>
            </div>
            {livePriceUpdatedAt && isOpen && (
              <div className="text-[9px] text-ink-subtle font-mono text-right">
                <div>{timeAgo(new Date(livePriceUpdatedAt).toISOString())} ago</div>
                <div className="text-[8px] mt-0.5">via Binance WS</div>
              </div>
            )}
          </div>

          {/* Local style for the tick-flash animation. Scoped via a unique key
              re-mounts the element on every price change, restarting the
              keyframe. */}
          <style>{`
            @keyframes sl-tick-flash {
              0%   { filter: brightness(1.35); }
              100% { filter: brightness(1.0); }
            }
            .sl-tick-flash { animation: sl-tick-flash 0.4s ease-out; }
          `}</style>
        </div>

        {hasTradeLevels && (
          /* Rendered immediately from the call's own levels — the marker rests
             at center until the first live tick, so the section never pops in
             after the drawer is already open. */
          <div className="px-5 py-4 border-b border-line/40 space-y-2">
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ background: "var(--line)" }}
            >
              {/* Entry anchor — fixed center tick */}
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px]"
                style={{ background: "var(--ink-45)" }}
              />
              {/* Fill grows from center: right/accent toward TP, left/red toward SL */}
              <div
                className="absolute inset-y-0 transition-all duration-300 ease-out"
                style={
                  (progress ?? 0) >= 0
                    ? {
                        left: "50%",
                        width: `${(progress ?? 0) * 50}%`,
                        background: "var(--accent)",
                        borderRadius: "0 9999px 9999px 0",
                      }
                    : {
                        left: `${50 + (progress ?? 0) * 50}%`,
                        width: `${-(progress ?? 0) * 50}%`,
                        background: "var(--negative)",
                        borderRadius: "9999px 0 0 9999px",
                      }
                }
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ease-out"
                style={{
                  left: `${50 + (progress ?? 0) * 50}%`,
                  background: "var(--bg)",
                  borderColor:
                    progress == null
                      ? "var(--ink-45)"
                      : progress >= 0
                        ? "var(--accent)"
                        : "var(--negative)",
                  boxShadow:
                    isOpen && progress != null
                      ? `0 0 12px ${progress >= 0 ? "var(--accent)" : "var(--negative)"}`
                      : "none",
                }}
              />
            </div>
            <div className="grid grid-cols-3 text-[10px] font-mono tabular-nums">
              <div>
                <div className="text-ink-subtle uppercase tracking-wide text-[9px] font-bold flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" /> Stop
                </div>
                <div className="font-bold mt-0.5" style={{ color: "#fda4af" }}>
                  {formatPrice(sl)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-ink-subtle uppercase tracking-wide text-[9px] font-bold">
                  Entry
                </div>
                <div className="font-bold text-ink mt-0.5">
                  {formatPrice(entry)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-ink-subtle uppercase tracking-wide text-[9px] font-bold flex items-center justify-end gap-1">
                  <Target className="h-2.5 w-2.5" /> TP1
                </div>
                <div className="font-bold mt-0.5" style={{ color: "var(--accent)" }}>
                  {formatPrice(tp1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-px bg-line/30">
          <Stat label="R:R configured" value={call.rr ? `1:${call.rr}` : "—"} />
          <Stat
            label={isOpen ? "Realized R" : "Final R"}
            value={r != null ? `${r >= 0 ? "+" : ""}${r.toFixed(2)}R` : "—"}
            color={pnlColor}
          />
          {tp2 != null && (
            <Stat label="TP2" value={formatPrice(tp2)} color="var(--accent)" />
          )}
          <Stat
            label="Time held"
            value={heldDuration}
            icon={<Clock className="h-2.5 w-2.5" />}
          />
        </div>

        {/* ── Footer / disclaimer ── */}
        <div 
          className="px-5 pt-4 flex items-start gap-2 text-[10px] text-ink-subtle leading-relaxed border-t border-line/10 bg-bg/20"
          style={{
            paddingBottom: "calc(16px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))"
          }}
        >
          <Zap className="h-3 w-3 flex-none mt-0.5" style={{ color: "var(--accent)" }} />
          <span>
            {isOpen
              ? "Mark price polls Binance directly every 3 seconds. Position auto-closes in V22 when TP1/TP2/SL/trail hits."
              : "Trade closed. Audit log entry locked."}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card p-3.5">
      <div className="text-[9px] uppercase tracking-[0.15em] text-ink-subtle font-bold flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div
        className="font-mono tabular-nums text-[14px] font-extrabold mt-0.5"
        style={{ color: color ?? "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}
