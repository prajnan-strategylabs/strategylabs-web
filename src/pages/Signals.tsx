import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Radio, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface Signal {
  id: string;
  asset: string;
  direction: "LONG" | "SHORT";
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  status: "new" | "filled" | "closed_tp" | "stopped";
  time: string;
}

export function Signals() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "new" | "filled" | "closed_tp">("all");

  const [signals] = useState<Signal[]>([
    {
      id: "sig-1",
      asset: "BTC/USDT",
      direction: "LONG",
      entry: 67200,
      stopLoss: 66100,
      takeProfit1: 69400,
      takeProfit2: 71200,
      status: "new",
      time: "2 hours ago",
    },
    {
      id: "sig-2",
      asset: "ETH/USDT",
      direction: "SHORT",
      entry: 3480,
      stopLoss: 3550,
      takeProfit1: 3340,
      status: "filled",
      time: "5 hours ago",
    },
    {
      id: "sig-3",
      asset: "SOL/USDT",
      direction: "LONG",
      entry: 142.5,
      stopLoss: 138.2,
      takeProfit1: 151.0,
      status: "closed_tp",
      time: "1 day ago",
    },
  ]);

  const filteredSignals = signals.filter((s) => filter === "all" || s.status === filter);

  return (
    <div className="space-y-6 pt-4">
      {/* ── HEADER TITLE ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent animate-pulse">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">Live Signals</h1>
            <p className="text-xs text-ink-muted mt-0.5">Real-time indicators triggered by verified models.</p>
          </div>
        </div>
      </div>

      {/* ── GATED DELAY BANNER (Free Tier) ── */}
      {user?.tier === "free" && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex gap-3 shadow-md shadow-yellow-500/5 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-none mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Daily Signals Delay Active</h4>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              You are currently viewing standard **1-day delayed signals**. Upgrading to Explorer ($19/mo) unlocks **instant push notifications** the second entry levels are triggered.
            </p>
          </div>
        </div>
      )}

      {/* ── STATUS FILTER TABS (Mobile Friendly Scroll) ── */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 select-none no-scrollbar">
        {(["all", "new", "filled", "closed_tp"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all border whitespace-nowrap active:scale-95
                       ${
                         filter === tab
                           ? "bg-accent border-accent text-bg"
                           : "border-line bg-bg-card/20 text-ink-muted hover:text-ink"
                       }`}
          >
            {tab === "all" ? "All Alerts" : tab === "new" ? "New Entry" : tab === "filled" ? "Filled" : "Hit TP"}
          </button>
        ))}
      </div>

      {/* ── CARD GRID (MOBILE-FIRST SCROLL OVER TABLES) ── */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center bg-transparent border-dashed">
            <Radio className="h-8 w-8 text-ink-subtle mb-3 animate-pulse" />
            <h3 className="font-bold text-ink">No signals found</h3>
            <p className="text-xs text-ink-muted mt-1">There are currently no active signals matching this filter.</p>
          </div>
        ) : (
          filteredSignals.map((sig) => (
            <div
              key={sig.id}
              className="card p-4 bg-bg-card/30 border-line/60 space-y-4 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
            >
              {/* Asset Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink">{sig.asset}</span>
                  <span className="text-[10px] text-ink-subtle">•</span>
                  <span className="text-[10px] text-ink-subtle font-medium">{sig.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Direction badge */}
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider
                               ${
                                 sig.direction === "LONG"
                                   ? "bg-emerald-500/10 text-emerald-400"
                                   : "bg-red-500/10 text-red-400"
                               }`}
                  >
                    {sig.direction === "LONG" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {sig.direction}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider
                               ${
                                 sig.status === "new"
                                   ? "bg-accent/15 text-accent"
                                   : sig.status === "filled"
                                   ? "bg-yellow-500/15 text-yellow-500"
                                   : sig.status === "closed_tp"
                                   ? "bg-emerald-500/15 text-emerald-400"
                                   : "bg-red-500/15 text-red-400"
                               }`}
                  >
                    {sig.status === "closed_tp" ? "Hit TP" : sig.status}
                  </span>
                </div>
              </div>

              {/* Signal Levels Grid */}
              <div className="grid grid-cols-3 gap-2 bg-bg-elev/40 rounded-xl p-3 border border-line/40 text-center">
                <div>
                  <div className="text-[9px] font-bold text-ink-subtle uppercase">Entry</div>
                  <div className="text-xs font-extrabold text-ink mt-1 tabular-nums">
                    ${sig.entry.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-ink-subtle uppercase">Stop Loss</div>
                  <div className="text-xs font-extrabold text-red-400 mt-1 tabular-nums">
                    ${sig.stopLoss.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-ink-subtle uppercase">Target TP1</div>
                  <div className="text-xs font-extrabold text-accent mt-1 tabular-nums">
                    ${sig.takeProfit1.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
