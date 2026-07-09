import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import type { TradeChartData } from "../../lib/api";

export interface Trade {
  date: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  r: string;
  pos: boolean;
  pnl_pct?: number;
  entry_date?: string;
  entry_ts?: number;
  exit_ts?: number;
  stop?: number;
  target?: number;
  exit_reason?: string;
}

function fmtPrice(v: number): string {
  if (v >= 1000) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

const EXIT_REASON_LABELS: Record<string, string> = {
  stop_loss: "stop loss hit",
  trail_stop: "trailing stop hit",
  gap_stop: "gapped through the stop",
  take_profit: "target hit",
  gap_target: "gapped through the target",
  timeout: "max holding time reached",
  end_of_data: "closed at end of test window",
  opposite_cross: "opposite crossover",
};

/**
 * Visualizes a single backtested trade. When real OHLC context is available
 * (chartData), renders a candlestick chart with the exact buy/sell points and
 * the stop/target levels. Falls back to a minimal entry→exit view otherwise.
 * Only real data is drawn — no fabricated price paths.
 */
export function TradeChart({
  trade,
  asset,
  chartData,
  loadingChart,
}: {
  trade: Trade;
  asset?: string;
  chartData?: TradeChartData | null;
  loadingChart?: boolean;
}) {
  const { side, entry, exit, pos, r, date } = trade;
  const long = side === "LONG";
  const movePct = trade.pnl_pct ?? ((exit - entry) / entry) * 100 * (long ? 1 : -1);

  const exitWhy = trade.exit_reason ? EXIT_REASON_LABELS[trade.exit_reason] ?? trade.exit_reason : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-headline text-ink">{chartData?.asset || asset || "Trade"}</div>
          <div className="text-footnote text-ink-subtle mt-0.5">
            {trade.entry_date && trade.entry_date !== date ? `${trade.entry_date} → ${date}` : date}
            {chartData?.timeframe ? ` · ${chartData.timeframe.toUpperCase()} candles` : ""}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption uppercase"
          style={{
            background: pos ? "var(--accent-soft)" : "var(--negative-soft)",
            color: pos ? "var(--accent)" : "var(--negative)",
          }}
        >
          {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {side}
        </span>
      </div>

      {/* Chart */}
      <div className="rounded-md2 border border-line bg-surface-2 p-3">
        {loadingChart ? (
          <div className="h-44 flex flex-col items-center justify-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-line border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            <div className="text-footnote text-ink-subtle">Loading price context…</div>
          </div>
        ) : chartData && chartData.candles.length > 1 ? (
          <CandleChart data={chartData} trade={trade} />
        ) : (
          <SimpleChart trade={trade} />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Return" value={`${movePct >= 0 ? "+" : ""}${movePct.toFixed(1)}%`} tone={pos ? "pos" : "neg"} />
        <Stat label="R-multiple" value={r} tone={pos ? "pos" : "neg"} />
        <Stat
          label="Outcome"
          value={pos ? "Win" : "Loss"}
          tone={pos ? "pos" : "neg"}
          icon={pos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        />
      </div>

      <p className="text-footnote text-ink-subtle leading-relaxed">
        {long
          ? `Bought at ${fmtPrice(entry)} and sold at ${fmtPrice(exit)}`
          : `Sold short at ${fmtPrice(entry)} and bought back at ${fmtPrice(exit)}`}
        {exitWhy ? ` — ${exitWhy}.` : "."}{" "}
        Backtested historical trade — not a prediction.
      </p>
    </div>
  );
}

/** Real OHLC candles with entry/exit markers and stop/target levels. */
function CandleChart({ data, trade }: { data: TradeChartData; trade: Trade }) {
  const { candles, entry_ts, exit_ts, approx_entry } = data;
  const long = trade.side === "LONG";
  const buy = "var(--accent)";
  const sell = "var(--negative)";
  const entryColor = long ? buy : sell;
  const exitColor = long ? sell : buy;

  const W = 340, H = 200, padTop = 18, padBot = 16, padL = 4, padR = 48;
  const plotW = W - padL - padR;
  const plotH = H - padTop - padBot;
  const n = candles.length;

  // Price domain: candle range plus the trade's own levels
  const levels = [trade.entry, trade.exit, trade.stop, trade.target].filter(
    (v): v is number => typeof v === "number" && isFinite(v) && v > 0
  );
  let lo = Math.min(...candles.map((c) => c[3]), ...levels);
  let hi = Math.max(...candles.map((c) => c[2]), ...levels);
  const span = hi - lo || hi * 0.02 || 1;
  lo -= span * 0.06;
  hi += span * 0.06;

  const xOf = (i: number) => padL + ((i + 0.5) / n) * plotW;
  const yOf = (p: number) => padTop + (1 - (p - lo) / (hi - lo)) * plotH;
  const cw = Math.min(Math.max((plotW / n) * 0.65, 1.2), 8);

  // Nearest candle index for a timestamp
  const idxOf = (ts: number) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(candles[i][0] - ts);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };
  const iEntry = idxOf(entry_ts);
  const iExit = idxOf(exit_ts);

  const xEntry = xOf(iEntry);
  const xExit = xOf(iExit);
  const yEntry = yOf(trade.entry);
  const yExit = yOf(trade.exit);

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
        {/* stop / target levels (only inside the traded span) */}
        {typeof trade.stop === "number" && trade.stop > 0 && (
          <>
            <line x1={xEntry} y1={yOf(trade.stop)} x2={W - padR} y2={yOf(trade.stop)}
              stroke={sell} strokeWidth={1} strokeDasharray="2 3" opacity={0.55} />
            <text x={W - padR + 3} y={yOf(trade.stop) + 3} fontSize="8" fill={sell} opacity={0.85}>SL</text>
          </>
        )}
        {typeof trade.target === "number" && trade.target > 0 && (
          <>
            <line x1={xEntry} y1={yOf(trade.target)} x2={W - padR} y2={yOf(trade.target)}
              stroke={buy} strokeWidth={1} strokeDasharray="2 3" opacity={0.55} />
            <text x={W - padR + 3} y={yOf(trade.target) + 3} fontSize="8" fill={buy} opacity={0.85}>TP</text>
          </>
        )}

        {/* candles */}
        {candles.map((c, i) => {
          const [, o, h, l, cl] = c;
          const up = cl >= o;
          const color = up ? "var(--accent)" : "var(--negative)";
          const x = xOf(i);
          const yO = yOf(o), yC = yOf(cl);
          const bodyTop = Math.min(yO, yC);
          const bodyH = Math.max(Math.abs(yC - yO), 0.8);
          const inTrade = i >= iEntry && i <= iExit;
          return (
            <g key={i} opacity={inTrade ? 0.95 : 0.38}>
              <line x1={x} y1={yOf(h)} x2={x} y2={yOf(l)} stroke={color} strokeWidth={1} />
              <rect x={x - cw / 2} y={bodyTop} width={cw} height={bodyH} fill={color} rx={0.5} />
            </g>
          );
        })}

        {/* entry marker */}
        <line x1={xEntry} y1={padTop} x2={xEntry} y2={H - padBot} stroke={entryColor} strokeWidth={0.75} strokeDasharray="2 3" opacity={0.5} />
        <circle cx={xEntry} cy={yEntry} r={8} fill={entryColor} opacity={0.18} />
        <circle cx={xEntry} cy={yEntry} r={4} fill={entryColor} stroke="var(--surface-2)" strokeWidth={1.25} />
        <text x={xEntry} y={padTop - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={entryColor}>
          {long ? "BUY" : "SELL"}{approx_entry ? "≈" : ""}
        </text>

        {/* exit marker */}
        <line x1={xExit} y1={padTop} x2={xExit} y2={H - padBot} stroke={exitColor} strokeWidth={0.75} strokeDasharray="2 3" opacity={0.5} />
        <circle cx={xExit} cy={yExit} r={8} fill={exitColor} opacity={0.18} />
        <circle cx={xExit} cy={yExit} r={4} fill={exitColor} stroke="var(--surface-2)" strokeWidth={1.25} />
        <text x={xExit} y={padTop - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill={exitColor}>
          {long ? "SELL" : "BUY"}
        </text>

        {/* price labels on the right axis */}
        <text x={W - padR + 3} y={yEntry + 3} fontSize="8.5" fontWeight="700" fill={entryColor}>
          {fmtPrice(trade.entry)}
        </text>
        <text x={W - padR + 3} y={yExit + 3} fontSize="8.5" fontWeight="700" fill={exitColor}>
          {fmtPrice(trade.exit)}
        </text>
      </svg>
      {approx_entry && (
        <p className="text-[9px] text-ink-subtle mt-1.5">
          ≈ Entry position approximated — this run predates entry-timestamp tracking. Re-run the backtest for exact placement.
        </p>
      )}
    </>
  );
}

/** Fallback when no OHLC context is available: entry → exit on a price axis. */
function SimpleChart({ trade }: { trade: Trade }) {
  const { side, entry, exit, pos } = trade;
  const long = side === "LONG";
  const buy = "var(--accent)";
  const sell = "var(--negative)";
  const entryColor = long ? buy : sell;
  const exitColor = long ? sell : buy;
  const entryAction = long ? "BUY" : "SELL";
  const exitAction = long ? "SELL" : "BUY";

  const W = 320, H = 176, padTop = 30, padBot = 40;
  const lo = Math.min(entry, exit);
  const hi = Math.max(entry, exit);
  const span = hi - lo || hi * 0.02 || 1;
  const minP = lo - span * 0.55;
  const maxP = hi + span * 0.55;
  const yOf = (p: number) => padTop + (1 - (p - minP) / (maxP - minP)) * (H - padTop - padBot);
  const xEntry = 58;
  const xExit = W - 58;
  const yEntry = yOf(entry);
  const yExit = yOf(exit);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
      <line x1={0} y1={yEntry} x2={W} y2={yEntry} stroke="var(--line-strong)" strokeWidth={1} strokeDasharray="3 4" />
      <line x1={xEntry} y1={yEntry} x2={xExit} y2={yExit}
        stroke={pos ? "var(--accent)" : "var(--negative)"} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={xEntry} cy={yEntry} r={9} fill={entryColor} opacity={0.18} />
      <circle cx={xEntry} cy={yEntry} r={4.5} fill={entryColor} />
      <circle cx={xExit} cy={yExit} r={9} fill={exitColor} opacity={0.18} />
      <circle cx={xExit} cy={yExit} r={4.5} fill={exitColor} />
      <text x={xEntry} y={yEntry - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={entryColor}>
        {entryAction}
      </text>
      <text x={xEntry} y={H - 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-100)">
        {fmtPrice(entry)}
      </text>
      <text x={xEntry} y={H - 7} textAnchor="middle" fontSize="9" fill="var(--ink-45)">
        entry
      </text>
      <text x={xExit} y={yExit - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={exitColor}>
        {exitAction}
      </text>
      <text x={xExit} y={H - 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-100)">
        {fmtPrice(exit)}
      </text>
      <text x={xExit} y={H - 7} textAnchor="middle" fontSize="9" fill="var(--ink-45)">
        exit
      </text>
    </svg>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "pos" | "neg";
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md2 border border-line bg-surface-1 p-3 text-center">
      <div className="text-caption uppercase text-ink-subtle">{label}</div>
      <div
        className="text-headline tabular-nums mt-1 flex items-center justify-center gap-1"
        style={{ color: tone === "pos" ? "var(--accent)" : "var(--negative)" }}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}
