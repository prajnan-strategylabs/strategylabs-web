import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { joinWaitlist } from "../lib/waitlist";
import { useAppConfig } from "../lib/useAppConfig";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; alreadyMember: boolean }
  | { kind: "error"; message: string };

export function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { is_launched: isLaunched, waitlist_full: waitlistFull } = useAppConfig();

  // Restore "already joined" success state from localStorage
  useEffect(() => {
    try {
      const alreadyJoined = localStorage.getItem("joined_waitlist");
      if (alreadyJoined === "true") {
        setStatus({ kind: "success", alreadyMember: true });
      }
    } catch {
      // ignore localStorage block
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status.kind === "loading") return;
    setStatus({ kind: "loading" });

    const result = await joinWaitlist(email, "hero");
    if (result.ok) {
      setStatus({ kind: "success", alreadyMember: result.alreadyMember });
      try {
        localStorage.setItem("joined_waitlist", "true");
      } catch {
        // ignore localStorage block
      }
    } else {
      setStatus({ kind: "error", message: result.error });
    }
  }

  const submitted = status.kind === "success";
  const loading   = status.kind === "loading";

  return (
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32">
      <div className="container-app relative">
        {/* Pre-headline tag */}
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-medium text-accent animate-fade-in">
          <Sparkles className="h-3 w-3" />
          Strategy Lab — now in private beta
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl animate-slide-up">
          Test any trading idea.
          <br />
          <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
            Get the verdict in 30 seconds.
          </span>
        </h1>

        {/* Sub */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-ink-muted md:text-xl animate-slide-up [animation-delay:100ms]">
          Describe your strategy in plain English. We auto-compile it.
          Backtested across years of market data.
          Get live signals if it actually works.
        </p>

        {/* Email capture / App Launch CTA */}
        <div id="waitlist" className="mx-auto mt-10 max-w-md animate-slide-up [animation-delay:200ms]">
          {isLaunched ? (
            <Link
              to="/login"
              className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
            >
              Launch Strategy Lab
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : waitlistFull && !submitted ? (
            <div className="card flex flex-col gap-4 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 flex-none text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">
                    The waitlist is currently full.
                  </div>
                  <div className="text-xs text-ink-muted mt-1 leading-relaxed">
                    We're at capacity for the current beta cohort. Follow{" "}
                    <a
                      href="https://twitter.com/strategylabs"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent hover:underline"
                    >
                      @strategylabs
                    </a>{" "}
                    — we'll open the next batch within a few weeks.
                  </div>
                </div>
              </div>
            </div>
          ) : submitted ? (
            <div className="card flex flex-col gap-4 border-accent/30 bg-accent/5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 flex-none text-accent mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">
                    {status.kind === "success" && status.alreadyMember
                      ? "You're already on the list."
                      : "You're on the list."}
                  </div>
                  <div className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {status.kind === "success" && status.alreadyMember
                      ? "We'll email you the moment beta opens. You can also explore the sandbox dashboard now!"
                      : "Thanks — we'll email you when beta opens. Explore the sandbox dashboard now!"}
                  </div>
                </div>
              </div>
              <Link to="/login" className="btn-primary py-2.5 text-xs w-full shadow-md shadow-accent/20">
                Launch Sandbox Dashboard
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="flex-1 rounded-lg border border-line bg-bg-card px-4 py-3
                             text-ink placeholder-ink-subtle outline-none
                             transition-colors focus:border-accent disabled:opacity-60"
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Joining..." : "Join waitlist"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              {status.kind === "error" && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{status.message}</span>
                </div>
              )}
            </>
          )}

          <p className="mt-3 text-center text-xs text-ink-subtle">
            No spam. Educational tool only. Not financial advice.
          </p>
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-muted animate-fade-in [animation-delay:400ms]">
          <TrustItem label="8+ years of data" />
          <TrustItem label="47 asset pairs" />
          <TrustItem label="Walk-forward validated" />
          <TrustItem label="Audit-grade transparency" />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-accent/70" />
      <span>{label}</span>
    </div>
  );
}
