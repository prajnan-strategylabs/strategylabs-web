import type { ButtonHTMLAttributes, ReactNode } from "react";
import { hapticLight } from "../lib/haptics";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-footnote rounded-sm2 gap-1.5",
  md: "h-11 px-5 text-body font-semibold rounded-md2 gap-2",
  lg: "h-13 px-6 text-[15px] font-bold rounded-md2 gap-2 w-full",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-surface-0 font-bold active:bg-accent-pressed disabled:opacity-40",
  secondary:
    "bg-surface-2 text-ink border border-line active:bg-surface-3 disabled:opacity-40",
  ghost:
    "bg-transparent text-ink-muted active:bg-surface-2 disabled:opacity-40",
  destructive:
    "bg-negative-soft text-negative border border-negative/20 active:bg-negative/20 disabled:opacity-40",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={(e) => {
        hapticLight();
        onClick?.(e);
      }}
      className={`inline-flex items-center justify-center select-none
        transition-transform duration-press ease-out-quart active:scale-[0.97]
        disabled:active:scale-100 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
