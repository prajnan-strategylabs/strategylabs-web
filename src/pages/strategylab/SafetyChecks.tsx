import { CheckCircle2 } from "lucide-react";

/** Describes the robustness checks the engine runs on every backtest.
 *  Deliberately descriptive-only before a run — real numbers appear in the
 *  result report (monte_carlo / cost_stress from the API). Never show
 *  fabricated per-strategy values here. */
export function SafetyChecks() {
  const checks = [
    { k: "Monte Carlo", v: "500 seeded trade-order reshuffles" },
    { k: "Cost stress", v: "replayed with fees + slippage doubled" },
    { k: "Execution", v: "signal on close, fill at next open" },
    { k: "Costs modeled", v: "0.10% fee + 0.05% slippage per side" },
  ];
  return (
    <div className="rounded-lg2 border border-line bg-surface-1 p-4 space-y-2">
      <div className="flex items-center gap-2 text-caption uppercase text-ink-subtle">
        <CheckCircle2 className="h-3 w-3" /> Checks run on every backtest
      </div>
      <div>
        {checks.map((c) => (
          <div
            key={c.k}
            className="flex items-center justify-between text-footnote py-2 border-b border-line/60 last:border-0"
          >
            <span className="text-ink-muted">{c.k}</span>
            <span className="text-ink font-semibold flex items-center gap-1.5">
              {c.v}
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-ink-subtle leading-relaxed pt-1">
        Results appear with your backtest report — nothing is graded until the
        simulation actually runs.
      </p>
    </div>
  );
}
