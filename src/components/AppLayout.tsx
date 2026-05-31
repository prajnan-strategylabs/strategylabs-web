import { useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth, type UserTier } from "../context/AuthContext";
import { LogoLockup } from "./Logo";
import { LayoutDashboard, Beaker, Radio, LogOut, ShieldAlert, Search, Shield } from "lucide-react";
import { LiveDot, Pill } from "./MobileUI";
import { supabase } from "../lib/supabase";
import { apiAdminCheck } from "../lib/api";

export function AppLayout() {
  const { user, loading, tierResolved, signOut, isSandbox, updateSandboxTier } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAdmin() {
      if (!user) return;
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) return;
        const res = await apiAdminCheck(token);
        if (active && res.ok) {
          setIsAdmin(true);
        }
      } catch {
        // Silently fail for non-admins
      }
    }
    checkAdmin();
    return () => {
      active = false;
    };
  }, [user]);

  // Hold the page in the loading state until we know:
  //   1. Whether there's a session at all (loading=false)
  //   2. The user's real tier (tierResolved=true)
  // Without (2) the optimistic "free" tier would briefly trigger the
  // WaitlistGate's "Join the waitlist" view before the real tier loaded —
  // jittery flash on first paint. Holding here keeps the experience stable.
  if (loading || (user && !tierResolved)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Guard: if not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Strategy Lab", to: "/lab", icon: Beaker },
    { label: "Signals", to: "/signals", icon: Radio },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row">
      {/* ── SANDBOX CONTROLLER PILL ── */}
      {isSandbox && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-500 backdrop-blur-md">
          <ShieldAlert className="h-3.5 w-3.5 flex-none animate-pulse" />
          <span>Sandbox Tier:</span>
          <select
            value={user.tier}
            onChange={(e) => updateSandboxTier(e.target.value as UserTier)}
            className="rounded bg-yellow-500/20 border-none px-2 py-0.5 text-yellow-500 font-bold focus:ring-0 cursor-pointer outline-none"
          >
            <option value="free" className="bg-bg text-ink">Free</option>
            <option value="trader" className="bg-bg text-ink">Trader ($49)</option>
            <option value="auto" className="bg-bg text-ink">Auto ($149)</option>
          </select>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-bg-card/30 p-6 flex-none">
        <div className="flex items-center gap-2 mb-8">
          <LogoLockup />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all
                           ${
                             active
                               ? "bg-accent/10 text-accent"
                               : "text-ink-muted hover:bg-bg-elev hover:text-ink"
                           }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all mt-2 border border-transparent
                         ${
                           location.pathname.startsWith("/admin")
                             ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-md"
                             : "text-ink-muted hover:bg-bg-elev hover:text-ink"
                         }`}
            >
              <Shield className={`h-5 w-5 ${location.pathname.startsWith("/admin") ? "text-amber-500" : "text-ink-subtle"}`} />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div className="border-t border-line pt-6 mt-auto">
          <div className="rounded-lg bg-bg-elev/40 p-3 mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Current Plan
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-ink capitalize">{user.tier} Tier</span>
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-accent tracking-wider">
                {user.tier === "free" ? "Free" : "Premium"}
              </span>
            </div>
            <div className="text-[10px] text-ink-muted mt-0.5 truncate">{user.email}</div>
          </div>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (TOP BAR) ── */}
      <header className="md:hidden relative z-40 flex items-center justify-between px-5 pt-3 pb-2 bg-bg/80 backdrop-blur-md">
        <LogoLockup />
        <div className="flex items-center gap-2">
          <Pill tone="accent" className="!text-[9px]">
            <LiveDot size={4} /> {user.tier === "free" ? "Free" : user.tier}
          </Pill>
          <button
            aria-label="Search"
            className="h-8 w-8 rounded-full bg-bg-elev border border-line/60 flex items-center justify-center text-ink-muted hover:text-ink transition active:scale-95"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="h-8 w-8 rounded-full border border-line/60 bg-bg-elev flex items-center justify-center text-red-400/90 hover:text-red-400 transition active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-line/60 bg-bg-elev flex items-center justify-center text-[10px] font-bold text-ink-muted uppercase">
            {(user.email?.[0] ?? "U")}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-0 flex-1 overflow-y-auto pb-28 md:pb-6 px-5 md:px-6 pt-2 md:pt-6">
        <div className="max-w-4xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (floating pill, matches handoff design) ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div
          className="rounded-2xl border bg-bg-card/70 backdrop-blur-md flex items-center justify-around h-[60px] px-2"
          style={{
            borderColor: "var(--line)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center w-16 active:scale-95 transition relative"
              >
                {active && (
                  <span
                    className="absolute -top-1 h-1 w-6 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                <Icon
                  className="h-5 w-5 transition"
                  style={{ color: active ? "var(--accent)" : "var(--ink-subtle)" }}
                />
                <span
                  className="text-[10px] font-bold mt-0.5 tracking-tight"
                  style={{ color: active ? "var(--ink)" : "var(--ink-subtle)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex flex-col items-center justify-center w-16 active:scale-95 transition relative"
            >
              {location.pathname.startsWith("/admin") && (
                <span
                  className="absolute -top-1 h-1 w-6 rounded-full bg-amber-500"
                />
              )}
              <Shield
                className="h-5 w-5 transition"
                style={{ color: location.pathname.startsWith("/admin") ? "#f59e0b" : "var(--ink-subtle)" }}
              />
              <span
                className="text-[10px] font-bold mt-0.5 tracking-tight"
                style={{ color: location.pathname.startsWith("/admin") ? "var(--ink)" : "var(--ink-subtle)" }}
              >
                Admin
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
