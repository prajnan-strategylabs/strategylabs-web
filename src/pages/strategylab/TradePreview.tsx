import { ChevronRight, LineChart } from "lucide-react";
import { Pill } from "../../components/MobileUI";

type TradeRow = {
  date: string;
  side: "LONG" | "SHORT";
  entry: number;
  exit: number;
  r: string;
  pos: boolean;
  pnl_pct?: number;
};

interface TradePreviewProps {
  trades: Array<TradeRow>;
  onViewAll?: () => void;
  /** index is this trade's position in the FULL trades array (not the
   *  5-item preview slice) — the preview always starts from index 0, so
   *  the local map index already matches the full array's index. */
  onSelectTrade?: (trade: TradeRow, index: number) => void;
}

export function TradePreview({ trades, onViewAll, onSelectTrade }: TradePreviewProps) {
  // Show only the 5 most recent trades in the preview panel
  const previewTrades = trades ? trades.slice(0, 5) : [];

  return (
    <div className="rounded-2xl border border-line bg-bg-card/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line/40 bg-bg-elev/10">
        <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          Recent trades ({trades?.length || 0})
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-[10px] font-bold text-ink hover:text-accent flex items-center gap-1"
          >
            View all <ChevronRight className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
      <div>
        {previewTrades.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelectTrade?.(t, i)}
            disabled={!onSelectTrade}
            className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-[12px] border-b border-line/30 last:border-0 enabled:hover:bg-bg-elev/40 enabled:active:bg-bg-elev/60 transition-colors"
          >
            <div className="text-ink-subtle font-mono w-20 text-[11px]">{t.date}</div>
            <Pill tone={t.side === "LONG" ? "accent" : "danger"}>{t.side}</Pill>
            <div className="flex-1 font-mono text-ink-muted text-[11px] tabular-nums">
              ${t.entry.toLocaleString()} → ${t.exit.toLocaleString()}
            </div>
            <div
              className="font-mono font-bold tabular-nums text-[12px]"
              style={{ color: t.pos ? "var(--accent)" : "#fda4af" }}
            >
              {t.r}
            </div>
            {onSelectTrade && <LineChart className="h-3 w-3 text-ink-subtle/60 flex-none" />}
          </button>
        ))}
      </div>
    </div>
  );
}

