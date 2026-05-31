import { Terminal, CheckCircle2 } from "lucide-react";
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

export function SpecCard({ spec }: SpecCardProps) {
  if (!spec) {
    return (
      <div className="rounded-2xl border border-line bg-bg-card/40 p-12 text-center text-ink-subtle text-xs italic font-mono">
        Waiting for Quant Coach parameters...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-bg-card/40 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line/40 bg-bg-elev/10">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          <Terminal className="h-3 w-3" /> Generated Strategy spec
        </div>
        <Pill tone="accent">
          <CheckCircle2 className="h-[9px] w-[9px]" /> active rules
        </Pill>
      </div>
      <pre className="px-4 py-4 font-mono text-[11px] leading-[1.75] text-ink-muted overflow-x-auto whitespace-pre select-text">
        <span className="text-ink-subtle">version:</span>{" "}
        <span style={{ color: "var(--accent)" }}>"v22"</span>
        {"\n"}
        <span className="text-ink-subtle">asset:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.asset || "Pending"}</span>
        {"\n"}
        <span className="text-ink-subtle">timeframe:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.timeframe || "Pending"}</span>
        {"\n"}
        <span className="text-ink-subtle">indicators:</span>
        {spec.indicators && spec.indicators.map((ind: string) => (
          `\n  - ${ind}`
        ))}
        {"\n"}
        <span className="text-ink-subtle">entry:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.entry || "Pending"}</span>
        {"\n"}
        <span className="text-ink-subtle">exit:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.exit || "Pending"}</span>
        {"\n"}
        <span className="text-ink-subtle">stop:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.stop_loss || "Pending"}</span>
        {"\n"}
        <span className="text-ink-subtle">target:</span>{" "}
        <span style={{ color: "var(--accent)" }}>{spec.target || "Pending"}</span>
      </pre>
    </div>
  );
}
