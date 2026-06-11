import { useEffect, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { subscribeToasts, dismissToast, type ToastItem } from "../lib/toast";

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-accent flex-none" />,
  info: <Info className="h-4 w-4 text-sky-400 flex-none" />,
  error: <AlertTriangle className="h-4 w-4 text-red-400 flex-none" />,
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border border-line bg-bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-md animate-slide-up"
        >
          {icons[t.kind]}
          <p className="flex-1 text-xs font-semibold leading-snug text-ink">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="p-1 rounded-lg text-ink-muted hover:text-ink transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
