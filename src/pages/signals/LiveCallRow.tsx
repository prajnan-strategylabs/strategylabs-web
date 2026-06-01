import { TrendingUp, TrendingDown } from "lucide-react";
import { Pill, LiveDot } from "../../components/MobileUI";
import type { V22Stats } from "../../lib/api";
import type { LiveTick } from "../../lib/useBinanceStreams";
import { formatWhenAgo } from "../../lib/utils";

export function LiveCallRow({
  call,
  tick,
  onSelect,
}: {
  call: V22Stats["recent_calls"][number];
  tick?: LiveTick;
  onSelect?: () => void;
}) {
  const long = call.dir === "LONG";
  const dirColor = long ? "var(--accent)" : "#fda4af";
  const isOpen = call.status === "open";

  // Map the raw outcome code to a chip label + tone
  const outcomeLabel = (() => {
    if (isOpen) return "running";
    switch (call.outcome) {
      case "tp1":
      case "tp1+trail":
        return "Hit TP";
      case "tp2":
        return "Hit TP2";
      case "sl":
      case "stop_loss":
        return "Stopped";
      case "trail":
      case "trail_stop":
        return "Trail close";
      case "timeout":
        return "Timed out";
      default:
        return call.outcome || "Closed";
    }
  })();
  const outcomeTone: "accent" | "danger" | "warn" | "info" = isOpen
    ? "info"
    : call.outcome?.startsWith("tp") || call.outcome?.startsWith("trail")
      ? "accent"
      : call.outcome?.startsWith("sl") || call.outcome === "stop_loss"
        ? "danger"
        : "warn";

  // Hold duration: entry → exit (closed) OR entry → now (open)
  const holdLabel = (() => {
    const formatDuration = (ms: number) => {
      const minutes = Math.floor(ms / 60_000);
      if (minutes < 60) return `${Math.max(1, minutes)}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.round(hours / 24)}d`;
    };

    const ms = (() => {
      try {
        const start = new Date(call.entry_time).getTime();
        const end = isOpen ? Date.now() : call.exit_time ? new Date(call.exit_time).getTime() : null;
        if (end == null || Number.isNaN(end)) return null;
        return Math.max(0, end - start);
      } catch {
        return null;
      }
    })();

    if (ms != null) return formatDuration(ms);

    if (!isOpen && call.hold_hours != null) {
      return formatDuration(call.hold_hours * 3_600_000);
    }
    if (!isOpen && call.hold_days != null) {
      return `${Math.max(1, call.hold_days)}d`;
    }
    return "—";
  })();

  // ── Live unrealized return for open positions ─────────────────────────
  // When the row is OPEN and we have a live tick from Binance, override
  // the static `ret_pct` (which is null for in-flight positions anyway).
  const liveRetPct =
    isOpen && tick?.price != null && call.entry
      ? ((tick.price - call.entry) / call.entry) * (long ? 1 : -1) * 100
      : null;
  const displayRetPct = liveRetPct ?? call.ret_pct ?? null;

  // Dollar P&L — uses the actual risk_usd from the signal, fallback to $50
  const riskUsd = call.risk_usd ?? 50;
  const displayUsd = (() => {
    if (!isOpen && call.pnl != null) return call.pnl;
    if (displayRetPct == null || !call.entry || !call.stop_loss) return null;
    const riskDist = Math.abs(call.entry - call.stop_loss) || 1;
    const movedR =
      ((tick?.price ?? call.entry * (1 + (displayRetPct / 100) * (long ? 1 : -1))) -
        call.entry) *
      (long ? 1 : -1) /
      riskDist;
    return movedR * riskUsd;
  })();

  const pnlColor =
    displayRetPct == null
      ? "var(--ink-muted)"
      : displayRetPct >= 0
        ? "var(--accent)"
        : "#fda4af";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-xl border border-line/60 bg-bg-card/40 hover:bg-bg-card/60 hover:border-line p-3 flex items-center gap-3 active:scale-[0.995] transition cursor-pointer"
    >
      <div className="h-9 w-9 rounded-lg bg-bg-elev border border-line/50 flex items-center justify-center flex-none">
        <span className="font-mono text-[9px] font-bold text-ink-muted">
          {call.asset}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[13px]">{call.asset}/USDT</span>
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
          {isOpen
            ? `Entered ${formatWhenAgo(call.entry_time) || call.when_ago} · ${holdLabel} running`
            : `Entered ${formatWhenAgo(call.entry_time) || call.when_ago} · held ${holdLabel}`}
        </div>
      </div>
      <div className="flex flex-col items-end flex-none gap-0.5 min-w-[80px]">
        <Pill tone={outcomeTone} className="!py-[1px]">
          {isOpen && <LiveDot size={4} />} {outcomeLabel}
        </Pill>
        {displayUsd != null && (
          <div
            key={`usd-${tick?.lastTickAt ?? "static"}`}
            className="font-mono font-extrabold tabular-nums text-[13px] sl-tick-flash"
            style={{ color: pnlColor, lineHeight: 1.1 }}
          >
            {displayUsd >= 0 ? "+" : "-"}${Math.abs(displayUsd).toFixed(2)}
          </div>
        )}
        {displayRetPct != null && (
          <div
            className="font-mono font-bold tabular-nums text-[10px]"
            style={{ color: pnlColor, opacity: 0.85 }}
          >
            {displayRetPct >= 0 ? "+" : ""}
            {displayRetPct.toFixed(2)}%
          </div>
        )}
      </div>
      <div
        className="h-8 w-0.5 rounded-full flex-none"
        style={{ background: dirColor, opacity: 0.5 }}
      />
    </button>
  );
}
