import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Settings,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { EquityCurve, LiveDot, Pill } from "./MobileUI";

export interface DetailStrategy {
  id: string;
  name: string;
  asset: string;
  spec: string;
  status: "live" | "paused" | "draft" | "backtesting" | "ready" | "archived";
  ret: number;
  win: number;
  dd: number;
  trades: number;
}

type Tab = "overview" | "spec" | "trades";

/** Deterministic curve from the strategy's REAL backtest return: eased ramp
 *  from 100 to 100+ret. Illustrative shape, real endpoints — never random. */
function retRamp(ret: number, n = 60): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const eased = t * t * (3 - 2 * t);
    out.push(100 + ret * eased);
  }
  return out;
}

export function StrategyDetail({
  strategy,
  onBack,
}: {
  strategy: DetailStrategy;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const equity = retRamp(strategy.ret);

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      {/* ── header ── */}
      <header className="pt-1 flex items-center gap-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="h-9 w-9 rounded-lg border border-line/60 bg-bg-card/40 flex items-center justify-center text-ink-muted hover:text-ink active:scale-95 transition"
        >
          <ChevronLeft className="h-[15px] w-[15px]" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold">
            {strategy.asset}/USDT
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight truncate">
              {strategy.name}
            </h1>
            {strategy.status === "live" && (
              <Pill tone="accent">
                <LiveDot size={4} /> live
              </Pill>
            )}
            {strategy.status === "paused" && <Pill tone="warn">paused</Pill>}
            {strategy.status === "backtesting" && (
              <Pill tone="info">backtesting</Pill>
            )}
            {strategy.status === "ready" && <Pill tone="accent">ready</Pill>}
            {(strategy.status === "draft" ||
              strategy.status === "archived") && (
              <Pill>{strategy.status}</Pill>
            )}
          </div>
        </div>
        <button
          aria-label="Settings"
          className="h-9 w-9 rounded-lg border border-line/60 bg-bg-card/40 flex items-center justify-center text-ink-muted hover:text-ink active:scale-95 transition"
        >
          <Settings className="h-[15px] w-[15px]" />
        </button>
      </header>

      {/* ── PnL + equity chart ── */}
      <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold">
              Backtest return
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-[36px] font-extrabold tabular-nums font-mono leading-none"
                style={{ color: "var(--accent)" }}
              >
                {strategy.ret >= 0 ? "+" : ""}{strategy.ret}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 -mx-1">
          <EquityCurve data={equity} height={180} animated />
        </div>

        <p className="mt-2 text-[9px] text-ink-subtle leading-relaxed px-1">
          Illustrative curve drawn from the strategy's real backtest return.
          Open it in the Lab for the trade-by-trade equity curve.
        </p>
      </div>

      {/* ── metrics row — real backtest metrics only ── */}
      <div className="grid grid-cols-3 gap-2">
        {([
          ["Win", `${strategy.win}%`, "var(--ink)"],
          ["Max DD", `−${strategy.dd}%`, "#fda4af"],
          ["Trades", String(strategy.trades), "var(--accent)"],
        ] as const).map(([k, v, c]) => (
          <div
            key={k}
            className="rounded-lg border border-line/50 bg-bg-card/30 p-2.5"
          >
            <div className="text-[9px] uppercase tracking-[0.15em] text-ink-subtle font-bold">
              {k}
            </div>
            <div
              className="font-mono tabular-nums text-[14px] font-extrabold mt-0.5"
              style={{ color: c }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* ── tabs ── */}
      <div className="flex border-b border-line/40">
        {([
          ["overview", "Overview"],
          ["spec", "Spec"],
          ["trades", `Trades (${strategy.trades})`],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 h-10 text-[12px] font-bold border-b-2 transition ${
              tab === k ? "" : "text-ink-muted border-transparent"
            }`}
            style={
              tab === k
                ? { color: "var(--accent)", borderColor: "var(--accent)" }
                : {}
            }
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3 animate-fade-in">
          <div className="rounded-xl border border-line/60 bg-bg-card/40 p-3.5">
            <div className="text-[10px] uppercase tracking-[0.15em] text-ink-subtle font-bold">
              Rule summary
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed mt-1.5">
              {strategy.spec}
            </p>
          </div>

          <div className="rounded-xl border border-line/60 bg-bg-card/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-ink-subtle font-bold">
              <CheckCircle2 className="h-3 w-3" /> Checks run on every backtest
            </div>
            {([
              ["Monte Carlo", "500 seeded trade-order reshuffles"],
              ["Cost stress", "fees + slippage doubled"],
              ["Execution", "signal on close, fill at next open"],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px] py-1 border-b border-line/40 last:border-0">
                <span className="text-ink-muted">{k}</span>
                <span className="text-ink font-semibold">{v}</span>
              </div>
            ))}
            <p className="text-[9px] text-ink-subtle leading-relaxed pt-1">
              Per-run results live in the Lab's backtest report.
            </p>
          </div>
        </div>
      )}

      {tab === "spec" && (
        <div className="rounded-2xl border border-line/70 bg-bg-card/40 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line/40">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
              Generated spec
            </div>
            <Pill tone="accent">
              <CheckCircle2 className="h-[9px] w-[9px]" /> valid
            </Pill>
          </div>
          <pre className="px-4 py-4 font-mono text-[11px] leading-[1.75] text-ink-muted overflow-x-auto whitespace-pre-wrap">
            <span className="text-ink-subtle">asset:</span>{" "}
            <span style={{ color: "var(--accent)" }}>
              {strategy.asset}/USDT
            </span>
            {"\n"}
            <span className="text-ink-subtle">rules:</span>{" "}
            {strategy.spec}
            {"\n\n"}
            <span className="text-ink-subtle">
              Full compiled spec and parameters are in the Lab.
            </span>
          </pre>
        </div>
      )}

      {tab === "trades" && (
        <div className="rounded-2xl border border-line/70 bg-bg-card/40 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line/40">
            <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
              Recent trades
            </div>
          </div>
          <div className="px-4 py-6 text-center">
            <p className="text-[12px] text-ink-muted leading-relaxed">
              {strategy.trades > 0
                ? `${strategy.trades} trades in the last backtest. Open this strategy in the Lab to inspect every entry and exit.`
                : "No backtest trades yet. Run this strategy in the Lab to generate its trade log."}
            </p>
            <Link
              to="/lab"
              className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold"
              style={{ color: "var(--accent)" }}
            >
              Open in Strategy Lab <Zap className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── bottom action bar ── */}
      <div className="pt-2">
        <Link
          to="/lab"
          className="h-12 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          <Zap className="h-3.5 w-3.5" /> Open in Strategy Lab
        </Link>
      </div>
    </div>
  );
}
