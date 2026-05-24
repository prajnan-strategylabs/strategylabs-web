import { MessageSquare, Cpu, BarChart3, Zap } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Describe your idea",
    body: "Tell our AI what you want to test in plain English. \"Buy when RSI drops below 30 on the 4-hour chart and price is above the 200-day moving average.\"",
  },
  {
    n: "02",
    icon: Cpu,
    title: "AI builds the strategy",
    body: "The AI translates your words into a precise, executable strategy spec. No coding required. Edit any rule, tighten any threshold.",
  },
  {
    n: "03",
    icon: BarChart3,
    title: "Backtest + verdict",
    body: "Your strategy runs against years of market data in seconds. You get full results — wins, losses, drawdown, walk-forward validation. We don't hide the bad news.",
  },
  {
    n: "04",
    icon: Zap,
    title: "Get live signals",
    body: "Strategy holds up? Subscribe to real-time alerts via Telegram, push, or webhook. Auto-execute via your exchange API on the Auto tier.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-line py-24">
      <div className="container-app">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
            How it works
          </div>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            From idea to validated strategy.
            <br />
            <span className="text-ink-muted">In four steps.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Step key={s.n} {...s} delayMs={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({
  n, icon: Icon, title, body, delayMs,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  delayMs: number;
}) {
  return (
    <div
      className="card group relative hover:border-accent/30 transition-all hover:-translate-y-1"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 ring-1 ring-accent/30 transition-colors group-hover:bg-accent/20">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <span className="font-mono text-xs text-ink-subtle">{n}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
