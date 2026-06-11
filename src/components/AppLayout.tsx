import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth, type UserTier } from "../context/AuthContext";
import { LogoLockup } from "./Logo";
import { LayoutDashboard, Beaker, Radio, LogOut, ShieldAlert, Shield, Bell, ChevronRight } from "lucide-react";
import { LiveDot, Pill } from "./MobileUI";
import { supabase } from "../lib/supabase";
import { apiAdminCheck } from "../lib/api";
import { Capacitor } from "@capacitor/core";
import { showBanner, hideBanner } from "../lib/ads";
import { hapticLight } from "../lib/haptics";

export function AppLayout() {
  const { user, loading, tierResolved, signOut, isSandbox, updateSandboxTier } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (profileOpen) {
      setShouldRenderDrawer(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRenderDrawer(false), 200);
      return () => clearTimeout(timer);
    }
  }, [profileOpen]);

  const isAndroid = Capacitor.getPlatform() === "android";
  const isIOS = Capacitor.getPlatform() === "ios";

  const topHeaderPadding = isAndroid
    ? "calc(var(--safe-area-inset-top, 38px) + 12px)"
    : isIOS
      ? "calc(env(safe-area-inset-top, 44px) + 12px)"
      : "12px";

  const bottomNavOffset = isAndroid
    ? "calc(var(--safe-area-inset-bottom, 16px) + 16px)"
    : isIOS
      ? "calc(env(safe-area-inset-bottom, 16px) + 16px)"
      : "16px";

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

  // Manage Banner Ads for Free users (only display on main Dashboard & Signals pages)
  useEffect(() => {
    if (!user || loading || !tierResolved) return;
    
    const isPaid = user.tier !== "free";
    const showOnThisPath = location.pathname === "/dashboard" || location.pathname === "/signals";

    if (!isPaid && showOnThisPath) {
      void showBanner();
    } else {
      void hideBanner();
    }

    return () => {
      void hideBanner();
    };
  }, [user?.tier, loading, tierResolved, location.pathname]);

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
    { label: "Notifications", to: "/notifications", icon: Bell },
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
            <option value="trader" className="bg-bg text-ink">Trader ($19.99)</option>
            <option value="auto" className="bg-bg text-ink">Auto ($49.99)</option>
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
      <header 
        className="md:hidden relative z-40 flex items-center justify-between px-5 pb-2 bg-bg/85 backdrop-blur-md border-b border-line/45"
        style={{ paddingTop: topHeaderPadding }}
      >
        <LogoLockup />
        <div className="flex items-center gap-2">
          <Pill tone="accent" className="!text-[9px]">
            <LiveDot size={4} /> {user.tier === "free" ? "Free" : user.tier}
          </Pill>
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile drawer"
            title="Profile"
            className="h-8 w-8 rounded-full border border-line/60 bg-bg-elev flex items-center justify-center text-[10px] font-bold text-ink-muted hover:text-accent hover:border-accent/40 transition active:scale-95 relative select-none flex-none"
          >
            <span className="font-bold uppercase">
              {((user.display_name?.[0] || user.email?.[0]) ?? "U")}
            </span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-0 flex-1 overflow-y-auto pb-28 md:pb-6 px-5 md:px-6 pt-2 md:pt-6">
        <div className="max-w-4xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (floating pill, matches handoff design) ── */}
      <nav
        className="bottom-nav md:hidden fixed left-4 right-4 z-40"
        style={{ bottom: bottomNavOffset }}
      >
        <div
          className="rounded-2xl border bg-bg-card/70 backdrop-blur-md flex items-center justify-around h-[60px] px-2"
          style={{
            borderColor: "var(--line)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {navItems.filter(item => item.to !== "/notifications").map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => hapticLight()}
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
        </div>
      </nav>

      {/* ── PROFILE DRAWER PORTAL ── */}
      {shouldRenderDrawer && createPortal(
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setProfileOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200 ease-out ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
          />
          
          {/* Drawer Sheet */}
          <div
            className={`relative bg-[#0a0e1a] rounded-t-3xl border-t border-line/50 p-6 space-y-6 transform transition-transform duration-200 ease-out select-none ${
              isAnimating ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {/* Top Handle Decorative Bar */}
            <div className="w-12 h-1 bg-line/50 rounded-full mx-auto -mt-2 mb-4" />
            
            {/* User Profile Header */}
            <div className="flex items-center gap-4 border-b border-line/35 pb-5">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-accent/20 to-indigo-500/10 border border-accent/30 flex items-center justify-center text-lg font-black text-accent uppercase">
                {((user.display_name?.[0] || user.email?.[0]) ?? "U")}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-extrabold text-[17px] tracking-tight text-white truncate">
                  {user.display_name || "Trader"}
                </div>
                <div className="text-[12px] text-ink-muted truncate font-medium">
                  {user.email}
                </div>
                <div className="inline-flex mt-1">
                  <span className="rounded bg-accent/15 px-2 py-0.5 text-[9px] font-extrabold uppercase text-accent tracking-wider">
                    {user.tier === "free" ? "Free Tier" : `${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Tier`}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation & Action Links */}
            <div className="space-y-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-500" />
                    <span className="text-[14px] font-bold text-amber-500">Admin Control Panel</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-500/70" />
                </Link>
              )}

              <button
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
                className="w-full h-13 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out of Account
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full py-2 text-center text-[13px] font-bold text-ink-subtle hover:text-ink active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
