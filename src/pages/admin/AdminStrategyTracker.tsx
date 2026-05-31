import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  apiAdminGetStrategies,
  apiAdminGetBacktests
} from "../../lib/api";
import {
  Terminal,
  Activity,
  Search,
  BookOpen,
  Eye,
  Loader2,
  TrendingUp,
  X,
  Clock
} from "lucide-react";
import { EquityCurve } from "../../components/MobileUI";

export function AdminStrategyTracker() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"strategies" | "backtests">("strategies");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [selectedSpec, setSelectedSpec] = useState<any | null>(null);
  const [selectedStats, setSelectedStats] = useState<any | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadLogs() {
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) throw new Error("No secure session");

        // Fetch logs parallelly
        const [stratsData, testsData] = await Promise.all([
          apiAdminGetStrategies(token),
          apiAdminGetBacktests(token)
        ]);

        setStrategies(stratsData || []);
        setBacktests(testsData || []);
      } catch (err: any) {
        triggerToast(err.message || "Failed to load activity logs", "error");
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Search Filter
  const filteredStrats = strategies.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (s.source_prompt || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const filteredTests = backtests.filter((t) =>
    t.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    t.strategy_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Compute Aggregations
  const totalStrategies = strategies.length;
  const totalRuns = backtests.length;
  
  const completedBacktests = backtests.filter((b) => b.status === "completed");
  const failedRuns = backtests.filter((b) => b.status === "failed").length;
  
  const avgReturn = completedBacktests.length
    ? Math.round(completedBacktests.reduce((sum, item) => sum + (item.stats?.total_return_pct || 0), 0) / completedBacktests.length)
    : 0;

  const avgSharpe = completedBacktests.length
    ? (completedBacktests.reduce((sum, item) => sum + (item.stats?.sharpe_ratio || 0), 0) / completedBacktests.length).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Strategy Lab Tracker</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Monitor user-compiled quantitative formulas, natural language prompts, simulation yields, and rule parameters.
        </p>
      </div>

      {/* ── OPERATION STATS CARDS ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        {/* Total Strategies */}
        <div className="card bg-bg-card/25 border-line/45 p-5 space-y-2">
          <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-ink-subtle">
            Strategies Compiled
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-ink">{totalStrategies}</span>
            <BookOpen className="h-5 w-5 text-amber-500/60" />
          </div>
          <p className="text-[10px] text-ink-muted">Active natural language rules spec</p>
        </div>

        {/* Total Backtests */}
        <div className="card bg-bg-card/25 border-line/45 p-5 space-y-2">
          <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-ink-subtle">
            Simulation Runs
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-ink">{totalRuns}</span>
            <Activity className="h-5 w-5 text-amber-500/60 animate-pulse" />
          </div>
          <p className="text-[10px] text-ink-muted">{failedRuns} runs failed / queued</p>
        </div>

        {/* Average Returns */}
        <div className="card bg-bg-card/25 border-line/45 p-5 space-y-2">
          <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-ink-subtle">
            Avg Backtest Return
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
              {avgReturn >= 0 ? "+" : ""}{avgReturn}%
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-500/60" />
          </div>
          <p className="text-[10px] text-ink-muted">Yield across walk-forward validation</p>
        </div>

        {/* Avg Sharpe */}
        <div className="card bg-bg-card/25 border-line/45 p-5 space-y-2">
          <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-ink-subtle">
            Avg Sharpe Ratio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tabular-nums text-amber-500">{avgSharpe}</span>
            <TrendingUp className="h-5 w-5 text-amber-500/60" />
          </div>
          <p className="text-[10px] text-ink-muted">System average risk-adjusted return</p>
        </div>
      </div>

      {/* ── FILTER & TAB HEADERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2740] pb-4">
        {/* Toggle tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`rounded-lg px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all select-none border
              ${activeTab === "strategies"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-transparent text-ink-muted border-transparent hover:text-ink"}`}
          >
            Compiled Rules ({totalStrategies})
          </button>
          <button
            onClick={() => setActiveTab("backtests")}
            className={`rounded-lg px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all select-none border
              ${activeTab === "backtests"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-transparent text-ink-muted border-transparent hover:text-ink"}`}
          >
            Simulation logs ({totalRuns})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search email, prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-line bg-bg-card/25 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* ── DATA MONITOR TABLES ── */}
      <div className="card bg-bg-card/15 border-line/45 p-0 overflow-hidden">
        {/* Strategies Log table */}
        {activeTab === "strategies" && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-bg-elev/20 border-b border-line">
                <tr className="font-mono uppercase tracking-wider text-[10px] text-ink-subtle">
                  <th className="px-6 py-4">User Email</th>
                  <th className="px-6 py-4">Plan Tier</th>
                  <th className="px-6 py-4">Strategy Name</th>
                  <th className="px-6 py-4">Original prompt</th>
                  <th className="px-6 py-4">Compiled Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredStrats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 italic text-ink-subtle font-mono">
                      No compiled rules found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredStrats.map((s) => (
                    <tr key={s.id} className="hover:bg-bg-elev/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-ink">{s.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider border
                          ${s.tier === "auto" 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                            : s.tier === "trader" 
                              ? "bg-accent/10 border-accent/20 text-accent" 
                              : "bg-bg-elev border-line text-ink-subtle"}`}
                        >
                          {s.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-ink-muted">{s.name}</td>
                      <td className="px-6 py-4 text-ink-muted line-clamp-2 max-w-xs leading-relaxed" title={s.source_prompt}>
                        {s.source_prompt || "—"}
                      </td>
                      <td className="px-6 py-4 text-ink-subtle font-mono text-[10px]">
                        {s.created_at ? s.created_at.slice(0, 16).replace("T", " ") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSpec(s.spec)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:underline font-mono"
                        >
                          <Eye className="h-3 w-3" /> Inspect Rules
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Backtests Log table */}
        {activeTab === "backtests" && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-bg-elev/20 border-b border-line">
                <tr className="font-mono uppercase tracking-wider text-[10px] text-ink-subtle">
                  <th className="px-6 py-4">User Email</th>
                  <th className="px-6 py-4">Plan Tier</th>
                  <th className="px-6 py-4">Execution Status</th>
                  <th className="px-6 py-4">Simulation yields</th>
                  <th className="px-6 py-4">Start / End Dates</th>
                  <th className="px-6 py-4">Completed Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 italic text-ink-subtle font-mono">
                      No simulation executions found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((t) => (
                    <tr key={t.id} className="hover:bg-bg-elev/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-ink">{t.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider border
                          ${t.tier === "auto" 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                            : t.tier === "trader" 
                              ? "bg-accent/10 border-accent/20 text-accent" 
                              : "bg-bg-elev border-line text-ink-subtle"}`}
                        >
                          {t.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase font-mono tracking-wider
                          ${t.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            : t.status === "failed"
                              ? "bg-red-500/10 border-red-500/25 text-red-400"
                              : "bg-amber-500/10 border-amber-500/25 text-amber-400"}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${t.status === "completed" ? "bg-emerald-400" : t.status === "failed" ? "bg-red-400" : "bg-amber-400 animate-pulse"}`} />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {t.status === "completed" && t.stats ? (
                          <div className="flex items-center gap-3 font-mono text-[10px] text-ink-muted">
                            <span className="text-emerald-400 font-extrabold">{t.stats.total_return_pct >= 0 ? "+" : ""}{t.stats.total_return_pct}%</span>
                            <span className="text-ink-subtle">·</span>
                            <span>Sharpe: <strong className="text-amber-500">{t.stats.sharpe_ratio}</strong></span>
                            <span className="text-ink-subtle">·</span>
                            <span className="text-rose-400">DD: {t.stats.max_drawdown_pct}%</span>
                          </div>
                        ) : t.status === "failed" ? (
                          <span className="text-rose-400 font-mono text-[10px] leading-relaxed block max-w-xs truncate" title={t.error}>
                            Failed: {t.error || "Execution timeout"}
                          </span>
                        ) : (
                          <span className="text-ink-subtle font-mono italic text-[10px]">Processing in background...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-ink-muted font-mono text-[10px]">
                        {t.start_date} <span className="text-ink-subtle">→</span> {t.end_date}
                      </td>
                      <td className="px-6 py-4 text-ink-subtle font-mono text-[10px]">
                        {t.completed_at ? t.completed_at.slice(0, 16).replace("T", " ") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => setSelectedSpec(t.spec)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:underline font-mono"
                        >
                          Rules
                        </button>
                        {t.status === "completed" && (
                          <button
                            onClick={() => setSelectedStats(t.stats)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline font-mono"
                          >
                            Yields
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAILED SPEC OVERLAY MODAL ── */}
      {selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg card border-amber-500/40 bg-bg-card/95 shadow-2xl p-0 overflow-hidden flex flex-col relative animate-slide-up">
            <button
              onClick={() => setSelectedSpec(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-line bg-bg-elev hover:text-white text-ink-muted transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 py-4 border-b border-line flex items-center gap-2 bg-bg-elev/20">
              <Terminal className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-ink">Rules Spec Code view</h3>
            </div>

            <div className="p-6 bg-bg-card select-text">
              <pre className="p-4 rounded-xl border border-line bg-bg-elev/40 font-mono text-xs leading-relaxed text-ink-muted max-h-96 overflow-y-auto scrollbar-thin">
                {JSON.stringify(selectedSpec, null, 2)}
              </pre>
            </div>
            
            <div className="px-6 py-3 border-t border-line text-right bg-bg-elev/10">
              <button
                onClick={() => setSelectedSpec(null)}
                className="btn-ghost py-1.5 px-4 text-xs font-mono border-line text-ink-muted hover:text-white"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAILED STATS OVERLAY MODAL ── */}
      {selectedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg card border-accent/40 bg-bg-card/95 shadow-2xl p-0 overflow-hidden flex flex-col relative animate-slide-up">
            <button
              onClick={() => setSelectedStats(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-line bg-bg-elev hover:text-white text-ink-muted transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 py-4 border-b border-line flex items-center gap-2 bg-bg-elev/20">
              <Activity className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-ink">Simulation Execution Stats</h3>
            </div>

            <div className="p-6 space-y-4 select-text">
              {/* Curve and stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-bg-elev/30 border border-line rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-ink-subtle font-mono">Win Rate</p>
                  <p className="text-base font-extrabold text-ink mt-1 font-mono">{selectedStats.win_rate_pct}%</p>
                </div>
                <div className="p-3 bg-bg-elev/30 border border-line rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-ink-subtle font-mono">Sharpe Ratio</p>
                  <p className="text-base font-extrabold text-ink mt-1 font-mono">{selectedStats.sharpe_ratio}</p>
                </div>
                <div className="p-3 bg-bg-elev/30 border border-line rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-ink-subtle font-mono">Max Drawdown</p>
                  <p className="text-base font-extrabold text-rose-400 mt-1 font-mono">-{selectedStats.max_drawdown_pct}%</p>
                </div>
                <div className="p-3 bg-bg-elev/30 border border-line rounded-lg">
                  <p className="text-[9px] uppercase font-bold text-ink-subtle font-mono">Total return</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-1 font-mono">+{selectedStats.total_return_pct}%</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-line bg-bg-elev/40 space-y-3 select-none">
                <span className="text-[9px] uppercase font-bold font-mono text-ink-subtle flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Equity Curve Walk-forward Preview
                </span>
                <EquityCurve data={selectedStats.equity_curve.map((p: any) => p[1])} height={120} animated />
              </div>
            </div>
            
            <div className="px-6 py-3 border-t border-line text-right bg-bg-elev/10">
              <button
                onClick={() => setSelectedStats(null)}
                className="btn-ghost py-1.5 px-4 text-xs font-mono border-line text-ink-muted hover:text-white"
              >
                Close Metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up
          ${toast.type === "error"
            ? "bg-red-500/10 border-red-500/25 text-red-400"
            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"}`}
        >
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
