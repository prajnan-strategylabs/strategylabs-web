import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth, type UserTier } from "../context/AuthContext";
import { LogoLockup } from "./Logo";
import { LayoutDashboard, Beaker, Radio, LogOut, ShieldAlert } from "lucide-react";

export function AppLayout() {
  const { user, loading, signOut, isSandbox, updateSandboxTier } = useAuth();
  const location = useLocation();

  if (loading) {
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
    { label: "AI Lab", to: "/lab", icon: Beaker },
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
            <option value="explorer" className="bg-bg text-ink">Explorer ($19)</option>
            <option value="trader" className="bg-bg text-ink">Trader ($59)</option>
            <option value="pro" className="bg-bg text-ink">Pro ($149)</option>
            <option value="auto" className="bg-bg text-ink">Auto ($249)</option>
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
      <header className="md:hidden flex h-14 items-center justify-between border-b border-line bg-bg/80 backdrop-blur-md px-6 sticky top-0 z-40">
        <LogoLockup />
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-accent">
            {user.tier}
          </span>
          <button onClick={signOut} className="text-red-400 p-1">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-6 p-6">
        <div className="max-w-4xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-2xl border border-line bg-bg-card/70 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all active:scale-95
                         ${active ? "text-accent" : "text-ink-muted"}`}
            >
              <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
              <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
