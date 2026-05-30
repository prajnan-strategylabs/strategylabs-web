import { useEffect, useMemo, useState } from "react";
import {
  Radio,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  apiGetV22Stats,
  type V22Stats,
  type V22YearRow,
  type V22RecentWin,
} from "../lib/api";
import { EquityCurve, LiveDot, Pill } from "../components/MobileUI";
import { ConnectTelegram } from "../components/ConnectTelegram";
import { LiveSignalDrawer } from "../components/LiveSignalDrawer";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { useBinanceTradeStreams, type LiveTick } from "../lib/useBinanceStreams";
import { useAuth } from "../context/AuthContext";
import { History } from "lucide-react";

interface Plan {
  id: "free" | "explorer" | "trader" | "pro" | "auto";
  name: string;
  price: string;
  /** Numeric price for the trial CTA copy. 0 for the free tier. */
  monthly: number;
  per: string;
  /** Single-sentence tagline that captures the upgrade story. */
  note: string;
  /** Three short bullets — kept tight so the row stays mobile-friendly. */
  features: string[];
  cta: string;
  featured?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────
   Pricing — 3 visible tiers (Free / Trader / Auto). The 5-tier UserTier
   type stays wide for back-compat with existing users on legacy tiers
   (explorer / pro); the UI just collapses them visually onto the nearest
   visible tier via `currentTierForDisplay()` below.

   Why 3 tiers? Cleaner conversion psychology — "no / maybe / yes I'm
   serious" beats a 5-way decision tree for a young product. The Trader
   tier ($49) is the realtime moat-unlock and the obvious middle pick.
   Auto ($149) anchors the price ceiling and exists for users who want
   end-to-end automation via exchange API.
   ──────────────────────────────────────────────────────────────────────── */
const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    monthly: 0,
    per: "/mo",
    note: "Browse the audit log",
    features: ["24h delayed", "Last 5 signals", "1 strategy slot"],
    cta: "Current plan",
  },
  {
    id: "trader",
    name: "Trader",
    price: "$49",
    monthly: 49,
    per: "/mo",
    note: "Realtime · the moat unlocks here",
    features: [
      "Realtime V22 signals",
      "Telegram alerts",
      "Full audit history",
      "10 strategy slots",
    ],
    cta: "Start 7-day trial",
    featured: true,
  },
  {
    id: "auto",
    name: "Auto",
    price: "$149",
    monthly: 149,
    per: "/mo",
    note: "Hands-off automation",
    features: [
      "Everything in Trader",
      "Binance / Bybit auto-execute",
      "Webhook outputs",
      "Unlimited strategy slots",
    ],
    cta: "Upgrade",
  },
];
type PlanId = Plan["id"];

/** Map a UserTier (which may include legacy explorer/pro) to the visible
 *  tier it should display as on the Signals page. */
function visibleTierFor(tier: string): PlanId {
  if (tier === "trader" || tier === "free" || tier === "auto") return tier;
  // Legacy: explorer was $19 → roll up to Trader. pro was $99 → roll up to Auto.
  if (tier === "explorer") return "trader";
  if (tier === "pro") return "auto";
  return "free";
}

export function Signals() {
  // Signals page is open to anyone who's signed in.
  // The landing-page waitlist form still captures emails for marketing,
  // but it no longer gates access. To re-introduce a gate later,
  // wrap <SignalsBody /> with <WaitlistGate> again.
  return <SignalsBody />;
}

function SignalsBody() {
  const { user } = useAuth();
  // Visible tier for the UI: 3-tier collapse (free/trader/auto). The real
  // backend tier still gates features at the API level — legacy explorer/pro
  // users keep their entitlements; here we just decide which plan row to
  // highlight + which upgrade nudge to render.
  const currentTier = visibleTierFor(user?.tier ?? "free");
  const isPaid = currentTier !== "free";

  const [data, setData] = useState<V22Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Default selection: the user's current tier if they have one, else the
  // featured tier (Trader). Keeps the CTA contextual on first paint.
  const [plan, setPlan] = useState<PlanId>(
    currentTier !== "free" ? currentTier : "trader",
  );
  const [animYears, setAnimYears] = useState(false);
  const [selectedCall, setSelectedCall] = useState<V22Stats["recent_calls"][number] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Re-fetch every 60s so "Live calls" stays fresh as the CSV is updated
  useEffect(() => {
    let cancelled = false;
    async function load(initial: boolean) {
      try {
        const stats = await apiGetV22Stats();
        if (!cancelled) {
          setData(stats);
          setError(null);
          if (initial) setLoading(false);
        }
      } catch (e) {
        if (!cancelled && initial) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      }
    }
    void load(true);
    const id = window.setInterval(() => void load(false), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Trigger year-bar animation once data lands
  useEffect(() => {
    if (data) {
      const id = window.setTimeout(() => setAnimYears(true), 80);
      return () => window.clearTimeout(id);
    }
  }, [data]);

  // ── Live Binance trade stream for every open call's symbol ──────────────
  // Single combined-stream WebSocket regardless of how many rows are open.
  // Closed rows are skipped (their PnL is final).
  const openCalls = useMemo(
    () =>
      data?.recent_calls?.filter(
        (c) => c.status === "open" && !!c.symbol,
      ) ?? [],
    [data?.recent_calls],
  );
  const openSymbols = useMemo(
    () => openCalls.map((c) => c.symbol as string),
    [openCalls],
  );
  const liveTicks = useBinanceTradeStreams(openSymbols);

  const selectedPlan = PLANS.find((p) => p.id === plan)!;
  const liveSinceLabel = useMemo(() => {
    if (!data?.live_since) return "";
    try {
      const d = new Date(data.live_since);
      return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch {
      return data.live_since;
    }
  }, [data?.live_since]);

  return (
    <div className="space-y-4 pb-6 animate-fade-in">
      {/* ── Header ── */}
      <header className="pt-1 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "rgba(34,211,170,0.15)",
              color: "var(--accent)",
            }}
          >
            <Radio className="h-[18px] w-[18px]" />
            <span
              className="absolute inset-0 rounded-2xl animate-ping"
              style={{ boxShadow: "0 0 0 1px rgba(34,211,170,0.4)" }}
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Pro Signals</h1>
            <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
              <LiveDot size={5} /> verified ·{" "}
              {data ? data.total_trades.toLocaleString() : "—"} trades
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-none">
          {isPaid && (
            <button
              onClick={() => setHistoryOpen(true)}
              aria-label="View history"
              className="h-9 px-3 rounded-lg border border-line/60 bg-bg-card/40 flex items-center gap-1.5 text-[11px] font-bold text-ink-muted hover:text-ink hover:border-line active:scale-95 transition"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}
          <Pill tone="accent">
            <CheckCircle2 className="h-[9px] w-[9px]" /> audited
          </Pill>
        </div>
      </header>

      {error && !data && (
        <div
          className="rounded-xl border p-3 flex gap-2 items-start"
          style={{
            borderColor: "rgba(239,68,68,0.30)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <AlertCircle className="h-4 w-4 flex-none mt-0.5" style={{ color: "#fda4af" }} />
          <div className="text-[11px] leading-relaxed text-ink-muted">
            Couldn't reach the audit feed. {error}
          </div>
        </div>
      )}

      {loading && <HeroSkeleton />}

      {data && (
        <>
          {/* ── Hero: cumulative return ── */}
          <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-bg-card/40 backdrop-blur-sm">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 0%, rgba(34,211,170,0.22), transparent 60%)",
              }}
            />
            <div className="relative p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-subtle font-bold">
                Cumulative return · since {liveSinceLabel}
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className="text-[48px] font-extrabold tracking-tight tabular-nums leading-none"
                  style={{
                    color: "var(--accent)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  +{Math.round(data.cum_return_pct).toLocaleString()}%
                </span>
              </div>
              <div className="text-[11px] text-ink-muted mt-1">
                <span className="font-bold" style={{ color: "var(--accent)" }}>
                  +{data.ytd_return_pct}% YTD
                </span>{" "}
                · vs BTC HODL{" "}
                <span className="text-ink">
                  +{data.btc_hodl_pct_same_period}%
                </span>{" "}
                over same period
              </div>

              <div className="mt-4 -mx-2">
                <EquityCurve
                  data={data.equity_curve.map(([, v]) => v)}
                  height={84}
                  animated
                />
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {([
                  ["Win", `${data.win_rate_pct}%`, "var(--accent)"],
                  ["Sharpe", data.sharpe.toFixed(2), "var(--ink)"],
                  ["Avg R", `${data.avg_r >= 0 ? "+" : ""}${data.avg_r}R`, "var(--accent)"],
                  ["Trades", data.total_trades.toLocaleString(), "var(--ink)"],
                ] as const).map(([k, v, c]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-bg-elev/50 border border-line/40 py-2"
                  >
                    <div className="text-[9px] uppercase tracking-[0.15em] text-ink-subtle font-bold">
                      {k}
                    </div>
                    <div
                      className="font-mono tabular-nums text-[12px] font-bold mt-0.5"
                      style={{ color: c }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Open positions callout — paid only, only when there are any ── */}
          {isPaid && openCalls.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-1.5">
                    <LiveDot size={5} /> Open positions
                  </h2>
                  <div className="text-[10px] text-ink-muted">
                    {openCalls.length} active · live PnL ticks every Binance trade
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {openCalls.map((c, i) => (
                  <LiveCallRow
                    key={`open-${c.id ?? i}`}
                    call={c}
                    tick={c.symbol ? liveTicks[c.symbol] : undefined}
                    onSelect={() => setSelectedCall(c)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Track record + Live-calls feed — UPSELL only (paid users access via History drawer) ── */}
          {!isPaid && (
          <>
          <section className="rounded-2xl border border-line/60 bg-bg-card/30 p-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h2 className="text-[13px] font-bold tracking-tight">
                  By the year
                </h2>
                <div className="text-[10px] text-ink-muted">
                  Closed PnL · audited
                </div>
              </div>
              <div className="text-[10px] font-mono text-ink-subtle tabular-nums">
                {data.year_breakdown.length}y verified
              </div>
            </div>
            <YearBars years={data.year_breakdown} animate={animYears} />
          </section>

          <section>
            <div className="flex items-end justify-between mb-2 gap-2">
              <div className="min-w-0">
                <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-1.5">
                  <LiveDot size={5} /> Live calls
                </h2>
                <div className="text-[10px] text-ink-muted truncate">
                  Last 5 V22 entries · upgrade for the full feed
                </div>
              </div>
              <ScannerHeartbeat scanner={data.scanner} />
            </div>
            <div className="space-y-2">
              {data.recent_calls.length === 0 ? (
                <div className="text-[11px] text-ink-subtle italic px-1">
                  Scanner warming up — first V22 cycle in progress…
                </div>
              ) : (
                data.recent_calls.map((c, i) => (
                  <LiveCallRow
                    key={c.id ?? i}
                    call={c}
                    tick={c.symbol ? liveTicks[c.symbol] : undefined}
                    onSelect={() => setSelectedCall(c)}
                  />
                ))
              )}
            </div>
          </section>
          </>
          )}

          {/* ── Connect Telegram (gated feature) ── */}
          <ConnectTelegram />

          {/* ── Plan picker + CTA — UPSELL ONLY (hidden for paid users) ── */}
          {!isPaid && (
          <>
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold tracking-tight">
                Choose your access
              </h2>
              <span className="text-[10px] text-ink-subtle">Cancel anytime</span>
            </div>
            <div className="space-y-2">
              {PLANS.map((p) => (
                <PlanRow
                  key={p.id}
                  plan={p}
                  selected={plan === p.id}
                  isCurrent={p.id === currentTier}
                  onSelect={() => setPlan(p.id)}
                />
              ))}
            </div>
          </section>

          {/* ── Sticky primary CTA — tier-aware ── */}
          {(() => {
            const isCurrent = selectedPlan.id === currentTier;
            // Three states:
            //   1. They selected their own plan → muted "Your current plan" CTA
            //   2. They selected a paid plan that costs more than current → upgrade CTA with trial copy
            //   3. They selected free while on a paid plan → "Switch to free" (no-op for now)
            const currentRank = PLANS.findIndex((p) => p.id === currentTier);
            const selectedRank = PLANS.findIndex((p) => p.id === selectedPlan.id);
            const isUpgrade = selectedRank > currentRank;
            const isFreePlan = selectedPlan.id === "free";

            return (
              <button
                disabled={isCurrent}
                className="w-full h-14 rounded-2xl font-extrabold text-[14px] flex items-center justify-center gap-2 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isCurrent ? "var(--bg-elev)" : "var(--accent)",
                  color: isCurrent ? "var(--ink-muted)" : "var(--bg)",
                  boxShadow: isCurrent
                    ? "none"
                    : "0 10px 40px rgba(34,211,170,0.25)",
                  border: isCurrent ? "1px solid var(--line)" : "none",
                }}
              >
                {!isCurrent && <Zap className="h-4 w-4" />}
                {isCurrent
                  ? `You're on ${selectedPlan.name}`
                  : isFreePlan
                    ? "Continue on Free"
                    : isUpgrade
                      ? `Start 7-day trial`
                      : `Switch to ${selectedPlan.name}`}
                {!isCurrent && !isFreePlan && (
                  <span className="opacity-70 text-[12px]">
                    — then {selectedPlan.price}
                    {selectedPlan.per}
                  </span>
                )}
              </button>
            );
          })()}
          </>
          )}

          {/* ── Subtle Trader → Auto nudge for already-paid users ── */}
          {currentTier === "trader" && (
            <div className="rounded-xl border border-line/40 bg-bg-card/20 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-ink">
                  Auto-execute trades on Binance / Bybit
                </div>
                <div className="text-[10px] text-ink-muted">
                  Auto tier · $149/mo · webhook outputs + unlimited slots
                </div>
              </div>
              <button
                className="text-[10px] font-bold whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line/60 hover:border-line hover:text-ink transition active:scale-95"
                style={{ color: "var(--accent)" }}
              >
                Upgrade <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* ── Recent wins — UPSELL ONLY (paid users access via History drawer) ── */}
          {!isPaid && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[13px] font-bold tracking-tight">
                  Recent closed wins
                </h2>
                <button className="text-[10px] font-bold text-ink-muted flex items-center gap-1 hover:text-ink">
                  All <ChevronRight className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                {data.recent_wins.map((w, i) => (
                  <RecentWinChip key={i} w={w} />
                ))}
              </div>
            </section>
          )}

          <p className="text-[10px] text-ink-subtle leading-relaxed pt-1">
            Track record computed from the V22 audit log. Past performance does
            not guarantee future results.
          </p>
        </>
      )}

      {/* ── Live signal detail drawer (mobile bottom-sheet / desktop modal) ── */}
      <LiveSignalDrawer
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />

      {/* ── History drawer — paid users open this from the header button ── */}
      <HistoryDrawer
        open={historyOpen}
        data={data}
        liveTicks={liveTicks}
        onClose={() => setHistoryOpen(false)}
        onCallSelect={(c) => {
          setHistoryOpen(false);
          setSelectedCall(c);
        }}
      />
    </div>
  );
}

/* ───────── Scanner heartbeat chip ───────── */
function ScannerHeartbeat({
  scanner,
}: {
  scanner?: V22Stats["scanner"];
}) {
  // We only care that the scanner has produced at least one heartbeat at all.
  // The actual 4H cadence is design-correct but confusing to expose ("scanned
  // 2h ago" looks broken). A pulsating LIVE chip is the right signal.
  const isLive = !!(scanner?.last_scan_at || scanner?.last_exit_check);
  if (!isLive) return null;
  return (
    <span
      className="text-[10px] font-mono font-bold flex-none whitespace-nowrap flex items-center gap-1 uppercase tracking-[0.12em]"
      style={{ color: "var(--accent)" }}
    >
      <LiveDot size={5} /> live
    </span>
  );
}

/* ───────── Live call row ───────── */
function LiveCallRow({
  call,
  tick,
  onSelect,
}: {
  call: V22Stats["recent_calls"][number];
  tick?: LiveTick;
  onSelect?: () => void;
}) {
  const long = call.dir === "LONG";
  const dirColor = long ? "var(--accent)" : "#fda4af";
  const isOpen = call.status === "open";

  // Map the raw outcome code to a chip label + tone
  const outcomeLabel = (() => {
    if (isOpen) return "running";
    switch (call.outcome) {
      case "tp1":
      case "tp1+trail":
        return "Hit TP";
      case "tp2":
        return "Hit TP2";
      case "sl":
      case "stop_loss":
        return "Stopped";
      case "trail":
      case "trail_stop":
        return "Trail close";
      case "timeout":
        return "Timed out";
      default:
        return call.outcome || "Closed";
    }
  })();
  const outcomeTone: "accent" | "danger" | "warn" | "info" = isOpen
    ? "info"
    : call.outcome?.startsWith("tp") || call.outcome?.startsWith("trail")
      ? "accent"
      : call.outcome?.startsWith("sl") || call.outcome === "stop_loss"
        ? "danger"
        : "warn";

  // Hold duration: entry → exit (closed) OR entry → now (open)
  const holdLabel = (() => {
    const ms = (() => {
      try {
        const start = new Date(call.entry_time).getTime();
        const end = isOpen
          ? Date.now()
          : new Date(call.exit_time ?? call.entry_time).getTime();
        return Math.max(0, end - start);
      } catch {
        return 0;
      }
    })();
    const hours = Math.floor(ms / 3_600_000);
    if (hours < 24) return `${Math.max(1, hours)}h`;
    return `${Math.round(hours / 24)}d`;
  })();

  // ── Live unrealized return for open positions ─────────────────────────
  // When the row is OPEN and we have a live tick from Binance, override
  // the static `ret_pct` (which is null for in-flight positions anyway).
  const liveRetPct =
    isOpen && tick?.price != null && call.entry
      ? ((tick.price - call.entry) / call.entry) * (long ? 1 : -1) * 100
      : null;
  const displayRetPct = liveRetPct ?? call.ret_pct ?? null;

  // Dollar P&L — uses the actual risk_usd from the signal, fallback to $50
  const riskUsd = call.risk_usd ?? 50;
  const displayUsd = (() => {
    if (!isOpen && call.pnl != null) return call.pnl;
    if (displayRetPct == null || !call.entry || !call.stop_loss) return null;
    const riskDist = Math.abs(call.entry - call.stop_loss) || 1;
    const movedR =
      ((tick?.price ?? call.entry * (1 + (displayRetPct / 100) * (long ? 1 : -1))) -
        call.entry) *
      (long ? 1 : -1) /
      riskDist;
    return movedR * riskUsd;
  })();

  const pnlColor =
    displayRetPct == null
      ? "var(--ink-muted)"
      : displayRetPct >= 0
        ? "var(--accent)"
        : "#fda4af";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-xl border border-line/60 bg-bg-card/40 hover:bg-bg-card/60 hover:border-line p-3 flex items-center gap-3 active:scale-[0.995] transition cursor-pointer"
    >
      <div className="h-9 w-9 rounded-lg bg-bg-elev border border-line/50 flex items-center justify-center flex-none">
        <span className="font-mono text-[9px] font-bold text-ink-muted">
          {call.asset}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[13px]">{call.asset}/USDT</span>
          <Pill tone={long ? "accent" : "danger"} className="!py-[1px]">
            {long ? (
              <TrendingUp className="h-[9px] w-[9px]" />
            ) : (
              <TrendingDown className="h-[9px] w-[9px]" />
            )}{" "}
            {call.dir}
          </Pill>
          {call.strategy && (
            <span className="text-[9px] font-mono font-bold text-ink-subtle">
              {call.strategy}
            </span>
          )}
        </div>
        <div className="text-[10px] text-ink-subtle font-mono mt-0.5">
          {isOpen
            ? `Entered ${call.when_ago} · ${holdLabel} running`
            : `Entered ${call.when_ago} · held ${holdLabel}`}
        </div>
      </div>
      <div className="flex flex-col items-end flex-none gap-0.5 min-w-[80px]">
        <Pill tone={outcomeTone} className="!py-[1px]">
          {isOpen && <LiveDot size={4} />} {outcomeLabel}
        </Pill>
        {displayUsd != null && (
          <div
            key={`usd-${tick?.lastTickAt ?? "static"}`}
            className="font-mono font-extrabold tabular-nums text-[13px] sl-tick-flash"
            style={{ color: pnlColor, lineHeight: 1.1 }}
          >
            {displayUsd >= 0 ? "+" : "-"}${Math.abs(displayUsd).toFixed(2)}
          </div>
        )}
        {displayRetPct != null && (
          <div
            className="font-mono font-bold tabular-nums text-[10px]"
            style={{ color: pnlColor, opacity: 0.85 }}
          >
            {displayRetPct >= 0 ? "+" : ""}
            {displayRetPct.toFixed(2)}%
          </div>
        )}
      </div>
      <div
        className="h-8 w-0.5 rounded-full flex-none"
        style={{ background: dirColor, opacity: 0.5 }}
      />
    </button>
  );
}

/* ───────── Year bars ───────── */
function YearBars({
  years,
  animate,
}: {
  years: V22YearRow[];
  animate: boolean;
}) {
  const maxAbs = Math.max(1, ...years.map((y) => Math.abs(y.pct)));
  return (
    <div className="space-y-2">
      {years.map((y, i) => {
        const pos = y.pct >= 0;
        const color = pos ? "var(--accent)" : "#fda4af";
        const w = (Math.abs(y.pct) / maxAbs) * 100;
        return (
          <div
            key={y.year}
            className="grid grid-cols-[36px_1fr_64px] gap-2.5 items-center"
          >
            <div
              className="font-mono text-[11px] font-bold tabular-nums"
              style={{ color: y.is_ytd ? "var(--ink)" : "var(--ink-muted)" }}
            >
              '{String(y.year).slice(-2)}
            </div>
            <div className="relative h-5 rounded-md overflow-hidden bg-bg-elev/40 border border-line/40">
              <div
                className="absolute inset-y-0 left-0 rounded-md"
                style={{
                  width: animate ? `${w}%` : "0%",
                  background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  transition: `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                  boxShadow: pos ? `inset 0 0 0 1px ${color}33` : "none",
                }}
              />
              {y.label && (
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider font-bold"
                  style={{ color: "var(--ink-subtle)" }}
                >
                  {y.label}
                </span>
              )}
            </div>
            <div
              className="text-right font-mono font-extrabold text-[12px] tabular-nums"
              style={{ color }}
            >
              {pos ? "+" : ""}
              {y.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Plan row ───────── */
function PlanRow({
  plan,
  selected,
  isCurrent,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  /** True when this row matches the user's actual paid tier — gets a "your plan" chip. */
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const accent = plan.featured ? "var(--accent)" : "var(--ink-muted)";
  const border = selected ? accent : "var(--line)";
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-xl p-3.5 flex flex-col gap-2 text-left transition active:scale-[0.99]"
      style={{
        border: `1px solid ${border}`,
        background: selected
          ? plan.featured
            ? "rgba(34,211,170,0.06)"
            : "rgba(15,21,37,0.55)"
          : "rgba(15,21,37,0.30)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="h-5 w-5 rounded-full flex-none flex items-center justify-center"
            style={{
              border: `2px solid ${selected ? accent : "var(--line)"}`,
              background: selected ? accent : "transparent",
            }}
          >
            {selected && (
              <CheckCircle2
                className="h-[10px] w-[10px]"
                style={{ color: "var(--bg)" }}
              />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[14px]">{plan.name}</span>
              {plan.featured && !isCurrent && (
                <Pill tone="accent" className="!py-[1px] !text-[8px]">
                  popular
                </Pill>
              )}
              {isCurrent && (
                <Pill tone="info" className="!py-[1px] !text-[8px]">
                  your plan
                </Pill>
              )}
            </div>
            <div className="text-[11px] text-ink-muted">{plan.note}</div>
          </div>
        </div>
        <div className="text-right flex-none">
          <span
            className="font-mono tabular-nums font-extrabold text-[15px]"
            style={{ color: plan.featured ? "var(--accent)" : "var(--ink)" }}
          >
            {plan.price}
          </span>
          <span className="text-[10px] text-ink-muted">{plan.per}</span>
        </div>
      </div>
      {/* Feature bullets — wrap so they stay readable on narrow viewports */}
      <div className="pl-8 flex flex-wrap gap-x-3 gap-y-0.5">
        {plan.features.map((f) => (
          <span
            key={f}
            className="text-[10px] font-mono text-ink-subtle flex items-center gap-1"
          >
            <span
              className="h-1 w-1 rounded-full flex-none"
              style={{ background: plan.featured ? "var(--accent)" : "var(--ink-subtle)" }}
            />
            {f}
          </span>
        ))}
      </div>
    </button>
  );
}

/* ───────── Recent win chip (horizontal scroll) ───────── */
function RecentWinChip({ w }: { w: V22RecentWin }) {
  return (
    <div className="flex-none w-[140px] rounded-xl border border-line/60 bg-bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold text-ink-muted">
          {w.asset}
        </span>
        <Pill tone={w.dir === "LONG" ? "accent" : "danger"} className="!py-[1px]">
          {w.dir === "LONG" ? (
            <TrendingUp className="h-[8px] w-[8px]" />
          ) : (
            <TrendingDown className="h-[8px] w-[8px]" />
          )}{" "}
          {w.dir}
        </Pill>
      </div>
      <div
        className="font-mono tabular-nums font-extrabold text-[18px] mt-2"
        style={{ color: "var(--accent)" }}
      >
        +{w.ret_pct}%
      </div>
      <div className="text-[10px] text-ink-subtle mt-0.5">
        {w.hold_days}d hold · {w.when_ago}
      </div>
    </div>
  );
}

/* ───────── Loading skeleton ───────── */
function HeroSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line/70 bg-bg-card/40 p-5 animate-pulse">
        <div className="h-3 w-40 rounded bg-bg-elev/60" />
        <div className="h-12 w-56 rounded bg-bg-elev/60 mt-3" />
        <div className="h-3 w-64 rounded bg-bg-elev/60 mt-3" />
        <div className="h-20 w-full rounded bg-bg-elev/40 mt-4" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 rounded-lg bg-bg-elev/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
