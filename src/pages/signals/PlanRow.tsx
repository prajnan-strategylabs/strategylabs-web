import { CheckCircle2 } from "lucide-react";
import { Pill } from "../../components/MobileUI";

export interface Plan {
  id: "free" | "trader" | "auto";
  name: string;
  price: string;
  monthly: number;
  annual?: number;
  per: string;
  note: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export function PlanRow({
  plan,
  selected,
  isCurrent,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
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
      {/* Feature bullets */}
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
