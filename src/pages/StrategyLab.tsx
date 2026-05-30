import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Terminal,
  Play,
  CheckCircle2,
  ArrowRight,
  Mic,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  EquityCurve,
  LiveDot,
  Pill,
} from "../components/MobileUI";

type Stage = "input" | "compiling" | "spec" | "backtesting" | "result";

const STARTER_IDEAS = [
  {
    tag: "BTC",
    text: "Buy BTC on 4H RSI < 30 when daily trend is bullish. Stop at 1.5 ATR, take profit at 3.5R.",
  },
  {
    tag: "ETH",
    text: "Mean-reversion on Ethereum. Long when price closes 2 std below the 20-EMA on 1H, exit at the EMA.",
  },
  {
    tag: "SOL",
    text: "Solana breakout: enter when price breaks 20-day high on rising volume, trail stop at 2× ATR.",
  },
];

const TIER_LIMITS: Record<string, number> = {
  free: 1,
  explorer: 3,
  trader: 10,
  pro: 50,
  auto: 9999,
};

export function StrategyLab() {
  // Strategy Lab is open to anyone who's signed in.
  // The landing-page waitlist form still captures emails for marketing,
  // but it no longer gates access. To re-introduce a gate later,
  // wrap <StrategyLabBody /> with <WaitlistGate> again.
  return <StrategyLabBody />;
}

function StrategyLabBody() {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>("input");
  const [prompt, setPrompt] = useState("");
  const [equity, setEquity] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const limit = user ? TIER_LIMITS[user.tier] ?? 1 : 1;
  const isFree = limit === 1;

  function build() {
    if (!prompt.trim()) return;
    setStage("compiling");
    window.setTimeout(() => setStage("spec"), 1800);
  }

  // Free-tier users can simulate locally — gating happens at Save (go-live) time.
  function runBacktest() {
    setStage("backtesting");
    setEquity([]);
    setProgress(0);
    const N = 80;
    let i = 0;
    let v = 100;
    const id = window.setInterval(() => {
      v += (Math.random() - 0.4) * 1.6 + 0.4;
      i++;
      setEquity((arr) => [...arr, v]);
      setProgress(Math.round((i / N) * 100));
      if (i >= N) {
        window.clearInterval(id);
        window.setTimeout(() => setStage("result"), 250);
      }
    }, 28);
  }

  function reset() {
    setStage("input");
    setPrompt("");
    setProgress(0);
    setEquity([]);
  }

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      {/* ── header ── */}
      <header className="pt-1">
        <div className="flex items-center gap-2.5">
          <div
            className="relative h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(34,211,170,0.15)",
              color: "var(--accent)",
            }}
          >
            <Sparkles className="h-[18px] w-[18px]" />
            <span
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{ boxShadow: "0 0 0 1px rgba(34,211,170,0.4)" }}
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Strategy Lab
            </h1>
            <div className="text-[11px] text-ink-muted">
              Describe an idea. We compile + simulate it.
            </div>
          </div>
        </div>
      </header>

      {/* ── stepper ── */}
      <Stepper stage={stage} />

      {/* ── INPUT ── */}
      {stage === "input" && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold">
              <Sparkles className="h-3 w-3" /> Your thesis
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Buy BTC when 4H RSI dips below 30 in a bullish daily trend. Stop at 1.5 ATR, take profit at 3.5R."
              rows={5}
              className="mt-3 w-full rounded-xl border border-line/70 bg-bg-elev/50 p-3.5 text-[13px] leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-bg-elev outline-none resize-none transition"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  aria-label="Voice input"
                  className="h-9 w-9 rounded-lg border border-line/60 bg-bg-elev flex items-center justify-center text-ink-muted hover:text-ink active:scale-95 transition"
                >
                  <Mic className="h-[15px] w-[15px]" />
                </button>
                <button className="text-[11px] font-bold text-ink-muted hover:text-ink px-3 h-9 rounded-lg border border-line/60 bg-bg-elev active:scale-95 transition">
                  + asset
                </button>
                <button className="text-[11px] font-bold text-ink-muted hover:text-ink px-3 h-9 rounded-lg border border-line/60 bg-bg-elev active:scale-95 transition">
                  + timeframe
                </button>
              </div>
              <button
                onClick={build}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg font-bold text-[12px] transition active:scale-[0.98] disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                Compile <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* templates */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold px-1">
              Starter ideas
            </div>
            <div className="space-y-2">
              {STARTER_IDEAS.map((ex) => (
                <button
                  key={ex.tag}
                  onClick={() => setPrompt(ex.text)}
                  className="w-full text-left rounded-xl border border-line/50 bg-bg-card/30 hover:bg-bg-card/60 hover:border-line p-3 flex gap-3 active:scale-[0.99] transition"
                >
                  <span className="h-7 w-7 rounded-lg bg-bg-elev border border-line/50 flex items-center justify-center font-mono text-[9px] font-bold text-ink-muted flex-none">
                    {ex.tag}
                  </span>
                  <span className="text-[12px] text-ink-muted leading-relaxed">
                    {ex.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPILING ── */}
      {stage === "compiling" && <CompilingPanel />}

      {/* ── SPEC ── */}
      {stage === "spec" && (
        <div className="space-y-4 animate-fade-in">
          <SpecCard />
          <SafetyChecks />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={reset}
              className="h-11 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
            >
              Edit prompt
            </button>
            <button
              onClick={runBacktest}
              className="h-11 rounded-xl font-bold text-[13px] active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              <Play className="h-3 w-3 fill-current" /> Run backtest
            </button>
          </div>
        </div>
      )}

      {/* ── BACKTESTING ── */}
      {stage === "backtesting" && (
        <BacktestRunning equity={equity} progress={progress} />
      )}

      {/* ── RESULT ── */}
      {stage === "result" && (
        <BacktestResult
          equity={equity}
          onReset={reset}
          onSave={() => {
            if (isFree) {
              setShowUpgradeModal(true);
            } else {
              alert("Strategy saved to your Dashboard.");
            }
          }}
        />
      )}

      {/* ── PREMIUM UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-ink">
                Unlock Priority Backtests
              </h3>
              <p className="text-sm text-ink-muted mt-2 px-4">
                Free plan users are limited to{" "}
                <strong className="text-ink">1 active strategy</strong>.
                Upgrade to Trader ($49/mo) to unlock:
              </p>

              <div className="w-full mt-6 space-y-3 text-left bg-bg-elev/40 rounded-2xl p-4 border border-line/40">
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>
                    <strong>10 active strategies</strong> + unlimited drafts
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>
                    <strong>Realtime V22 signals</strong> with Telegram alerts
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>Full trade-by-trade audit history + CSV exports</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                <button
                  onClick={() => alert("Simulated Stripe checkout!")}
                  className="btn-primary w-full py-3.5 shadow-lg shadow-accent/20"
                >
                  Start 7-day trial — then $49/mo
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn-ghost w-full py-3.5 border-none"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Stepper ───────── */
function Stepper({ stage }: { stage: Stage }) {
  const steps = ["Prompt", "Compile", "Backtest", "Result"];
  const map: Record<Stage, number> = {
    input: 0,
    compiling: 1,
    spec: 1,
    backtesting: 2,
    result: 3,
  };
  const idx = map[stage] ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <Segment key={s} label={s} active={i <= idx} current={i === idx} last={i === steps.length - 1} />
      ))}
    </div>
  );
}

function Segment({
  label,
  active,
  current,
  last,
}: {
  label: string;
  active: boolean;
  current: boolean;
  last: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 rounded-full transition-all ${active ? "" : "opacity-30"}`}
          style={{
            background: active ? "var(--accent)" : "var(--ink-subtle)",
            width: current ? 22 : 8,
          }}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${active ? "text-ink" : "text-ink-subtle"}`}
        >
          {label}
        </span>
      </div>
      {!last && (
        <span
          className="flex-1 h-px"
          style={{ background: "var(--line)" }}
        />
      )}
    </>
  );
}

/* ───────── Compiling panel ───────── */
function CompilingPanel() {
  const lines = [
    "// parsing thesis",
    "tokens   = lex(prompt)",
    "✓ identified asset: BTC",
    "✓ identified timeframe: 4H · 15m",
    "✓ identified indicators: RSI(14), EMA(20,50), ATR(14)",
    "// mapping to executable spec",
    "compiled.entry  = RSI(14,4H) ≤ 30 AND trend.daily == 'up'",
    "compiled.exit   = EMA(20,15m) ⊥ EMA(50,15m)",
    "compiled.stop   = 1.5 × ATR(14)",
    "compiled.target = 3.5R",
    "✓ ready — 0.42s",
  ];
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(lines.slice(0, i));
      if (i >= lines.length) window.clearInterval(id);
    }, 130);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="relative h-7 w-7 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(34,211,170,0.15)",
            color: "var(--accent)",
          }}
        >
          <Terminal className="h-[14px] w-[14px]" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          Compiling…
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ink-subtle font-mono">
          <LiveDot size={4} /> claude
        </span>
      </div>
      <div className="rounded-xl bg-bg-elev/70 border border-line/40 p-3.5 font-mono text-[11px] leading-[1.7] text-ink-muted min-h-[180px]">
        {shown.map((l, i) => {
          const isOk = l.startsWith("✓");
          const isComment = l.startsWith("//");
          return (
            <div
              key={i}
              style={{
                color: isOk
                  ? "var(--accent)"
                  : isComment
                    ? "var(--ink-subtle)"
                    : "var(--ink)",
              }}
            >
              {l}
              {i === shown.length - 1 && shown.length < lines.length && (
                <span
                  className="inline-block w-1.5 h-3 -mb-0.5 ml-0.5"
                  style={{
                    background: "var(--accent)",
                    animation: "blink 1s steps(1) infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Spec card ───────── */
function SpecCard() {
  return (
    <div className="rounded-2xl border border-line/70 bg-bg-card/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line/40">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          <Terminal className="h-3 w-3" /> Generated spec
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
        <span style={{ color: "var(--accent)" }}>BTC/USDT</span>
        {"\n"}
        <span className="text-ink-subtle">timeframe:</span>{" "}
        <span style={{ color: "var(--accent)" }}>4H</span>
        {"\n"}
        <span className="text-ink-subtle">indicators:</span>
        {"\n"}  - <span className="text-ink">RSI</span>(14) on 4H
        {"\n"}  - <span className="text-ink">EMA</span>(20, 50) on 15m
        {"\n"}  - <span className="text-ink">ATR</span>(14) on 4H
        {"\n"}
        <span className="text-ink-subtle">entry:</span> RSI(14,4H){" "}
        <span style={{ color: "var(--accent)" }}>{"<="}</span>{" "}
        <span style={{ color: "var(--accent)" }}>30</span> {"&&"} trend.daily ==
        "up"
        {"\n"}
        <span className="text-ink-subtle">exit:</span>  EMA(20,15m){" "}
        <span style={{ color: "var(--accent)" }}>×</span> EMA(50,15m)
        {"\n"}
        <span className="text-ink-subtle">stop:</span>  {" "}
        <span style={{ color: "var(--accent)" }}>1.5</span> × ATR(14)
        {"\n"}
        <span className="text-ink-subtle">target:</span>{" "}
        <span style={{ color: "var(--accent)" }}>3.5</span>R
      </pre>
    </div>
  );
}

/* ───────── Robustness checks ───────── */
function SafetyChecks() {
  const checks = [
    { k: "Walk-forward windows", v: "12 of 12 pass" },
    { k: "Monte-Carlo (10k runs)", v: "p95 DD < 15%" },
    { k: "Out-of-sample Sharpe", v: "2.31 (in: 2.44)" },
    { k: "Survivorship bias", v: "filtered" },
  ];
  return (
    <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-4 space-y-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
        <CheckCircle2 className="h-3 w-3" /> Robustness checks
      </div>
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.k}
            className="flex items-center justify-between text-[12px] py-1.5 border-b border-line/30 last:border-0"
          >
            <span className="text-ink-muted">{c.k}</span>
            <span className="font-mono text-ink flex items-center gap-1.5">
              {c.v}
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Backtest running ───────── */
function BacktestRunning({
  equity,
  progress,
}: {
  equity: number[];
  progress: number;
}) {
  return (
    <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-4 animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
            Simulating
          </span>
        </div>
        <span
          className="font-mono tabular-nums text-[12px] font-bold"
          style={{ color: "var(--accent)" }}
        >
          {progress}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--line)" }}
      >
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${progress}%`, background: "var(--accent)" }}
        />
      </div>
      <div className="rounded-xl bg-bg-elev/50 border border-line/40 px-3 py-2">
        <EquityCurve
          data={equity.length ? equity : [100, 100]}
          height={140}
          animated={false}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono tabular-nums text-ink-muted">
        <div>
          8.2y data <span className="text-ink-subtle">·</span>{" "}
          <span style={{ color: "var(--accent)" }}>scanning</span>
        </div>
        <div>
          47 pairs <span className="text-ink-subtle">·</span>{" "}
          <span style={{ color: "var(--accent)" }}>3 matched</span>
        </div>
        <div>1.2M bars</div>
      </div>
    </div>
  );
}

/* ───────── Result ───────── */
function BacktestResult({
  equity,
  onReset,
  onSave,
}: {
  equity: number[];
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* hero verdict */}
      <div
        className="rounded-2xl border p-4 relative overflow-hidden"
        style={{
          borderColor: "rgba(34,211,170,0.30)",
          background:
            "linear-gradient(135deg, rgba(34,211,170,0.10), rgba(34,211,170,0.02))",
        }}
      >
        <div
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full"
          style={{ background: "rgba(34,211,170,0.15)", filter: "blur(40px)" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.18em] font-bold"
              style={{ color: "var(--accent)" }}
            >
              Walk-forward verified
            </div>
            <div
              className="text-[42px] font-extrabold tabular-nums font-mono leading-none mt-1"
              style={{ color: "var(--accent)" }}
            >
              +784%
            </div>
            <div className="text-[11px] text-ink-muted mt-1">
              backtest return · 8.2 years · BTC/USDT
            </div>
          </div>
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(34,211,170,0.18)",
              color: "var(--accent)",
            }}
          >
            <CheckCircle2 className="h-[22px] w-[22px]" />
          </div>
        </div>
        <div className="relative mt-3 -mx-1">
          <EquityCurve data={equity} height={80} animated />
        </div>
      </div>

      {/* metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard k="Win-rate" v="49.2%" sub="142 trades" />
        <MetricCard k="Sharpe" v="2.31" sub="risk-adj" highlight />
        <MetricCard k="Max DD" v="−8.57%" sub="recovered 18d" tone="danger" />
        <MetricCard k="Profit factor" v="2.84" sub="gross/loss" />
      </div>

      {/* trade preview */}
      <TradePreview />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onReset}
          className="h-11 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
        >
          New thesis
        </button>
        <button
          onClick={onSave}
          className="h-11 rounded-xl font-bold text-[13px] active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          Save & go live <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  k,
  v,
  sub,
  tone,
  highlight,
}: {
  k: string;
  v: ReactNode;
  sub: string;
  tone?: "danger";
  highlight?: boolean;
}) {
  const color = tone === "danger" ? "#fda4af" : highlight ? "var(--accent)" : "var(--ink)";
  return (
    <div className="rounded-xl border border-line/60 bg-bg-card/40 p-3.5">
      <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-ink-subtle">
        {k}
      </div>
      <div
        className="font-mono tabular-nums text-[22px] font-extrabold mt-1"
        style={{ color }}
      >
        {v}
      </div>
      <div className="text-[10px] text-ink-subtle mt-0.5">{sub}</div>
    </div>
  );
}

function TradePreview() {
  const trades = [
    { d: "May 19", side: "LONG", entry: 67200, exit: 71400, r: "+3.5R", pos: true },
    { d: "May 12", side: "LONG", entry: 64800, exit: 63500, r: "−1.0R", pos: false },
    { d: "May 04", side: "LONG", entry: 61200, exit: 65400, r: "+3.5R", pos: true },
  ];
  return (
    <div className="rounded-2xl border border-line/70 bg-bg-card/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line/40">
        <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          Recent trades
        </div>
        <button className="text-[10px] font-bold text-ink-muted hover:text-ink flex items-center gap-1">
          View all <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </div>
      <div>
        {trades.map((t, i) => (
          <div
            key={i}
            className="px-4 py-2.5 flex items-center gap-3 text-[12px] border-b border-line/30 last:border-0"
          >
            <div className="text-ink-subtle font-mono w-14 text-[11px]">{t.d}</div>
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
  );
}
