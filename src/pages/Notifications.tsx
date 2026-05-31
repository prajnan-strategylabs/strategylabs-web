import { useMemo } from "react";
import { Bell, ShieldAlert, Beaker, Radio } from "lucide-react";
import { Pill, LiveDot } from "../components/MobileUI";

interface NotificationItem {
  id: string;
  category: "signal" | "backtest" | "account";
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS_MOCK: NotificationItem[] = [
  {
    id: "notif-1",
    category: "signal",
    title: "V22 Trend Classifier Alert",
    description: "S5 SHORT signal triggered on SOL/USDT at $143.50. Risk/Reward ratio: 2.0. stop loss: $148.10.",
    time: "25m ago",
    unread: true,
  },
  {
    id: "notif-2",
    category: "signal",
    title: "V22 Position Closed",
    description: "S3 LONG position on TAO/USDT closed at TP1 for a +5.55% gain in 1 day.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "notif-3",
    category: "backtest",
    title: "Backtest Finished Successfully",
    description: "Your customized Strategy Lab backtest (S3 Ensemble pullback on BTC) completed with +18.4% return, 1.62 Sharpe, and 3.2% drawdown.",
    time: "1d ago",
    unread: false,
  },
  {
    id: "notif-4",
    category: "account",
    title: "System Update: Multi-Platform Sync",
    description: "Android & iOS native compilation synced successfully. Automatic CORS bypassing active via custom native fetch.",
    time: "2d ago",
    unread: false,
  },
  {
    id: "notif-5",
    category: "account",
    title: "Welcome to Strategy Labs Beta",
    description: "Your waitlist reservation has been activated. Full Free Tier sandbox capabilities unlocked successfully.",
    time: "3d ago",
    unread: false,
  },
];

export function Notifications() {
  const unreadCount = useMemo(
    () => NOTIFICATIONS_MOCK.filter((n) => n.unread).length,
    []
  );

  return (
    <div className="space-y-5 pb-6 animate-fade-in">
      {/* ── Header ── */}
      <header className="flex items-start justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "rgb(165, 180, 252)",
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span
                className="absolute inset-0 rounded-2xl animate-ping"
                style={{ boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.4)" }}
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Alert Feed</h1>
            <div className="text-[11px] text-ink-muted flex items-center gap-1.5 mt-0.5">
              <LiveDot size={5} /> {unreadCount} unread · system notifications
            </div>
          </div>
        </div>
        <Pill tone="info">
          live logs
        </Pill>
      </header>

      {/* ── Notification List ── */}
      <div className="space-y-3">
        {NOTIFICATIONS_MOCK.map((n) => {
          const Icon = (() => {
            switch (n.category) {
              case "signal":
                return Radio;
              case "backtest":
                return Beaker;
              default:
                return ShieldAlert;
            }
          })();

          const color = (() => {
            switch (n.category) {
              case "signal":
                return "var(--accent)";
              case "backtest":
                return "rgb(165, 180, 252)";
              default:
                return "rgb(251, 191, 36)";
            }
          })();

          const bg = (() => {
            switch (n.category) {
              case "signal":
                return "rgba(34, 211, 170, 0.08)";
              case "backtest":
                return "rgba(99, 102, 241, 0.08)";
              default:
                return "rgba(251, 191, 36, 0.08)";
            }
          })();

          return (
            <div
              key={n.id}
              className={`rounded-xl border p-4 flex gap-3 transition-all duration-300 relative overflow-hidden bg-bg-card/30 hover:bg-bg-card/50 ${
                n.unread ? "border-line" : "border-line/45"
              }`}
              style={{
                boxShadow: n.unread
                  ? "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.02)"
                  : "none",
              }}
            >
              {/* Highlight bar for unread notifications */}
              {n.unread && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: color }}
                />
              )}

              {/* Category Icon */}
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-none border border-line/30"
                style={{ background: bg, color: color }}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className={`text-xs font-bold text-ink ${n.unread ? "text-white" : ""}`}>
                    {n.title}
                  </h3>
                  <span className="text-[9px] font-semibold text-ink-subtle uppercase tracking-wider font-mono">
                    {n.time}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-ink-muted">
                  {n.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-ink-subtle leading-relaxed pt-2 text-center">
        Real-time alerts sync directly with the cloud core. Alert preferences can be configured under Settings.
      </p>
    </div>
  );
}
