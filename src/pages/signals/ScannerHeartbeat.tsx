import { LiveDot } from "../../components/MobileUI";
import type { V22Stats } from "../../lib/api";

export function ScannerHeartbeat({
  scanner,
}: {
  scanner?: V22Stats["scanner"];
}) {
  // We only care that the scanner has produced at least one heartbeat at all.
  // The actual 4H cadence is design-correct but confusing to expose ("scanned
  // 2h ago" looks broken). A pulsating LIVE chip is the right signal.
  const isLive = !!(scanner?.last_scan_at || scanner?.last_exit_check);
  if (!isLive) return null;
  return (
    <span
      className="text-[10px] font-mono font-bold flex-none whitespace-nowrap flex items-center gap-1 uppercase tracking-[0.12em]"
      style={{ color: "var(--accent)" }}
    >
      <LiveDot size={5} /> live
    </span>
  );
}
