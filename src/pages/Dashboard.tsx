import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { WaitlistGate } from "../components/WaitlistGate";
import {
  Bell,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Radio,
  Beaker,
} from "lucide-react";
import {
  EquityCurve,
  LiveDot,
  NumFlow,
  Pill,
  Sparkline,
} from "../components/MobileUI";
import { StrategyDetail } from "../components/StrategyDetail";
import { Button, Banner, EmptyState, ListRow, Sheet, StatTile } from "../ui";
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
  const needsName = !user?.display_name;

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

  // Aggregate stats — only meaningful if user has strategies. Everything here
  // must come from real backtest metrics; never derive or invent a stat.
  const aggTrades = useMemo(() => {
    if (!rows || rows.length === 0) return "—";
    return rows.reduce((s, r) => s + r.trades, 0).toLocaleString();
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
            Hello, {greet}.
          </h1>
          <div className="text-footnote text-ink-muted mt-1 flex items-center gap-1.5">
            <LiveDot /> {activeCount} live · {limit === 9999 ? "∞" : limit} max on{" "}
            {user?.tier ?? "free"}
          </div>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="h-10 w-10 rounded-full border border-line bg-surface-1 flex items-center justify-center text-ink-muted active:bg-surface-2 transition-colors duration-press relative"
        >
          <Bell className="h-[17px] w-[17px]" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-accent" />
        </Link>
      </header>

      {/* ── Trader-name onboarding — a forced step, not a dismissible sheet.
          onClose is a no-op: Sheet's drag-to-dismiss just snaps back since
          `open` never changes without a saved name. ── */}
      <Sheet open={needsName} onClose={() => {}}>
        <div className="text-center space-y-3 pb-1">
          <div className="inline-flex rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-caption text-accent uppercase">
            Personalize your setup
          </div>
          <h2 className="text-title-2 text-ink leading-tight">
            What would be your trader name?
          </h2>
          <p className="text-footnote text-ink-muted leading-relaxed max-w-xs mx-auto">
            Claim your trader name to personalize your greeting and display
            across your compiled backtest strategies.
          </p>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4 mt-5 pb-2">
          <input
            type="text"
            value={traderName}
            onChange={(e) => setTraderName(e.target.value)}
            placeholder="Enter your trader name…"
            className="w-full text-center border border-line bg-surface-2 rounded-md2 px-4 py-4 focus:ring-2 focus:ring-accent/40 outline-none text-headline font-bold text-ink placeholder:text-ink-subtle select-text"
            maxLength={20}
            disabled={savingName}
            autoFocus
          />

          {nameError && (
            <div className="text-footnote font-semibold text-negative flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-negative" /> {nameError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            loading={savingName}
            disabled={!traderName.trim()}
          >
            Save & continue
          </Button>
        </form>
      </Sheet>

      {error && (
        <Banner tone="error">Couldn't load your strategies. {error}</Banner>
      )}

      {/* ── Hero equity card ── */}
      <div className="rounded-lg2 border border-line bg-surface-1 animate-enter">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-caption uppercase text-ink-subtle">
                Your strategies · backtest PnL
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                {isLoading ? (
                  <div className="h-[44px] flex items-center" aria-hidden>
                    <div className="skeleton h-9 w-40" />
                  </div>
                ) : isEmpty ? (
                  <span className="font-mono text-display text-ink-muted tabular-nums">
                    +0.0%
                  </span>
                ) : (
                  <NumFlow
                    value={pnl}
                    decimals={1}
                    prefix="+"
                    suffix="%"
                    countUp
                    className="font-mono text-display"
                  />
                )}
              </div>
              {isLoading && (
                <div className="skeleton h-4 w-48 mt-1.5" aria-hidden />
              )}
              {!isLoading && !isEmpty && (
                <div className="text-footnote text-ink-subtle mt-1">
                  Aggregate of {rows?.length} · signal feed is in{" "}
                  <Link to="/signals" className="text-ink underline">
                    Signals
                  </Link>
                </div>
              )}
              {isEmpty && (
                <div className="text-footnote text-ink-muted mt-1">
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
                  <div className="text-caption text-ink-subtle mt-2 tabular-nums">
                    {rows.length} strat · backtested
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 -mx-2 relative">
            <EquityCurve data={equity} height={90} animated />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-1/60 backdrop-blur-[1.5px] rounded-md2">
                <span className="text-caption text-ink-muted bg-surface-2 border border-line rounded-full px-3 py-1.5">
                  No active backtest data. Run a strategy in the Lab!
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-line">
          <StatTile label="Trades" value={isLoading ? "" : aggTrades} loading={isLoading} className="!rounded-none !border-0 !border-r !border-line" />
          <StatTile label="Win-rate" value={isLoading ? "" : aggWin} loading={isLoading} className="!rounded-none !border-0 !border-r !border-line" />
          <StatTile label="Max DD" value={isLoading ? "" : aggDD} loading={isLoading} tone="negative" className="!rounded-none !border-0" />
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
            <ArrowRight className="h-4 w-4 text-ink-faint" />
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
            <ArrowRight className="h-4 w-4 text-ink-faint" />
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
            <h2 className="text-headline text-ink">My strategies</h2>
            <div className="text-footnote text-ink-muted">
              {isLoading
                ? "Loading…"
                : isEmpty
                  ? "Nothing here yet"
                  : `${rows!.length} in your lab · ${activeCount} active`}
            </div>
          </div>
          {!isEmpty && (
            <button className="text-footnote font-semibold text-ink-muted flex items-center gap-1 active:text-ink">
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
                <div className="skeleton h-11 w-11 rounded-sm2" />
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
            <EmptyState
              icon={Beaker}
              title="No strategies yet"
              body={
                <>
                  Strategies you build in the lab show up here with their live
                  backtest performance. The{" "}
                  <Link to="/signals" className="text-accent underline">
                    Signals
                  </Link>{" "}
                  tab is separate — that's our flagship V22 feed.
                </>
              }
              action={
                <Link to="/lab">
                  <Button size="md">
                    <Sparkles className="h-3.5 w-3.5" /> Open Strategy Lab
                  </Button>
                </Link>
              }
            />
          </div>
        )}

        {!isLoading && !isEmpty && (
          <div className="space-y-2.5 stagger">
            {rows!.map((s) => (
              <div key={s.id} className="animate-enter">
                <StrategyListRow s={s} onOpen={() => onOpen(s.id)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-caption text-ink-subtle leading-relaxed pt-2 normal-case">
        Educational tool only. Past performance does not predict future results.
      </p>
    </div>
  );
}

function StrategyListRow({
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
    <ListRow
      onPress={onOpen}
      leading={
        <span className="text-caption font-bold text-ink-muted tracking-wide">
          {s.asset}
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{s.name}</span>
          <Pill tone={tone} className="!py-[1px] flex-none">
            {s.status === "live" && <LiveDot size={4} />} {s.status}
          </Pill>
        </span>
      }
      sub={s.spec}
      trailing={
        isDraft ? (
          <span className="text-footnote text-ink-subtle font-semibold">Draft</span>
        ) : (
          <div className="flex items-center gap-2.5">
            <Sparkline
              data={s.curve}
              width={56}
              height={24}
              color={pos ? "var(--positive)" : "var(--negative)"}
            />
            <div className="text-right">
              <div
                className={`font-bold text-footnote tabular-nums ${pos ? "text-positive" : "text-negative"}`}
              >
                {pos ? "+" : ""}
                {s.ret.toFixed(1)}%
              </div>
              <div className="text-caption text-ink-subtle">{s.since}</div>
            </div>
          </div>
        )
      }
    />
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
    curve: retRamp(ret),
  };
}

/** Deterministic sparkline from the strategy's REAL backtest return: eased
 *  ramp from 100 to 100+ret. Purely illustrative shape — endpoints are the
 *  real numbers, nothing is randomized or invented. */
function retRamp(ret: number, n = 40): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const eased = t * t * (3 - 2 * t); // smoothstep
    out.push(100 + ret * eased);
  }
  return out;
}
