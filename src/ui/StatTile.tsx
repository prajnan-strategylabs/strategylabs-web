import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { hapticLight } from "../lib/haptics";
import { Skeleton } from "./Skeleton";

/** Metric tile: caption label, stat value, footnote.
 *  Optional `info` makes it tap-to-flip into a plain-English explanation. */
export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  info,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "default" | "positive" | "negative" | "accent";
  info?: string;
  loading?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const valueColor =
    tone === "negative"
      ? "text-negative"
      : tone === "positive" || tone === "accent"
        ? "text-accent"
        : "text-ink";

  return (
    <div
      className={`rounded-md2 border border-line bg-surface-1 p-4 ${
        info ? "cursor-pointer" : ""
      }`}
      onClick={
        info
          ? () => {
              hapticLight();
              setFlipped((f) => !f);
            }
          : undefined
      }
    >
      <div className="text-caption uppercase text-ink-subtle flex items-center justify-between">
        <span>{label}</span>
        {info && <HelpCircle className="h-3 w-3 text-ink-faint" />}
      </div>
      {loading ? (
        <Skeleton className="h-[26px] w-16 mt-1.5" />
      ) : flipped && info ? (
        <p className="text-footnote text-ink-muted mt-1.5">{info}</p>
      ) : (
        <>
          <div className={`text-stat tabular-nums mt-1.5 ${valueColor}`}>{value}</div>
          {sub && <div className="text-footnote text-ink-subtle mt-0.5">{sub}</div>}
        </>
      )}
    </div>
  );
}
