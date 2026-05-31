import { TrendingUp, TrendingDown } from "lucide-react";
import { Pill } from "../../components/MobileUI";
import type { V22RecentWin } from "../../lib/api";

export function RecentWinChip({ w }: { w: V22RecentWin }) {
  return (
    <div className="flex-none w-[140px] rounded-xl border border-line/60 bg-bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold text-ink-muted">
          {w.asset}
        </span>
        <Pill tone={w.dir === "LONG" ? "accent" : "danger"} className="!py-[1px]">
          {w.dir === "LONG" ? (
            <TrendingUp className="h-[8px] w-[8px]" />
          ) : (
            <TrendingDown className="h-[8px] w-[8px]" />
          )}{" "}
          {w.dir}
        </Pill>
      </div>
      <div
        className="font-mono tabular-nums font-extrabold text-[18px] mt-2"
        style={{ color: "var(--accent)" }}
      >
        +{w.ret_pct}%
      </div>
      <div className="text-[10px] text-ink-subtle mt-0.5">
        {w.hold_days}d hold · {w.when_ago}
      </div>
    </div>
  );
}
