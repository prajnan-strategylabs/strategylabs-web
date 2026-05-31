import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  apiAdminGetWaitlist,
  apiAdminDeleteWaitlistEntry,
  apiAdminExportWaitlist,
  type AdminWaitlistEntry
} from "../../lib/api";
import {
  Users,
  Search,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  MapPin
} from "lucide-react";

export function AdminWaitlist() {
  const [waitlist, setWaitlist] = useState<AdminWaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadWaitlist = async () => {
    setLoading(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      const data = await apiAdminGetWaitlist(token);
      setWaitlist(data);
    } catch (err: any) {
      triggerToast(err.message || "Failed to load waitlist", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, []);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      const blob = await apiAdminExportWaitlist(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `waitlist_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      triggerToast("Waitlist exported successfully!");
    } catch (err: any) {
      triggerToast(err.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmail || isDeleting) return;
    setIsDeleting(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      await apiAdminDeleteWaitlistEntry(token, deletingEmail);
      triggerToast("Waitlist submission removed successfully.");
      setDeletingEmail(null);
      loadWaitlist();
    } catch (err: any) {
      triggerToast(err.message || "Removal failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredWaitlist = waitlist.filter((entry) =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLatestSignupDate = () => {
    if (waitlist.length === 0) return "N/A";
    const dates = waitlist.map((w) => new Date(w.created_at).getTime());
    const latest = new Date(Math.max(...dates));
    return latest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Waitlist Directory</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Monitor and manage quantitative waitlist signups, referrer nodes, and campaign channels.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all select-none disabled:opacity-50 shadow-lg shadow-amber-500/10 self-start md:self-auto"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-bg" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export CSV File
        </button>
      </div>

      {/* ── TELEMETRIES BAR ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card bg-bg-card/25 border-line/45 backdrop-blur-sm p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">Total Submissions</p>
            <h3 className="text-2xl font-black text-ink mt-0.5">{waitlist.length}</h3>
          </div>
        </div>

        <div className="card bg-bg-card/25 border-line/45 backdrop-blur-sm p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">Latest Connection</p>
            <h3 className="text-sm font-bold text-ink mt-1.5">{getLatestSignupDate()}</h3>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="relative max-w-md border-b border-[#1e2740] pb-4">
        <Search className="absolute left-3.5 top-1/3 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
        <input
          type="text"
          placeholder="Filter submissions by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-line bg-bg-card/25 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* ── WAITLIST TABLE ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredWaitlist.length === 0 ? (
        <div className="card border-line/60 bg-bg-card/20 text-center py-16 space-y-4 max-w-xl mx-auto">
          <AlertCircle className="h-10 w-10 text-ink-subtle mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">No members found</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              No waitlist accounts matched your email filter queries.
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
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Referrer</th>
                    <th className="px-6 py-4">UTM Campaign</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2740]/40">
                  {filteredWaitlist.map((entry) => (
                    <tr key={entry.email} className="hover:bg-bg-elev/15 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-ink select-all">{entry.email}</td>
                      <td className="px-6 py-4 text-ink-muted">
                        <span className="px-2 py-0.5 rounded bg-bg-elev/45 border border-line text-[10px] font-mono uppercase tracking-wider">
                          {entry.source || "hero"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink-subtle truncate max-w-xs" title={entry.referrer || "-"}>
                        {entry.referrer || "-"}
                      </td>
                      <td className="px-6 py-4 text-ink-subtle">
                        {entry.utm_source || entry.utm_medium || entry.utm_campaign ? (
                          <span className="text-[10px] font-mono text-amber-500/80">
                            {[entry.utm_source, entry.utm_medium, entry.utm_campaign].filter(Boolean).join(" / ")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-ink-muted font-mono">{formatDate(entry.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeletingEmail(entry.email)}
                          className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Remove user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {filteredWaitlist.map((entry) => (
              <div
                key={entry.email}
                className="card bg-bg-card/25 border-line/45 p-5 space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-ink select-all leading-tight">{entry.email}</p>
                    <p className="text-[9px] font-mono text-ink-subtle">Joined {formatDate(entry.created_at)}</p>
                  </div>
                  <button
                    onClick={() => setDeletingEmail(entry.email)}
                    className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all flex-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line/40 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-ink-subtle flex items-center gap-1 font-mono uppercase tracking-wider text-[8px]"><Layers className="h-3 w-3" /> Source</span>
                    <span className="font-semibold text-ink-muted">{entry.source || "hero"}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-ink-subtle flex items-center gap-1 font-mono uppercase tracking-wider text-[8px]"><MapPin className="h-3 w-3" /> Referrer</span>
                    <span className="font-semibold text-ink-muted truncate block max-w-[120px]">{entry.referrer || "-"}</span>
                  </div>
                </div>

                {(entry.utm_source || entry.utm_medium || entry.utm_campaign) && (
                  <div className="bg-bg-elev/20 border border-line/40 p-2.5 rounded-lg text-[9px] font-mono">
                    <span className="text-ink-subtle block uppercase tracking-wider text-[7px] mb-0.5">Campaign Info</span>
                    <span className="text-amber-500/80">
                      {["src: " + entry.utm_source, "med: " + entry.utm_medium, "cam: " + entry.utm_campaign]
                        .filter((x) => !x.endsWith("undefined") && !x.endsWith("null") && x.length > 5)
                        .join(" | ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CONFIRMATION DELETION MODAL ── */}
      {deletingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md card bg-bg-card/45 border-line/60 p-6 space-y-6 relative overflow-hidden animate-zoom-in">
            <div className="flex items-center gap-3 border-b border-[#1e2740] pb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Remove Signup</h3>
            </div>
            
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              Are you sure you want to delete <span className="text-ink font-semibold">"{deletingEmail}"</span> from waitlist directory? They will lose waitlist position.
            </p>
            
            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => setDeletingEmail(null)}
                disabled={isDeleting}
                className="btn-ghost py-2 px-4 text-xs font-mono border-line text-ink-muted hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-xs font-bold text-bg transition-all select-none disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin text-bg" />}
                Remove Entry
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
