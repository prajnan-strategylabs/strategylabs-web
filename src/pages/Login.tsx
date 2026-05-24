import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoLockup } from "../components/Logo";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export function Login() {
  const { user, signIn, verifyOtp, isSandbox } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Surface any error returned in the URL (e.g. ?error=otp_expired)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const err = searchParams.get("error");
    const desc = searchParams.get("desc");

    if (err) {
      if (err === "otp_expired" || err.includes("expired")) {
        setError("Your sign-in code has expired or has already been used. Please request a new one.");
      } else {
        setError(desc || "Authentication failed. Please request a new code.");
      }
    }

    // Clean query parameters from URL so they don't linger
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);
  }, []);

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

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || verifying) return;

    setVerifying(true);
    setError(null);

    const { error: verifyError } = await verifyOtp(email, code);
    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message || "Invalid verification code. Please try again.");
    } else {
      navigate("/dashboard");
    }
  }

  async function handleResendEmail(e: React.MouseEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || "Failed to resend. Please try again.");
    } else {
      setError(null);
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
            {sent
              ? "Enter your code"
              : isSandbox
              ? "Sandbox Terminal"
              : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-ink-muted px-4">
            {sent
              ? "Check your inbox for a 6-digit sign-in code."
              : isSandbox
              ? "Local dev mode enabled. Enter any email to launch."
              : "Enter your email and we'll send you a sign-in code."}
          </p>
        </div>

        {sent ? (
          <div className="mt-8 flex flex-col items-center text-center animate-slide-up w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">Check your email</h3>
            <p className="mt-2 text-xs text-ink-muted px-2">
              We've sent a <strong>6-digit code</strong> to <span className="text-accent font-semibold">{email}</span>. Enter it below to sign in:
            </p>

            {/* 6-Digit Code verification input form */}
            <form onSubmit={handleVerifyCode} className="mt-6 space-y-4 w-full text-left">
              <div>
                <label htmlFor="code" className="block text-[10px] font-bold uppercase tracking-wider text-ink-subtle text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  disabled={verifying}
                  className="block w-full text-center tracking-[0.5em] font-mono text-xl rounded-lg border border-line bg-bg-elev/40 py-3 text-ink outline-none transition-colors focus:border-accent disabled:opacity-60 mt-2"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 font-sans">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 bg-accent text-bg shadow-md shadow-accent/25 hover:scale-[1.01]"
              >
                {verifying ? "Verifying..." : "Verify Code & Sign In"}
                {!verifying && <ArrowRight className="h-3.5 w-3.5" />}
              </button>

              {isSandbox && (
                <p className="text-center text-[10px] text-accent/80 font-medium font-mono pt-1">
                  ⚡ Sandbox Mode: Use '123456' to bypass
                </p>
              )}

              <div className="flex justify-between items-center text-[10px] mt-4 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setCode("");
                    setError(null);
                  }}
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  ← Back to Email
                </button>
                
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="text-accent hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
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
              {loading ? "Sending..." : "Send Sign-In Code"}
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
