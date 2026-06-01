import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    sub: "forever",
    features: [
      "Browse the V22 audit log",
      "Signals delayed 24h",
      "Last 5 signals visible",
      "1 strategy slot in the lab",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Trader",
    price: "$19.99",
    sub: "per month",
    features: [
      "Realtime V22 signals",
      "Telegram alerts on every entry",
      "Full audit history + CSV exports",
      "10 active strategy slots",
    ],
    cta: "Start 7-day trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Auto",
    price: "$49.99",
    sub: "per month",
    features: [
      "Everything in Trader",
      "Auto-execute on Binance / Bybit",
      "Webhook outputs for your bot",
      "Unlimited strategy slots",
      "Priority support",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-line py-24">
      <div className="container-app">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
            Pricing
          </div>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Test for free. <span className="text-accent">Pay when you trade.</span>
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Every tier includes our full backtest engine and walk-forward validation.
            Real-time signals and auto-execution are paid features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {TIERS.map((t) => (
            <Tier key={t.name} {...t} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-ink-subtle">
          Annual plans available: Trader $149.99/year and Auto $399.99/year. All prices in USD. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

function Tier({
  name, price, sub, features, cta, highlight, badge,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative card transition-all hover:-translate-y-1 ${
        highlight
          ? "border-accent/50 bg-gradient-to-b from-accent/10 to-bg-card shadow-lg shadow-accent/10"
          : "hover:border-accent/30"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-bg">
          {badge}
        </span>
      )}

      <h3 className="text-lg font-semibold">{name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-sm text-ink-muted">/ {sub}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
            <span className="text-ink-muted">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href="#waitlist"
        className={`mt-8 block w-full text-center ${highlight ? "btn-primary" : "btn-ghost"}`}
      >
        {cta}
      </a>
    </div>
  );
}
