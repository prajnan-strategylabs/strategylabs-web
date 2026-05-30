import { useState } from "react";
import {
  ChevronLeft,
  Settings,
  Pause,
  Share2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { EquityCurve, LiveDot, Pill, genWalk } from "./MobileUI";

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

type Range = "1D" | "1W" | "1M" | "1Y" | "ALL";
type Tab = "overview" | "spec" | "trades";

export function StrategyDetail({
  strategy,
  onBack,
}: {
  strategy: DetailStrategy;
  onBack: () => void;
}) {
  const [range, setRange] = useState<Range>("ALL");
  const [tab, setTab] = useState<Tab>("overview");
  const equity = genWalk(200, 7, 2, 0.55);

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
            {strategy.asset}/USDT · 4H
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
              All-time return
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-[36px] font-extrabold tabular-nums font-mono leading-none"
                style={{ color: "var(--accent)" }}
              >
                +{strategy.ret}%
              </span>
              <span
                className="text-[12px] font-bold"
                style={{ color: "var(--accent)" }}
              >
                +2.4%
              </span>
              <span className="text-[10px] text-ink-subtle">24h</span>
            </div>
          </div>
        </div>

        {/* range tabs */}
        <div className="flex gap-1 mt-3 bg-bg-elev/50 rounded-lg p-1 border border-line/40">
          {(["1D", "1W", "1M", "1Y", "ALL"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 h-7 text-[10px] font-bold rounded-md transition ${
                range === r ? "text-bg" : "text-ink-muted hover:text-ink"
              }`}
              style={{
                background: range === r ? "var(--accent)" : "transparent",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-3 -mx-1">
          <EquityCurve data={equity} height={180} animated />
        </div>

        <div className="flex justify-between mt-1 text-[9px] text-ink-subtle font-mono tabular-nums px-1">
          <span>Jan '23</span>
          <span>Q3 '23</span>
          <span>Q1 '24</span>
          <span>Q3 '24</span>
          <span>now</span>
        </div>
      </div>

      {/* ── metrics row ── */}
      <div className="grid grid-cols-3 gap-2">
        {([
          ["Sharpe", "2.31", "var(--accent)"],
          ["Win", `${strategy.win}%`, "var(--ink)"],
          ["Max DD", `−${strategy.dd}%`, "#fda4af"],
          ["Trades", String(strategy.trades), "var(--ink)"],
          ["Avg R", "+1.8R", "var(--accent)"],
          ["Exposure", "31%", "var(--ink)"],
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
              Edge summary
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed mt-1.5">
              {strategy.spec}. Long-only mean-reversion within macro up-trend.
              Waits for 4H RSI to dip below 30, confirms daily trend remains
              bullish, exits when the short EMA crosses below the slower EMA on
              15m.
            </p>
          </div>

          <div className="rounded-xl border border-line/60 bg-bg-card/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.15em] text-ink-subtle font-bold">
                Robustness
              </div>
              <Pill tone="accent">
                <CheckCircle2 className="h-[9px] w-[9px]" /> passing
              </Pill>
            </div>
            {([
              ["Walk-forward", 12, 12],
              ["Monte-Carlo", 9821, 10000],
              ["Out-of-sample", 1, 1],
            ] as const).map(([k, p, t]) => (
              <div key={k}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-ink-muted">{k}</span>
                  <span className="font-mono tabular-nums text-ink">
                    {p.toLocaleString()}/{t.toLocaleString()}
                  </span>
                </div>
                <div
                  className="h-1 mt-1 rounded-full overflow-hidden"
                  style={{ background: "var(--line)" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${(p / t) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
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
          <pre className="px-4 py-4 font-mono text-[11px] leading-[1.75] text-ink-muted overflow-x-auto whitespace-pre">
            <span className="text-ink-subtle">version:</span>{" "}
            <span style={{ color: "var(--accent)" }}>"v22"</span>
            {"\n"}
            <span className="text-ink-subtle">asset:</span>{" "}
            <span style={{ color: "var(--accent)" }}>
              {strategy.asset}/USDT
            </span>
            {"\n"}
            <span className="text-ink-subtle">timeframe:</span>{" "}
            <span style={{ color: "var(--accent)" }}>4H</span>
            {"\n"}
            <span className="text-ink-subtle">entry:</span>{" "}
            RSI(14,4H) {"<="}{" "}
            <span style={{ color: "var(--accent)" }}>30</span> {"&&"}{" "}
            trend.daily == "up"
            {"\n"}
            <span className="text-ink-subtle">stop:</span>{" "}
            <span style={{ color: "var(--accent)" }}>1.5</span> × ATR(14)
            {"\n"}
            <span className="text-ink-subtle">target:</span>{" "}
            <span style={{ color: "var(--accent)" }}>3.5</span>R
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
          <div>
            {[
              { d: "May 19", side: "LONG", entry: 67200, exit: 71400, r: "+3.5R", pos: true },
              { d: "May 12", side: "LONG", entry: 64800, exit: 63500, r: "−1.0R", pos: false },
              { d: "May 04", side: "LONG", entry: 61200, exit: 65400, r: "+3.5R", pos: true },
            ].map((t, i) => (
              <div
                key={i}
                className="px-4 py-2.5 flex items-center gap-3 text-[12px] border-b border-line/30 last:border-0"
              >
                <div className="text-ink-subtle font-mono w-14 text-[11px]">
                  {t.d}
                </div>
                <Pill tone={t.pos ? "accent" : "danger"}>{t.side}</Pill>
                <div className="flex-1 font-mono text-ink-muted text-[11px] tabular-nums">
                  ${t.entry.toLocaleString()} → ${t.exit.toLocaleString()}
                </div>
                <div
                  className="font-mono font-bold tabular-nums text-[12px]"
                  style={{ color: t.pos ? "var(--accent)" : "#fda4af" }}
                >
                  {t.r}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── bottom action bar ── */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <button className="h-12 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[12px] flex items-center justify-center gap-1.5 text-ink-muted hover:text-ink active:scale-95 transition">
          <Pause className="h-3.5 w-3.5" /> Pause
        </button>
        <button className="h-12 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[12px] flex items-center justify-center gap-1.5 text-ink-muted hover:text-ink active:scale-95 transition">
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        <button
          className="h-12 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          <Zap className="h-3.5 w-3.5" /> Trade
        </button>
      </div>
    </div>
  );
}
