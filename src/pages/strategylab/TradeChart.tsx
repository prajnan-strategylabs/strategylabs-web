import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

export interface Trade {
  date: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  r: string;
  pos: boolean;
  pnl_pct?: number;
}

function fmtPrice(v: number): string {
  if (v >= 1000) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

/**
 * Visualizes a single backtested trade: the buy point and the sell point on a
 * price axis, so the user can see where the strategy entered and exited.
 * Uses only real trade data (entry/exit price, side) — no fabricated price path.
 */
export function TradeChart({ trade, asset }: { trade: Trade; asset?: string }) {
  const { side, entry, exit, pos, r, date } = trade;
  const long = side === "LONG";
  const movePct = trade.pnl_pct ?? ((exit - entry) / entry) * 100 * (long ? 1 : -1);

  // Conventional colors: a BUY marker is green, a SELL marker is red.
  const buy = "var(--accent)";
  const sell = "var(--negative)";
  const entryColor = long ? buy : sell;
  const exitColor = long ? sell : buy;
  const entryAction = long ? "BUY" : "SELL";
  const exitAction = long ? "SELL" : "BUY";

  // ── Geometry ──
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-headline text-ink">{asset || "Trade"}</div>
          <div className="text-footnote text-ink-subtle mt-0.5">{date}</div>
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
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
          {/* entry reference baseline */}
          <line
            x1={0} y1={yEntry} x2={W} y2={yEntry}
            stroke="var(--line-strong)" strokeWidth={1} strokeDasharray="3 4"
          />
          {/* connector */}
          <line
            x1={xEntry} y1={yEntry} x2={xExit} y2={yExit}
            stroke={pos ? "var(--accent)" : "var(--negative)"} strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* entry marker */}
          <circle cx={xEntry} cy={yEntry} r={9} fill={entryColor} opacity={0.18} />
          <circle cx={xEntry} cy={yEntry} r={4.5} fill={entryColor} />
          {/* exit marker */}
          <circle cx={xExit} cy={yExit} r={9} fill={exitColor} opacity={0.18} />
          <circle cx={xExit} cy={yExit} r={4.5} fill={exitColor} />

          {/* entry labels */}
          <text x={xEntry} y={yEntry - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={entryColor}>
            {entryAction}
          </text>
          <text x={xEntry} y={H - 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-100)">
            {fmtPrice(entry)}
          </text>
          <text x={xEntry} y={H - 7} textAnchor="middle" fontSize="9" fill="var(--ink-45)">
            entry
          </text>

          {/* exit labels */}
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
          ? `Bought at ${fmtPrice(entry)} and sold at ${fmtPrice(exit)}.`
          : `Sold short at ${fmtPrice(entry)} and bought back at ${fmtPrice(exit)}.`}{" "}
        Backtested historical trade — not a prediction.
      </p>
    </div>
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
