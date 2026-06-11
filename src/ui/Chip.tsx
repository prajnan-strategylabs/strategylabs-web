import type { ReactNode } from "react";
import { hapticLight } from "../lib/haptics";

/** Selectable pill chip (DESIGN.md §5). */
export function Chip({
  children,
  selected = false,
  onPress,
  className = "",
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={
        onPress
          ? () => {
              hapticLight();
              onPress();
            }
          : undefined
      }
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full
        text-footnote font-semibold select-none
        transition-colors duration-state ease-out-quart active:scale-[0.97]
        ${
          selected
            ? "bg-accent-soft text-accent border border-accent/25"
            : "bg-surface-2 text-ink-muted border border-line active:bg-surface-3"
        } ${className}`}
    >
      {children}
    </button>
  );
}
