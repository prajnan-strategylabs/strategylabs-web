import { useState } from "react";
import { Sparkles, Plus, Play, X } from "lucide-react";
import { hapticLight } from "../../lib/haptics";

const TOUR_KEY = "sl_lab_tour_done";

const STEPS = [
  {
    icon: Sparkles,
    title: "Describe your idea in plain English",
    body: "No code needed — type your strategy the way you'd explain it to a friend. Stuck? Tap a starter idea below.",
  },
  {
    icon: Plus,
    title: "Add detail with one tap",
    body: "Use + indicators and + timeframes to drop terms into your prompt, or tap the mic and just say it.",
  },
  {
    icon: Play,
    title: "Test it on 8 years of data",
    body: "Draft Rules turns your words into precise trading rules. Review them, then run the backtest to see if your idea would have made money.",
  },
];

export function shouldShowLabTour(): boolean {
  try {
    return !localStorage.getItem(TOUR_KEY);
  } catch {
    return false;
  }
}

export function LabTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  function finish() {
    hapticLight();
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // storage unavailable — tour will show again next visit
    }
    onDone();
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/[0.05] p-4 animate-fade-in relative">
      <button
        aria-label="Skip tour"
        onClick={finish}
        className="absolute top-3 right-3 text-ink-subtle hover:text-ink transition"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3.5 items-start pr-6">
        <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-none">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[13px] font-extrabold text-ink leading-snug">
            {current.title}
          </h4>
          <p className="text-[11.5px] text-ink-muted leading-relaxed">{current.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3.5 pl-[50px]">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            if (isLast) {
              finish();
            } else {
              hapticLight();
              setStep(step + 1);
            }
          }}
          className="text-[11px] font-bold px-3.5 h-8 rounded-lg active:scale-95 transition"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          {isLast ? "Got it" : "Next"}
        </button>
      </div>
    </div>
  );
}
