/**
 * Strategy Labs brand mark — ascending chart with V-dip + spark peak.
 * Use `size` to control rendered px. Color comes from `text-{color}` class.
 */
export function LogoMark({
  size = 32,
  className = "",
}: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 36 180 C 60 178, 78 168, 96 144 L 116 168 L 222 50"
        stroke="currentColor" strokeWidth="14"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="36" cy="180" r="10" stroke="currentColor" strokeWidth="9" />
      <circle cx="222" cy="50" r="12" stroke="currentColor" strokeWidth="9" />
      <g stroke="currentColor" strokeWidth="9" strokeLinecap="round">
        <line x1="222" y1="22" x2="222" y2="8" />
        <line x1="200" y1="32" x2="190" y2="22" />
        <line x1="244" y1="32" x2="254" y2="22" />
        <line x1="192" y1="50" x2="178" y2="50" />
        <line x1="252" y1="50" x2="266" y2="50" />
      </g>
    </svg>
  );
}

/**
 * Logo + wordmark together — for headers and footers.
 */
export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={28} className="text-accent" />
      <span className="text-lg font-bold tracking-tight">
        Strategy<span className="text-accent">Labs</span>
      </span>
    </span>
  );
}
