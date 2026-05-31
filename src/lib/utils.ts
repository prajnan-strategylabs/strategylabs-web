import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", opts).format(n);
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatWhenAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    let dateStr = typeof dateInput === "string" ? dateInput.trim() : "";
    let date: Date;
    if (dateStr) {
      // Normalize space to T
      dateStr = dateStr.replace(" ", "T");
      // If it doesn't end with Z or a timezone offset like +00:00 / -0500, append Z to force UTC
      if (!/[Zz]$/.test(dateStr) && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
        dateStr += "Z";
      }
      date = new Date(dateStr);
    } else {
      date = dateInput as Date;
    }
    const ms = Date.now() - date.getTime();
    const secs = Math.max(0, ms / 1000);
    if (secs < 60) return "just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    if (secs < 86400 * 7) return `${Math.round(secs / 86400)}d ago`;
    if (secs < 86400 * 30) return `${Math.round(secs / (86400 * 7))}w ago`;
    if (secs < 86400 * 365) return `${Math.round(secs / (86400 * 30))}mo ago`;
    return `${Math.round(secs / (86400 * 365))}y ago`;
  } catch {
    return "";
  }
}
