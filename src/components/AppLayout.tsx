import { useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, type UserTier } from "../context/AuthContext";
import { LogoLockup } from "./Logo";
import { LayoutDashboard, Beaker, Radio, LogOut, ShieldAlert, Shield, Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiAdminCheck } from "../lib/api";
import { Capacitor } from "@capacitor/core";
import { showBanner, hideBanner } from "../lib/ads";
import { Sheet, TabBar, Button, ListRow } from "../ui";

export function AppLayout() {
  const { user, loading, tierResolved, signOut, isSandbox, updateSandboxTier } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAndroid = Capacitor.getPlatform() === "android";
  const isIOS = Capacitor.getPlatform() === "ios";

  const topHeaderPadding = isAndroid
    ? "calc(var(--safe-area-inset-top, 38px) + 10px)"
    : isIOS
      ? "calc(env(safe-area-inset-top, 44px) + 10px)"
      : "10px";

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
    { label: "Lab", to: "/lab", icon: Beaker },
    { label: "Signals", to: "/signals", icon: Radio },
    { label: "Alerts", to: "/notifications", icon: Bell },
  ];

  const desktopNavItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Strategy Lab", to: "/lab", icon: Beaker },
    { label: "Signals", to: "/signals", icon: Radio },
    { label: "Notifications", to: "/notifications", icon: Bell },
  ];

  const tierLabel =
    user.tier === "free"
      ? "Free"
      : user.tier.charAt(0).toUpperCase() + user.tier.slice(1);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row">
      {/* ── SANDBOX CONTROLLER PILL ── */}
      {isSandbox && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-warning/30 bg-warning-soft px-3 py-1.5 text-footnote font-semibold text-warning backdrop-blur-md">
          <ShieldAlert className="h-3.5 w-3.5 flex-none" />
          <span>Sandbox Tier:</span>
          <select
            value={user.tier}
            onChange={(e) => updateSandboxTier(e.target.value as UserTier)}
            className="rounded bg-warning/20 border-none px-2 py-0.5 text-warning font-bold focus:ring-0 cursor-pointer outline-none"
          >
            <option value="free" className="bg-bg text-ink">Free</option>
            <option value="trader" className="bg-bg text-ink">Trader ($19.99)</option>
            <option value="auto" className="bg-bg text-ink">Auto ($49.99)</option>
          </select>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface-1/40 p-6 flex-none">
        <div className="flex items-center gap-2 mb-8">
          <LogoLockup />
        </div>

        <nav className="flex-1 space-y-1">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md2 px-4 py-3 text-body font-semibold transition-colors duration-state
                           ${
                             active
                               ? "bg-accent-soft text-accent"
                               : "text-ink-muted hover:bg-surface-2 hover:text-ink"
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
              className={`flex items-center gap-3 rounded-md2 px-4 py-3 text-body font-semibold transition-colors duration-state mt-2
                         ${
                           location.pathname.startsWith("/admin")
                             ? "bg-warning-soft text-warning"
                             : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                         }`}
            >
              <Shield className="h-5 w-5" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="border-t border-line pt-6 mt-auto">
          <div className="rounded-md2 bg-surface-2 p-3 mb-4">
            <div className="text-caption uppercase text-ink-subtle">Current Plan</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-body font-bold text-ink">{tierLabel} Tier</span>
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-caption uppercase text-accent">
                {user.tier === "free" ? "Free" : "Premium"}
              </span>
            </div>
            <div className="text-footnote text-ink-muted mt-0.5 truncate">{user.email}</div>
          </div>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md2 px-4 py-2.5 text-body font-semibold text-negative hover:bg-negative-soft transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER (TOP BAR) ── */}
      <header
        className="md:hidden relative z-40 flex items-center justify-between px-5 pb-2.5 border-b border-line"
        style={{
          paddingTop: topHeaderPadding,
          background: "color-mix(in srgb, var(--surface-0) 88%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <LogoLockup />
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-caption uppercase text-accent">
            {tierLabel}
          </span>
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-footnote font-bold text-ink-muted active:bg-surface-3 transition-colors duration-press select-none flex-none uppercase"
          >
            {(user.display_name?.[0] || user.email?.[0]) ?? "U"}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT — keyed by route for page transition ── */}
      <main className="relative z-0 flex-1 overflow-y-auto pb-28 md:pb-6 px-5 md:px-6 pt-3 md:pt-6">
        <div key={location.pathname} className="max-w-4xl mx-auto w-full animate-page">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <TabBar items={navItems} />

      {/* ── PROFILE SHEET ── */}
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)}>
        <div className="flex items-center gap-4 border-b border-line pb-5">
          <div className="h-14 w-14 rounded-full bg-accent-soft border border-accent/25 flex items-center justify-center text-title-2 text-accent uppercase">
            {(user.display_name?.[0] || user.email?.[0]) ?? "U"}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="text-headline text-ink truncate">
              {user.display_name || "Trader"}
            </div>
            <div className="text-footnote text-ink-muted truncate">{user.email}</div>
            <span className="inline-flex mt-1 rounded bg-accent-soft px-2 py-0.5 text-caption uppercase text-accent">
              {tierLabel} Tier
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-5">
          {isAdmin && (
            <ListRow
              leading={<Shield className="h-5 w-5 text-warning" />}
              title="Admin Control Panel"
              chevron
              onPress={() => {
                setProfileOpen(false);
                navigate("/admin");
              }}
            />
          )}

          <Button
            variant="destructive"
            size="lg"
            onClick={() => {
              setProfileOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>

          <Button variant="ghost" size="md" className="w-full" onClick={() => setProfileOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
