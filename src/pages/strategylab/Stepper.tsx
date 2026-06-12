type Stage = "input" | "compiling" | "chat" | "spec" | "backtesting" | "result";

interface StepperProps {
  stage: Stage;
}

/** Thin animated progress bar + current-step label (DESIGN.md §7.2). */
export function Stepper({ stage }: StepperProps) {
  const steps = ["Describe", "Review rules", "Backtest", "Result"];
  const map: Record<Stage, number> = {
    input: 0,
    compiling: 1,
    chat: 1,
    spec: 1,
    backtesting: 2,
    result: 3,
  };
  const idx = map[stage] ?? 0;
  const pct = ((idx + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-caption uppercase text-ink-subtle">
          Step {idx + 1} of {steps.length}
        </span>
        <span className="text-caption uppercase text-accent">{steps[idx]}</span>
      </div>
      <div className="h-[3px] rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-enter ease-out-quart"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
