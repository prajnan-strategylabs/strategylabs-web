import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { hapticLight } from "../lib/haptics";

/** Bottom sheet — the standard mobile interruption surface (DESIGN.md §5).
 *  Spring entrance, scrim, drag handle, drag-to-dismiss following the finger. */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragDelta = useRef(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true))
      );
      return () => cancelAnimationFrame(id);
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 360);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [mounted]);

  function onTouchStart(e: React.TouchEvent) {
    dragStart.current = e.touches[0].clientY;
    dragDelta.current = 0;
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }

  function onTouchMove(e: React.TouchEvent) {
    if (dragStart.current === null || !sheetRef.current) return;
    const delta = Math.max(0, e.touches[0].clientY - dragStart.current);
    dragDelta.current = delta;
    sheetRef.current.style.transform = `translateY(${delta}px)`;
  }

  function onTouchEnd() {
    if (!sheetRef.current) return;
    sheetRef.current.style.transition = "";
    if (dragDelta.current > 90) {
      hapticLight();
      sheetRef.current.style.transform = "";
      onClose();
    } else {
      sheetRef.current.style.transform = "";
    }
    dragStart.current = null;
    dragDelta.current = 0;
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-state ease-out-quart ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative bg-surface-1 border-t border-line-strong rounded-t-xl2
          px-5 pt-3 transition-transform duration-sheet ease-spring will-change-transform
          ${shown ? "translate-y-0" : "translate-y-full"}`}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 20px)",
          boxShadow: "0 -16px 48px rgba(0,0,0,0.45)",
        }}
      >
        <div className="w-9 h-1 bg-ink-faint/40 rounded-full mx-auto mb-4" />
        {children}
      </div>
    </div>,
    document.body
  );
}
