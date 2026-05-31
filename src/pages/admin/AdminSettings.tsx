import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { apiAdminGetConfig } from "../../lib/api";
import {
  Copy,
  Check,
  Terminal,
  Loader2,
  AlertTriangle
} from "lucide-react";

export function AdminSettings() {
  const [config, setConfig] = useState<{
    is_launched: boolean;
    waitlist_full: boolean;
    admin_enabled: boolean;
    v22_scanner_disabled: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadConfig() {
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) throw new Error("No secure session");

        const data = await apiAdminGetConfig(token);
        setConfig(data);
      } catch (err: any) {
        triggerToast(err.message || "Failed to fetch config", "error");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    triggerToast("Command copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const items = [
    {
      key: "IS_LAUNCHED",
      name: "Launch Sandbox Mode",
      status: config?.is_launched ?? false,
      desc: "When enabled, unlocks trading simulator dashboard for all accounts, regardless of waitlist state.",
      cmd: `fly secrets set IS_LAUNCHED=${config?.is_launched ? "false" : "true"} -a strategylabs-api`
    },
    {
      key: "WAITLIST_FULL",
      name: "Waitlist Cap Full",
      status: config?.waitlist_full ?? false,
      desc: "When enabled, blocks new waitlist submissions and displays a waitlist capped explanation screen.",
      cmd: `fly secrets set WAITLIST_FULL=${config?.waitlist_full ? "false" : "true"} -a strategylabs-api`
    },
    {
      key: "ADMIN_ENABLED",
      name: "Admin Control Gate",
      status: config?.admin_enabled ?? false,
      desc: "Master administrative kill-switch. When disabled, blocks access to all /admin/* endpoints across the API.",
      cmd: `fly secrets set ADMIN_ENABLED=${config?.admin_enabled ? "false" : "true"} -a strategylabs-api`
    },
    {
      key: "V22_SCANNER_DISABLED",
      name: "V22 Core Scanner",
      status: config?.v22_scanner_disabled ?? false,
      desc: "When enabled, terminates V22 live trend classifier background loops (Binance, Supabase metrics).",
      cmd: `fly secrets set V22_SCANNER_DISABLED=${config?.v22_scanner_disabled ? "false" : "true"} -a strategylabs-api`
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">System Configuration</h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Inspect core system flags, backend microservices, and container environment variables.
        </p>
      </div>

      {/* ── WARNING NOTE ── */}
      <div className="card border-amber-500/25 bg-amber-500/5 p-6 flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex-none z-10">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>
        <div className="space-y-2 z-10 font-sans">
          <h4 className="text-sm font-bold text-ink leading-none">Immutable Environment Variables</h4>
          <p className="text-xs text-ink-muted leading-relaxed">
            These configuration properties are stored securely inside the Fly.io secrets store. Changing them requires pushing encrypted credentials via the Fly CLI, which triggers a graceful rolling redeploy of the API server containers.
          </p>
        </div>
      </div>

      {/* ── SETTINGS LIST ── */}
      <div className="grid gap-6">
        {items.map((item) => (
          <div
            key={item.key}
            className="card bg-bg-card/25 border-line/45 hover:border-line/75 p-6 space-y-5 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold text-ink leading-none">{item.name}</h3>
                  <span className="font-mono text-[9px] font-bold text-ink-subtle uppercase bg-bg-elev/40 border border-line/60 px-1.5 py-0.5 rounded">
                    {item.key}
                  </span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed max-w-xl font-sans">{item.desc}</p>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase font-mono tracking-wider self-start sm:self-auto
                ${item.status
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-red-500/10 border-red-500/25 text-red-400"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.status ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {item.status ? "active" : "inactive"}
              </span>
            </div>

            {/* Fly CLI Command Box */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-ink-subtle uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-amber-500" />
                Fly CLI Command to Toggle
              </span>
              
              <div className="flex items-center justify-between gap-4 bg-bg-elev/30 border border-line p-3 rounded-xl font-mono text-[10px] text-ink select-all overflow-x-auto scrollbar-thin">
                <code className="whitespace-nowrap">{item.cmd}</code>
                
                <button
                  onClick={() => handleCopy(item.key, item.cmd)}
                  className="p-1.5 rounded-lg border border-line/60 bg-bg-card hover:bg-bg-elev hover:text-white transition-all text-ink-muted flex-none"
                  title="Copy command"
                >
                  {copiedKey === item.key ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
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
