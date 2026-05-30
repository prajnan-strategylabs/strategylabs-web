/* ========================================================================
   Strategy Labs — shared mobile primitives
   Ported from Claude Design handoff: Sparkline · EquityCurve · NumFlow ·
   LiveDot · Pill. Used across Dashboard, Strategy Lab, Signals.
   ======================================================================== */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ---------------- LiveDot ---------------- */
export function LiveDot({
  color = "var(--accent)",
  size = 6,
}: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex flex-none" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full opacity-60 animate-ping"
        style={{ background: color }}
      />
      <span
        className="relative inline-block rounded-full"
        style={{ background: color, width: size, height: size }}
      />
    </span>
  );
}

/* ---------------- Sparkline path builder ---------------- */
function buildSparkPath(data: number[], w: number, h: number) {
  if (!data || data.length < 2) return { line: "", area: "" };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i): [number, number] => [
    i * stepX,
    h - ((v - min) / range) * (h - 2) - 1,
  ]);
  const line = pts
    .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${w.toFixed(2)} ${h.toFixed(2)} L 0 ${h.toFixed(2)} Z`;
  return { line, area };
}

/* ---------------- Sparkline (compact) ---------------- */
export function Sparkline({
  data,
  color = "var(--accent)",
  width = 80,
  height = 28,
  fill = true,
  strokeWidth = 1.6,
  animated = false,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  strokeWidth?: number;
  animated?: boolean;
}) {
  const path = useMemo(() => buildSparkPath(data, width, height), [data, width, height]);
  const dRef = useRef<SVGPathElement | null>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (animated && dRef.current) {
      setLen(dRef.current.getTotalLength());
    }
  }, [animated, path.line]);
  const gradId = useMemo(
    () => `spark-grad-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={path.area} fill={`url(#${gradId})`} />}
      <path
        ref={dRef}
        d={path.line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animated && len
            ? {
                strokeDasharray: len,
                strokeDashoffset: len,
                animation: "spark-draw 1.4s cubic-bezier(.6,.05,.2,1) forwards",
              }
            : undefined
        }
      />
    </svg>
  );
}

/* ---------------- EquityCurve (richer) ---------------- */
export function EquityCurve({
  data,
  height = 160,
  animated = true,
}: {
  data: number[];
  height?: number;
  animated?: boolean;
}) {
  const W = 600;
  const H = height;
  const path = useMemo(() => buildSparkPath(data, W, H), [data, H]);
  const dRef = useRef<SVGPathElement | null>(null);
  const [len, setLen] = useState(0);
  const gradId = useMemo(
    () => `eq-grad-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );
  useEffect(() => {
    if (animated && dRef.current) setLen(dRef.current.getTotalLength());
  }, [animated, path.line]);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1="0"
          y1={H * p}
          x2={W}
          y2={H * p}
          stroke="var(--line)"
          strokeOpacity="0.5"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}
      <path d={path.area} fill={`url(#${gradId})`} />
      <path
        ref={dRef}
        d={path.line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animated && len
            ? {
                strokeDasharray: len,
                strokeDashoffset: len,
                animation: "spark-draw 1.6s cubic-bezier(.6,.05,.2,1) forwards",
              }
            : undefined
        }
      />
    </svg>
  );
}

/* ---------------- NumFlow ---------------- */
export function NumFlow({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  useEffect(() => {
    let raf = 0;
    const start = shownRef.current;
    const end = value;
    const t0 = performance.now();
    const dur = 700;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const v = start + (end - start) * e;
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const txt = shown.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {txt}
      {suffix}
    </span>
  );
}

/* ---------------- Pill ---------------- */
type PillTone = "neutral" | "accent" | "danger" | "warn" | "info";
export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  const styles: Record<PillTone, { bg: string; fg: string }> = {
    neutral: { bg: "rgba(139,148,168,0.10)", fg: "var(--ink-muted, #8b94a8)" },
    accent: { bg: "rgba(34,211,170,0.14)", fg: "var(--accent, #22d3aa)" },
    danger: { bg: "rgba(239,68,68,0.14)", fg: "#fca5a5" },
    warn: { bg: "rgba(245,158,11,0.14)", fg: "#fcd34d" },
    info: { bg: "rgba(99,102,241,0.18)", fg: "#a5b4fc" },
  };
  const s = styles[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}
      style={{
        background: s.bg,
        color: s.fg,
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </span>
  );
}

/* ---------------- Plausible equity walk helper ---------------- */
export function genWalk(
  n: number,
  seed = 1,
  vol = 1.2,
  drift = 0.3,
): number[] {
  let r = seed;
  const rng = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };
  let v = 100;
  const arr = [v];
  for (let i = 1; i < n; i++) {
    v += (rng() - 0.5) * vol + drift;
    arr.push(v);
  }
  return arr;
}
