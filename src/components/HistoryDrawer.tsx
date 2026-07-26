import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import {
  apiGetV22History,
  type V22HistoryFilters,
  type V22HistoryResponse,
  type V22RecentCall,
  type V22Stats,
} from "../lib/api";
import { LiveDot, Pill } from "./MobileUI";
import type { LiveTick } from "../lib/useBinanceStreams";
import { formatWhenAgo } from "../lib/utils";

interface Props {
  open: boolean;
  /** The /v22 stats response — used only to grab "all-time" header metadata. */
  data: V22Stats | null;
  liveTicks: Record<string, LiveTick>;
  onClose: () => void;
  onCallSelect: (call: V22RecentCall) => void;
}

const PAGE_SIZE = 50;

/** Date-range presets keyed off "today" UTC. */
function rangeStart(preset: RangePreset): string | undefined {
  if (preset === "all") return undefined;
  const now = new Date();
  const ms: Record<Exclude<RangePreset, "all">, number> = {
    "7d": 7 * 86400e3,
    "30d": 30 * 86400e3,
    "90d": 90 * 86400e3,
    ytd: now.getTime() - new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).getTime(),
  };
  const start = new Date(now.getTime() - ms[preset]);
  return start.toISOString().slice(0, 10);
}

type RangePreset = "7d" | "30d" | "90d" | "ytd" | "all";
type StrategyFilter = "all" | "S3" | "S5";
type DirectionFilter = "all" | "long" | "short";
type OutcomeFilter = "all" | "win" | "loss" | "open";

interface DrawerFilters {
  range: RangePreset;
  symbolText: string;        // free-text user input
  strategy: StrategyFilter;
  direction: DirectionFilter;
  outcome: OutcomeFilter;
}

const DEFAULT_FILTERS: DrawerFilters = {
  range: "all",
  symbolText: "",
  strategy: "all",
  direction: "all",
  outcome: "all",
};

/**
 * Build the V22HistoryFilters payload from drawer state.
 * Empty / "all" values map to undefined so the URL stays clean.
 */
function toApiFilters(f: DrawerFilters, offset: number): V22HistoryFilters {
  const symbols = f.symbolText
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  return {
    start: rangeStart(f.range),
    symbols: symbols.length ? symbols : undefined,
    strategy: f.strategy === "all" ? undefined : f.strategy,
    direction: f.direction === "all" ? undefined : f.direction,
    outcome: f.outcome === "all" ? undefined : f.outcome,
    limit: PAGE_SIZE,
    offset,
  };
}

export function HistoryDrawer({
  open,
  data,
  liveTicks,
  onClose,
  onCallSelect,
}: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalOpen(true);
      const timer = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(timer);
    } else if (localOpen) {
      setActive(false);
      const timer = setTimeout(() => setLocalOpen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setActive(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // ── Drawer lifecycle ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!localOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [localOpen]);

  useEffect(() => {
    if (!localOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [localOpen]);

  // ── Filter state + paged result ─────────────────────────────────────────
  const [filters, setFilters] = useState<DrawerFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<V22HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<V22RecentCall[]>([]);

  // Debounce the symbol text input so typing doesn't fire a request per keystroke
  const debouncedFilters = useDebouncedValue(filters, 300);

  // Refetch from offset=0 whenever filters change (including the debounced text)
  useEffect(() => {
    if (!localOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void apiGetV22History(toApiFilters(debouncedFilters, 0))
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        setPage(res.trades);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message || "Failed to load history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [localOpen, debouncedFilters]);

  async function loadMore() {
    if (!result || loading) return;
    if (!result.pagination.has_more) return;
    setLoading(true);
    try {
      const next = await apiGetV22History(
        toApiFilters(debouncedFilters, result.pagination.offset + PAGE_SIZE),
      );
      setResult(next);
      setPage((prev) => [...prev, ...next.trades]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  const hasActiveFilters = useMemo(() => {
    return (
      filters.range !== "all" ||
      !!filters.symbolText.trim() ||
      filters.strategy !== "all" ||
      filters.direction !== "all" ||
      filters.outcome !== "all"
    );
  }, [filters]);

  if (!localOpen) return null;

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
        className={`w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl border-t md:border bg-bg-card overflow-hidden transition-all duration-300 ease-out flex flex-col ${
          active
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-full opacity-0 md:scale-95"
        }`}
        style={{ borderColor: "var(--line)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line/40 bg-bg/50 backdrop-blur-sm">
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold tracking-tight">History</h2>
            {/* Two figures, not one blend: total_trades / cum_return_pct span the
                whole record, which is backtested up to backtest_through and live
                after it. Stating both keeps "all-time" from reading as live. */}
            <div className="text-[10px] text-ink-subtle font-mono mt-0.5">
              {data
                ? `${typeof data.live_trades === "number" ? data.live_trades.toLocaleString() : "—"} live · ${data.total_trades.toLocaleString()} incl. backtest`
                : "Loading…"}
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

        {/* ── Filter panel ── */}
        <div className="border-b border-line/40 px-5 py-3 space-y-2.5 bg-bg-card/50">
          {/* Symbol search */}
          <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-bg-elev/50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-ink-subtle flex-none" />
            <input
              type="text"
              value={filters.symbolText}
              onChange={(e) =>
                setFilters({ ...filters, symbolText: e.target.value })
              }
              placeholder="Filter by symbol — BTC, ETH, SOL…"
              className="flex-1 bg-transparent text-[12px] text-ink placeholder:text-ink-subtle outline-none font-mono"
            />
            {filters.symbolText && (
              <button
                onClick={() => setFilters({ ...filters, symbolText: "" })}
                aria-label="Clear search"
                className="text-ink-subtle hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Date range */}
          <ChipRow
            label="Range"
            value={filters.range}
            options={[
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
              { value: "ytd", label: "YTD" },
              { value: "all", label: "All" },
            ]}
            onChange={(v) =>
              setFilters({ ...filters, range: v as RangePreset })
            }
          />

          {/* Strategy + Direction + Outcome — compact stacked rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ChipRow
              label="Strategy"
              value={filters.strategy}
              dense
              options={[
                { value: "all", label: "All" },
                { value: "S3", label: "S3" },
                { value: "S5", label: "S5" },
              ]}
              onChange={(v) =>
                setFilters({ ...filters, strategy: v as StrategyFilter })
              }
            />
            <ChipRow
              label="Dir"
              value={filters.direction}
              dense
              options={[
                { value: "all", label: "All" },
                { value: "long", label: "LONG" },
                { value: "short", label: "SHORT" },
              ]}
              onChange={(v) =>
                setFilters({ ...filters, direction: v as DirectionFilter })
              }
            />
            <ChipRow
              label="Outcome"
              value={filters.outcome}
              dense
              options={[
                { value: "all", label: "All" },
                { value: "win", label: "Wins" },
                { value: "loss", label: "Losses" },
              ]}
              onChange={(v) =>
                setFilters({ ...filters, outcome: v as OutcomeFilter })
              }
            />
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-[10px] font-bold text-ink-muted hover:text-ink flex items-center gap-1"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── Filtered stats strip ── */}
        {result && (
          <div className="px-5 py-2.5 border-b border-line/40 bg-bg-elev/30 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono tabular-nums">
            <StatChip label="Trades" value={result.stats.count.toLocaleString()} />
            <StatChip
              label="Win"
              value={`${result.stats.win_rate_pct}%`}
              color={
                result.stats.win_rate_pct >= 50 ? "var(--accent)" : "var(--ink)"
              }
            />
            <StatChip
              label="Total PnL"
              value={`${result.stats.total_pnl >= 0 ? "+" : "-"}$${Math.abs(result.stats.total_pnl).toLocaleString()}`}
              color={
                result.stats.total_pnl >= 0 ? "var(--accent)" : "#fda4af"
              }
            />
            {result.stats.best_ret_pct != null && (
              <StatChip
                label="Best"
                value={`+${result.stats.best_ret_pct}%`}
                color="var(--accent)"
              />
            )}
            {result.stats.worst_ret_pct != null && (
              <StatChip
                label="Worst"
                value={`${result.stats.worst_ret_pct}%`}
                color="#fda4af"
              />
            )}
          </div>
        )}

        {/* ── Scrollable list ── */}
        <div 
          className="flex-1 overflow-y-auto px-5 pt-3"
          style={{
            paddingBottom: "calc(20px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))"
          }}
        >
          {loading && page.length === 0 ? (
            <SkeletonRows />
          ) : error ? (
            <div className="text-[11px] text-red-400 p-3">{error}</div>
          ) : page.length === 0 ? (
            <div className="text-[11px] text-ink-subtle italic p-3 text-center">
              <Filter className="h-5 w-5 mx-auto mb-2 opacity-50" />
              No trades match these filters.
            </div>
          ) : (
            <div className="space-y-2">
              {page.map((c, i) => (
                <TradeRow
                  key={`${c.entry_time}-${c.symbol}-${c.strategy ?? i}`}
                  call={c}
                  tick={c.symbol ? liveTicks[c.symbol] : undefined}
                  onSelect={() => onCallSelect(c)}
                />
              ))}
              {result?.pagination.has_more && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl border border-line/60 bg-bg-elev/40 text-[11px] font-bold text-ink-muted hover:text-ink hover:border-line transition active:scale-[0.99] disabled:opacity-50"
                >
                  {loading
                    ? "Loading…"
                    : `Load more · ${(result.pagination.total_count - page.length).toLocaleString()} remaining`}
                </button>
              )}
              {!result?.pagination.has_more && page.length > PAGE_SIZE && (
                <div className="text-center text-[10px] text-ink-subtle py-2">
                  End of history · {page.length.toLocaleString()} trades shown
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────── Filter chip row ─────────── */
function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
  dense,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "" : "flex items-center gap-2 flex-wrap"}>
      <span
        className={`${
          dense ? "block mb-1" : ""
        } text-[9px] uppercase tracking-[0.15em] text-ink-subtle font-bold flex-none`}
      >
        {label}
      </span>
      <div className="flex gap-1 flex-wrap">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex-none rounded-full px-2.5 h-7 text-[10px] font-bold uppercase tracking-[0.08em] transition active:scale-95"
              style={{
                background: active ? "var(--accent)" : "var(--bg-elev)",
                border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                color: active ? "var(--bg)" : "var(--ink-muted)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Stat chip ─────────── */
function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-ink-subtle">{label}</span>
      <span className="font-bold" style={{ color: color ?? "var(--ink)" }}>
        {value}
      </span>
    </span>
  );
}

/* ─────────── Skeleton rows ─────────── */
function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="rounded-xl border border-line/40 bg-bg-card/30 p-3 flex items-center gap-3 animate-pulse"
        >
          <div className="h-9 w-9 rounded-lg bg-bg-elev/60 flex-none" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-32 rounded bg-bg-elev/60" />
            <div className="h-2 w-24 rounded bg-bg-elev/40" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 w-12 rounded bg-bg-elev/60" />
            <div className="h-2 w-10 rounded bg-bg-elev/40 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Single trade row ─────────── */
function TradeRow({
  call,
  tick,
  onSelect,
}: {
  call: V22RecentCall;
  tick?: LiveTick;
  onSelect: () => void;
}) {
  const long = call.dir === "LONG";
  const isOpen = call.status === "open";
  const displayRetPct = (() => {
    if (isOpen && tick?.price != null && call.entry != null && call.entry > 0) {
      return ((tick.price - call.entry) / call.entry) * (long ? 1 : -1) * 100;
    }
    return call.ret_pct;
  })();
  const pnlColor =
    displayRetPct == null
      ? "var(--ink-muted)"
      : displayRetPct >= 0
        ? "var(--accent)"
        : "#fda4af";

  const outcomeLabel = (() => {
    if (isOpen) return "running";
    switch (call.outcome) {
      case "tp1":
      case "tp1+trail":
        return "TP";
      case "tp2":
        return "TP2";
      case "sl":
      case "stop_loss":
        return "Stop";
      case "trail":
      case "trail_stop":
        return "Trail";
      case "timeout":
        return "Timeout";
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-[13px]">
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
          {call.entry_time?.slice(0, 10)} · {formatWhenAgo(call.entry_time) || call.when_ago}
        </div>
      </div>
      <div className="flex flex-col items-end flex-none gap-1">
        <Pill tone={outcomeTone} className="!py-[1px]">
          {isOpen && <LiveDot size={4} />} {outcomeLabel}
        </Pill>
        {displayRetPct != null && (
          <div
            className="font-mono font-bold tabular-nums text-[12px]"
            style={{ color: pnlColor }}
          >
            {displayRetPct >= 0 ? "+" : ""}
            {displayRetPct.toFixed(2)}%
          </div>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-ink-subtle flex-none" />
    </button>
  );
}

/* ─────────── Debounce helper ─────────── */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(valueRef.current), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
