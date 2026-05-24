import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoLockup } from "../components/Logo";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export function Login() {
  const { user, signIn, isSandbox } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[50%] -translate-x-[50%] h-[300px] w-[300px] rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-line bg-bg-card/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md animate-fade-in">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center text-center">
          <LogoLockup />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink">
            {isSandbox ? "Sandbox Terminal" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {isSandbox
              ? "Local dev mode enabled. Enter any email to launch."
              : "Enter your email to receive a passwordless magic link."}
          </p>
        </div>

        {sent ? (
          <div className="mt-8 flex flex-col items-center text-center animate-slide-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">Check your email</h3>
            <p className="mt-2 text-sm text-ink-muted px-2">
              We've sent a magic link to <strong className="text-accent">{email}</strong>. 
              Click it to sign in instantly.
            </p>
            {isSandbox && (
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-primary mt-6 w-full"
              >
                Go to Sandbox Dashboard
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-8 space-y-4 animate-slide-up">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Email Address
              </label>
              <div className="relative mt-2 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-subtle">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  className="block w-full rounded-lg border border-line bg-bg-elev/40 py-3 pl-10 pr-3 
                             text-ink placeholder-ink-subtle outline-none transition-colors 
                             focus:border-accent disabled:opacity-60"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 shadow-md shadow-accent/20"
            >
              {loading ? "Sending..." : "Send Magic Link"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            {isSandbox && (
              <p className="text-center text-xs text-accent/80 font-medium">
                ⚡ Development sandbox active (bypasses network auth)
              </p>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-medium text-ink-subtle hover:text-accent transition-colors"
          >
            ← Back to marketing site
          </button>
        </div>
      </div>
    </div>
  );
}
