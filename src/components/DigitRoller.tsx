import { useEffect, useRef, useState, memo } from "react";

/* ─── Single rolling column ─────────────────────────────────────────── */

const DIGITS = "0123456789";

interface ColProps {
  digit: string; // 0-9
  delay: number; // stagger ms
  height: number; // line-height in px
}

const RollerCol = memo(({ digit, delay, height }: ColProps) => {
  const idx = DIGITS.indexOf(digit);
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Re-trigger on digit change
  useEffect(() => {
    setActive(false);
    const t = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(t);
  }, [digit]);

  return (
    <div
      style={{
        height,
        overflow: "hidden",
        display: "inline-block",
        position: "relative",
      }}
    >
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "column",
          transition: active
            ? `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
            : "none",
          transform: active
            ? `translateY(-${idx * height}px)`
            : `translateY(-${9 * height}px)`, // start from 9
        }}
      >
        {DIGITS.split("").map((d) => (
          <span
            key={d}
            style={{
              height,
              lineHeight: `${height}px`,
              display: "block",
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
});

RollerCol.displayName = "RollerCol";

/* ─── Static character (comma, %, +, etc.) ──────────────────────────── */

const StaticChar = memo(
  ({ char, height }: { char: string; height: number }) => (
    <span
      style={{
        display: "inline-block",
        height,
        lineHeight: `${height}px`,
      }}
    >
      {char}
    </span>
  ),
);
StaticChar.displayName = "StaticChar";

/* ─── Public component ──────────────────────────────────────────────── */

interface DigitRollerProps {
  value: string; // e.g. "+1,234%"
  height?: number; // px per character cell (match font-size)
  className?: string;
  style?: React.CSSProperties;
}

export default function DigitRoller({
  value,
  height = 52,
  className,
  style,
}: DigitRollerProps) {
  const chars = value.split("");
  let digitIdx = 0;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        overflow: "hidden",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        if (/\d/.test(ch)) {
          const stagger = digitIdx * 80; // 80ms between each digit
          digitIdx++;
          return (
            <RollerCol key={`${i}-${ch}`} digit={ch} delay={stagger} height={height} />
          );
        }
        return <StaticChar key={`${i}-${ch}`} char={ch} height={height} />;
      })}
    </span>
  );
}
