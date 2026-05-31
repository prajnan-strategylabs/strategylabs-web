import { ChevronRight } from "lucide-react";
import { Pill } from "../../components/MobileUI";

interface TradePreviewProps {
  trades: Array<{
    date: string;
    side: "LONG" | "SHORT";
    entry: number;
    exit: number;
    r: string;
    pos: boolean;
  }>;
}

export function TradePreview({ trades }: TradePreviewProps) {
  return (
    <div className="rounded-2xl border border-line bg-bg-card/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line/40 bg-bg-elev/10">
        <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          Recent simulated trades
        </div>
        <button className="text-[10px] font-bold text-ink-muted hover:text-ink flex items-center gap-1">
          View all <ChevronRight className="h-2.5 w-2.5" />
        </button>
      </div>
      <div>
        {trades && trades.map((t, i) => (
          <div
            key={i}
            className="px-4 py-2.5 flex items-center gap-3 text-[12px] border-b border-line/30 last:border-0"
          >
            <div className="text-ink-subtle font-mono w-14 text-[11px]">{t.date}</div>
            <Pill tone={t.pos ? "accent" : "danger"}>{t.side}</Pill>
            <div className="flex-1 font-mono text-ink-muted text-[11px] tabular-nums">
              ${t.entry.toLocaleString()} → ${t.exit.toLocaleString()}
            </div>
            <div
              className="font-mono font-bold tabular-nums text-[12px]"
              style={{ color: t.pos ? "var(--accent)" : "#fda4af" }}
            >
              {t.r}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
