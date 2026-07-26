import { useEffect, useMemo, useState } from "react";
import {
  Radio,
  Zap,
  ChevronRight,
  AlertCircle,
  History,
} from "lucide-react";
import {
  apiGetV22Stats,
  apiGetV22History,
  type V22Stats,
  type V22RecentCall,
} from "../lib/api";
import { EquityCurve, LiveDot, Pill } from "../components/MobileUI";
import DigitRoller from "../components/DigitRoller";
import { ConnectTelegram } from "../components/ConnectTelegram";
import { ConnectPushNotifications } from "../components/ConnectPushNotifications";
import { LiveSignalDrawer } from "../components/LiveSignalDrawer";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { useBinanceTradeStreams } from "../lib/useBinanceStreams";
import { toast } from "../lib/toast";
import { useAuth } from "../context/AuthContext";
import {
  findPackageForPlan,
  getSubscriptionOfferings,
  purchaseSubscriptionPackage,
  type RCProductOfferings,
} from "../lib/purchases";

// Modular Sub-components Imports
import { ScannerHeartbeat } from "./signals/ScannerHeartbeat";
import { LiveCallRow } from "./signals/LiveCallRow";
import { YearBars } from "./signals/YearBars";
import { PlanRow, type Plan } from "./signals/PlanRow";
import { RecentWinChip } from "./signals/RecentWinChip";
import { HeroSkeleton } from "./signals/HeroSkeleton";

/* ────────────────────────────────────────────────────────────────────────
   Pricing — 3 visible tiers (Free / Trader / Auto).
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
    price: "$19.99",
    monthly: 19.99,
    annual: 149.99,
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
    price: "$49.99",
    monthly: 49.99,
    annual: 399.99,
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

function formatUsd(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? `$${rounded.toFixed(0)}` : `$${rounded.toFixed(2)}`;
}

function formatWithSameCurrency(value: number, priceString: string): string {
  if (!priceString) {
    return formatUsd(value);
  }
  const match = priceString.match(/^([^\d]*)([\d\s,.]+)([^\d]*)$/);
  if (!match) {
    return formatUsd(value);
  }
  
  const prefix = match[1] || "";
  const suffix = match[3] || "";
  
  const rounded = Math.round(value * 100) / 100;
  const decSep = priceString.includes(",") && !priceString.includes(".") ? "," : ".";
  
  let formattedNumber = "";
  if (rounded % 1 === 0) {
    formattedNumber = rounded.toFixed(0);
  } else {
    formattedNumber = rounded.toFixed(2);
    if (decSep === ",") {
      formattedNumber = formattedNumber.replace(".", ",");
    }
  }
  
  return `${prefix}${formattedNumber}${suffix}`;
}

function visibleTierFor(tier: string): PlanId {
  if (tier === "trader" || tier === "free" || tier === "auto") return tier;
  return "free";
}

export function Signals() {
  return <SignalsBody />;
}

function SignalsBody() {
  const { user, tierResolved, updateSandboxTier } = useAuth();
  const currentTier = visibleTierFor(user?.tier ?? "free");
  const tierLabel = (user?.tier ?? currentTier).toUpperCase();
  const isPaid = currentTier !== "free";

  const [data, setData] = useState<V22Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanId>(
    currentTier !== "free" ? currentTier : "trader",
  );
  const [animYears, setAnimYears] = useState(false);
  const [selectedCall, setSelectedCall] = useState<V22Stats["recent_calls"][number] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [paidClosedCalls, setPaidClosedCalls] = useState<V22RecentCall[] | null>(null);

  const handleSelectCall = (c: V22Stats["recent_calls"][number]) => {
    setSelectedCall(c);
  };

  // Free tier: one live call stays fully unlocked as a credibility sample
  // (the oldest open one); all other live calls mask their levels in-drawer.
  const callKey = (c: V22RecentCall) => c.id ?? `${c.symbol}-${c.entry_time}`;
  const freeSampleKey = useMemo(() => {
    if (isPaid || !data) return null;
    const open = data.recent_calls.filter((c) => c.status === "open");
    if (open.length === 0) return null;
    const oldest = open.reduce((a, b) =>
      new Date(a.entry_time).getTime() <= new Date(b.entry_time).getTime() ? a : b
    );
    return callKey(oldest);
  }, [data, isPaid]);

  const selectedIsLiveLocked =
    !isPaid &&
    selectedCall?.status === "open" &&
    callKey(selectedCall) !== freeSampleKey;
  const selectedIsSample =
    !isPaid &&
    selectedCall?.status === "open" &&
    callKey(selectedCall) === freeSampleKey;

  const handleDrawerUpgrade = () => {
    setSelectedCall(null);
    window.setTimeout(() => {
      document
        .getElementById("plan-picker")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  };

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

  useEffect(() => {
    if (!data || !tierResolved || !isPaid) {
      setPaidClosedCalls(null);
      return;
    }

    let cancelled = false;
    async function loadClosedHistory() {
      try {
        const history = await apiGetV22History({ limit: 50 });
        if (!cancelled) {
          setPaidClosedCalls(
            history.trades
              .filter((c) => c.status !== "open")
              .sort(
                (a, b) =>
                  new Date(b.exit_time ?? b.entry_time).getTime() -
                  new Date(a.exit_time ?? a.entry_time).getTime(),
              )
              .slice(0, 10),
          );
        }
      } catch (e) {
        console.error("Failed to load closed signal history", e);
        if (!cancelled) setPaidClosedCalls([]);
      }
    }

    void loadClosedHistory();
    return () => {
      cancelled = true;
    };
  }, [data, tierResolved, isPaid]);

  // Trigger year-bar animation once data lands
  useEffect(() => {
    if (data) {
      const id = window.setTimeout(() => setAnimYears(true), 80);
      return () => window.clearTimeout(id);
    }
  }, [data]);

  // Live Binance trade stream for every open call's symbol
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

  const [rcOfferings, setRcOfferings] = useState<RCProductOfferings | null>(null);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOfferings() {
      try {
        const offs = await getSubscriptionOfferings();
        setRcOfferings(offs);
      } catch (e) {
        console.error("Failed to load RevenueCat offerings", e);
      }
    }
    loadOfferings();
  }, []);

  useEffect(() => {
    setPurchaseError(null);
  }, [plan, billing]);

  const dynamicPlans = useMemo(() => {
    return PLANS.map((p) => {
      if (!rcOfferings?.rawOfferings?.current) {
        // Fallback simulation for Web / Sandbox
        if (billing === "yearly" && p.id !== "free") {
          const yearlyRate = (p.annual ?? p.monthly * 12 * 0.8) / 12;
          return {
            ...p,
            price: formatUsd(yearlyRate),
            per: "/mo, billed annually"
          };
        }
        return p;
      }
      const currentOffering = rcOfferings.rawOfferings.current;
      const pkg = findPackageForPlan(
        currentOffering.availablePackages,
        p.id,
        billing,
      );

      if (pkg && pkg.product) {
        const isYearly = billing === "yearly";
        const priceString = isYearly
          ? formatWithSameCurrency(pkg.product.price / 12, pkg.product.priceString)
          : pkg.product.priceString;
        return {
          ...p,
          price: priceString,
          per: isYearly ? "/mo, billed annually" : "/mo",
          monthly: pkg.product.price,
        };
      }
      return p;
    });
  }, [rcOfferings, billing]);

  const selectedPlan = dynamicPlans.find((p) => p.id === plan)!;

  const handleCtaClick = async () => {
    if (purchaseBusy) return;

    const isCurrent = selectedPlan.id === currentTier;
    if (isCurrent) return;

    if (selectedPlan.id === "free") {
      toast("To manage or cancel your subscription, use the settings in your profile menu.", "info");
      return;
    }

    try {
      setPurchaseBusy(true);
      setPurchaseError(null);
      const purchased = await purchaseSubscriptionPackage(selectedPlan.id, billing);
      if (purchased) {
        updateSandboxTier(selectedPlan.id as any);
        return;
      }
      setPurchaseError("Purchase was not completed. If the Play Store did not open, check the subscription product setup.");
    } catch (e) {
      console.error("Purchase error", e);
      setPurchaseError(e instanceof Error ? e.message : "Purchase failed. Please try again.");
    } finally {
      setPurchaseBusy(false);
    }
  };
  const executionCalls = useMemo(
    () =>
      [...(data?.recent_calls ?? [])].sort((a, b) => {
        if (a.status === "open" && b.status !== "open") return -1;
        if (a.status !== "open" && b.status === "open") return 1;
        return new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime();
      }),
    [data?.recent_calls],
  );
  const closedCalls = useMemo(
    () =>
      (paidClosedCalls ?? data?.recent_calls ?? [])
        .filter((c) => c.status !== "open")
        .sort(
          (a, b) =>
            new Date(b.exit_time ?? b.entry_time).getTime() -
            new Date(a.exit_time ?? a.entry_time).getTime(),
        ),
    [data?.recent_calls, paidClosedCalls],
  );

  const monthYear = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  /**
   * The live-only block, or null if the API predates it. Null must render as
   * "unknown" rather than zero — a 0% live return would be a fabricated number,
   * and this page is the one place that must not invent performance.
   *
   * Note live_start (first REAL signal) is deliberately not live_since, which is
   * the first backtested trade in 2017.
   */
  const live = useMemo(() => {
    if (!data || typeof data.live_trades !== "number") return null;
    return {
      trades: data.live_trades,
      returnPct: data.live_return_pct ?? 0,
      pnlUsd: data.live_pnl_usd ?? 0,
      winRatePct: data.live_win_rate_pct ?? 0,
      avgR: data.live_avg_r ?? 0,
      equity: data.live_equity_curve ?? [],
      startLabel: monthYear(data.live_start),
    };
  }, [data]);

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
            <h1 className="text-xl font-extrabold tracking-tight">
              {isPaid ? "Signals" : "Live Signals"}
            </h1>
            <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
              <LiveDot size={5} />{" "}
              {isPaid
                ? `${openCalls.length} active · ${closedCalls.length} closed`
                : `${live ? live.trades.toLocaleString() : "—"} live trades closed`}
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
          <Pill tone="accent">{isPaid ? tierLabel : "audited"}</Pill>
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

      {(loading || !tierResolved) && <HeroSkeleton />}

      {data && tierResolved && (
        <>
          {isPaid ? (
            <>
              <section>
                <div className="flex items-end justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-1.5">
                      <LiveDot size={5} /> Open positions
                    </h2>
                    <div className="text-[10px] text-ink-muted truncate">
                      Live P&L ticks every Binance trade
                    </div>
                  </div>
                  <ScannerHeartbeat scanner={data.scanner} />
                </div>

                <div className="space-y-2">
                  {openCalls.length === 0 ? (
                    <div className="rounded-xl border border-line/60 bg-bg-card/30 p-3 text-[11px] text-ink-muted leading-relaxed">
                      No open positions right now. The scanner watches 47 pairs around the clock and only fires when a setup clears every filter. Most days nothing does. A quiet feed is the system being selective, not broken.
                    </div>
                  ) : (
                    openCalls.map((c, i) => (
                      <LiveCallRow
                        key={`open-${c.id ?? i}`}
                        call={c}
                        tick={c.symbol ? liveTicks[c.symbol] : undefined}
                        onSelect={() => handleSelectCall(c)}
                      />
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-end justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[13px] font-bold tracking-tight">
                      Latest closed trades
                    </h2>
                    <div className="text-[10px] text-ink-muted truncate">
                      Recent completed signals from the audit log
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {closedCalls.length === 0 ? (
                    <div className="text-[11px] text-ink-subtle italic px-1">
                      No closed trades yet.
                    </div>
                  ) : (
                    closedCalls.map((c, i) => (
                      <LiveCallRow
                        key={c.id ?? i}
                        call={c}
                        tick={c.symbol ? liveTicks[c.symbol] : undefined}
                        onSelect={() => handleSelectCall(c)}
                      />
                    ))
                  )}
                </div>
              </section>

              <ConnectTelegram />

              <ConnectPushNotifications />

              <p className="text-[10px] text-ink-subtle leading-relaxed pt-1">
                Signal alerts are for educational use. Past performance does
                not guarantee future results.
              </p>
            </>
          ) : (
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
              <div className="text-caption uppercase text-ink-subtle">
                Live return{live ? ` · since ${live.startLabel}` : ""}
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <DigitRoller
                  value={
                    live
                      ? `${live.returnPct >= 0 ? "+" : ""}${live.returnPct}%`
                      : "—"
                  }
                  height={52}
                  className="text-[48px] font-extrabold tracking-tight tabular-nums leading-none"
                  style={{
                    color:
                      !live || live.returnPct >= 0
                        ? "var(--accent)"
                        : "var(--danger, #f87171)",
                    letterSpacing: "-0.03em",
                  }}
                />
              </div>
              <div className="text-[11px] text-ink-muted mt-1">
                {live ? (
                  <>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          live.pnlUsd >= 0
                            ? "var(--accent)"
                            : "var(--danger, #f87171)",
                      }}
                    >
                      {live.pnlUsd >= 0 ? "+" : "−"}$
                      {Math.abs(live.pnlUsd).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>{" "}
                    on a $5,000 account · {live.trades} closed{" "}
                    {live.trades === 1 ? "trade" : "trades"}
                  </>
                ) : (
                  "Live figures syncing…"
                )}
              </div>

              <div className="mt-4 -mx-2">
                <EquityCurve
                  data={(live?.equity ?? []).map(([, v]) => v)}
                  height={84}
                  animated
                />
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {([
                  ["Win", live ? `${live.winRatePct}%` : "—", "var(--accent)"],
                  ["Avg R", live ? `${live.avgR >= 0 ? "+" : ""}${live.avgR}R` : "—", "var(--accent)"],
                  ["Trades", live ? live.trades.toLocaleString() : "—", "var(--ink)"],
                  ["Since", live ? live.startLabel : "—", "var(--ink)"],
                ] as const).map(([k, v, c]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-bg-elev/50 border border-line/40 py-2"
                  >
                    <div className="text-caption uppercase text-ink-subtle">
                      {k}
                    </div>
                    <div
                      className="tabular-nums text-[12px] font-bold mt-0.5"
                      style={{ color: c }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Live-calls feed + Track record — UPSELL only ── */}
          <section>
            <div className="flex items-end justify-between mb-2 gap-2">
              <div className="min-w-0">
                <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-1.5">
                  <LiveDot size={5} /> Live calls
                </h2>
                <div className="text-[10px] text-ink-muted truncate">
                  Last {executionCalls.length} V22 entries · upgrade for the full feed
                </div>
              </div>
              <ScannerHeartbeat scanner={data.scanner} />
            </div>
            <div className="space-y-2">
              {executionCalls.length === 0 ? (
                <div className="text-[11px] text-ink-subtle italic px-1">
                  Scanner warming up — first V22 cycle in progress…
                </div>
              ) : (
                executionCalls.map((c, i) => (
                  <LiveCallRow
                    key={c.id ?? i}
                    call={c}
                    tick={c.symbol ? liveTicks[c.symbol] : undefined}
                    onSelect={() => handleSelectCall(c)}
                  />
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line/60 bg-bg-card/30 p-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h2 className="text-[13px] font-bold tracking-tight">
                  By the year
                </h2>
                <div className="text-[10px] text-ink-muted">
                  Closed PnL · backtested
                  {data.backtest_through
                    ? ` through ${monthYear(data.backtest_through)}, live after`
                    : ""}
                </div>
              </div>
              <div className="text-[10px] text-ink-subtle tabular-nums">
                {data.year_breakdown.length}y
              </div>
            </div>
            <YearBars years={data.year_breakdown} animate={animYears} />
          </section>

          {/* ── Connect Telegram (gated feature) ── */}
          <ConnectTelegram />

          <ConnectPushNotifications />

          {/* ── Plan picker + CTA — UPSELL ONLY ── */}
          <section id="plan-picker" className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold tracking-tight">
                Choose your access
              </h2>
              <span className="text-[10px] text-ink-subtle">Cancel anytime</span>
            </div>
            
            {/* Billing period switcher */}
            <div className="flex p-0.5 rounded-lg bg-bg-elev/50 border border-line/45 max-w-[220px]">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`flex-1 py-1 text-center rounded-md text-[10px] font-bold transition cursor-pointer ${
                  billing === "monthly"
                    ? "bg-accent/15 text-accent border border-accent/15"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`flex-1 py-1 text-center rounded-md text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  billing === "yearly"
                    ? "bg-accent/15 text-accent border border-accent/15"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                Yearly
                <span className="text-[7.5px] bg-accent/20 text-accent px-1 rounded-sm font-extrabold scale-90">
                  -20%
                </span>
              </button>
            </div>

            <div className="space-y-2">
              {dynamicPlans.map((p) => (
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
            const currentRank = dynamicPlans.findIndex((p) => p.id === currentTier);
            const selectedRank = dynamicPlans.findIndex((p) => p.id === selectedPlan.id);
            const isUpgrade = selectedRank > currentRank;
            const isFreePlan = selectedPlan.id === "free";

            return (
              <div className="space-y-2">
                <button
                  disabled={isCurrent || purchaseBusy}
                  onClick={handleCtaClick}
                  className="w-full min-h-14 rounded-2xl px-4 py-3 font-extrabold text-[14px] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isCurrent ? "var(--bg-elev)" : "var(--accent)",
                    color: isCurrent ? "var(--ink-muted)" : "var(--bg)",
                    boxShadow: isCurrent
                      ? "none"
                      : "0 10px 40px rgba(34,211,170,0.25)",
                    border: isCurrent ? "1px solid var(--line)" : "none",
                  }}
                >
                  {!isCurrent && <Zap className="h-4 w-4 flex-none" />}
                  <span>
                    {purchaseBusy
                      ? "Opening Play Store..."
                      : isCurrent
                        ? `You're on ${selectedPlan.name}`
                        : isFreePlan
                          ? "Continue on Free"
                          : isUpgrade
                            ? `Start 7-day trial`
                            : `Switch to ${selectedPlan.name}`}
                  </span>
                  {!isCurrent && !isFreePlan && !purchaseBusy && (
                    <span className="opacity-70 text-[12px]">
                      then {selectedPlan.price}
                      {selectedPlan.per}
                    </span>
                  )}
                </button>
                {purchaseError && (
                  <div
                    className="rounded-xl border px-3 py-2 text-[11px] leading-relaxed"
                    style={{
                      borderColor: "rgba(239,68,68,0.35)",
                      background: "rgba(239,68,68,0.06)",
                      color: "#fecdd3",
                    }}
                  >
                    {purchaseError}
                  </div>
                )}
              </div>
            );
          })()}
          {/* ── Recent wins — UPSELL ONLY ── */}
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

          <p className="text-[10px] text-ink-subtle leading-relaxed pt-1">
            Track record computed from the V22 audit log. Past performance does
            not guarantee future results.
          </p>
            </>
          )}
        </>
      )}

      {/* ── Live signal detail drawer (mobile bottom-sheet / desktop modal) ── */}
      <LiveSignalDrawer
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
        locked={selectedIsLiveLocked}
        sample={selectedIsSample}
        onUpgrade={handleDrawerUpgrade}
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
