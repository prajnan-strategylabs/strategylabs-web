import { EquityCurve } from "../../components/MobileUI";

interface BacktestRunningProps {
  equity: number[];
  progress: number;
}

const STATUS_LINES = [
  { at: 0, text: "Loading 8 years of market data" },
  { at: 25, text: "Walking forward through history" },
  { at: 55, text: "Executing your rules trade by trade" },
  { at: 80, text: "Computing risk and drawdown" },
  { at: 95, text: "Finalizing results" },
];

/** Full-screen takeover — the app's signature moment (DESIGN.md §7.2).
 *  The equity curve draws live while the backtest runs. */
export function BacktestRunning({ equity, progress }: BacktestRunningProps) {
  const status =
    [...STATUS_LINES].reverse().find((s) => progress >= s.at) ?? STATUS_LINES[0];

  return (
    <div className="animate-enter flex flex-col justify-center min-h-[62vh]">
      <div className="text-center">
        <div className="text-caption uppercase text-ink-subtle">
          Walk-forward backtest
        </div>
        <div className="text-display text-ink tabular-nums mt-2">
          {progress}%
        </div>
        <div className="text-footnote text-ink-muted mt-2 h-[17px]">
          {status.text}…
        </div>
      </div>

      <div className="mt-8 -mx-2">
        <EquityCurve
          data={equity.length ? equity : [100, 100]}
          height={160}
          animated={false}
        />
      </div>

      <div className="h-1 rounded-full overflow-hidden bg-surface-2 mt-8">
        <div
          className="h-full bg-accent transition-all duration-150 ease-out-quart"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center gap-6 mt-5 text-footnote text-ink-subtle tabular-nums">
        <span>8.2y data</span>
        <span>47 pairs</span>
        <span>1.2M bars</span>
      </div>
    </div>
  );
}
