import { useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoLockup } from "./Logo";
import { LayoutDashboard, Beaker, Radio, LogOut, Shield, Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiAdminCheck } from "../lib/api";
import { Capacitor } from "@capacitor/core";
import { Sheet, TabBar, Button, ListRow } from "../ui";

export function AppLayout() {
  const { user, loading, tierResolved, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
  const activeTab = navItems.find((item) => location.pathname === item.to);
  const mobileTitle = activeTab?.label ?? "Strategy Labs";

  return (
    <div className="h-[100dvh] bg-bg text-ink flex flex-col overflow-hidden md:h-auto md:min-h-screen md:flex-row">
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

      {/* ── MOBILE HEADER — large-title pattern, compact after scroll ── */}
      <header
        className={`md:hidden relative z-40 flex items-end justify-between px-5 transition-[padding,background-color,border-color] duration-state ${
          isScrolled ? "pb-2.5 border-b border-line bg-surface-0/95" : "pb-4 border-b border-transparent bg-surface-0"
        }`}
        style={{
          paddingTop: topHeaderPadding,
          backdropFilter: isScrolled ? "blur(16px)" : undefined,
          WebkitBackdropFilter: isScrolled ? "blur(16px)" : undefined,
        }}
      >
        <div className="min-w-0">
          {!isScrolled && <p className="text-caption text-ink-subtle">STRATEGY LABS</p>}
          <h1 className={`text-ink transition-[font-size,line-height] duration-state ${isScrolled ? "text-title-2" : "text-title-1"}`}>
            {mobileTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            className="h-10 w-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-footnote font-bold text-ink-muted active:bg-surface-3 transition-colors duration-press select-none flex-none uppercase"
          >
            {(user.display_name?.[0] || user.email?.[0]) ?? "U"}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT — keyed by route for page transition ── */}
      <main
        className="native-scroll relative z-0 flex-1 overflow-y-auto pb-28 md:pb-6 px-5 md:px-6 pt-4 md:pt-6"
        onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 24)}
      >
        <div key={location.pathname} className="max-w-none md:max-w-4xl mx-auto w-full animate-page">
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
