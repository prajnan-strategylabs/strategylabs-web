import { useState, useEffect } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { apiAdminCheck } from "../lib/api";
import { Capacitor } from "@capacitor/core";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Lock,
  Loader2,
  Activity
} from "lucide-react";
import { LogoLockup } from "./Logo";

export function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAndroid = Capacitor.getPlatform() === "android";
  const isIOS = Capacitor.getPlatform() === "ios";

  const topHeaderPadding = isAndroid
    ? "calc(var(--safe-area-inset-top, 38px) + 16px)"
    : isIOS
      ? "calc(env(safe-area-inset-top, 44px) + 16px)"
      : "16px";

  const bottomNavOffset = isAndroid
    ? "calc(var(--safe-area-inset-bottom, 16px) + 24px)"
    : isIOS
      ? "calc(env(safe-area-inset-bottom, 16px) + 24px)"
      : "24px";

  useEffect(() => {
    let active = true;
    async function verifyAdmin() {
      if (authLoading) return;
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) {
          if (active) setIsAdmin(false);
          return;
        }
        const res = await apiAdminCheck(token);
        if (active) {
          if (res.ok) {
            setIsAdmin(true);
            setAdminEmail(res.email || user.email || "");
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        if (active) setIsAdmin(false);
      }
    }
    verifyAdmin();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // Auth loading state
  if (authLoading || (user && isAdmin === null)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0e1a]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-xs font-mono text-ink-subtle uppercase tracking-widest animate-pulse">
            Authenticating Secure Session
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not an admin -> Premium Access Denied Screen
  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-4">
        <div className="w-full max-w-md card bg-bg-card/45 border-line/60 backdrop-blur-md p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 animate-pulse">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-ink">Access Denied</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Your account (<span className="text-ink font-semibold">{user.email}</span>) does not have administrative privileges. This request has been logged.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-bg-elev border border-line px-5 py-3 text-sm font-bold text-ink hover:text-white hover:bg-bg-elev/80 transition-all select-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Strategy Labs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Blog Posts", to: "/admin/blogs", icon: BookOpen },
    { label: "Waitlist", to: "/admin/waitlist", icon: Users },
    { label: "User Accounts", to: "/admin/users", icon: Users },
    { label: "AI Lab Tracker", to: "/admin/tracker", icon: Activity },
    { label: "System Config", to: "/admin/settings", icon: Settings },
  ];

  const checkActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && (path !== "/admin" || location.pathname === "/admin");
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e6e9f0] flex flex-col md:flex-row">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1e2740] bg-bg-card/25 p-6 flex-none justify-between">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <LogoLockup />
            <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-md tracking-wider">
              Admin
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = checkActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
                    ${active
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5"
                      : "text-ink-muted hover:bg-bg-elev/40 hover:text-ink border border-transparent"}`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-amber-500" : "text-ink-subtle group-hover:text-ink"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#1e2740]">
          <div className="px-4 py-3 rounded-xl bg-bg-elev/30 border border-line/40">
            <p className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">Signed in as</p>
            <p className="text-xs font-semibold text-ink-muted truncate" title={adminEmail}>
              {adminEmail}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink-muted hover:text-ink hover:bg-bg-elev/40 transition-all border border-transparent"
          >
            <ArrowLeft className="h-4 w-4 text-ink-subtle" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* ── MOBILE HEADER & NAV ── */}
      <header 
        className="md:hidden flex items-center justify-between px-6 py-4 border-b border-[#1e2740] bg-bg-card/45 backdrop-blur-md z-40 relative"
        style={{ paddingTop: topHeaderPadding }}
      >
        <LogoLockup />
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase font-mono px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded tracking-wider">
            Admin
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-ink hover:text-amber-500 transition-colors p-1"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-x-0 bottom-0 bg-[#0a0e1a] z-30 flex flex-col justify-between p-6 animate-fade-in"
          style={{ 
            top: `calc(${topHeaderPadding} + 49px)`,
            paddingBottom: bottomNavOffset
          }}
        >
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = checkActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all
                    ${active
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "text-ink-muted hover:bg-bg-elev/30 hover:text-ink"}`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="space-y-4 pt-6 border-t border-[#1e2740]">
            <div className="px-4 py-3 rounded-xl bg-bg-elev/30 border border-line/40">
              <p className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-semibold text-ink-muted truncate">{adminEmail}</p>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink-muted hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT OUTLET ── */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 max-w-7xl relative z-10 scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
}
