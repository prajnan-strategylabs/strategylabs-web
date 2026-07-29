import type { V22YearRow } from "../../lib/api";

export function YearBars({
  years,
  animate,
}: {
  years: V22YearRow[];
  animate: boolean;
}) {
  const maxAbs = Math.max(1, ...years.map((y) => Math.abs(y.pct)));
  return (
    <div className="space-y-2">
      {years.map((y, i) => {
        const pos = y.pct >= 0;
        const color = pos ? "var(--accent)" : "#fda4af";
        const w = (Math.abs(y.pct) / maxAbs) * 100;
        return (
          <div
            key={y.year}
            className="grid grid-cols-[36px_1fr_64px] gap-2.5 items-center"
          >
            <div
              className="text-caption tabular-nums"
              style={{ color: y.is_ytd ? "var(--ink)" : "var(--ink-muted)" }}
            >
              '{String(y.year).slice(-2)}
            </div>
            <div className="relative h-5 rounded-md overflow-hidden bg-bg-elev/40 border border-line/40">
              <div
                className="absolute inset-y-0 left-0 rounded-md"
                style={{
                  width: animate ? `${w}%` : "0%",
                  background: `linear-gradient(90deg, ${color}, ${color}99)`,
                  transition: `width 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                  boxShadow: pos ? `inset 0 0 0 1px ${color}33` : "none",
                }}
              />
              {y.label && (
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-caption uppercase tracking-wider"
                  style={{ color: "var(--ink-subtle)" }}
                >
                  {y.label}
                </span>
              )}
            </div>
            <div
              className="text-right text-footnote tabular-nums"
              style={{ color }}
            >
              {pos ? "+" : ""}
              {y.pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
