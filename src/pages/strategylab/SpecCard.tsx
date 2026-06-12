import { Terminal, CheckCircle2, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Pill } from "../../components/MobileUI";

interface SpecCardProps {
  spec: {
    asset: string;
    timeframe: string;
    indicators: string[];
    entry: string;
    exit: string;
    stop_loss: string;
    target: string;
  } | null;
}

/** Rules grouped into scannable cards — mono only inside rule expressions
 *  (DESIGN.md §7.2). */
export function SpecCard({ spec }: SpecCardProps) {
  if (!spec) {
    return (
      <div className="rounded-lg2 border border-line bg-surface-1 p-12 text-center text-footnote text-ink-subtle">
        Waiting for strategy parameters…
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-enter">
      {/* Market header */}
      <div className="rounded-lg2 border border-line bg-surface-1 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-caption uppercase text-ink-subtle">
            <Terminal className="h-3 w-3" /> Your strategy
          </div>
          <Pill tone="accent">
            <CheckCircle2 className="h-[9px] w-[9px]" /> rules ready
          </Pill>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-headline text-ink">{spec.asset || "—"}</span>
          <span className="text-footnote text-ink-subtle">on the</span>
          <span className="text-headline text-ink">{spec.timeframe || "—"}</span>
          <span className="text-footnote text-ink-subtle">timeframe</span>
        </div>
        {spec.indicators?.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {spec.indicators.map((ind) => (
              <span
                key={ind}
                className="rounded-full bg-surface-2 border border-line px-2.5 py-1 text-footnote font-semibold text-ink-muted"
              >
                {ind}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rule groups */}
      <RuleGroup icon={LogIn} label="Entry" value={spec.entry} />
      <RuleGroup icon={LogOut} label="Exit" value={spec.exit} />
      <div className="grid grid-cols-2 gap-3">
        <RuleGroup icon={ShieldCheck} label="Stop loss" value={spec.stop_loss} />
        <RuleGroup icon={ShieldCheck} label="Target" value={spec.target} />
      </div>
    </div>
  );
}

function RuleGroup({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LogIn;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md2 border border-line bg-surface-1 p-4">
      <div className="flex items-center gap-1.5 text-caption uppercase text-ink-subtle">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-mono text-[13px] leading-relaxed text-ink mt-2 selectable">
        {value || <span className="text-ink-subtle">Pending</span>}
      </div>
    </div>
  );
}
