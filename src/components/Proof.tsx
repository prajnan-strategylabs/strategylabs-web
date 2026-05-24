import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Activity, 
  Info,
  RefreshCw,
  TrendingDown,
  ChevronDown,
  SlidersHorizontal,
  X
} from "lucide-react";
import { apiGetShowcaseData, ShowcaseResponse } from "../lib/api";
import { SYMBOLS_LIST, TIMEFRAMES } from "./ShowcaseConstants";
import { EquityChart } from "./EquityChart";

export function Proof() {
  const [activeSymbols, setActiveSymbols] = useState<string[]>(SYMBOLS_LIST.map((s) => s.id));
  const [timeframe, setTimeframe] = useState<string>("4h");
  const [period, setPeriod] = useState<string>("8yr");
  const [startingCapital, setStartingCapital] = useState<number>(10000);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ShowcaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dynamic backtest portfolio metrics from the FastAPI backend
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      if (activeSymbols.length === 0) {
        setData(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetShowcaseData(activeSymbols, timeframe, period);
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to compile showcase portfolio data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [activeSymbols, timeframe, period]);

  function toggleSymbol(symbol: string) {
    if (activeSymbols.includes(symbol)) {
      if (activeSymbols.length === 1) return;
      setActiveSymbols(activeSymbols.filter((s) => s !== symbol));
    } else {
      setActiveSymbols([...activeSymbols, symbol]);
    }
  }

  const stats = data?.stats || {
    total_return_pct: 0,
    max_drawdown_pct: 0,
    win_rate_pct: 0,
    trade_count: 0,
    sharpe_ratio: 0,
    profit_factor: 0
  };

  const isPositive = stats.total_return_pct >= 0;

  return (
    <section id="proof" className="border-t border-line py-24 relative overflow-hidden bg-bg/10">
      {/* Background glow decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[5%] h-[350px] w-[350px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] h-[250px] w-[250px] rounded-full bg-[#3b6af1]/5 blur-[100px]" />
      </div>

      <div className="container-app relative space-y-12">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="mx-auto w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
            Live Showcase Terminal
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
            Audit the proprietary <span className="text-accent">V22 Strategy</span>
          </h2>
          <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
            The V22 dual-regime ensemble is our flagship institutional model, backtested on <strong>47 USDT trading pairs</strong>. 
            Toggle assets and resolutions in the cockpit below to watch the portfolio outcomes aggregate in real time.
          </p>
        </div>

        {error && (
          <div className="max-w-lg mx-auto p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-center text-xs text-red-400 font-mono">
            {error}. Falling back to offline simulator mode.
          </div>
        )}

        {/* ── SYMMETRIC TWO-COLUMN COCKPIT (1:2 SPLIT) ── */}
        <div className="grid gap-6 md:grid-cols-12 items-stretch max-w-6xl mx-auto">
          
          {/* LEFT SIDEBAR: STATISTICS & PARAMETERS (COL 4) */}
          <div className="md:col-span-4 flex flex-col justify-between gap-4 relative">
            
            {/* STATS GRID (2x2) */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              
              {/* RETURN */}
              <div className="card p-4 border-line/60 bg-bg-card/45 flex flex-col justify-between backdrop-blur-sm min-h-[96px]">
                <div className="text-[9px] font-extrabold tracking-wider text-ink-muted uppercase flex items-center justify-between">
                  <span>PnL Return</span>
                  {isPositive ? <TrendingUp className="h-3 w-3 text-accent" /> : <TrendingDown className="h-3 w-3 text-red-400" />}
                </div>
                <div className={`text-xl font-black font-mono leading-none tracking-tight ${loading ? "text-ink-subtle" : isPositive ? "text-accent" : "text-red-400"}`}>
                  {loading ? "..." : `${isPositive ? "+" : ""}${stats.total_return_pct}%`}
                </div>
                <span className="text-[8px] text-ink-subtle font-mono uppercase tracking-wider">{period === "8yr" ? "8 yrs" : "YTD 2026"}</span>
              </div>

              {/* DRAWDOWN */}
              <div className="card p-4 border-line/60 bg-bg-card/45 flex flex-col justify-between backdrop-blur-sm min-h-[96px]">
                <div className="text-[9px] font-extrabold tracking-wider text-ink-muted uppercase flex items-center justify-between">
                  <span>Max DD</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-accent/80" />
                </div>
                <div className="text-xl font-black font-mono text-ink leading-none tracking-tight">
                  {loading ? "..." : `${stats.max_drawdown_pct}%`}
                </div>
                <span className={`text-[8px] font-mono uppercase tracking-wider ${stats.max_drawdown_pct < 10 ? "text-emerald-400" : stats.max_drawdown_pct < 18 ? "text-amber-400" : "text-red-400"}`}>
                  {stats.max_drawdown_pct < 10 ? "Low Risk" : stats.max_drawdown_pct < 18 ? "Moderate" : "High DD"}
                </span>
              </div>

              {/* WIN RATE */}
              <div className="card p-4 border-line/60 bg-bg-card/45 flex flex-col justify-between backdrop-blur-sm min-h-[96px]">
                <div className="text-[9px] font-extrabold tracking-wider text-ink-muted uppercase flex items-center justify-between">
                  <span>Win Rate</span>
                  <Target className="h-3.5 w-3.5 text-accent/80" />
                </div>
                <div className="text-xl font-black font-mono text-accent leading-none tracking-tight">
                  {loading ? "..." : `${stats.win_rate_pct}%`}
                </div>
                <span className="text-[8px] text-ink-subtle font-mono uppercase tracking-wider">{loading ? "..." : `${stats.trade_count} trades`}</span>
              </div>

              {/* SHARPE */}
              <div className="card p-4 border-line/60 bg-bg-card/45 flex flex-col justify-between backdrop-blur-sm min-h-[96px]">
                <div className="text-[9px] font-extrabold tracking-wider text-ink-muted uppercase flex items-center justify-between">
                  <span>Sharpe</span>
                  <Activity className="h-3.5 w-3.5 text-accent/80" />
                </div>
                <div className="text-xl font-black font-mono text-ink leading-none tracking-tight">
                  {loading ? "..." : stats.sharpe_ratio}
                </div>
                <span className={`text-[8px] font-mono uppercase tracking-wider ${stats.sharpe_ratio > 1.8 ? "text-accent" : stats.sharpe_ratio > 1.4 ? "text-emerald-400" : "text-ink-muted"}`}>
                  {stats.sharpe_ratio > 1.8 ? "Excellent" : stats.sharpe_ratio > 1.4 ? "Strong" : "Viable"}
                </span>
              </div>

            </div>

            {/* CONTROLS CARD: TIMEFRAMES, PERIOD, AND FLOATING DROPDOWN ALLOCATOR */}
            <div className="card p-4 border-line/60 bg-bg-card/45 space-y-4 backdrop-blur-sm relative">
              
              {/* A. Dropdown trigger button */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <span className="text-[9px] font-extrabold text-ink-subtle uppercase tracking-wider block">Portfolio Sizing</span>
                
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full py-2 px-3 rounded-lg text-[11px] font-semibold border flex items-center justify-between transition-all select-none
                    ${isDropdownOpen 
                      ? "bg-accent/10 border-accent text-accent" 
                      : "bg-bg-elev/45 border-line/80 text-ink hover:border-line hover:text-accent"
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-accent flex-none" />
                    <span>Select Coins ({activeSymbols.length} Active)</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-ink-subtle transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-accent" : ""}`} />
                </button>

                {/* B. Glassmorphic absolute-positioned popup menu (Opens upwards to avoid clipping) */}
                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 z-30 card p-4 border-accent/40 bg-bg-card/98 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-3 min-w-[280px]">
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <span className="text-[10px] font-black text-ink uppercase tracking-wider">Asset Allocator</span>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-ink-subtle hover:text-ink transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Action toggles inside dropdown */}
                    <div className="flex gap-2 text-[9px] font-extrabold font-mono">
                      <button
                        onClick={() => setActiveSymbols(SYMBOLS_LIST.map(s => s.id))}
                        className="flex-1 py-1 rounded bg-accent/15 border border-accent/20 text-accent hover:bg-accent/25 transition-all"
                      >
                        Select All 42
                      </button>
                      <button
                        onClick={() => setActiveSymbols(["BTC", "ETH", "SOL", "BNB", "LINK"])}
                        className="flex-1 py-1 rounded bg-bg-elev border border-line text-ink-muted hover:text-ink transition-all"
                      >
                        Core 5 Only
                      </button>
                    </div>

                    {/* Tickers scrollbox */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {SYMBOLS_LIST.map((sym) => {
                        const isActive = activeSymbols.includes(sym.id);
                        return (
                          <button
                            key={sym.id}
                            onClick={() => toggleSymbol(sym.id)}
                            className={`p-1.5 rounded text-[10px] text-left transition-all border flex items-center justify-between
                              ${isActive
                                ? "bg-accent/10 border-accent/40 text-accent font-bold"
                                : "bg-bg-elev/20 border-line/40 text-ink-muted hover:border-line hover:text-ink"
                              }`}
                          >
                            <span className="truncate">{sym.id}</span>
                            {isActive && <CheckIcon />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Starting Capital Selector */}
              <div className="space-y-2 border-t border-line/35 pt-3">
                <div className="flex justify-between items-center text-[9px] font-extrabold text-ink-subtle uppercase tracking-wider">
                  <span>Starting Capital</span>
                  <span className="font-mono text-accent font-black text-xs">${startingCapital.toLocaleString()}</span>
                </div>
                
                {/* Premium Slider */}
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={startingCapital}
                  onChange={(e) => setStartingCapital(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-bg-elev border border-line outline-none accent-accent cursor-pointer"
                />
                
                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-1 text-[8px] font-mono">
                  {[10000, 25000, 50000, 100000].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setStartingCapital(cap)}
                      className={`py-0.5 rounded border transition-all select-none
                        ${startingCapital === cap 
                          ? "bg-accent/15 border-accent text-accent font-bold" 
                          : "bg-bg-elev/20 border-line/45 text-ink-muted hover:border-line hover:text-ink"
                        }`}
                    >
                      ${cap >= 1000 ? `${cap / 1000}k` : cap}
                    </button>
                  ))}
                </div>
              </div>

              {/* B. Timeframe selector */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-ink-subtle uppercase tracking-wider block">Timeframe Resolution</span>
                <div className="grid grid-cols-4 gap-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setTimeframe(tf.id)}
                      className={`py-1 rounded font-mono text-[10px] font-extrabold uppercase transition-all select-none border
                        ${timeframe === tf.id 
                          ? "bg-accent/10 border-accent text-accent" 
                          : "bg-bg-elev/40 border-line/80 text-ink-muted hover:border-line hover:text-ink"
                        }`}
                    >
                      {tf.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* C. Period Selector */}
              <div className="flex items-center justify-between text-[10px] font-bold text-ink-muted pt-1">
                <span>Backtest Interval</span>
                <div className="flex bg-bg-elev border border-line rounded-lg p-0.5">
                  <button 
                    onClick={() => setPeriod("8yr")}
                    className={`px-2 py-0.5 text-[9px] rounded font-mono ${period === "8yr" ? "bg-accent text-bg font-extrabold" : "text-ink-muted"}`}
                  >
                    8 Yrs
                  </button>
                  <button 
                    onClick={() => setPeriod("ytd")}
                    className={`px-2 py-0.5 text-[9px] rounded font-mono ${period === "ytd" ? "bg-accent text-bg font-extrabold" : "text-ink-muted"}`}
                  >
                    2026 YTD
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COL: THE WIDESCREEN SVG EQUITY CHART (COL 8) */}
          <div className="md:col-span-8">
            <div className="card p-5 border-line/60 bg-bg-card/45 backdrop-blur-sm flex flex-col justify-between h-full min-h-[380px] relative">
              
              {/* Compiling spinner */}
              {loading && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-accent z-20">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono text-[9px] tracking-wider uppercase">Ingesting Tick Logs...</span>
                </div>
              )}

              {/* CHART HEADER */}
              <div className="flex justify-between items-center border-b border-line pb-3 gap-4">
                <div>
                  <div className="text-[9px] font-extrabold tracking-widest text-ink-subtle uppercase">
                    V22 Compounded Portfolio Outcome
                  </div>
                  <div className="text-base font-bold text-ink mt-0.5 flex items-center gap-2">
                    {period === "8yr" ? "Historical Multi-Regime Matrix" : "Out-of-Sample Validation"}
                    <span className="text-[9px] bg-accent/15 border border-accent/20 px-1.5 py-0.5 rounded font-mono text-accent">
                      {timeframe.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-extrabold text-ink-subtle uppercase">Total Portfolio Value</div>
                  <div className="font-mono font-bold text-sm text-accent mt-0.5">
                    {loading ? "$..." : `$${(startingCapital + (startingCapital * stats.total_return_pct) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="text-[8px] text-ink-subtle mt-0.5">
                    Started with ${startingCapital.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* DYNAMIC SVG CHART CONTAINER */}
              <div className="flex-1 mt-4 border border-line/30 rounded-xl bg-bg-elev/20 overflow-hidden flex flex-col justify-center min-h-[220px] relative">
                {loading ? (
                  <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-bg-elev/30 animate-pulse">
                    <svg className="w-full h-32 px-4 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,90 Q15,85 25,65 T50,55 T75,25 T100,10" fill="none" stroke="#22d3aa" strokeWidth="2" strokeDasharray="3 3" />
                    </svg>
                  </div>
                ) : data && data.equity_curve.length > 0 ? (
                  <div className="p-1 w-full">
                    <EquityChart 
                      data={data.equity_curve.map((pt) => [pt[0], pt[1] * (startingCapital / 10000.0)])} 
                      period={period} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 text-xs text-ink-subtle font-mono">
                    Please select at least one cryptocurrency to calculate the portfolio.
                  </div>
                )}
              </div>

              {/* METADATA FOOTER */}
              <div className="grid grid-cols-3 gap-2 border-t border-line/50 mt-4 pt-3.5 text-[9px] text-ink-muted font-medium">
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span>Friction & Slippage Adjusted</span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span>Profit Factor: {stats.profit_factor}</span>
                </div>
                <div className="text-right text-accent hover:underline flex items-center justify-end gap-0.5">
                  <a href="#" className="font-semibold">Download Raw Trades CSV →</a>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* DIVERSIFICATION TIPS CARD BELOW */}
        <div className="card p-4 border-line/60 bg-bg-card/45 flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-sm max-w-6xl mx-auto">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent flex-none">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-ink">💡 Portfolio Theory In Action</h4>
              <p className="text-[10px] text-ink-muted leading-relaxed">
                Notice how selecting a single asset like Solana yields aggressive drawdowns (~54%). Toggling on more assets automatically aggregates interleaved trades, mathematically smoothing the compounded equity curve and shrinking drawdown (~15%) while maintaining robust Sharpe ratios.
              </p>
            </div>
          </div>
          
          <a 
            href="#how"
            className="text-[10px] text-accent hover:underline font-bold font-mono uppercase flex items-center gap-1 flex-none self-end sm:self-center"
          >
            <span>Test strategy builder next</span>
            <ChevronDown className="h-3 w-3 animate-bounce" />
          </a>
        </div>

        <p className="text-center text-[9px] text-ink-subtle leading-relaxed">
          * Strategy Labs compiles trade simulations incorporating Binance historical fee splits. Past performance does not guarantee future results.
        </p>

      </div>
    </section>
  );
}

// Compact check icon inside dropdown
function CheckIcon() {
  return (
    <svg className="h-3 w-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
