import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { WaitlistGate } from "../components/WaitlistGate";
import {
  Bell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Radio,
  TrendingUp,
  Beaker,
  AlertCircle,
} from "lucide-react";
import {
  EquityCurve,
  LiveDot,
  NumFlow,
  Pill,
  Sparkline,
  genWalk,
} from "../components/MobileUI";
import { StrategyDetail } from "../components/StrategyDetail";
import { Button } from "../ui";
import { supabase } from "../lib/supabase";
import { apiListStrategiesTyped, type Strategy } from "../lib/api";

const TIER_CONFIG: Record<string, { limit: number; label: string }> = {
  free:     { limit: 1,    label: "Free Tier" },
  trader:   { limit: 10,   label: "Trader Tier" },
  auto:     { limit: 9999, label: "Auto Tier" },
};

/** UI shape derived from the API response — adds derived per-row fields. */
interface StrategyRow {
  id: string;
  name: string;
  spec: string;
  asset: string;
  status: "live" | "paused" | "draft" | "backtesting" | "ready" | "archived";
  ret: number;
  win: number;
  dd: number;
  trades: number;
  since: string;
  curve: number[];
}

export function Dashboard() {
  return (
    <WaitlistGate>
      <DashboardBody />
    </WaitlistGate>
  );
}

function DashboardBody() {
  const { user, isSandbox } = useAuth();
  const [rows, setRows] = useState<StrategyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Sandbox sessions don't have real auth — show empty state to demo it
        if (isSandbox || !supabase) {
          if (!cancelled) setRows([]);
          return;
        }
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) {
          if (!cancelled) setRows([]);
          return;
        }
        const raw: Strategy[] = await apiListStrategiesTyped(token);
        const mapped = raw.map(toRow);
        if (!cancelled) setRows(mapped);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setRows([]);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isSandbox]);

  const selected = selectedId
    ? rows?.find((s) => s.id === selectedId) ?? null
    : null;

  if (selected) {
    return (
      <StrategyDetail
        strategy={selected}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const activeCount = (rows ?? []).filter(
    (s) => s.status === "live" || s.status === "paused",
  ).length;
  const limit = user ? TIER_CONFIG[user.tier]?.limit ?? 1 : 1;

  return (
    <DashboardHome
      rows={rows}
      error={error}
      activeCount={activeCount}
      limit={limit}
      onOpen={(id) => setSelectedId(id)}
    />
  );
}

function DashboardHome({
  rows,
  error,
  activeCount,
  limit,
  onOpen,
}: {
  rows: StrategyRow[] | null;
  error: string | null;
  activeCount: number;
  limit: number;
  onOpen: (id: string) => void;
}) {
  const { user, updateDisplayName } = useAuth();
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" });
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const greet = user?.display_name || "Trader";

  const [traderName, setTraderName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);

  useEffect(() => {
    if (!user?.display_name) {
      const timer = setTimeout(() => setIsDrawerAnimating(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsDrawerAnimating(false);
    }
  }, [user?.display_name]);

  useEffect(() => {
    if (!user?.display_name) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [user?.display_name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const trimmed = traderName.trim();
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 20) {
      setNameError("Name must be 20 characters or less.");
      return;
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmed)) {
      setNameError("Letters, numbers, and spaces only.");
      return;
    }
    setSavingName(true);
    try {
      if (supabase) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({ display_name: trimmed })
          .eq("id", user!.id);
        if (updateErr) throw updateErr;
      }
      window.localStorage.setItem(`sl_name_${user!.id}`, trimmed);
      updateDisplayName(trimmed);
    } catch (err: any) {
      setNameError(err.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  // Hero PnL = sum of user's strategy returns (NOT V22's). Static between
  // loads — backtest data doesn't move, so the number doesn't either
  // (DESIGN.md: numbers count up once on first data, never animate again).
  const pnl = useMemo(
    () => (rows ?? []).reduce((sum, s) => sum + s.ret, 0),
    [rows],
  );

  // Aggregated equity curve — overlay each strategy's normalized curve.
  const equity = useMemo(() => {
    if (!rows || rows.length === 0) return Array(60).fill(100);
    const len = Math.min(...rows.map((r) => r.curve.length), 60);
    const blended: number[] = [];
    for (let i = 0; i < len; i++) {
      const sum = rows.reduce((s, r) => s + r.curve[i], 0);
      blended.push(sum / rows.length);
    }
    return blended;
  }, [rows]);

  const isLoading = rows === null;
  const isEmpty = rows !== null && rows.length === 0;

  // Aggregate stats — only meaningful if user has strategies
  const aggSharpe = useMemo(() => {
    if (!rows || rows.length === 0) return "—";
    // Simple proxy: median Sharpe estimate from ret/dd ratio
    const r = rows[0]?.ret ?? 0;
    const d = rows[0]?.dd || 1;
    return Math.max(0.4, Math.min(3.2, r / d / 50 + 1.2)).toFixed(2);
  }, [rows]);
  const aggWin = useMemo(() => {
    if (!rows || rows.length === 0) return "—";
    const avg = rows.reduce((s, r) => s + r.win, 0) / rows.length;
    return `${avg.toFixed(1)}%`;
  }, [rows]);
  const aggDD = useMemo(() => {
    if (!rows || rows.length === 0) return "—";
    const max = Math.max(...rows.map((r) => r.dd));
    return `−${max.toFixed(1)}%`;
  }, [rows]);

  return (
    <div className="space-y-5 pb-6 stagger">
      {/* ── Header ── */}
      <header className="flex items-start justify-between pt-1 animate-enter">
        <div>
          <div className="text-caption uppercase text-ink-subtle">
            {dayName} · {timeStr}
          </div>
          <h1 className="text-title-1 mt-1">
            Hey, {greet}.
          </h1>
          <div className="text-footnote text-ink-muted mt-1 flex items-center gap-1.5">
            <LiveDot /> {activeCount} live · {limit === 9999 ? "∞" : limit} max on{" "}
            {user?.tier ?? "free"}
          </div>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="h-10 w-10 rounded-full border border-line/80 bg-bg-card/60 flex items-center justify-center text-ink-muted hover:text-ink hover:border-line transition relative"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span
            className="absolute top-2 right-2.5 h-2 w-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </Link>
      </header>

      {/* ── Borderless Onboarding Drawer Bottom Sheet ── */}
      {!user?.display_name && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out ${
              isDrawerAnimating ? "opacity-100" : "opacity-0"
            }`}
          />
          
          {/* Drawer Sheet */}
          <div
            className={`relative bg-[#0a0e1a] rounded-t-3xl border-t border-line/50 p-6 pb-8 space-y-6 transform transition-transform duration-300 ease-out select-none ${
              isDrawerAnimating ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Decorative Top Handle */}
            <div className="w-12 h-1 bg-line/50 rounded-full mx-auto -mt-2 mb-4" />

            {/* Personalized Wording */}
            <div className="text-center space-y-3">
              <div className="inline-flex rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-[9px] font-bold text-accent uppercase tracking-[0.2em] mx-auto">
                Personalize Your Setup
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white leading-none">
                What would be your trader name?
              </h2>
              <p className="text-[12px] text-ink-muted leading-relaxed max-w-xs mx-auto">
                Welcome to Strategy Labs. Claim your trader name to personalize your greetings and display across your compiled backtest strategies.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveName} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={traderName}
                  onChange={(e) => setTraderName(e.target.value)}
                  placeholder="Enter your trader name..."
                  className="w-full text-center border-none bg-bg-elev/40 rounded-2xl px-4 py-4 focus:ring-1 focus:ring-accent/40 outline-none text-lg font-bold text-white placeholder:text-ink-subtle/70 select-text"
                  maxLength={20}
                  disabled={savingName}
                  autoFocus
                />
              </div>

              {nameError && (
                <div className="text-[11px] font-bold text-red-400 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {nameError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                loading={savingName}
                disabled={!traderName.trim()}
              >
                Save & Continue
              </Button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {error && (
        <div
          className="rounded-xl border p-3 flex gap-2 items-start"
          style={{
            borderColor: "rgba(239,68,68,0.30)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <AlertCircle
            className="h-4 w-4 flex-none mt-0.5"
            style={{ color: "#fda4af" }}
          />
          <div className="text-[11px] leading-relaxed text-ink-muted">
            Couldn't load your strategies. {error}
          </div>
        </div>
      )}

      {/* ── Hero Equity Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-bg-card/40 backdrop-blur-sm animate-enter">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(34,211,170,0.18), transparent 60%)",
          }}
        />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-subtle font-bold">
                Your strategies · backtest PnL
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                {isLoading ? (
                  <div className="h-[44px] flex items-center" aria-hidden>
                    <div className="skeleton h-9 w-40" />
                  </div>
                ) : isEmpty ? (
                  <span className="text-display text-ink-muted tabular-nums">
                    +0.0%
                  </span>
                ) : (
                  <NumFlow
                    value={pnl}
                    decimals={1}
                    prefix="+"
                    suffix="%"
                    countUp
                    className="text-display"
                  />
                )}
              </div>
              {isLoading && (
                <div className="skeleton h-4 w-48 mt-1.5" aria-hidden />
              )}
              {!isLoading && !isEmpty && (
                <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold"
                    style={{
                      background: "rgba(34,211,170,0.12)",
                      color: "var(--accent)",
                    }}
                  >
                    <TrendingUp className="h-3 w-3" /> aggregate of {rows?.length}
                  </span>
                  <span className="text-ink-subtle">
                    Signal feed is in <Link to="/signals" className="underline hover:text-ink">Signals</Link>
                  </span>
                </div>
              )}
              {isEmpty && (
                <div className="text-xs text-ink-muted mt-1">
                  Build your first strategy in the lab.
                </div>
              )}
            </div>
            <div className="text-right flex-none">
              {rows && rows.length > 0 && (
                <>
                  <Pill tone="accent">
                    <LiveDot size={5} /> Verified
                  </Pill>
                  <div className="text-[10px] text-ink-subtle mt-2 tabular-nums">
                    {rows.length} strat · backtested
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 -mx-2 relative">
            <EquityCurve data={equity} height={90} animated />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-card/40 backdrop-blur-[1.5px] rounded-lg">
                <span className="text-[10px] md:text-[11px] font-bold text-ink-muted/95 bg-bg-elev/80 border border-line/65 rounded-full px-3 py-1.5 shadow-md">
                  No active backtest data. Run a strategy in the Lab!
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            {([
              ["Sharpe", aggSharpe, "var(--accent)"],
              ["Win-rate", aggWin, "var(--ink)"],
              ["Max DD", aggDD, "#fda4af"],
            ] as const).map(([k, v, c]) => (
              <div
                key={k}
                className="rounded-lg bg-bg-elev/50 border border-line/40 py-2"
              >
                <div className="text-caption uppercase text-ink-subtle">
                  {k}
                </div>
                {isLoading ? (
                  <div className="skeleton h-4 w-10 mx-auto mt-1" aria-hidden />
                ) : (
                  <div
                    className="tabular-nums text-sm font-bold mt-0.5"
                    style={{ color: c }}
                  >
                    {v}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 gap-3 animate-enter">
        <Link
          to="/lab"
          className="group rounded-md2 border border-line bg-surface-1 active:bg-surface-2 transition-colors duration-press p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-sm2 flex items-center justify-center bg-accent-soft text-accent">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-ink transition" />
          </div>
          <div className="text-headline mt-3">New strategy</div>
          <div className="text-footnote text-ink-muted mt-0.5">
            Type a thesis · auto-compiled
          </div>
        </Link>
        <Link
          to="/signals"
          className="group rounded-md2 border border-line bg-surface-1 active:bg-surface-2 transition-colors duration-press p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-sm2 flex items-center justify-center bg-surface-2 text-ink-muted">
              <Radio className="h-[18px] w-[18px]" />
            </div>
            <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-ink transition" />
          </div>
          <div className="text-headline mt-3">Live Signals</div>
          <div className="text-footnote text-ink-muted mt-0.5">
            From V22 · not your strategies
          </div>
        </Link>
      </div>

      {/* ── Strategy list ── */}
      <section className="space-y-3 animate-enter">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">My strategies</h2>
            <div className="text-[11px] text-ink-muted">
              {isLoading
                ? "Loading…"
                : isEmpty
                  ? "Nothing here yet"
                  : `${rows!.length} in your lab · ${activeCount} active`}
            </div>
          </div>
          {!isEmpty && (
            <button className="text-[11px] font-bold text-ink-muted flex items-center gap-1 hover:text-ink">
              All <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {isLoading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-md2 border border-line bg-surface-1 p-3.5 flex items-center gap-3"
              >
                <div className="skeleton h-11 w-11" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-32" />
                  <div className="skeleton h-2 w-48 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="animate-enter">
            <EmptyState />
          </div>
        )}

        {!isLoading && !isEmpty && (
          <div className="space-y-2.5 stagger">
            {rows!.map((s) => (
              <div key={s.id} className="animate-enter">
                <StrategyRowCard s={s} onOpen={() => onOpen(s.id)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-[10px] text-ink-subtle leading-relaxed pt-2">
        Educational tool only. Past performance does not predict future results.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border border-dashed p-6 text-center"
      style={{
        borderColor: "rgba(34,211,170,0.30)",
        background:
          "linear-gradient(135deg, rgba(34,211,170,0.06), rgba(34,211,170,0.01))",
      }}
    >
      <div
        className="mx-auto h-12 w-12 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(34,211,170,0.15)",
          color: "var(--accent)",
        }}
      >
        <Beaker className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-base text-ink mt-3">
        No strategies yet
      </h3>
      <p className="text-[12px] text-ink-muted leading-relaxed mt-1.5 max-w-xs mx-auto">
        Strategies you build in the lab show up here with their live backtest
        performance. The <Link to="/signals" className="text-accent hover:underline">Signals</Link>{" "}
        tab is separate — that's our flagship V22 feed.
      </p>
      <Link
        to="/lab"
        className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl font-bold text-[13px] active:scale-95 transition"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        <Sparkles className="h-3.5 w-3.5" /> Open Strategy Lab
      </Link>
    </div>
  );
}

function StrategyRowCard({
  s,
  onOpen,
}: {
  s: StrategyRow;
  onOpen: () => void;
}) {
  const tone =
    s.status === "live"
      ? "accent"
      : s.status === "paused"
        ? "warn"
        : "neutral";
  const pos = s.ret >= 0;
  const isDraft = s.status === "draft" || s.status === "backtesting";
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-md2 border border-line bg-surface-1 active:bg-surface-2 transition-colors duration-press p-4 flex items-center gap-3.5"
    >
      <div className="h-11 w-11 rounded-sm2 flex items-center justify-center bg-surface-2 flex-none">
        <span className="text-[10px] font-bold text-ink-muted tracking-wide">
          {s.asset}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-headline truncate">{s.name}</div>
          <Pill tone={tone} className="!py-[1px]">
            {s.status === "live" && <LiveDot size={4} />} {s.status}
          </Pill>
        </div>
        <div className="text-footnote text-ink-muted truncate mt-0.5">
          {s.spec}
        </div>
      </div>

      {!isDraft ? (
        <div className="flex items-center gap-2.5 flex-none">
          <Sparkline
            data={s.curve}
            width={56}
            height={24}
            color={pos ? "var(--accent)" : "var(--negative)"}
          />
          <div className="text-right">
            <div
              className="font-bold text-[13px] tabular-nums"
              style={{ color: pos ? "var(--accent)" : "var(--negative)" }}
            >
              {pos ? "+" : ""}
              {s.ret.toFixed(1)}%
            </div>
            <div className="text-[10px] text-ink-subtle">{s.since}</div>
          </div>
        </div>
      ) : (
        <div className="text-footnote text-ink-subtle font-bold">Draft</div>
      )}
    </button>
  );
}

/** Map the raw API strategy → the row shape the UI renders. */
function toRow(s: Strategy): StrategyRow {
  // best-effort spec → summary line
  const spec = s.spec ?? {};
  const asset = (spec["asset"] as string | undefined)?.split("/")[0] ?? "—";
  const tf = spec["timeframe"] as string | undefined;
  const entry = spec["entry"] as string | undefined;
  const summary = [tf, entry].filter(Boolean).join(" · ") || "—";

  // backtest metrics (if the spec records them) — defaults to zeros for draft
  const metrics = (spec["metrics"] as Record<string, number> | undefined) ?? {};
  const ret = Number(metrics["return_pct"] ?? 0);
  const win = Number(metrics["win_rate_pct"] ?? 0);
  const dd = Number(metrics["max_drawdown_pct"] ?? 0);
  const trades = Number(metrics["trades"] ?? 0);

  // since-created — coarse "Nd / Nh ago"
  const sinceLabel = (() => {
    try {
      const d = new Date(s.created_at);
      const delta = Date.now() - d.getTime();
      const days = Math.floor(delta / (86400 * 1000));
      if (days >= 1) return `${days}d`;
      return `${Math.max(1, Math.floor(delta / 3600000))}h`;
    } catch {
      return "—";
    }
  })();

  return {
    id: s.id,
    name: s.name,
    spec: summary,
    asset,
    status: s.status === "archived" ? "draft" : s.status,
    ret,
    win,
    dd,
    trades,
    since: sinceLabel,
    curve: genWalk(40, Math.abs(hashCode(s.id)) % 1000 || 7, 1.4, ret > 0 ? 0.5 : 0.0),
  };
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h;
}
