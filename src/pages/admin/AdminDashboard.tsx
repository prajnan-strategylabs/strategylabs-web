import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { apiAdminAnalytics, apiAdminStats, apiAdminExportWaitlist, type AdminAnalytics } from "../../lib/api";
import {
  Users,
  BookOpen,
  Beaker,
  Radio,
  Plus,
  Download,
  Loader2,
  FileSpreadsheet,
  CalendarDays,
  Eye,
  Globe2,
  UsersRound
} from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState<{
    users: number;
    waitlist: number;
    blogs: number;
    strategies: number;
    signals: number;
  } | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) throw new Error("No secure session");
        
        const [statsResult, analyticsResult] = await Promise.allSettled([
          apiAdminStats(token),
          apiAdminAnalytics(token),
        ]);
        if (statsResult.status === "rejected") throw statsResult.reason;
        setStats(statsResult.value);
        if (analyticsResult.status === "fulfilled") {
          setAnalytics(analyticsResult.value);
        } else {
          triggerToast("Visitor analytics are unavailable until the database migration is applied.", "error");
        }
      } catch (err: any) {
        triggerToast(err.message || "Failed to load stats", "error");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExportWaitlist = async () => {
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

  const statCards = [
    {
      label: "Registered Users",
      value: stats?.users ?? 0,
      icon: Users,
      color: "from-blue-500/10 to-transparent",
      borderColor: "hover:border-blue-500/30",
      iconColor: "text-blue-400"
    },
    {
      label: "Waitlist Signups",
      value: stats?.waitlist ?? 0,
      icon: FileSpreadsheet,
      color: "from-amber-500/10 to-transparent",
      borderColor: "hover:border-amber-500/30",
      iconColor: "text-amber-400"
    },
    {
      label: "Research Articles",
      value: stats?.blogs ?? 0,
      icon: BookOpen,
      color: "from-emerald-500/10 to-transparent",
      borderColor: "hover:border-emerald-500/30",
      iconColor: "text-emerald-400"
    },
    {
      label: "Custom Strategies",
      value: stats?.strategies ?? 0,
      icon: Beaker,
      color: "from-purple-500/10 to-transparent",
      borderColor: "hover:border-purple-500/30",
      iconColor: "text-purple-400"
    },
    {
      label: "System Signals",
      value: stats?.signals ?? 0,
      icon: Radio,
      color: "from-pink-500/10 to-transparent",
      borderColor: "hover:border-pink-500/30",
      iconColor: "text-pink-400"
    }
  ];

  const analyticsCards = [
    {
      label: `Page Views (${analytics?.period_days ?? 30}d)`,
      value: analytics?.page_views ?? 0,
      icon: Eye,
      iconColor: "text-cyan-400",
    },
    {
      label: "Unique Visitors",
      value: analytics?.unique_visitors ?? 0,
      icon: UsersRound,
      iconColor: "text-emerald-400",
    },
    {
      label: "Sessions",
      value: analytics?.sessions ?? 0,
      icon: Globe2,
      iconColor: "text-violet-400",
    },
    {
      label: "Views Today",
      value: analytics?.today.page_views ?? 0,
      icon: CalendarDays,
      iconColor: "text-amber-400",
    },
  ];
  const lastSevenDays = analytics?.daily.slice(-7) ?? [];
  const dailyMax = Math.max(...lastSevenDays.map((day) => day.page_views), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">System Overview</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Real-time telemetry, waitlist stats, and administrative controls.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportWaitlist}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-bg-elev border border-line px-4 py-2.5 text-xs font-bold text-ink hover:text-white hover:bg-bg-elev/80 transition-all select-none disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            ) : (
              <Download className="h-3.5 w-3.5 text-amber-500" />
            )}
            Export Waitlist CSV
          </button>
          <Link
            to="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all select-none shadow-lg shadow-amber-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            New Research Post
          </Link>
        </div>
      </div>

      {/* ── VISITOR ANALYTICS ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Visitor Analytics</h2>
            <p className="text-xs text-ink-muted mt-1">Pseudonymous first-party traffic from the last 30 days.</p>
          </div>
          <div className="text-right text-xs font-mono text-ink-subtle whitespace-nowrap">
            <p>{analytics?.today.unique_visitors ?? 0} unique today</p>
            <p className="mt-1 text-emerald-400">{analytics?.waitlist_signups ?? 0} signups · {analytics?.signup_conversion_rate ?? 0}% conversion</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card bg-bg-card/25 border-line/50 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {analyticsCards.map((card) => (
              <div key={card.label} className="card bg-bg-card/25 border-line/45 p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-ink">{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-bg-elev/50 border border-line/65 ${card.iconColor}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
            <div className="card bg-bg-card/25 border-line/45 p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-ink">Last 7 days</h3>
                <span className="text-[11px] font-mono text-ink-subtle">Page views</span>
              </div>
              <div className="mt-6 grid grid-cols-7 gap-3 h-40 items-end">
                {lastSevenDays.map((day) => (
                  <div key={day.date} className="h-full flex flex-col justify-end min-w-0 group">
                    <div className="text-center text-[10px] font-mono text-ink-muted mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.page_views}
                    </div>
                    <div
                      className="w-full min-h-[4px] rounded-sm bg-cyan-400/80 group-hover:bg-cyan-300 transition-colors"
                      style={{ height: `${Math.max((day.page_views / dailyMax) * 100, 3)}%` }}
                      title={`${day.page_views} page views, ${day.unique_visitors} unique visitors`}
                    />
                    <span className="mt-2 text-center text-[9px] font-mono text-ink-subtle">
                      {new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-bg-card/25 border-line/45 p-6">
              <h3 className="text-sm font-bold text-ink">Top Referrers</h3>
              <div className="mt-4 space-y-3">
                {analytics?.referrers.length ? analytics.referrers.slice(0, 5).map((item) => (
                  <div key={item.referrer} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-ink-muted truncate" title={item.referrer}>{item.referrer}</span>
                    <span className="font-mono font-semibold text-ink whitespace-nowrap">{item.page_views}</span>
                  </div>
                )) : (
                  <p className="text-xs text-ink-subtle">No visitor data yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="card bg-bg-card/25 border-line/45 overflow-hidden">
            <div className="px-6 py-4 border-b border-line/45 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Top Pages</h3>
              <span className="text-[11px] font-mono text-ink-subtle">Last 30 days</span>
            </div>
            {analytics?.top_pages.length ? (
              <div className="divide-y divide-line/45">
                {analytics.top_pages.slice(0, 6).map((page) => (
                  <div key={page.path} className="grid grid-cols-[minmax(0,1fr)_90px_110px] gap-4 px-6 py-3.5 text-xs items-center">
                    <span className="font-mono text-ink truncate" title={page.path}>{page.path}</span>
                    <span className="text-right text-ink-muted">{page.page_views} views</span>
                    <span className="text-right text-ink-muted">{page.unique_visitors} unique</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-6 py-6 text-xs text-ink-subtle">No visitor data yet.</p>
            )}
          </div>
        )}
      </section>

      {/* ── STATS GRID ── */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="card bg-bg-card/25 border-line/50 p-6 flex flex-col justify-between h-36 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-bg-elev rounded" />
                <div className="h-8 w-8 bg-bg-elev rounded-full" />
              </div>
              <div className="h-8 w-16 bg-bg-elev rounded mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`card bg-bg-card/25 border-line/45 ${card.borderColor} backdrop-blur-sm p-6 flex flex-col justify-between h-36 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] group p-0`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 pointer-events-none`} />
              <div className="flex items-center justify-between p-6 pb-0 z-10">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-lg bg-bg-elev/50 border border-line/65 ${card.iconColor} group-hover:scale-105 transition-transform`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="px-6 pb-6 z-10 flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-black text-ink tracking-tight font-sans">
                  {card.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── QUICK PANEL / INSIGHTS ── */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="card bg-bg-card/25 border-line/45 p-6 space-y-4">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            System Administration Manual
          </h3>
          <div className="text-xs text-ink-muted leading-relaxed space-y-3 font-sans">
            <p>
              Welcome to the Strategy Labs Administrative Terminal. This panel provides real-time access to user profile tier mappings, waitlist entries, publishing queues, and micro-service environment flags.
            </p>
            <p className="font-semibold text-ink">
              Operational Protocols:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Changes to user account subscription tiers propagate immediately to user login sessions.</li>
              <li>Research drafts created inside the Blog Editor remain completely invisible to public endpoints.</li>
              <li>Always check environment configurations before toggling database properties or microservice flags.</li>
            </ul>
          </div>
        </div>

        <div className="card bg-bg-card/25 border-line/45 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              Quick Operations
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              Perform administrative operations quickly using the direct command links below.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link
              to="/admin/blogs"
              className="flex flex-col justify-between p-4 rounded-xl border border-line bg-bg-elev/20 hover:bg-bg-elev/45 hover:border-amber-500/30 transition-all group"
            >
              <span className="text-xs font-bold text-ink group-hover:text-amber-500 transition-colors">Manage Blogs</span>
              <span className="text-[10px] text-ink-subtle mt-1 font-mono">Create, Edit, Delete drafts</span>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex flex-col justify-between p-4 rounded-xl border border-line bg-bg-elev/20 hover:bg-bg-elev/45 hover:border-amber-500/30 transition-all group"
            >
              <span className="text-xs font-bold text-ink group-hover:text-amber-500 transition-colors">Subscription Tiers</span>
              <span className="text-[10px] text-ink-subtle mt-1 font-mono">Manage trader/auto permissions</span>
            </Link>
          </div>
        </div>
      </div>

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
