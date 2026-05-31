type Stage = "input" | "compiling" | "chat" | "spec" | "backtesting" | "result";

interface StepperProps {
  stage: Stage;
}

export function Stepper({ stage }: StepperProps) {
  const steps = ["Prompt", "Refine Spec", "Simulation", "Walk-forward Result"];
  const map: Record<Stage, number> = {
    input: 0,
    compiling: 1,
    chat: 1,
    spec: 1,
    backtesting: 2,
    result: 3,
  };
  const idx = map[stage] ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <Segment key={s} label={s} active={i <= idx} current={i === idx} last={i === steps.length - 1} />
      ))}
    </div>
  );
}

function Segment({
  label,
  active,
  current,
  last,
}: {
  label: string;
  active: boolean;
  current: boolean;
  last: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 rounded-full transition-all duration-350 ${active ? "" : "opacity-30"}`}
          style={{
            background: active ? "var(--accent)" : "var(--ink-subtle)",
            width: current ? 22 : 8,
          }}
        />
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${active ? "text-ink" : "text-ink-subtle"}`}
        >
          {label}
        </span>
      </div>
      {!last && (
        <span
          className="flex-1 h-px"
          style={{ background: "var(--line)" }}
        />
      )}
    </>
  );
}
