import { useEffect, useState, useRef, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Terminal,
  Play,
  CheckCircle2,
  ArrowRight,
  Mic,
  AlertTriangle,
  Loader2,
  Lock,
  Send,
  RefreshCw,
  Zap,
  HelpCircle,
  X,
  Share2
} from "lucide-react";
import {
  apiCreateStrategy,
  apiQueueBacktest,
  apiGetBacktest,
  apiListBacktests,
  apiChatStrategySpec,
  apiAnalyzeBacktest,
  apiListStrategiesTyped,
  type ChatMessage,
  type Strategy
} from "../lib/api";
import {
  EquityCurve,
  LiveDot,
} from "../components/MobileUI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "../lib/toast";
import { hapticSuccess, hapticLight } from "../lib/haptics";
import { startDictation, type DictationHandle } from "../lib/speech";
import { shareBacktestCard } from "../lib/shareCard";

// Modular Sub-components Imports
import { LabTour, shouldShowLabTour } from "./strategylab/LabTour";
import { Stepper } from "./strategylab/Stepper";
import { CompilingPanel } from "./strategylab/CompilingPanel";
import { SpecCard } from "./strategylab/SpecCard";
import { SafetyChecks } from "./strategylab/SafetyChecks";
import { BacktestRunning } from "./strategylab/BacktestRunning";
import { TradePreview } from "./strategylab/TradePreview";

export type Stage = "input" | "compiling" | "chat" | "spec" | "backtesting" | "result";

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
  trader: 5,
  auto: 999999,
};

const INDICATOR_CHIPS = [
  { label: "RSI", phrase: "using RSI(14)" },
  { label: "MACD", phrase: "with MACD crossover confirmation" },
  { label: "EMA cross", phrase: "when the 9 EMA crosses above the 21 EMA" },
  { label: "Bollinger", phrase: "when price touches the lower Bollinger Band" },
  { label: "ATR stop", phrase: "with a stop loss at 1.5 ATR" },
  { label: "Volume", phrase: "confirmed by above-average volume" },
];

const TIMEFRAME_CHIPS = [
  { label: "15m", phrase: "on the 15m timeframe" },
  { label: "1H", phrase: "on the 1H timeframe" },
  { label: "4H", phrase: "on the 4H timeframe" },
  { label: "1D", phrase: "on the daily timeframe" },
  { label: "1W", phrase: "on the weekly timeframe" },
];

export function StrategyLab() {
  return <StrategyLabBody />;
}

function StrategyLabBody() {
  const { user } = useAuth();
  
  // Workflow Stages
  const [stage, setStage] = useState<Stage>("input");
  const [prompt, setPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  
  // Strategy & Backtest spec state
  const [currentSpec, setCurrentSpec] = useState<{
    asset: string;
    timeframe: string;
    indicators: string[];
    entry: string;
    exit: string;
    stop_loss: string;
    target: string;
  } | null>(null);
  
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [doubts, setDoubts] = useState<string[]>([]);
  
  // Simulation / Backtesting states
  const [equity, setEquity] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [backtestStats, setBacktestStats] = useState<any | null>(null);
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [userStrategies, setUserStrategies] = useState<Strategy[]>([]);
  const [userBacktests, setUserBacktests] = useState<any[]>([]);

  
  // Auditing / Upsell states
  const [auditReport, setAuditReport] = useState<{ analysis: string; optimized_prompt: string } | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upsellReason, setUpsellReason] = useState<"limit" | "audit" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);
  const [isDoubtsExpanded, setIsDoubtsExpanded] = useState(false);

  // Prompt helpers: chip pickers + voice dictation
  const [showTour, setShowTour] = useState(() => shouldShowLabTour());
  const [openPicker, setOpenPicker] = useState<"indicators" | "timeframes" | null>(null);
  const [listening, setListening] = useState(false);
  const dictationRef = useRef<DictationHandle | null>(null);
  const dictationBaseRef = useRef("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userTier = (user?.tier || "free").toLowerCase();
  const limit = TIER_LIMITS[userTier] ?? 1;

  // Auto-scroll chat window to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loadingChat]);

  // Load user's backtest count and saved strategies on mount and stage transitions
  useEffect(() => {
    if (!user) return;
    async function loadStats() {
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) return;
        
        const runs = await apiListBacktests(token);
        setRunCount(runs.length);
        setUserBacktests(runs);

        const strats = await apiListStrategiesTyped(token);
        setUserStrategies(strats);
      } catch (e) {
        // Silently fail
      }
    }
    loadStats();
  }, [user, stage]);

  // Conversational spec compiler trigger
  async function compileStrategy(latestPrompt: string, thread: ChatMessage[]) {
    setErrorMessage(null);
    setLoadingChat(true);
    
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("Authentication token required.");

      const res = await apiChatStrategySpec(token, latestPrompt, thread);
      
      // Update our Accumulating rules card state
      if (res.spec) {
        setCurrentSpec(res.spec);
      }

      // Add quant coach response to history
      const newAssistantMsg: ChatMessage = {
        role: "assistant",
        content: res.reply
      };
      
      setChatMessages((prev) => [...prev, newAssistantMsg]);
      setDoubts(res.doubts || []);

      if (res.is_complete) {
        setStage("spec");
      } else {
        setStage("chat");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact Quant Coach");
      setStage("input");
    } finally {
      setLoadingChat(false);
    }
  }

  // Initial compilation trigger
  function injectPhrase(phrase: string) {
    hapticLight();
    setPrompt((prev) => {
      const base = prev.trimEnd();
      if (base.toLowerCase().includes(phrase.toLowerCase())) return prev;
      return base ? `${base} ${phrase}` : phrase;
    });
  }

  async function handleMicToggle() {
    hapticLight();
    if (listening) {
      dictationRef.current?.stop();
      dictationRef.current = null;
      setListening(false);
      return;
    }

    dictationBaseRef.current = prompt.trimEnd();
    const handle = await startDictation(
      (transcript) => {
        const base = dictationBaseRef.current;
        setPrompt(base ? `${base} ${transcript}` : transcript);
      },
      () => {
        dictationRef.current = null;
        setListening(false);
      }
    );

    if (!handle) {
      toast("Voice input isn't available on this device.", "info");
      return;
    }
    dictationRef.current = handle;
    setListening(true);
  }

  // Stop dictation if the user leaves the input stage or the page
  useEffect(() => {
    if (stage !== "input" && dictationRef.current) {
      dictationRef.current.stop();
      dictationRef.current = null;
      setListening(false);
    }
    return () => {
      dictationRef.current?.stop();
    };
  }, [stage]);

  function handleInitialBuild() {
    if (!prompt.trim()) return;
    setStage("compiling");
    
    const initialMsg: ChatMessage = {
      role: "user",
      content: prompt
    };
    
    setChatMessages([initialMsg]);
    compileStrategy(prompt, [initialMsg]);
  }

  // Chat message resolution submission
  function handleSendMessage() {
    if (!chatInput.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: chatInput
    };

    const updatedThread = [...chatMessages, userMsg];
    setChatMessages(updatedThread);
    setChatInput("");
    
    compileStrategy(chatInput, updatedThread);
  }

  // Enforce strategy limits and launch Walk-forward backtesting
  async function handleRunBacktest() {
    if (!currentSpec) return;
    setErrorMessage(null);
    setStage("backtesting");
    setEquity([]);
    setProgress(0);

    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No active session");

      // Verify limits locally beforehand to give instant drawer popup
      const runs = await apiListBacktests(token);
      if (runs.length >= limit) {
        setUpsellReason("limit");
        setShowUpgradeModal(true);
        setStage("spec");
        return;
      }

      // 1. Create strategy record first
      const strategyName = `${currentSpec.asset} AI ${currentSpec.timeframe} Strategy`;
      const stratRes: any = await apiCreateStrategy(token, {
        name: strategyName,
        spec: currentSpec,
        source_prompt: prompt
      });

      // 2. Queue a backtest run on backend
      const today = new Date().toISOString().split("T")[0];
      const startOfYear = `${new Date().getFullYear() - 8}-01-01`; // 8 years data
      const runRes: any = await apiQueueBacktest(token, stratRes.id, startOfYear, today);
      setActiveRunId(runRes.id);

      // 3. Realistic high-fidelity loading simulation
      let progressVal = 0;
      const progressInterval = window.setInterval(async () => {
        progressVal += Math.round(Math.random() * 8) + 4;
        if (progressVal >= 95) {
          progressVal = 95;
        }
        setProgress(progressVal);
        
        // Generate random walk points for visual curve representation
        setEquity((prev) => {
          const base = prev.length ? prev[prev.length - 1] : 100;
          const next = base + (Math.random() - 0.415) * 4.5;
          return [...prev, round(next, 2)];
        });
      }, 100);

      // 4. Poll actual run results from backend until finished
      let attempts = 0;
      const pollInterval = window.setInterval(async () => {
        attempts++;
        if (attempts > 60) { // Support slightly longer execution if backend needs it (48 seconds max)
          window.clearInterval(pollInterval);
          window.clearInterval(progressInterval);
          setErrorMessage("Simulation timed out on backend. Please try again.");
          setStage("spec");
          return;
        }

        try {
          const runStatus: any = await apiGetBacktest(token, runRes.id);
          if (runStatus.status === "completed" && runStatus.stats) {
            window.clearInterval(pollInterval);
            window.clearInterval(progressInterval);
            
            setProgress(100);
            setBacktestStats(runStatus.stats);
            setEquity(runStatus.stats.equity_curve.map((p: any) => p[1]));
            hapticSuccess();

            window.setTimeout(() => setStage("result"), 250);
          } else if (runStatus.status === "failed") {
            window.clearInterval(pollInterval);
            window.clearInterval(progressInterval);
            setErrorMessage(runStatus.error || "Simulation failed on backend.");
            setStage("spec");
            return;
          }
        } catch (err: any) {
          window.clearInterval(pollInterval);
          window.clearInterval(progressInterval);
          setErrorMessage(err.message || "Failed to retrieve simulation status.");
          setStage("spec");
          return;
        }
      }, 800);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete walk-forward backtest.");
      setStage("spec");
    }
  }

  // Trigger post-backtest AI Quant Audit with upsell limits
  async function handleRequestAudit() {
    if (!activeRunId) return;
    
    // Gated by tier! Direct check to trigger upsell locks
    if (userTier === "free") {
      setUpsellReason("audit");
      setShowUpgradeModal(true);
      return;
    }

    setLoadingAudit(true);
    setErrorMessage(null);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("Authorization expired");

      const res = await apiAnalyzeBacktest(token, activeRunId);
      setAuditReport(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Auditing failed.");
    } finally {
      setLoadingAudit(false);
    }
  }

  // Auto-optimize trigger: loads updated rules back and triggers compile
  function handleApplyOptimization(optPrompt: string) {
    setPrompt(optPrompt);
    setStage("compiling");
    setChatMessages([]);
    setCurrentSpec(null);
    setAuditReport(null);
    
    const initialMsg: ChatMessage = {
      role: "user",
      content: optPrompt
    };
    
    setChatMessages([initialMsg]);
    compileStrategy(optPrompt, [initialMsg]);
  }

  function reset() {
    setStage("input");
    setPrompt("");
    setChatMessages([]);
    setCurrentSpec(null);
    setDoubts([]);
    setEquity([]);
    setProgress(0);
    setBacktestStats(null);
    setShowAllTrades(false);
    setAuditReport(null);
    setErrorMessage(null);
  }

  function round(val: number, decimals: number): number {
    const power = Math.pow(10, decimals);
    return Math.round(val * power) / power;
  }

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* ── HEADER ── */}
      <header className={`pt-1 flex items-center justify-between ${stage === "chat" ? "hidden lg:flex" : "flex"}`}>
        <div className="flex items-center gap-2.5">
          <div
            className="relative h-10 w-10 rounded-2xl flex items-center justify-center bg-accent/15 text-accent"
          >
            <Sparkles className="h-[18px] w-[18px]" />
            <span
              className="absolute inset-0 rounded-2xl animate-ping border border-accent/40"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Strategy Lab
            </h1>
            <div className="text-[11px] text-ink-muted">
              Describe an idea. The Conversational Quant Coach compiles + tests it.
            </div>
          </div>
        </div>

        {/* Dynamic usage indicator */}
        {user && (
          <div className="rounded-xl border border-line bg-bg-card/45 px-3 py-1.5 font-mono text-[9px] font-bold text-ink-subtle flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500 animate-pulse" />
            Runs: {runCount} / {limit === 999999 ? "∞" : limit} Used
          </div>
        )}
      </header>

      {/* Stepper progress */}
      <div className={stage === "chat" ? "hidden lg:block" : "block"}>
        <Stepper stage={stage} />
      </div>

      {/* ── ERROR TOAST ── */}
      {errorMessage && (
        <div className="card border-red-500/25 bg-red-500/5 p-4 flex gap-3 items-start animate-fade-in">
          <AlertTriangle className="h-4.5 w-4.5 text-red-400 flex-none mt-0.5" />
          <div className="flex-1 space-y-2.5">
            <p className="text-xs text-red-400 font-semibold leading-relaxed">{errorMessage}</p>
            {currentSpec && (
              <button
                onClick={handleRunBacktest}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry backtest
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── INPUT PROMPT THESIS ── */}
      {stage === "input" && (
        <div className="space-y-4 animate-fade-in">
          {showTour && <LabTour onDone={() => setShowTour(false)} />}
          <div className="rounded-2xl border border-line bg-bg-card/40 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold">
              <Sparkles className="h-3 w-3" /> Describe your Strategy
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Buy BTC when 4H RSI dips below 30 in a bullish daily trend. Stop at 1.5 ATR, take profit at 3.5R."
              rows={5}
              className="mt-3 w-full rounded-xl border border-line bg-bg-elev/30 p-3.5 text-[13px] leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-bg-elev outline-none resize-none transition"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  aria-label="Voice input"
                  onClick={handleMicToggle}
                  className={`h-9 w-9 rounded-lg border flex items-center justify-center active:scale-95 transition ${
                    listening
                      ? "border-red-400/50 bg-red-500/15 text-red-400 animate-pulse"
                      : "border-line/60 bg-bg-elev text-ink-muted hover:text-ink"
                  }`}
                >
                  <Mic className="h-[15px] w-[15px]" />
                </button>
                <button
                  onClick={() => {
                    hapticLight();
                    setOpenPicker(openPicker === "indicators" ? null : "indicators");
                  }}
                  className={`text-[11px] font-bold px-3 h-9 rounded-lg border active:scale-95 transition ${
                    openPicker === "indicators"
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line/60 bg-bg-elev text-ink-muted hover:text-ink"
                  }`}
                >
                  + indicators
                </button>
                <button
                  onClick={() => {
                    hapticLight();
                    setOpenPicker(openPicker === "timeframes" ? null : "timeframes");
                  }}
                  className={`text-[11px] font-bold px-3 h-9 rounded-lg border active:scale-95 transition ${
                    openPicker === "timeframes"
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line/60 bg-bg-elev text-ink-muted hover:text-ink"
                  }`}
                >
                  + timeframes
                </button>
              </div>
              <button
                onClick={handleInitialBuild}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg font-bold text-[12px] transition active:scale-[0.98] disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
              >
                Draft Rules <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {listening && (
              <p className="mt-2 text-[10px] text-red-400/90 font-semibold animate-fade-in">
                Listening… speak your strategy, tap the mic again to stop.
              </p>
            )}

            {openPicker && (
              <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                {(openPicker === "indicators" ? INDICATOR_CHIPS : TIMEFRAME_CHIPS).map(
                  (chip) => (
                    <button
                      key={chip.label}
                      onClick={() => injectPhrase(chip.phrase)}
                      className="text-[11px] font-bold px-2.5 h-8 rounded-lg border border-accent/30 bg-accent/[0.06] text-accent hover:bg-accent/15 active:scale-95 transition"
                    >
                      {chip.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Saved Strategies */}
          {userStrategies.length > 0 && (
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle font-bold px-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-accent" /> Saved Strategies
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {userStrategies.map((strat) => {
                  const stratRuns = userBacktests.filter(
                    (run) => run.strategy_id === strat.id && run.status === "completed"
                  );
                  const latestRun = stratRuns.length > 0 ? stratRuns[0] : null;

                  return (
                    <button
                      key={strat.id}
                      onClick={() => {
                        setPrompt(strat.source_prompt || strat.name);
                        setCurrentSpec(strat.spec as any);
                        
                        if (latestRun && latestRun.stats) {
                          setBacktestStats(latestRun.stats);
                          setEquity(latestRun.stats.equity_curve.map((p: any) => p[1]));
                          setActiveRunId(latestRun.id);
                          setStage("result");
                        } else {
                          setStage("spec");
                        }
                      }}
                      className="w-full text-left rounded-xl border border-line/50 bg-bg-card/30 hover:bg-bg-card/60 hover:border-accent/40 p-3.5 flex flex-col gap-1.5 active:scale-[0.99] transition duration-200"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-[12px] text-ink truncate max-w-[65%]">
                          {strat.name}
                        </span>
                        <div className="flex items-center gap-1.5 flex-none">
                          {latestRun && latestRun.stats && (
                            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${latestRun.stats.total_return_pct >= 0 ? "text-accent bg-accent/10 border border-accent/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"}`}>
                              {latestRun.stats.total_return_pct >= 0 ? "+" : ""}{latestRun.stats.total_return_pct}%
                            </span>
                          )}
                          <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-ink-subtle bg-bg-elev px-1.5 py-0.5 rounded border border-line">
                            {strat.spec.asset as string || "Asset"}
                          </span>
                        </div>
                      </div>
                      {strat.source_prompt && (
                        <p className="text-[10.5px] text-ink-muted leading-relaxed line-clamp-2 italic">
                          "{strat.source_prompt}"
                        </p>
                      )}
                      <span className="text-[8.5px] font-mono text-ink-subtle">
                        Created: {new Date(strat.created_at).toLocaleDateString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* ── LOADING TYPEWRITER PANEL ── */}
      {stage === "compiling" && <CompilingPanel prompt={prompt} />}

      {/* ── COCH CHAT DOUBT ELICITATION THREAD ── */}
      {stage === "chat" && (
        <div className="space-y-4 animate-fade-in">
          
          {/* ── DESKTOP VIEW LAYOUT ── */}
          <div className="hidden lg:grid gap-6 lg:grid-cols-2 items-start">
            {/* Left panel: chatbot logs */}
            <div className="rounded-2xl border border-line bg-bg-card/40 flex flex-col h-[520px] overflow-hidden">
              {/* Header chat log */}
              <div className="px-4 py-3 border-b border-line/40 flex items-center justify-between bg-bg-elev/20">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-ink-muted flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-accent" />
                  Quant Coach doubt resolution
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] text-ink-subtle font-mono bg-bg-elev border border-line px-2 py-0.5 rounded">
                  <LiveDot size={4} /> {userTier === "free" ? "claude" : "quant-coach"}
                </span>
              </div>

              {/* Chat Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin select-text">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 max-w-[85%] ${m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <span className="text-[8px] font-mono text-ink-subtle uppercase">
                      {m.role === "user" ? "You" : "Quant Coach"}
                    </span>
                    <div className={`p-3 rounded-2xl text-[12px] leading-relaxed border
                      ${m.role === "user" 
                        ? "bg-bg-elev border-line text-ink" 
                        : "bg-accent/5 border-accent/15 text-ink-muted"}`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                
                {loadingChat && (
                  <div className="flex items-center gap-2 text-ink-subtle text-[11px] italic font-mono pl-2">
                    <Loader2 className="h-3 w-3 animate-spin text-accent" />
                    Coach compiling rules...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Questions to resolve banner */}
              {doubts.length > 0 && (
                <div className="border-t border-line bg-accent/5 p-3.5 space-y-1.5">
                  <span className="text-[9px] font-extrabold text-accent uppercase tracking-wider font-mono flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Clarification Required:
                  </span>
                  <ul className="list-disc pl-4 text-[10px] text-ink-muted leading-relaxed space-y-0.5">
                    {doubts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chat entry form */}
              <div className="border-t border-line p-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Reply to Quant Coach doubts..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loadingChat}
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-line bg-bg-elev/40 text-ink focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || loadingChat}
                  className="p-2.5 rounded-xl bg-accent text-bg hover:bg-accent/80 active:scale-95 disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right panel: dynamic spec card */}
            <div className="space-y-4">
              <SpecCard spec={currentSpec} />
              
              <div className="pt-2">
                <button
                  onClick={reset}
                  className="w-full h-11 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>

          {/* ── MOBILE NATIVE ANDROID MESSENGER LAYOUT ── */}
          <div className="flex lg:hidden flex-col bg-bg-card/25 border border-line rounded-2xl h-[580px] overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            
            {/* Top Bar Header */}
            <div className="px-4 py-3 border-b border-line/45 flex items-center justify-between bg-bg-elev/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                {/* Bot Avatar */}
                <div className="relative h-9 w-9 rounded-full flex items-center justify-center bg-accent/15 border border-accent/25 text-accent flex-none">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-accent border border-bg-card animate-pulse" />
                </div>
                <div>
                  <div className="text-[12px] font-black tracking-tight text-white leading-tight">
                    AI Quant Coach
                  </div>
                  <div className="text-[9px] text-accent font-semibold flex items-center gap-1 mt-0.5">
                    {loadingChat ? (
                      <span className="animate-pulse">typing...</span>
                    ) : (
                      <>
                        <span className="h-1 w-1 rounded-full bg-accent" />
                        online
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Header actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSpecSheetOpen(true)}
                  className="h-8 px-2.5 rounded-xl border border-line bg-bg-elev/60 hover:bg-bg-elev hover:text-accent font-bold text-[10px] text-ink-muted flex items-center gap-1 active:scale-95 transition"
                >
                  <Terminal className="h-3.5 w-3.5 text-accent" />
                  Spec
                  {currentSpec && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse ml-0.5" />
                  )}
                </button>
                <button
                  onClick={reset}
                  className="h-8 w-8 rounded-xl border border-line bg-bg-elev/60 text-ink-muted hover:text-red-400 flex items-center justify-center active:scale-95 transition"
                  title="Restart"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat message bubbles viewport */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4.5 scrollbar-thin select-text pb-20">
              {chatMessages.map((m, idx) => {
                const isBot = m.role === "assistant";
                return (
                  <div
                    key={idx}
                    className={`flex items-end gap-2 max-w-[88%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    {isBot && (
                      <div className="h-7 w-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[9px] text-accent flex-none font-bold">
                        QC
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[8px] font-mono text-ink-subtle uppercase px-1 leading-none">
                        {isBot ? "Quant Coach" : "You"}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-[12px] leading-relaxed relative border
                          ${isBot 
                            ? "bg-bg-elev/80 border-line/50 text-ink-muted rounded-bl-sm" 
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-[#0a0e1a] font-bold rounded-br-sm shadow-md"}`}
                      >
                        {m.content}
                        {!isBot && (
                          <span className="inline-flex text-[9px] text-[#0a0e1a]/60 ml-1.5 align-middle select-none">
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {loadingChat && (
                <div className="flex items-center gap-2 text-accent/80 text-[10.5px] italic font-mono pl-9 py-1 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  Coach compiling rules...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating warning banner for doubts */}
            {doubts.length > 0 && (
              <div className="absolute bottom-[58px] left-0 right-0 border-t border-line/60 bg-[#0c1224]/90 backdrop-blur-md px-3.5 py-2 space-y-1.5 z-10 transition-all duration-200">
                <button 
                  onClick={() => setIsDoubtsExpanded(!isDoubtsExpanded)}
                  className="w-full flex items-center justify-between text-[9px] font-black text-accent uppercase tracking-wider font-mono"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-accent animate-pulse" /> 
                    Clarification Required ({doubts.length} items)
                  </span>
                  <span className="text-ink-subtle hover:text-ink">
                    {isDoubtsExpanded ? "[ Collapse ]" : "[ Expand ]"}
                  </span>
                </button>
                {isDoubtsExpanded && (
                  <ul className="list-disc pl-4 text-[10px] text-ink-muted leading-relaxed space-y-0.5 animate-fade-in max-h-[120px] overflow-y-auto">
                    {doubts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Bottom sticky input controls */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-line bg-bg-card p-2 flex gap-2 items-center z-20">
              <div className="flex-1 rounded-3xl border border-line bg-bg-elev/80 px-4 py-2 flex items-center shadow-inner">
                <input
                  type="text"
                  placeholder="Reply to Quant Coach doubts..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={loadingChat}
                  className="w-full text-[11.5px] bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || loadingChat}
                className="h-9 w-9 rounded-full bg-accent text-bg hover:bg-accent/80 active:scale-90 disabled:opacity-40 transition flex items-center justify-center flex-none shadow-md shadow-accent/15"
              >
                <Send className="h-3.5 w-3.5 text-bg" />
              </button>
            </div>

          </div>

          {/* Slide-up Bottom Sheet for mobile spec card */}
          {isSpecSheetOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              {/* Backdrop Overlay */}
              <div
                onClick={() => setIsSpecSheetOpen(false)}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
              />
              
              {/* Drawer Sheet */}
              <div
                className="relative bg-bg-card rounded-t-3xl border-t border-line/65 p-5 max-h-[80vh] overflow-y-auto select-none shadow-2xl flex flex-col gap-4 pb-8 z-10 animate-slide-up"
              >
                {/* Drag handle decorator */}
                <div className="w-12 h-1 bg-line/60 rounded-full mx-auto -mt-1 mb-2 flex-none" />
                
                {/* Close Button */}
                <button
                  onClick={() => setIsSpecSheetOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-line bg-bg-elev text-ink-muted hover:text-ink active:scale-95 transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-xs font-bold text-ink-muted px-1 flex-none">
                  Generated Spec Ruleset
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <SpecCard spec={currentSpec} />
                </div>

                <div className="flex gap-3 mt-2 flex-none">
                  <button
                    onClick={() => {
                      reset();
                      setIsSpecSheetOpen(false);
                    }}
                    className="flex-1 h-11 rounded-xl border border-line bg-bg-elev text-xs font-bold text-red-400 hover:bg-red-500/10 active:scale-95 transition"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => setIsSpecSheetOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-accent text-bg text-xs font-bold active:scale-95 transition"
                  >
                    Continue Chat
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── RULES CODESPACE SPEC VIEW ── */}
      {stage === "spec" && (
        <div className="space-y-4 animate-fade-in">
          <SpecCard spec={currentSpec} />
          <SafetyChecks />

          {userTier === "free" && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-3.5 py-2.5 flex items-center gap-2.5">
              <Zap className="h-3.5 w-3.5 text-amber-500 flex-none" />
              <p className="text-[11px] font-semibold leading-snug text-amber-400/90">
                {limit - runCount <= 0
                  ? "You've used your free backtest — upgrade to run more."
                  : `${limit - runCount} free backtest${limit - runCount === 1 ? "" : "s"} remaining — make it count.`}
              </p>
            </div>
          )}

          {/* Mobile view controls */}
          <div className="flex lg:hidden flex-col gap-3 pt-2">
            <button
              onClick={handleRunBacktest}
              className="h-13 w-full rounded-2xl font-black tracking-wide text-[13px] active:scale-[0.98] transition inline-flex items-center justify-center gap-2 shadow-lg shadow-accent/25"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              <Play className="h-4 w-4 fill-current text-bg" /> RUN WALK-FORWARD BACKTEST
            </button>
            <button
              onClick={() => setStage("chat")}
              className="h-11 w-full rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
            >
              Refine Strategy Rules
            </button>
          </div>

          {/* Desktop view controls */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setStage("chat")}
              className="h-11 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
            >
              Refine rules
            </button>
            <button
              onClick={handleRunBacktest}
              className="h-11 rounded-xl font-bold text-[13px] active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              <Play className="h-3 w-3 fill-current text-bg" /> Run backtest
            </button>
          </div>
        </div>
      )}

      {/* ── SIMULATING LOADER ── */}
      {stage === "backtesting" && (
        <BacktestRunning equity={equity} progress={progress} />
      )}

      {/* ── RESULT BACKTEST BOARD & AI COACH AUDITS ── */}
      {stage === "result" && backtestStats && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero verdict card */}
          <div
            className="rounded-2xl border p-4 relative overflow-hidden"
            style={{
              borderColor: "rgba(34,211,170,0.30)",
              background: "linear-gradient(135deg, rgba(34,211,170,0.10), rgba(34,211,170,0.02))",
            }}
          >
            <div
              className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/15 blur-[40px]"
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent"
                >
                  Walk-forward verified
                </div>
                <div
                  className="text-[42px] font-extrabold tabular-nums font-mono leading-none mt-1 text-accent"
                >
                  {backtestStats.total_return_pct >= 0 ? "+" : ""}{backtestStats.total_return_pct}%
                </div>
                <div className="text-[11px] text-ink-muted mt-1">
                  backtest return · 8.2 years · {currentSpec?.asset || "BTC/USDT"}
                </div>
                <div className="text-[12px] text-ink font-semibold mt-2 leading-snug max-w-[260px]">
                  {verdictFor(backtestStats)}
                </div>
              </div>
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center bg-accent/18 text-accent"
              >
                <CheckCircle2 className="h-[22px] w-[22px]" />
              </div>
            </div>
            <div className="relative mt-3 -mx-1">
              <EquityCurve data={equity} height={80} animated />
            </div>
            <button
              onClick={() => {
                hapticLight();
                shareBacktestCard(
                  backtestStats,
                  currentSpec?.asset || "BTC/USDT",
                  equity
                ).catch(() => toast("Couldn't open the share sheet.", "error"));
              }}
              className="relative mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] font-bold text-accent hover:bg-accent/20 active:scale-95 transition"
            >
              <Share2 className="h-3.5 w-3.5" /> Share result
            </button>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard k="Win-rate" v={`${backtestStats.win_rate_pct}%`} sub={`${backtestStats.trade_count} trades`} info="How often trades closed in profit. Even 40% can be profitable if winners outsize losers." />
            <MetricCard k="Sharpe" v={String(backtestStats.sharpe_ratio)} sub="risk-adj" highlight info="Return earned per unit of risk taken. Above 1 is solid, above 2 is excellent." />
            <MetricCard k="Max DD" v={`−${backtestStats.max_drawdown_pct}%`} sub="recovered 18d" tone="danger" info="The worst peak-to-bottom drop. This is the pain you'd have to sit through." />
            <MetricCard k="Profit factor" v={String(backtestStats.profit_factor)} sub="gross/loss" info="Total profits divided by total losses. Above 1.5 means winners clearly outweigh losers." />
          </div>

          {/* Sleek Yearly Breakdown Cards */}
          {backtestStats.yearly_breakdown && (
            <div className="rounded-2xl border border-line bg-bg-card/45 p-4 space-y-3 animate-fade-in">
              <div className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-ink-subtle flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Yearly Performance Breakdown
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-ink-muted border-b border-line/45 pb-2">
                <div className="text-left pl-1">Year</div>
                <div>Trades</div>
                <div>Win Rate</div>
                <div>Max DD</div>
                <div className="text-right pr-1">Annual Return</div>
              </div>
              <div className="max-h-[165px] overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin select-text">
                {backtestStats.yearly_breakdown.map((y: any) => (
                  <div key={y.year} className="grid grid-cols-5 text-[11px] font-medium text-ink-muted py-1.5 items-center border-b border-line/20 last:border-0 last:pb-0">
                    <div className="text-left font-mono text-ink pl-1">{y.year}</div>
                    <div className="font-mono text-ink-subtle">{y.trades_count || 0}</div>
                    <div className="font-mono text-ink-subtle">{y.win_rate_pct}%</div>
                    <div className="font-mono text-rose-400/90">-{y.drawdown_pct}%</div>
                    <div className={`text-right font-mono font-extrabold pr-1 ${y.return_pct >= 0 ? "text-accent" : "text-rose-400"}`}>
                      {y.return_pct >= 0 ? "+" : ""}{y.return_pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trade logs preview with full view hook */}
          <TradePreview 
            trades={backtestStats.trades} 
            onViewAll={() => setShowAllTrades(true)} 
          />


          {/* ── AI QUANT STRATEGY COACH AUDITOR CARD ── */}
          <div className="card bg-bg-card/25 border-line hover:border-accent/30 p-6 space-y-4 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 border-b border-l border-line px-3 py-1 rounded-bl-xl">
              AI Quant Coach
            </div>

            <h3 className="text-base font-extrabold text-ink leading-none flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              AI Backtest Strategy Audit
            </h3>

            {/* AI AUDIT LOGIC (UPSELL CARD VS REAL ANALYSIS) */}
            {userTier === "free" ? (
              <div className="space-y-4">
                <p className="text-xs text-ink-muted leading-relaxed font-sans">
                  The backtest succeeded, but our neural analyzer detected <span className="font-bold text-amber-500">2 critical weaknesses</span> (risk clustering during low-liquidity whipsaws) in your rules spec. Upgrade to <span className="font-bold text-accent">Trader</span> or <span className="font-bold text-accent">Auto</span> to unlock the full code optimization audit.
                </p>


                {/* Sample finding preview */}
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-2 flex gap-3.5 items-start">
                  <Sparkles className="h-5 w-5 text-amber-500 flex-none" />
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-ink uppercase tracking-wide">Sample finding</h5>
                    <p className="text-[10px] text-ink-muted">Whipsaw analysis found 4 entry false-breakouts. ATR expansion trigger is recommended. The full audit explains how to fix each weakness.</p>
                  </div>
                </div>

                <button
                  onClick={handleRequestAudit}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all select-none shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  <Lock className="h-3.5 w-3.5 text-bg" /> Unlock Full Audit & Fixes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Loader typewriter */}
                {!auditReport && !loadingAudit && (
                  <div className="space-y-3">
                    <p className="text-xs text-ink-muted leading-relaxed font-sans">
                      Request a quantitative performance audit to scan your entries, identify consolidation traps, and optimize your stop losses.
                    </p>
                    <button
                      onClick={handleRequestAudit}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all active:scale-95"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-bg" /> Run Rule Weakness Scan
                    </button>
                  </div>
                )}

                {loadingAudit && (
                  <div className="flex items-center gap-3 text-ink-subtle text-xs italic font-mono py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                    AI is auditing historical trade executions...
                  </div>
                )}

                {auditReport && (
                  <div className="space-y-4 animate-fade-in font-sans">
                    <div className="text-xs md:text-sm text-ink-muted leading-relaxed space-y-3 bg-bg-elev/30 border border-line p-4 rounded-xl select-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {auditReport.analysis}
                      </ReactMarkdown>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> Recommended Optimization Rule Spec
                      </h4>
                      <p className="text-[11px] italic text-ink-muted leading-relaxed bg-bg-card p-3 rounded-lg border border-line font-mono">
                        "{auditReport.optimized_prompt}"
                      </p>
                      
                      <button
                        onClick={() => handleApplyOptimization(auditReport.optimized_prompt)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 text-bg fill-current" /> Auto-Apply Rules & Re-Test
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={reset}
              className="h-11 rounded-xl border border-line/70 bg-bg-elev/60 font-bold text-[13px] text-ink-muted hover:text-ink active:scale-[0.98] transition"
            >
              Start New Strategy
            </button>
            <button
              onClick={() => {
                if (userTier === "free") {
                  setUpsellReason("limit");
                  setShowUpgradeModal(true);
                } else {
                  hapticSuccess();
                  toast("Strategy saved to your Live Dashboard!", "success");
                }
              }}
              className="h-11 rounded-xl font-bold text-[13px] active:scale-[0.98] transition inline-flex items-center justify-center gap-1.5"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              Save & go live <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── PREMIUM UPSELL UPGRADE MODAL ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-bg-card p-6 shadow-2xl animate-slide-up relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-line bg-bg-elev text-ink-muted hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/25">
                {upsellReason === "limit" ? <Zap className="h-6 w-6 animate-pulse" /> : <Lock className="h-6 w-6" />}
              </div>
              
              <h3 className="text-lg font-black tracking-tight text-ink">
                {upsellReason === "limit" ? "Upgrade Trading Terminals" : "Unlock AI Quant Coach Auditing"}
              </h3>
              
              <p className="text-xs text-ink-muted mt-2 px-4 leading-relaxed font-sans">
                {upsellReason === "limit" 
                  ? "Free plan accounts are limited to exactly 1 strategy run. Upgrade to the Trader or Auto terminals to continue backtesting."
                  : "Post-backtest execution diagnostics and dynamic rules auto-tuning are reserved for premium plans."}
              </p>

              {/* Comparison card package */}
              <div className="w-full mt-6 space-y-3.5 text-left bg-bg-elev/40 rounded-2xl p-4 border border-line/45">
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>
                    <strong>Trader Tier ($49/mo)</strong>: 5 dynamic strategies + live Telegram notifications.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>
                    <strong>Auto Tier ($199/mo)</strong>: Unlimited strategies + live container execution bots.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-ink">
                  <CheckCircle2 className="h-4 w-4 text-accent flex-none" />
                  <span>
                    <strong>AI Quant Coach Audit</strong>: Comprehensive entry diagnostics and rules re-compiler.
                  </span>
                </div>
              </div>

              {/* Stripe simulated checkout triggers */}
              <div className="w-full mt-6 space-y-3">
                <button
                  onClick={() => toast("Simulated Stripe secure payment flow launched!", "info")}
                  className="btn-primary w-full py-3.5 shadow-lg shadow-accent/20 bg-amber-500 hover:bg-amber-600 text-bg font-bold font-mono text-[12px] flex items-center justify-center gap-1.5"
                >
                  <Zap className="h-4 w-4 fill-current text-bg" /> Unlock Quant Terminal Plan
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn-ghost w-full py-3.5 border-none text-[11px]"
                >
                  Return to Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL TRADES DETAILED DIALOG MODAL ── */}
      {showAllTrades && backtestStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in select-text">
          <div className="w-full max-w-xl rounded-3xl border border-line bg-bg-card p-6 shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-b-line/40">
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-ink">
                  Detailed Backtest Trade Logs
                </h3>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  Showing all {backtestStats.trades.length} strategy executions
                </p>
              </div>
              <button 
                onClick={() => setShowAllTrades(false)}
                className="p-1.5 rounded-lg border border-line bg-bg-elev text-ink-muted hover:text-ink transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable Table) */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-ink-muted border-b border-line/35 pb-2 mb-2">
                <div className="text-left pl-1">Date</div>
                <div>Side</div>
                <div className="col-span-2 text-left">Price coordinates</div>
                <div className="text-right pr-1">P&L (R)</div>
              </div>
              
              <div className="space-y-2">
                {backtestStats.trades.map((t: any, i: number) => (
                  <div 
                    key={i} 
                    className="grid grid-cols-5 gap-2 text-[11px] font-medium text-ink-muted py-1.5 items-center border-b border-line/15 last:border-0"
                  >
                    <div className="text-left font-mono text-ink-subtle pl-1">{t.date}</div>
                    <div className="text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.side === "LONG" ? "bg-accent/10 text-accent border border-accent/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {t.side}
                      </span>
                    </div>
                    <div className="col-span-2 text-left font-mono text-ink-subtle text-[10px] tabular-nums">
                      ${t.entry.toLocaleString()} → ${t.exit.toLocaleString()}
                    </div>
                    <div 
                      className={`text-right font-mono font-bold pr-1 ${t.pos ? "text-accent" : "text-rose-400"}`}
                    >
                      {t.r} ({t.pnl_pct >= 0 ? "+" : ""}{t.pnl_pct}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-line/40 flex justify-end">
              <button
                onClick={() => setShowAllTrades(false)}
                className="h-9 px-5 rounded-lg border border-line bg-bg-elev font-bold text-[11px] text-ink hover:text-accent transition active:scale-95"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Results Metric Card ───────── */
function verdictFor(stats: {
  sharpe_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_return_pct: number;
}) {
  if (stats.total_return_pct < 0) {
    return "This strategy lost money over the test period — refine the rules before going further.";
  }
  if (stats.sharpe_ratio >= 1.5 && stats.max_drawdown_pct <= 25) {
    return "Strong result: solid returns for the risk taken, with drawdowns most traders could stomach.";
  }
  if (stats.sharpe_ratio >= 1) {
    return "Decent edge — profitable with reasonable risk, though there's room to tighten the rough patches.";
  }
  if (stats.max_drawdown_pct > 40) {
    return `Profitable, but the −${stats.max_drawdown_pct}% drawdown would be brutal to sit through. Consider tighter risk rules.`;
  }
  return "Profitable overall, but the returns are thin for the risk involved — worth refining before trusting it.";
}

function MetricCard({
  k,
  v,
  sub,
  tone,
  highlight,
  info,
}: {
  k: string;
  v: ReactNode;
  sub: string;
  tone?: "danger";
  highlight?: boolean;
  info?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const color = tone === "danger" ? "#fda4af" : highlight ? "var(--accent)" : "var(--ink)";
  return (
    <div
      className={`rounded-xl border border-line/60 bg-bg-card/45 p-3.5 ${info ? "cursor-pointer" : ""}`}
      onClick={info ? () => setShowInfo((s) => !s) : undefined}
    >
      <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-ink-subtle flex items-center justify-between">
        <span>{k}</span>
        {info && <HelpCircle className="h-3 w-3 text-ink-subtle/70" />}
      </div>
      {showInfo && info ? (
        <p className="text-[10px] text-ink-muted leading-snug mt-1.5">{info}</p>
      ) : (
        <>
          <div
            className="font-mono tabular-nums text-[22px] font-extrabold mt-1"
            style={{ color }}
          >
            {v}
          </div>
          <div className="text-[10px] text-ink-subtle mt-0.5">{sub}</div>
        </>
      )}
    </div>
  );
}
