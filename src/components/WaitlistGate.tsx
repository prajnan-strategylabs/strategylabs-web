import { ReactNode, useState } from "react";
import { Clock, Sparkles, AlertCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWaitlistStatus } from "../lib/useWaitlistStatus";
import { useAppConfig } from "../lib/useAppConfig";
import { joinWaitlist } from "../lib/waitlist";

interface WaitlistGateProps {
  /** What to render when the user has cleared the waitlist gate (approved). */
  children: ReactNode;
  /**
   * Predicate that decides whether a user is "approved" past the waitlist.
   * Default: anyone whose tier != "free" is approved. Override per-page if needed.
   */
  isApproved?: (tier: string) => boolean;
}

const defaultIsApproved = (tier: string) => tier !== "free";

export function WaitlistGate({ children, isApproved = defaultIsApproved }: WaitlistGateProps) {
  const { user, isSandbox } = useAuth();
  const status = useWaitlistStatus();
  const { waitlist_full: waitlistFull } = useAppConfig();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  // Sandbox always sees the real dashboard
  if (isSandbox) return <>{children}</>;

  // Already approved users (paid tier, or an admin-set flag) bypass the gate
  if (user && isApproved(user.tier)) return <>{children}</>;

  if (status.state === "loading") {
    return (
      <GateShell>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm text-ink-muted">Checking your access…</p>
        </div>
      </GateShell>
    );
  }

  if (status.state === "error") {
    return (
      <GateShell>
        <div className="flex flex-col items-center gap-3 py-8">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-ink-muted text-center">
            We couldn't verify your access right now.<br />
            <span className="text-xs text-ink-subtle">{status.error}</span>
          </p>
        </div>
      </GateShell>
    );
  }

  const { on_waitlist, position } = status.data;

  // On waitlist but not approved — show position + waiting message
  if (on_waitlist) {
    return (
      <GateShell>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent ring-4 ring-accent/5">
            <Clock className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">You're on the waitlist</h2>
            <p className="mt-2 text-sm text-ink-muted">
              We're opening seats in batches as we stress-test the platform.
            </p>
          </div>

          {typeof position === "number" && (
            <div className="rounded-xl border border-line bg-bg-elev/40 px-6 py-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                Your position
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-accent">#{position}</div>
            </div>
          )}

          <p className="max-w-sm text-center text-xs text-ink-subtle">
            You'll get an email at <span className="text-ink-muted">{user?.email}</span> the
            moment your seat opens. No spam, no marketing.
          </p>
        </div>
      </GateShell>
    );
  }

  // Logged in but not on waitlist — but the waitlist is now full → show capped state
  if (waitlistFull) {
    return (
      <GateShell>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 ring-4 ring-yellow-500/5">
            <Lock className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">The waitlist is full</h2>
            <p className="mt-2 max-w-sm text-sm text-ink-muted text-center">
              We've capped the current beta cohort and aren't taking new
              signups right now. The next batch typically opens within a few
              weeks.
            </p>
          </div>

          <p className="max-w-sm text-center text-xs text-ink-subtle">
            Follow{" "}
            <a
              href="https://twitter.com/strategylabs"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent hover:underline"
            >
              @strategylabs
            </a>{" "}
            to be the first to know when we re-open.
          </p>
        </div>
      </GateShell>
    );
  }

  // Logged in but not on waitlist — offer to add them
  return (
    <GateShell>
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent ring-4 ring-accent/5">
          <Sparkles className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Join the waitlist</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-muted text-center">
            Strategy Labs is in invite-only access. Join the waitlist with{" "}
            <span className="text-ink">{user?.email}</span> to get notified when your seat opens.
          </p>
        </div>

        {joined ? (
          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
            <Mail className="h-4 w-4" />
            You're on the list. We'll be in touch.
          </div>
        ) : (
          <button
            type="button"
            disabled={joining}
            onClick={async () => {
              if (!user?.email) return;
              setJoining(true);
              setJoinError(null);
              const res = await joinWaitlist(user.email, "dashboard-gate");
              setJoining(false);
              if (res.ok) {
                setJoined(true);
              } else {
                setJoinError(res.error);
              }
            }}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {joining ? "Joining…" : "Add me to the waitlist"}
          </button>
        )}

        {joinError && (
          <p className="text-xs text-red-400">{joinError}</p>
        )}
      </div>
    </GateShell>
  );
}

function GateShell({ children }: { children: ReactNode }) {
  return (
    <div className="container-app py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-bg-card/40 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
