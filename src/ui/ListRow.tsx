import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { hapticLight } from "../lib/haptics";

/** Standard list row: leading tile · title/sub · trailing value · chevron.
 *  Press feedback = surface step-up, never scale (DESIGN.md §4). */
export function ListRow({
  leading,
  title,
  sub,
  trailing,
  chevron = false,
  onPress,
  className = "",
}: {
  leading?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const Tag = onPress ? "button" : "div";
  return (
    <Tag
      onClick={
        onPress
          ? () => {
              hapticLight();
              onPress();
            }
          : undefined
      }
      className={`w-full text-left rounded-md2 border border-line bg-surface-1
        active:bg-surface-2 transition-colors duration-press
        p-4 flex items-center gap-3.5 ${className}`}
    >
      {leading && (
        <div className="h-11 w-11 rounded-sm2 bg-surface-2 flex items-center justify-center flex-none text-ink-muted">
          {leading}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-headline text-ink truncate">{title}</div>
        {sub && <div className="text-footnote text-ink-muted truncate mt-0.5">{sub}</div>}
      </div>
      {trailing && <div className="flex-none text-right">{trailing}</div>}
      {chevron && <ChevronRight className="h-4 w-4 text-ink-faint flex-none" />}
    </Tag>
  );
}
