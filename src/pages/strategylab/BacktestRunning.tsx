import { EquityCurve } from "../../components/MobileUI";

interface BacktestRunningProps {
  equity: number[];
  progress: number;
}

export function BacktestRunning({ equity, progress }: BacktestRunningProps) {
  return (
    <div className="rounded-2xl border border-line bg-bg-card/40 p-4 animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-pulse bg-accent"
          />
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
            Simulating walk-forward data
          </span>
        </div>
        <span
          className="font-mono tabular-nums text-[12px] font-bold text-accent"
        >
          {progress}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden bg-line"
      >
        <div
          className="h-full transition-all duration-150 bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="rounded-xl bg-bg-elev/50 border border-line/45 px-3 py-2">
        <EquityCurve
          data={equity.length ? equity : [100, 100]}
          height={140}
          animated={false}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono tabular-nums text-ink-subtle">
        <div>
          8.2y data <span className="text-ink-subtle">·</span>{" "}
          <span className="text-accent">scanning</span>
        </div>
        <div>
          47 pairs <span className="text-ink-subtle">·</span>{" "}
          <span className="text-accent">matched</span>
        </div>
        <div>1.2M bars</div>
      </div>
    </div>
  );
}
