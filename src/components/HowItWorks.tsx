import { useState, useRef } from "react";
import { 
  MessageSquare, 
  Cpu, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Check,
  SlidersHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { TEMPLATES } from "./SimulatorTemplates";

type SimulatorStage = "idle" | "compiling" | "backtesting" | "results" | "optimizing" | "optimized_results";

export function HowItWorks() {
  const [stage, setStage] = useState<SimulatorStage>("idle");
  const [promptText, setPromptText] = useState<string>("Select a strategy template above to watch the AI build it...");
  const [activeTemplate, setActiveTemplate] = useState<number>(-1);
  
  // Animation states
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [backtestProgress, setBacktestProgress] = useState<number>(0);
  const [backtestLogs, setBacktestLogs] = useState<string[]>([]);
  
  // Optimizer states
  const [optimizingProgress, setOptimizingProgress] = useState<number>(0);
  const [optimizerLogs, setOptimizerLogs] = useState<string[]>([]);
  
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backtestIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typewriter effect for templates
  function handleSelectTemplate(idx: number) {
    if (stage !== "idle" && stage !== "results" && stage !== "optimized_results") return;
    
    // Reset state
    setStage("idle");
    setActiveTemplate(idx);
    const targetPrompt = TEMPLATES[idx].prompt;
    
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    
    let currentIdx = 0;
    typingTimerRef.current = setInterval(() => {
      if (currentIdx <= targetPrompt.length) {
        setPromptText(targetPrompt.slice(0, currentIdx));
        currentIdx++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      }
    }, 15);
  }

  // AI Parameter Compile Sequence
  function handleStartCompilation() {
    if (promptText === "" || promptText.startsWith("Select a strategy")) {
      handleSelectTemplate(0); // Default to first template if empty
      return;
    }
    
    setStage("compiling");
    setCompileLogs([]);
    
    const logs = [
      "Initializing deep NLP translation matrix...",
      "Analyzing timeframe context: extracting chart constraints...",
      "Scanning token sequences for triggers: 'crossover', 'RSI'...",
      "Identifying indicators: extracting parameters...",
      "Validating risk guidelines: checking Stop Loss bounds...",
      "Syntax audit complete: Spec successfully compiled to V22 YAML!"
    ];
    
    let currentLogIdx = 0;
    const interval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setCompileLogs((prev) => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          handleStartBacktest();
        }, 800);
      }
    }, 500);
  }

  // Backtest Historical Processing Simulator
  function handleStartBacktest() {
    setStage("backtesting");
    setBacktestProgress(0);
    setBacktestLogs([]);
    
    const logs = [
      "Connecting to Binance Spot historical data vault...",
      "Ingesting 1,248,502 bars of high-fidelity OHLCV candles...",
      "Simulating 8 years of historical regime walk-forward bounds...",
      "Applying VIP exchange fees and 0.15% slippage penalties...",
      "Compiling trade matching matrix...",
      "Audit trail complete: Portfolio compound results generated!"
    ];

    let currentProgress = 0;
    
    backtestIntervalRef.current = setInterval(() => {
      currentProgress += 5;
      setBacktestProgress(currentProgress);
      
      const visibleLogs: string[] = [];
      if (currentProgress >= 10) visibleLogs.push(logs[0]);
      if (currentProgress >= 30) visibleLogs.push(logs[1]);
      if (currentProgress >= 50) visibleLogs.push(logs[2]);
      if (currentProgress >= 70) visibleLogs.push(logs[3]);
      if (currentProgress >= 90) visibleLogs.push(logs[4]);
      if (currentProgress >= 100) visibleLogs.push(logs[5]);
      
      setBacktestLogs(visibleLogs);

      if (currentProgress >= 100) {
        if (backtestIntervalRef.current) clearInterval(backtestIntervalRef.current);
        setTimeout(() => {
          setStage("results");
        }, 800);
      }
    }, 150);
  }

  // AI Optimizer Simulation
  function handleImproveStrategy() {
    setStage("optimizing");
    setOptimizingProgress(0);
    setOptimizerLogs([]);
    
    const logs = [
      "Initializing parameter optimizer sweep...",
      "Fine-tuning EMA period weights (crossover sweep)...",
      "Scanning RSI overshoot bands (optimizing threshold 30 -> 24)...",
      "Injecting ATR trailing stop trailing tighteners...",
      "Activating BTC regime-gate filters (filtering Longs in downtrends)...",
      "Optimizer sweep complete: Compound metrics upgraded!"
    ];

    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 10;
      setOptimizingProgress(currentProgress);
      
      const visibleLogs: string[] = [];
      if (currentProgress >= 20) visibleLogs.push(logs[0]);
      if (currentProgress >= 40) visibleLogs.push(logs[1]);
      if (currentProgress >= 60) visibleLogs.push(logs[2]);
      if (currentProgress >= 80) visibleLogs.push(logs[3]);
      if (currentProgress >= 100) {
        visibleLogs.push(logs[4]);
        visibleLogs.push(logs[5]); // Show final completion log
      }
      
      setOptimizerLogs(visibleLogs);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStage("optimized_results");
        }, 800);
      }
    }, 250);
  }

  function handleReset() {
    setStage("idle");
    setPromptText("Select a strategy template above to watch the AI build it...");
    setActiveTemplate(-1);
    setCompileLogs([]);
    setBacktestLogs([]);
    setOptimizerLogs([]);
  }

  const templateIdx = activeTemplate === -1 ? 0 : activeTemplate;
  const currentTemplate = TEMPLATES[templateIdx];

  return (
    <section id="how" className="border-t border-line py-24 bg-bg/25 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] left-[2%] h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="container-app relative">
        
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="mx-auto w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
            Interactive Strategy Lab Sandbox
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl text-ink">
            Compile your raw concept to live assets
          </h2>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Witness the Strategy Labs engine in action. Select a curated template to run a typewriter simulation, 
            or type your custom concepts, and click <strong>"Run AI Backtest"</strong> to watch it compile.
          </p>
        </div>

        {/* ── TEMPLATES SELECTOR BAR ── */}
        <div className="mt-12 max-w-4xl mx-auto grid gap-4 sm:grid-cols-3">
          {TEMPLATES.map((t, idx) => {
            const isActive = activeTemplate === idx;
            return (
              <button
                key={t.title}
                onClick={() => handleSelectTemplate(idx)}
                className={`card p-4 text-left border-line/60 transition-all select-none hover:scale-[1.01] flex flex-col justify-between
                  ${isActive 
                    ? "border-accent bg-accent/5 shadow-md shadow-accent/5" 
                    : "bg-bg-card/30 hover:border-line hover:bg-bg-card/50"
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-ink">{t.title}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-accent" />}
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1.5 leading-relaxed">{t.desc}</p>
                </div>
                <div className="text-[8px] font-mono text-accent mt-3 uppercase tracking-wider">
                  {t.timeframe} · {t.baseReturn} return
                </div>
              </button>
            );
          })}
        </div>

        {/* ── TWO-COLUMN INTERACTIVE SHELL ── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start max-w-6xl mx-auto">
          
          {/* LEFT: THE INTERACTIVE CONSOLE (COL 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* INPUT CONSOLE CARD */}
            <div className="card p-5 border-line/60 bg-bg-card/45 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <MessageSquare className="h-4 w-4" />
                  <span>Strategy Draft Box</span>
                </div>
                <span className="font-mono text-[9px] text-ink-subtle uppercase">English Input</span>
              </div>

              <div className="relative">
                <textarea
                  value={promptText}
                  readOnly
                  className="w-full min-h-[140px] p-4 rounded-xl border border-line bg-bg-elev/20 font-mono text-xs leading-relaxed text-ink-muted resize-none outline-none transition-all select-none cursor-default"
                  placeholder="Select a strategy template above to watch the AI build and optimize it..."
                />
              </div>

              <div className="flex gap-3">
                {stage === "idle" ? (
                  <button
                    onClick={handleStartCompilation}
                    disabled={activeTemplate === -1}
                    className={`w-full py-3 text-xs flex items-center justify-center gap-2 transition-all rounded-lg select-none font-bold
                      ${activeTemplate === -1
                        ? "bg-bg-elev border border-line text-ink-subtle cursor-not-allowed opacity-55"
                        : "btn-primary bg-accent text-bg shadow-md shadow-accent/25 hover:scale-[1.015]"
                      }`}
                  >
                    <Play className={`h-3.5 w-3.5 ${activeTemplate === -1 ? "text-ink-subtle fill-none" : "fill-bg text-bg"}`} />
                    <span>Run AI Backtest</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="btn-ghost w-full py-3 text-xs flex items-center justify-center gap-2 border-line text-ink-muted hover:border-line hover:text-ink"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Simulation</span>
                  </button>
                )}
              </div>
            </div>

            {/* WORKFLOW TIMELINE GUIDE (Visible in 'idle' stage to balance vertical heights) */}
            {stage === "idle" && (
              <div className="card p-5 border-line/60 bg-bg-card/45 backdrop-blur-sm space-y-4 animate-slide-up">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <SlidersHorizontal className="h-4 w-4 animate-pulse" />
                  <span>Interactive Walkthrough Steps</span>
                </div>
                
                <div className="space-y-3 select-none">
                  <div className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/30 text-accent font-mono text-[10px] font-bold flex items-center justify-center flex-none mt-0.5">
                      1
                    </div>
                    <div className="text-[11px] leading-relaxed text-ink-muted">
                      <strong className="text-ink">Draft Rules:</strong> Choose a template above to auto-type, or draft your concept in the box.
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start border-t border-line/30 pt-2.5">
                    <div className="w-5 h-5 rounded-full bg-bg-elev border border-line text-ink-subtle font-mono text-[10px] flex items-center justify-center flex-none mt-0.5">
                      2
                    </div>
                    <div className="text-[11px] leading-relaxed text-ink-muted">
                      <strong className="text-ink">Compile Spec:</strong> Click "Run AI Backtest". Watch the compiler map indicators.
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start border-t border-line/30 pt-2.5">
                    <div className="w-5 h-5 rounded-full bg-bg-elev border border-line text-ink-subtle font-mono text-[10px] flex items-center justify-center flex-none mt-0.5">
                      3
                    </div>
                    <div className="text-[11px] leading-relaxed text-ink-muted">
                      <strong className="text-ink">Run Simulation:</strong> Watch historical trades compound, draw equity curves, and optimize parameters!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI COMPILING LOGS CARD */}
            {(stage === "compiling" || (compileLogs.length > 0 && stage !== "optimizing" && stage !== "optimized_results")) && (
              <div className="card p-5 border-line/60 bg-bg-card/45 backdrop-blur-sm space-y-4 animate-slide-up">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <Cpu className="h-4 w-4" />
                  <span>AI Logic Compiler Logs</span>
                </div>

                <div className="space-y-2 rounded-xl border border-line bg-bg-elev/40 p-4 font-mono text-[10px] leading-relaxed text-ink-muted min-h-[120px] max-h-[220px] overflow-y-auto">
                  {compileLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-accent flex-none">✓</span>
                      <span className={idx === compileLogs.length - 1 && stage === "compiling" ? "text-ink font-semibold animate-pulse" : "text-ink-muted"}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {stage === "compiling" && (
                    <div className="flex gap-2 items-center text-accent animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin flex-none" />
                      <span>compiling parameters...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI OPTIMIZER LOGS CARD */}
            {(stage === "optimizing" || optimizerLogs.length > 0) && (
              <div className="card p-5 border-line/60 bg-bg-card/45 backdrop-blur-sm space-y-4 animate-slide-up">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>AI Parameters Sweep (Optimizer)</span>
                </div>

                <div className="space-y-2 rounded-xl border border-line bg-bg-elev/40 p-4 font-mono text-[10px] leading-relaxed text-ink-muted min-h-[120px]">
                  {optimizerLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-accent flex-none">⚡</span>
                      <span className={idx === optimizerLogs.length - 1 && stage === "optimizing" ? "text-ink font-semibold animate-pulse" : "text-ink-muted"}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {stage === "optimizing" && (
                    <div className="flex gap-2 items-center text-accent animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin flex-none" />
                      <span>sweeping thresholds... ({optimizingProgress}%)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: THE LIVE SIMULATOR COCKPIT DISPLAY (COL 7) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-md h-[465px] rounded-[36px] border-[6px] border-line/90 bg-bg p-4 shadow-[0_24px_50px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden flex flex-col">
              
              {/* Phone Notch */}
              <div className="absolute top-0 left-[50%] -translate-x-[50%] h-4 w-32 bg-line/90 rounded-b-xl z-20" />

              {/* Status bar */}
              <div className="flex justify-between items-center text-[9px] font-extrabold text-ink-subtle pt-2 pb-4 px-4 z-10 font-mono">
                <span>09:41</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Live Simulator Terminal
                </span>
              </div>

              {/* PHONE SCREEN CONTENT CONTAINER */}
              <div className="flex-1 bg-bg-card/25 rounded-[24px] border border-line/40 p-4 overflow-y-auto relative flex flex-col justify-between">
                
                {/* ── STATE 1: IDLE / WAIT STATE ── */}
                {stage === "idle" && (
                  <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-center items-center text-center px-4">
                    <div className="h-12 w-12 rounded-2xl bg-bg-elev/60 border border-line flex items-center justify-center text-accent mb-2">
                      <Cpu className="h-6 w-6 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-bold text-ink">Ready to compile backtest</h3>
                    <p className="text-xs text-ink-muted leading-relaxed max-w-xs">
                      Type your strategy rules or click a pre-baked template above, then click <strong>"Run AI Backtest"</strong> to compile parameter maps.
                    </p>
                  </div>
                )}

                {/* ── STATE 2: AI COMPILING SEQUENCE ── */}
                {stage === "compiling" && (
                  <div className="space-y-5 animate-fade-in flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <Cpu className="h-4 w-4" />
                        <span>AI Logic Compiler</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-accent animate-pulse">EXTRACTING...</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-ink-subtle">
                        <span>PARAMETER MAP</span>
                        <span>STATUS</span>
                      </div>
                      
                      <div className="space-y-2 rounded-xl border border-line bg-bg-elev/30 p-3">
                        <div className="flex items-center justify-between rounded-lg bg-accent/5 px-3 py-2 border border-accent/20">
                          <span className="text-[10px] font-semibold text-ink">Resolution: {currentTemplate.timeframe}</span>
                          <span className="text-[9px] font-extrabold text-accent uppercase">Timeframe</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-accent/5 px-3 py-2 border border-accent/20 animate-pulse">
                          <span className="text-[10px] font-semibold text-ink">Indicators: {currentTemplate.indicators}</span>
                          <span className="text-[9px] font-extrabold text-accent uppercase">Triggers</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-accent/5 px-3 py-2 border border-accent/20">
                          <span className="text-[10px] font-semibold text-ink">Stop Loss: {currentTemplate.stopLoss}</span>
                          <span className="text-[9px] font-extrabold text-accent uppercase">Risk Range</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STATE 3: ENGINE BACKTESTING PROCESSING ── */}
                {stage === "backtesting" && (
                  <div className="space-y-5 animate-fade-in flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <BarChart3 className="h-4 w-4" />
                        <span>Dynamic Backtest Engine</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-accent">{backtestProgress}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 w-full rounded-full bg-bg-elev border border-line overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full bg-accent transition-all duration-150 ease-out" 
                        style={{ width: `${backtestProgress}%` }}
                      />
                    </div>

                    {/* Scrolling terminal backtest logs */}
                    <div className="rounded-xl border border-line bg-bg-elev/40 p-4 font-mono text-[9px] leading-relaxed text-ink-subtle min-h-[110px] space-y-1">
                      {backtestLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <span className="text-accent flex-none">▶</span>
                          <span className="text-ink-muted">{log}</span>
                        </div>
                      ))}
                      <div className="animate-pulse inline-block w-1.5 h-3.5 bg-accent mt-1" />
                    </div>
                  </div>
                )}

                {/* ── STATE 4 & 6: RESULTS AND OPTIMIZED REPORT ── */}
                {(stage === "results" || stage === "optimizing" || stage === "optimized_results") && (
                  <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between h-full relative">
                    
                    {/* Scanning overlay beam for optimizer */}
                    {stage === "optimizing" && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/15 to-transparent h-16 w-full animate-bounce pointer-events-none z-10 border-y border-accent/20" />
                    )}

                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Walk-Forward Passed
                      </span>
                      <span className="text-[9px] font-mono font-bold text-ink-subtle uppercase">Compounding Results</span>
                    </div>

                    {/* 3 Metrics Dashboard columns */}
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-line/30 bg-bg-elev/20 border border-line/40 rounded-xl p-3">
                      <div>
                        <div className="text-[8px] font-bold text-ink-subtle uppercase">PnL Return</div>
                        <div className={`text-sm font-black mt-1 font-mono leading-none tracking-tight transition-all duration-300 ${stage === "optimized_results" ? "text-accent text-base" : "text-ink"}`}>
                          {stage === "optimized_results" ? currentTemplate.optReturn : currentTemplate.baseReturn}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-ink-subtle uppercase">Win-Rate</div>
                        <div className="text-sm font-black mt-1 font-mono text-ink leading-none tracking-tight">
                          {stage === "optimized_results" ? currentTemplate.optWinRate : currentTemplate.baseWinRate}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-ink-subtle uppercase">Max DD</div>
                        <div className="text-sm font-black mt-1 font-mono text-red-400 leading-none tracking-tight">
                          {stage === "optimized_results" ? currentTemplate.optDrawdown : currentTemplate.baseDrawdown}
                        </div>
                      </div>
                    </div>

                    {/* Comparative SVG Equity curve */}
                    <div className="rounded-xl bg-bg-elev/40 border border-line/40 p-3 h-28 relative overflow-hidden flex flex-col justify-center">
                      <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="eqBaseShow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b94a8" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#8b94a8" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="eqOptShow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3aa" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#22d3aa" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* BASELINE EQUITY LINE */}
                        <path d="M0,90 Q15,85 25,65 T50,55 T75,45 T100,32" fill="none" stroke="#8b94a8" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />

                        {/* OPTIMIZED UPGRADED EQUITY LINE */}
                        {(stage === "optimized_results" || stage === "optimizing") && (
                          <>
                            <path d="M0,90 C15,85 25,55 50,40 T75,20 T100,4 L100,100 L0,100 Z" fill="url(#eqOptShow)" className="transition-all duration-1000 ease-out" />
                            <path d="M0,90 C15,85 25,55 50,40 T75,20 T100,4" fill="none" stroke="#22d3aa" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                          </>
                        )}
                      </svg>
                      
                      {/* Live visual axis labels */}
                      <span className="absolute bottom-1 right-2 text-[7px] font-mono text-ink-subtle">
                        {stage === "optimized_results" ? "Compounded Portfolio Curve" : "Baseline Backtest Curve"}
                      </span>
                    </div>

                    {/* Parameter Optimization Details */}
                    {stage === "optimized_results" && (
                      <div className="rounded-lg bg-accent/5 border border-accent/20 p-2.5 text-[9px] text-ink-muted leading-tight font-mono space-y-1">
                        <div className="flex items-center justify-between text-accent font-bold">
                          <span>✓ Parameter Tweaks Active</span>
                          <span>Sweep Passed</span>
                        </div>
                        <div>• Optimized thresholds: RSI 30 → 24</div>
                        <div>• ATR trailing trail: 1.5x → dynamic 2.1x</div>
                        <div>• Rule Filter added: BTC daily trend regime-gate</div>
                      </div>
                    )}

                    {/* Simulator Cockpit Actions */}
                    <div className="space-y-2 mt-auto">
                      {stage === "results" ? (
                        <button
                          onClick={handleImproveStrategy}
                          className="btn-primary py-2.5 text-xs w-full bg-accent/15 text-accent hover:bg-accent/25 border border-accent/25 flex items-center justify-center gap-2"
                        >
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                          <span>Improve Strategy (AI Optimizer)</span>
                        </button>
                      ) : stage === "optimizing" ? (
                        <button
                          disabled
                          className="btn-primary py-2.5 text-xs w-full bg-bg-elev border border-line text-ink-subtle flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>AI Optimizer working... ({optimizingProgress}%)</span>
                        </button>
                      ) : (
                        <div className="rounded-lg bg-accent/10 border border-accent/30 p-2 text-center text-[10px] font-bold text-accent font-mono">
                          🎉 Optimizations Applied Successfully!
                        </div>
                      )}
                      
                      <Link
                        to="/login"
                        className="btn-primary py-2.5 text-xs w-full flex items-center justify-center gap-1.5 bg-accent text-bg shadow-md shadow-accent/20"
                      >
                        <span>Subscribe to Live Signals</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
