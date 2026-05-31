import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { LiveDot } from "../../components/MobileUI";

interface CompilingPanelProps {
  prompt: string;
}

export function CompilingPanel({ prompt }: CompilingPanelProps) {
  const lines = [
    "// parsing quantitative thesis...",
    `tokens = lex("${prompt.slice(0, 18)}...")`,
    "✓ scanning asset and timeframe gates",
    "✓ mapping indicator specifications",
    "// triggering quant compiler Consensus",
    "✓ resolving triggers and safety indicators",
    "✓ rules spec compiled successfully in 0.42s"
  ];
  
  const [shown, setShown] = useState<string[]>([]);
  
  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(lines.slice(0, i));
      if (i >= lines.length) window.clearInterval(id);
    }, 150);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="rounded-2xl border border-line bg-bg-card/40 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="relative h-7 w-7 rounded-lg flex items-center justify-center bg-accent/15 text-accent"
        >
          <Terminal className="h-[14px] w-[14px]" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-muted">
          Compiling Thesis...
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ink-subtle font-mono">
          <LiveDot size={4} /> claude
        </span>
      </div>
      <div className="rounded-xl bg-bg-elev/70 border border-line/45 p-3.5 font-mono text-[11px] leading-[1.7] text-ink-muted min-h-[180px]">
        {shown.map((l, i) => {
          const isOk = l.startsWith("✓");
          const isComment = l.startsWith("//");
          return (
            <div
              key={i}
              style={{
                color: isOk
                  ? "var(--accent)"
                  : isComment
                    ? "var(--ink-subtle)"
                    : "var(--ink)",
              }}
            >
              {l}
              {i === shown.length - 1 && shown.length < lines.length && (
                <span
                  className="inline-block w-1.5 h-3 -mb-0.5 ml-0.5 bg-accent animate-pulse"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
