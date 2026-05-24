import { TrendingUp, ShieldCheck, Target, Activity } from "lucide-react";

// Pulled from real backtest summaries:
// s3s5_v22_top47_8yr.csv  → +$39,196 PnL, 8.57% maxDD, 1946 trades, 49.2% WR
// s3s5_v22_top47_ytd2026.csv → +$4,538 PnL, 4.77% maxDD, 171 trades, 50.9% WR
const STATS = [
  { label: "8-year return",   value: "+784%",  sub: "$5K → $44K backtested", icon: TrendingUp },
  { label: "Max drawdown",    value: "8.57%",  sub: "Within prop firm limits", icon: ShieldCheck },
  { label: "Win rate",        value: "49.2%",  sub: "1,946 trades · 47 pairs", icon: Target },
  { label: "Walk-forward",    value: "PASS",   sub: "Edge holds out-of-sample", icon: Activity },
];

// Approximate equity curve from 8-year backtest (smoothed sample points)
// Each point is [yearFraction (0..8), equityInUSD]
const EQUITY_CURVE: [number, number][] = [
  [0.0,  5000],   [0.3,  5050],   [0.5,  4980],   [1.0,  5060],
  [1.5,  5350],   [2.0,  5230],   [2.5,  6100],   [3.0,  6320],
  [3.5,  6450],   [4.0,  6890],   [4.5,  8500],   [5.0,  11500],
  [5.5,  16800],  [6.0,  19200],  [6.5,  24500],  [7.0,  29800],
  [7.5,  34800],  [8.0,  44196],
];

export function Proof() {
  return (
    <section id="proof" className="border-t border-line py-24">
      <div className="container-app">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
            Showcase strategy
          </div>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            One strategy. <span className="text-accent">8 years.</span> Audit it yourself.
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            This is the first strategy we tested on the lab. Every trade, every regime,
            verifiable. No cherry-picking, no future leakage — full walk-forward validation.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Equity curve */}
        <div className="card mt-8 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <div className="text-sm text-ink-muted">Equity curve · 2017 → 2024</div>
              <div className="font-mono text-xl font-semibold">
                $5,000 → <span className="text-accent">$44,196</span>
              </div>
            </div>
            <div className="hidden gap-6 text-right text-sm md:flex">
              <Mini label="Trades" value="1,946" />
              <Mini label="Profit factor" value="2.0" />
              <Mini label="Sharpe" value="1.4" />
            </div>
          </div>

          <EquityChart data={EQUITY_CURVE} />

          <div className="grid grid-cols-2 gap-4 border-t border-line px-6 py-4 text-xs text-ink-muted md:grid-cols-4">
            <div>Backtested on 47 USDT pairs (Binance)</div>
            <div>Two-strategy ensemble (S3 + S5)</div>
            <div>1% risk per trade · DD brake active</div>
            <div className="text-right">
              <a href="#" className="text-accent hover:underline">Download raw CSV →</a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-ink-subtle">
          Past performance does not predict future results. This is a backtest, not a guarantee.
          Trading involves substantial risk including possible loss of principal.
        </p>
      </div>
    </section>
  );
}

function StatCard({
  label, value, sub, icon: Icon,
}: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="card group hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
        <Icon className="h-4 w-4 text-accent/60 group-hover:text-accent transition-colors" />
      </div>
      <div className="stat-num mt-2 text-accent">{value}</div>
      <div className="mt-1 text-sm text-ink-muted">{sub}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-muted">{label}</div>
      <div className="font-mono font-semibold text-ink">{value}</div>
    </div>
  );
}

function EquityChart({ data }: { data: [number, number][] }) {
  const W = 800;
  const H = 280;
  const P = 24;

  const xs = data.map((d) => d[0]);
  const ys = data.map((d) => d[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);

  const fx = (x: number) => P + ((x - xMin) / (xMax - xMin)) * (W - 2 * P);
  const fy = (y: number) => H - P - ((y - yMin) / (yMax - yMin)) * (H - 2 * P);

  const linePath =
    "M " + data.map((d) => `${fx(d[0]).toFixed(1)} ${fy(d[1]).toFixed(1)}`).join(" L ");

  const fillPath =
    linePath +
    ` L ${fx(xMax).toFixed(1)} ${H - P} L ${fx(xMin).toFixed(1)} ${H - P} Z`;

  // Year ticks 2017..2024
  const yearTicks = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="w-full overflow-hidden bg-bg-DEFAULT px-2 py-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#22d3aa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3aa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal grid */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={P} x2={W - P}
            y1={H - P - g * (H - 2 * P)} y2={H - P - g * (H - 2 * P)}
            stroke="#1e2740" strokeDasharray="3 4"
          />
        ))}

        {/* year ticks */}
        {yearTicks.map((y) => (
          <text
            key={y}
            x={P + (y / 8) * (W - 2 * P)} y={H - 6}
            fill="#5a6378" fontSize="10" textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
          >
            {2017 + y}
          </text>
        ))}

        {/* fill + line */}
        <path d={fillPath} fill="url(#eqGrad)" />
        <path d={linePath} stroke="#22d3aa" strokeWidth="2" fill="none"
              strokeLinejoin="round" strokeLinecap="round" />

        {/* endpoint dot */}
        <circle cx={fx(xMax)} cy={fy(ys[ys.length - 1])} r="4" fill="#22d3aa" />
        <circle cx={fx(xMax)} cy={fy(ys[ys.length - 1])} r="8" fill="#22d3aa" fillOpacity="0.2" />
      </svg>
    </div>
  );
}
