import { CheckCircle2 } from "lucide-react";

export function SafetyChecks() {
  const checks = [
    { k: "Walk-forward windows", v: "12 of 12 pass" },
    { k: "Monte-Carlo (10k runs)", v: "p95 DD < 15%" },
    { k: "Out-of-sample Sharpe", v: "2.31 (in: 2.44)" },
    { k: "Survivorship bias", v: "filtered" },
  ];
  return (
    <div className="rounded-2xl border border-line bg-bg-card/40 p-4 space-y-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
        <CheckCircle2 className="h-3 w-3" /> Walk-forward Robustness
      </div>
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.k}
            className="flex items-center justify-between text-[12px] py-1.5 border-b border-line/30 last:border-0"
          >
            <span className="text-ink-muted">{c.k}</span>
            <span className="font-mono text-ink flex items-center gap-1.5">
              {c.v}
              <span
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
