import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Play, Pause, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { WaitlistGate } from "../components/WaitlistGate";

interface Strategy {
  id: string;
  name: string;
  spec: string;
  status: "draft" | "backtesting" | "ready" | "live" | "paused";
  created_at: string;
  metrics?: {
    return: number;
    winRate: number;
    drawdown: number;
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: "strat-1",
      name: "Swing Pullback BTC",
      spec: "Buy BTC on RSI oversold under 30 in 4H trend",
      status: "live",
      created_at: "2026-05-24",
      metrics: { return: 784, winRate: 49.2, drawdown: 8.57 },
    },
  ]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Active Strategy limit check
  const activeCount = strategies.filter((s) => s.status === "live" || s.status === "backtesting").length;
  
  // Dynamic Tier configuration
  const tierConfig = {
    free: { limit: 1, label: "Free Tier" },
    explorer: { limit: 3, label: "Explorer Tier" },
    trader: { limit: 10, label: "Trader Tier" },
    pro: { limit: 50, label: "Pro Tier" },
    auto: { limit: 9999, label: "Auto Tier" },
  };

  const currentLimit = user ? tierConfig[user.tier].limit : 1;
  const isAtLimit = activeCount >= currentLimit;

  function toggleStatus(id: string) {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        
        if (s.status === "live") {
          return { ...s, status: "paused" };
        } else {
          // If trying to activate, check tier limit
          if (isAtLimit) {
            setShowUpgradeModal(true);
            return s;
          }
          return { ...s, status: "live" };
        }
      })
    );
  }

  return (
    <WaitlistGate>
    <div className="space-y-6 pt-4">
      {/* ── TIER STATUS BANNER (Free Gated Callout) ── */}
      {user?.tier === "free" && (
        <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-lg shadow-accent/5 animate-fade-in">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/10 blur-[30px]" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent flex-none">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">You are on the Free Plan</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Unlock up to 3 active strategies, instant backtesting, and real-time signals.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="btn-primary py-2 px-4 text-xs shadow-md shadow-accent/20 flex-none"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* ── METRICS GRID (MOBILE PORTRAIT FRIENDLY) ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 bg-bg-card/40 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
            Active / Total
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-ink tabular-nums">{activeCount}</span>
            <span className="text-sm text-ink-muted">/</span>
            <span className="text-sm font-semibold text-ink-muted tabular-nums">
              {currentLimit === 9999 ? "∞" : currentLimit}
            </span>
          </div>
          <div className="w-full bg-line/30 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit ? "bg-red-400" : "bg-accent"
              }`}
              style={{ width: `${Math.min(100, (activeCount / currentLimit) * 100)}%` }}
            />
          </div>
        </div>

        <div className="card p-4 bg-bg-card/40 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
            Portfolio PnL
          </span>
          <div className="flex items-baseline gap-0.5 mt-2">
            <span className="text-3xl font-extrabold text-accent tabular-nums">+784%</span>
          </div>
          <div className="text-[10px] text-accent/80 font-medium mt-3 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Performance verified
          </div>
        </div>
      </div>

      {/* ── STRATEGIES SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">My Trading Labs</h2>
          <Link
            to="/lab"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            Create New <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {strategies.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed bg-transparent">
            <div className="rounded-2xl bg-line/20 p-4 mb-4 text-ink-muted">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-ink">No strategies yet</h3>
            <p className="text-sm text-ink-muted mt-1 max-w-xs">
              Go to the AI Strategy Lab to describe and backtest your first idea.
            </p>
            <Link to="/lab" className="btn-primary mt-6 text-sm">
              <Plus className="h-4 w-4" /> Launch Lab
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {strategies.map((strat) => (
              <div
                key={strat.id}
                className="card p-4 bg-bg-card/30 flex items-center justify-between border-line/60 hover:border-line transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="space-y-1 pr-4 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-ink truncate max-w-[150px] sm:max-w-none">
                      {strat.name}
                    </h3>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider
                                 ${
                                   strat.status === "live"
                                     ? "bg-accent/15 text-accent"
                                     : "bg-ink-muted/15 text-ink-subtle"
                                 }`}
                    >
                      {strat.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate max-w-[200px] sm:max-w-none">
                    {strat.spec}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-none">
                  {strat.metrics && (
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-accent">+{strat.metrics.return}%</div>
                      <div className="text-[10px] text-ink-muted">
                        Win: {strat.metrics.winRate}% | DD: {strat.metrics.drawdown}%
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleStatus(strat.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95
                               ${
                                 strat.status === "live"
                                   ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                   : "bg-accent/10 text-accent hover:bg-accent/20"
                               }`}
                  >
                    {strat.status === "live" ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 pl-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PREMIUM UPGRADE DRAWER / MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-ink">Upgrade to Active Explorer</h3>
              <p className="text-sm text-ink-muted mt-2 px-4">
                Free plan users are limited to <strong className="text-ink">1 active strategy</strong> at a time. Upgrade to Explorer ($19/mo) to unlock:
              </p>

              <div className="w-full mt-6 space-y-3 text-left bg-bg-elev/40 rounded-2xl p-4 border border-line/40">
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent flex-none" />
                  <span>Up to <strong>3 active strategies</strong> (instead of 1)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent flex-none" />
                  <span><strong>Real-time</strong> Signals feed (no delay)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent flex-none" />
                  <span><strong>Priority</strong> queue backtest runs</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                <button
                  onClick={() => alert("Simulated Stripe checkout!")}
                  className="btn-primary w-full py-3.5 shadow-lg shadow-accent/20"
                >
                  Upgrade for $19/month
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
    </WaitlistGate>
  );
}
