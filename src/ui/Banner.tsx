import type { ReactNode } from "react";
import { AlertTriangle, Info, Zap } from "lucide-react";

const TONES = {
  info: {
    box: "border-line bg-surface-1",
    icon: "text-accent",
    text: "text-ink-muted",
    Icon: Info,
  },
  warning: {
    box: "border-warning/20 bg-warning-soft",
    icon: "text-warning",
    text: "text-ink",
    Icon: Zap,
  },
  error: {
    box: "border-negative/20 bg-negative-soft",
    icon: "text-negative",
    text: "text-ink",
    Icon: AlertTriangle,
  },
} as const;

/** Inline status banner with optional action slot (DESIGN.md §5). */
export function Banner({
  tone = "info",
  children,
  action,
  className = "",
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  const Icon = t.Icon;
  return (
    <div className={`rounded-md2 border ${t.box} px-4 py-3 flex gap-3 items-start ${className}`}>
      <Icon className={`h-4 w-4 flex-none mt-0.5 ${t.icon}`} />
      <div className="flex-1 space-y-2.5">
        <div className={`text-footnote font-semibold leading-snug ${t.text}`}>{children}</div>
        {action}
      </div>
    </div>
  );
}
