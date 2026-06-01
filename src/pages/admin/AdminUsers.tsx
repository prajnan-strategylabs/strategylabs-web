import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  apiAdminGetUsers,
  apiAdminUpdateUserTier,
  type AdminUserEntry
} from "../../lib/api";
import {
  Search,
  AlertCircle,
  Loader2,
  Shield,
  Calendar,
  Clock
} from "lucide-react";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [updatingUser, setUpdatingUser] = useState<{ id: string; email: string; currentTier: string; nextTier: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      const data = await apiAdminGetUsers(token);
      
      // Sort by created_at desc
      const sorted = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setUsers(sorted);
    } catch (err: any) {
      triggerToast(err.message || "Failed to load user list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleTierChangeRequest = (user: AdminUserEntry, nextTier: string) => {
    if (user.tier === nextTier) return;
    setUpdatingUser({
      id: user.id,
      email: user.email,
      currentTier: user.tier,
      nextTier
    });
  };

  const confirmTierChange = async () => {
    if (!updatingUser || isUpdating) return;
    setIsUpdating(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      await apiAdminUpdateUserTier(token, updatingUser.id, updatingUser.nextTier);
      triggerToast(`Account tier upgraded to ${updatingUser.nextTier.toUpperCase()}.`);
      setUpdatingUser(null);
      loadUsers();
    } catch (err: any) {
      triggerToast(err.message || "Tier update failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((entry) =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  const getTierBadgeStyle = (tier: string) => {
    const base = "px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase font-mono tracking-wider";
    switch (tier.toLowerCase()) {
      case "trader":
        return `${base} bg-amber-500/10 border-amber-500/25 text-amber-400`;
      case "auto":
        return `${base} bg-emerald-500/10 border-emerald-500/25 text-emerald-400`;
      default:
        return `${base} bg-slate-500/10 border-slate-500/25 text-slate-400`;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">User Accounts</h1>
        <p className="text-sm text-ink-muted leading-relaxed font-sans">
          Manage user profiles, authenticate connections, and assign access control tiers.
        </p>
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="relative max-w-md border-b border-[#1e2740] pb-4">
        <Search className="absolute left-3.5 top-1/3 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
        <input
          type="text"
          placeholder="Search registered accounts by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-line bg-bg-card/25 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* ── USER TABLE ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card border-line/60 bg-bg-card/20 text-center py-16 space-y-4 max-w-xl mx-auto">
          <AlertCircle className="h-10 w-10 text-ink-subtle mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">No users found</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              No registered user accounts matched your search queries.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card bg-bg-card/25 border-line/45 backdrop-blur-sm p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-[#1e2740] bg-bg-elev/20 text-ink-muted uppercase font-mono tracking-wider">
                    <th className="px-6 py-4">Security User ID</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Subscription Tier</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4">Last Activity</th>
                    <th className="px-6 py-4 text-right">Assign Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2740]/40">
                  {filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-bg-elev/15 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-ink-subtle truncate max-w-[120px]" title={item.id}>
                        {item.id}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-ink select-all">{item.email}</td>
                      <td className="px-6 py-4">
                        <span className={getTierBadgeStyle(item.tier)}>
                          {item.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink-muted font-mono">{formatDate(item.created_at)}</td>
                      <td className="px-6 py-4 text-ink-muted font-mono">{formatDate(item.last_sign_in_at)}</td>
                      <td className="px-6 py-4 text-right relative">
                        <select
                          value={item.tier}
                          onChange={(e) => handleTierChangeRequest(item, e.target.value)}
                          className="rounded-lg bg-bg-elev/40 border border-line px-2.5 py-1.5 text-ink-muted hover:text-ink font-bold text-[10px] focus:ring-1 focus:ring-amber-500/50 cursor-pointer outline-none transition-all uppercase"
                        >
                          <option value="free" className="bg-[#0f1525] text-slate-400 font-semibold font-sans">Free</option>
                          <option value="trader" className="bg-[#0f1525] text-amber-400 font-semibold font-sans">Trader ($19.99)</option>
                          <option value="auto" className="bg-[#0f1525] text-emerald-400 font-semibold font-sans">Auto ($49.99)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {filteredUsers.map((item) => (
              <div
                key={item.id}
                className="card bg-bg-card/25 border-line/45 p-5 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-ink select-all leading-tight">{item.email}</p>
                    <p className="text-[9px] font-mono text-ink-subtle">ID: {item.id.slice(0, 18)}...</p>
                  </div>
                  <span className={getTierBadgeStyle(item.tier)}>
                    {item.tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line/40 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-ink-subtle flex items-center gap-1 font-mono uppercase tracking-wider text-[8px]"><Calendar className="h-3 w-3" /> Registered</span>
                    <span className="font-semibold text-ink-muted">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-ink-subtle flex items-center gap-1 font-mono uppercase tracking-wider text-[8px]"><Clock className="h-3 w-3" /> Active</span>
                    <span className="font-semibold text-ink-muted truncate block">{formatDate(item.last_sign_in_at)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-line/35 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-ink-subtle uppercase">Override Tier</span>
                  <select
                    value={item.tier}
                    onChange={(e) => handleTierChangeRequest(item, e.target.value)}
                    className="rounded-lg bg-bg-elev/45 border border-line px-3 py-1.5 text-[10px] font-mono text-ink focus:ring-1 focus:ring-amber-500/50 cursor-pointer outline-none uppercase"
                  >
                    <option value="free" className="bg-[#0f1525] text-slate-400">Free</option>
                    <option value="trader" className="bg-[#0f1525] text-amber-400">Trader</option>
                    <option value="auto" className="bg-[#0f1525] text-emerald-400">Auto</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CONFIRMATION OVERRIDE MODAL ── */}
      {updatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md card bg-bg-card/45 border-line/60 p-6 space-y-6 relative overflow-hidden animate-zoom-in">
            <div className="flex items-center gap-3 border-b border-[#1e2740] pb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Update Access Tier</h3>
            </div>
            
            <div className="text-xs text-ink-muted leading-relaxed space-y-3 font-sans">
              <p>
                Are you sure you want to update the subscription tier for account <span className="text-ink font-semibold">"{updatingUser.email}"</span>?
              </p>
              <div className="flex items-center gap-4 bg-bg-elev/20 border border-line/45 p-3.5 rounded-xl justify-center font-mono text-[10px] font-extrabold">
                <span className="text-ink-subtle uppercase">From:</span>
                <span className={getTierBadgeStyle(updatingUser.currentTier)}>{updatingUser.currentTier}</span>
                <span className="text-amber-500">⟶</span>
                <span className="text-ink-subtle uppercase">To:</span>
                <span className={getTierBadgeStyle(updatingUser.nextTier)}>{updatingUser.nextTier}</span>
              </div>
              <p className="text-[10px] text-amber-500/90 leading-normal italic">
                Notice: Updating this tier overrides standard Stripe payment verification and gives immediate access to active backtest slots, telemetry dashboards, and proprietary Telegram signal streams.
              </p>
            </div>
            
            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => setUpdatingUser(null)}
                disabled={isUpdating}
                className="btn-ghost py-2 px-4 text-xs font-mono border-line text-ink-muted hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmTierChange}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-bg transition-all select-none disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-bg" />}
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up
          ${toast.type === "error"
            ? "bg-red-500/10 border-red-500/25 text-red-400"
            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"}`}
        >
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
