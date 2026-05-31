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
  type V22Stats,
} from "../lib/api";
import { EquityCurve, LiveDot, Pill } from "../components/MobileUI";
import DigitRoller from "../components/DigitRoller";
import { ConnectTelegram } from "../components/ConnectTelegram";
import { LiveSignalDrawer } from "../components/LiveSignalDrawer";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { useBinanceTradeStreams } from "../lib/useBinanceStreams";
import { useAuth } from "../context/AuthContext";
import { getSubscriptionOfferings, presentPaywall, type RCProductOfferings } from "../lib/purchases";

// Modular Sub-components Imports
import { ScannerHeartbeat } from "./signals/ScannerHeartbeat";
import { LiveCallRow } from "./signals/LiveCallRow";
import { YearBars } from "./signals/YearBars";
import { PlanRow, type Plan } from "./signals/PlanRow";
import { RecentWinChip } from "./signals/RecentWinChip";
import { HeroSkeleton } from "./signals/HeroSkeleton";

/* ────────────────────────────────────────────────────────────────────────
   Pricing — 3 visible tiers (Free / Trader / Auto). The 5-tier UserTier
   type stays wide for back-compat with existing users on legacy tiers
   (explorer / pro); the UI just collapses them visually onto the nearest
   visible tier via `currentTierForDisplay()` below.
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
  return <SignalsBody />;
}

function SignalsBody() {
  const { user } = useAuth();
  const currentTier = visibleTierFor(user?.tier ?? "free");
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

  const dynamicPlans = useMemo(() => {
    return PLANS.map((p) => {
      if (!rcOfferings?.rawOfferings?.current) return p;
      const currentOffering = rcOfferings.rawOfferings.current;
      
      let pkg: any = null;
      if (p.id === "trader") {
        pkg = currentOffering.monthly || currentOffering.annual || null;
      } else if (p.id === "auto") {
        pkg = currentOffering.availablePackages?.find((pkg: any) => 
          pkg.identifier.toLowerCase().includes("auto") || 
          pkg.product.identifier.toLowerCase().includes("auto")
        ) || null;
      }

      if (pkg && pkg.product) {
        return {
          ...p,
          price: pkg.product.priceString,
          monthly: pkg.product.price,
        };
      }
      return p;
    });
  }, [rcOfferings]);

  const selectedPlan = dynamicPlans.find((p) => p.id === plan)!;

  const handleCtaClick = async () => {
    const isCurrent = selectedPlan.id === currentTier;
    if (isCurrent) return;

    if (selectedPlan.id === "free") {
      alert("To manage or cancel your active subscription, please use the settings in your profile menu or system subscription settings.");
      return;
    }

    try {
      const purchased = await presentPaywall(selectedPlan.id);
      if (purchased) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Paywall error", e);
    }
  };
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
            audited
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
                <DigitRoller
                  value={`+${Math.round(data.cum_return_pct).toLocaleString()}%`}
                  height={52}
                  className="text-[48px] font-extrabold tracking-tight tabular-nums leading-none"
                  style={{
                    color: "var(--accent)",
                    letterSpacing: "-0.03em",
                  }}
                />
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

          {/* ── Live-calls feed + Track record — UPSELL only (paid users access via History drawer) ── */}
          {!isPaid && (
          <>
          <section>
            {(() => {
              const sortedCalls = [...data.recent_calls].sort((a, b) => {
                if (a.status === "open" && b.status !== "open") return -1;
                if (a.status !== "open" && b.status === "open") return 1;
                return 0;
              });
              return (
                <>
                  <div className="flex items-end justify-between mb-2 gap-2">
                    <div className="min-w-0">
                      <h2 className="text-[13px] font-bold tracking-tight flex items-center gap-1.5">
                        <LiveDot size={5} /> Live calls
                      </h2>
                      <div className="text-[10px] text-ink-muted truncate">
                        Last {sortedCalls.length} V22 entries · upgrade for the full feed
                      </div>
                    </div>
                    <ScannerHeartbeat scanner={data.scanner} />
                  </div>
                  <div className="space-y-2">
                    {sortedCalls.length === 0 ? (
                      <div className="text-[11px] text-ink-subtle italic px-1">
                        Scanner warming up — first V22 cycle in progress…
                      </div>
                    ) : (
                      sortedCalls.map((c, i) => (
                        <LiveCallRow
                          key={c.id ?? i}
                          call={c}
                          tick={c.symbol ? liveTicks[c.symbol] : undefined}
                          onSelect={() => setSelectedCall(c)}
                        />
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </section>

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
              <button
                disabled={isCurrent}
                onClick={handleCtaClick}
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
