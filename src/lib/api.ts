/**
 * Strategy Labs API client.
 * All DB operations go through the FastAPI backend (not Supabase directly).
 */

import { Capacitor, CapacitorHttp } from "@capacitor/core";

export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8080";

export async function customFetch(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string> | HeadersInit;
    body?: any;
  } = {}
): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  if (Capacitor.isNativePlatform() && !isFormData) {
    const reqHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          reqHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          reqHeaders[key] = value;
        });
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            reqHeaders[key] = String(value);
          }
        });
      }
    }

    const method = options.method || "GET";
    let data = options.body;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        // Keep as string
      }
    }

    try {
      const nativeRes = await CapacitorHttp.request({
        url,
        method,
        headers: reqHeaders,
        data,
      });

      const responseBody = typeof nativeRes.data === "object"
        ? JSON.stringify(nativeRes.data)
        : String(nativeRes.data);

      return new Response(responseBody, {
        status: nativeRes.status,
        statusText: nativeRes.status >= 200 && nativeRes.status < 300 ? "OK" : "Error",
        headers: new Headers(nativeRes.headers as Record<string, string>),
      });
    } catch (err) {
      console.error("[CapacitorHttp Error]", err);
      throw err;
    }
  }

  return window.fetch(url, options as RequestInit);
}

// Shadow global fetch inside this file's lexical scope
const fetch = customFetch;


async function post<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── Waitlist & Config ──────────────────────────────────────────────────────────

export type WaitlistResponse = { ok: boolean; already_member: boolean };

export async function apiJoinWaitlist(email: string, source = "hero"): Promise<WaitlistResponse> {
  return post<WaitlistResponse>("/api/v1/waitlist", { email, source });
}

export type WaitlistMeResponse = {
  on_waitlist: boolean;
  position: number | null;
  source: string | null;
};

export async function apiGetWaitlistStatus(token: string): Promise<WaitlistMeResponse> {
  return get<WaitlistMeResponse>("/api/v1/waitlist/me", token);
}

export async function apiGetConfig(): Promise<{ is_launched: boolean; waitlist_full: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/config`);
    if (!res.ok) return { is_launched: false, waitlist_full: false };
    return await res.json() as { is_launched: boolean; waitlist_full: boolean };
  } catch {
    return { is_launched: false, waitlist_full: false };
  }
}

// ── First-party analytics ────────────────────────────────────────────────────

export interface PageViewPayload {
  visitor_id: string;
  session_id: string;
  path: string;
  title?: string;
  referrer?: string;
  utm?: Record<string, string>;
}

export async function apiTrackPageView(payload: PageViewPayload): Promise<void> {
  await post<{ ok: boolean }>("/api/v1/analytics/page-view", payload);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRequestOtp(email: string, redirectTo: string): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>("/api/v1/auth/otp", {
    email,
    redirect_to: redirectTo,
  });
}

// ── Strategies ────────────────────────────────────────────────────────────────

export async function apiListStrategies(token: string) {
  return get<unknown[]>("/api/v1/strategies", token);
}

export async function apiCreateStrategy(
  token: string,
  data: { name: string; spec: Record<string, unknown>; source_prompt?: string },
) {
  return post<unknown>("/api/v1/strategies", data, { Authorization: `Bearer ${token}` });
}

// ── Backtests ─────────────────────────────────────────────────────────────────

export async function apiQueueBacktest(
  token: string,
  strategyId: string,
  startDate: string,
  endDate: string,
) {
  return post<unknown>(
    "/api/v1/backtests",
    { strategy_id: strategyId, start_date: startDate, end_date: endDate },
    { Authorization: `Bearer ${token}` },
  );
}

export async function apiGetBacktest(token: string, runId: string) {
  return get<unknown>(`/api/v1/backtests/${runId}`, token);
}

export interface TradeChartData {
  asset: string;
  timeframe: string;
  /** [ts_ms, open, high, low, close] */
  candles: Array<[number, number, number, number, number]>;
  trade: Record<string, unknown>;
  entry_ts: number;
  exit_ts: number;
  approx_entry: boolean;
}

export async function apiGetTradeChart(token: string, runId: string, tradeIndex: number) {
  return get<TradeChartData>(`/api/v1/backtests/${runId}/trades/${tradeIndex}/chart`, token);
}

// ── Signals ───────────────────────────────────────────────────────────────────

export async function apiListSignals(token: string, status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return get<unknown[]>(`/api/v1/signals${qs}`, token);
}

// ── Showcase / Proof ──────────────────────────────────────────────────────────

export interface ShowcaseStats {
  total_return_pct: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  trade_count: number;
  sharpe_ratio: number;
  profit_factor: number;
}

export interface ShowcaseResponse {
  stats: ShowcaseStats;
  equity_curve: [number, number][];
}

export async function apiGetShowcaseData(
  symbols: string[],
  timeframe: string,
  period = "8yr"
): Promise<ShowcaseResponse> {
  const syms = symbols.join(",");
  const res = await fetch(
    `${API_BASE}/api/v1/showcase?symbols=${encodeURIComponent(syms)}&timeframe=${timeframe}&period=${period}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch showcase data");
  }
  return res.json() as Promise<ShowcaseResponse>;
}

// ── V22 Track Record (powers Signals upsell page) ─────────────────────────────

export interface V22YearRow {
  year: number;
  pct: number;
  trades: number;
  label: string;
  is_ytd?: boolean;
}

export interface V22RecentWin {
  asset: string;
  dir: "LONG" | "SHORT";
  ret_pct: number;
  hold_days: number;
  when_ago: string;
  entry_time: string;
}

export interface V22RecentCall {
  /** undefined when the call comes from the historical CSV (pre-DB); set when live. */
  id?: number;
  asset: string;
  symbol?: string;
  dir: "LONG" | "SHORT";
  outcome: string;
  /** 'open' for live in-flight positions, 'closed' for finished ones. */
  status?: "open" | "closed";
  entry?: number;
  stop_loss?: number;
  tp1?: number;
  tp2?: number | null;
  rr?: number;
  risk_usd?: number | null;
  position_size?: number | null;
  ret_pct: number | null;
  pnl?: number | null;
  strategy?: "S3" | "S5";
  hold_days?: number;
  hold_hours?: number;
  when_ago: string;
  entry_time: string;
  exit_time?: string | null;
  exit_price?: number | null;
  exit_reason?: string | null;
}

export interface V22ScannerHeartbeat {
  last_scan_at: string | null;
  last_exit_check: string | null;
  last_signal_at: string | null;
  open_count: number | null;
  /** true once the scanner has completed at least one full scan in production. */
  live: boolean;
}

export interface V22Stats {
  /**
   * Live-only track record — real signals the scanner fired, nothing simulated.
   * The `cum_*` / `win_rate_pct` / `total_trades` fields below span the whole
   * record, which is backtested up to `backtest_through` and live after it.
   * Don't mix the two in one figure.
   */
  live_start: string;
  live_trades: number;
  live_return_pct: number;
  live_pnl_usd: number;
  live_win_rate_pct: number;
  live_avg_r: number;
  live_equity_curve: [number, number][];
  /** Last date covered by backtested data; live begins after this. */
  backtest_through: string;

  live_since: string;
  cum_return_pct: number;
  ytd_return_pct: number;
  win_rate_pct: number;
  sharpe: number;
  avg_r: number;
  total_trades: number;
  equity_curve: [number, number][];
  year_breakdown: V22YearRow[];
  recent_wins: V22RecentWin[];
  recent_calls: V22RecentCall[];
  btc_hodl_pct_same_period: number;
  scanner?: V22ScannerHeartbeat;
}

export async function apiGetV22Stats(): Promise<V22Stats> {
  const res = await fetch(`${API_BASE}/api/v1/showcase/v22`);
  if (!res.ok) {
    throw new Error("Failed to fetch V22 stats");
  }
  return res.json() as Promise<V22Stats>;
}

// ── V22 History (comprehensive audit log w/ filters + pagination) ────────────

export interface V22HistoryFilters {
  /** "YYYY-MM-DD" */ start?: string;
  /** "YYYY-MM-DD" */ end?: string;
  /** Uppercase asset symbols, e.g. ["BTC","ETH"] — sent comma-joined to backend. */
  symbols?: string[];
  strategy?: "S3" | "S5";
  direction?: "long" | "short";
  outcome?: "win" | "loss" | "open";
  limit?: number;
  offset?: number;
}

export interface V22HistoryStats {
  count: number;
  win_rate_pct: number;
  wins: number;
  losses: number;
  open: number;
  total_pnl: number;
  best_ret_pct: number | null;
  worst_ret_pct: number | null;
  first_date: string | null;
  last_date: string | null;
}

export interface V22HistoryResponse {
  trades: V22RecentCall[];
  stats: V22HistoryStats;
  filters: {
    start: string | null;
    end: string | null;
    symbols: string[] | null;
    strategy: string | null;
    direction: string | null;
    outcome: string | null;
  };
  pagination: {
    total_count: number;
    has_more: boolean;
    limit: number;
    offset: number;
  };
}

export async function apiGetV22History(
  filters: V22HistoryFilters = {},
): Promise<V22HistoryResponse> {
  const qs = new URLSearchParams();
  if (filters.start) qs.set("start", filters.start);
  if (filters.end) qs.set("end", filters.end);
  if (filters.symbols && filters.symbols.length)
    qs.set("symbols", filters.symbols.join(","));
  if (filters.strategy) qs.set("strategy", filters.strategy);
  if (filters.direction) qs.set("direction", filters.direction);
  if (filters.outcome) qs.set("outcome", filters.outcome);
  if (filters.limit != null) qs.set("limit", String(filters.limit));
  if (filters.offset != null) qs.set("offset", String(filters.offset));
  const url = `${API_BASE}/api/v1/showcase/v22/history?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch V22 history");
  return res.json() as Promise<V22HistoryResponse>;
}

// ── Strategies (live list for Dashboard) ──────────────────────────────────────

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  spec: Record<string, unknown>;
  status: "draft" | "backtesting" | "ready" | "live" | "paused" | "archived";
  source_prompt: string | null;
  created_at: string;
  updated_at?: string;
}

export async function apiListStrategiesTyped(token: string): Promise<Strategy[]> {
  return get<Strategy[]>("/api/v1/strategies", token);
}

// ── Telegram linking (for V22 signal alerts) ──────────────────────────────────

export interface TelegramStatus {
  is_linked: boolean;
  enabled: boolean;
  telegram_handle: string | null;
  verified_at: string | null;
  last_sent_at: string | null;
  bot_username: string | null;
  signal_min_tier: "free" | "trader" | "auto";
}

export interface TelegramLink {
  url: string;
  token: string;
  expires_at: string;
}

export async function apiGetTelegramStatus(token: string): Promise<TelegramStatus> {
  return get<TelegramStatus>("/api/v1/telegram/status", token);
}

export async function apiCreateTelegramLink(token: string): Promise<TelegramLink> {
  return post<TelegramLink>("/api/v1/telegram/link", {}, { Authorization: `Bearer ${token}` });
}

export async function apiSetTelegramPaused(token: string, enabled: boolean): Promise<{ enabled: boolean }> {
  const res = await fetch(`${API_BASE}/api/v1/telegram/pause`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to update Telegram preferences");
  return res.json() as Promise<{ enabled: boolean }>;
}

export async function apiUnlinkTelegram(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/telegram/unlink`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to unlink Telegram");
}

// ── Native push notifications (open/close signal alerts) ─────────────────────

export interface PushStatus {
  is_registered: boolean;
  enabled: boolean;
  signal_min_tier: "free" | "trader" | "auto";
}

export async function apiRegisterPushToken(token: string, deviceToken: string, platform: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/push/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ token: deviceToken, platform }),
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to register push token");
}

export async function apiGetPushStatus(token: string): Promise<PushStatus> {
  return get<PushStatus>("/api/v1/push/status", token);
}

export async function apiSetPushPaused(token: string, enabled: boolean): Promise<{ enabled: boolean }> {
  const res = await fetch(`${API_BASE}/api/v1/push/pause`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to update push preferences");
  return res.json() as Promise<{ enabled: boolean }>;
}

export async function apiUnregisterPushToken(token: string, deviceToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/push/unregister?token=${encodeURIComponent(deviceToken)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to unregister push token");
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function apiAdminCheck(token: string): Promise<{ ok: boolean; email: string }> {
  return get<{ ok: boolean; email: string }>("/api/v1/admin/admin-check", token);
}

export async function apiAdminStats(token: string) {
  return get<{ users: number; waitlist: number; blogs: number; strategies: number; signals: number }>("/api/v1/admin/stats", token);
}

export interface AdminAnalytics {
  period_days: number;
  page_views: number;
  unique_visitors: number;
  sessions: number;
  waitlist_signups: number;
  signup_conversion_rate: number;
  today: {
    page_views: number;
    unique_visitors: number;
  };
  daily: Array<{
    date: string;
    page_views: number;
    unique_visitors: number;
  }>;
  top_pages: Array<{
    path: string;
    page_views: number;
    unique_visitors: number;
  }>;
  referrers: Array<{
    referrer: string;
    page_views: number;
  }>;
}

export async function apiAdminAnalytics(token: string): Promise<AdminAnalytics> {
  return get<AdminAnalytics>("/api/v1/admin/analytics", token);
}

export interface AdminBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  cover_gradient: string;
  read_time: string;
  tags: string[];
  status: "draft" | "published";
  created_at: string;
  updated_at?: string;
}

export async function apiAdminGetBlogs(token: string): Promise<AdminBlogPost[]> {
  return get<AdminBlogPost[]>("/api/v1/admin/blogs", token);
}

export async function apiAdminCreateBlog(token: string, body: Record<string, unknown>) {
  return post<{ ok: boolean; slug: string }>("/api/v1/admin/blogs", body, { Authorization: `Bearer ${token}` });
}

export async function apiAdminUpdateBlog(token: string, slug: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/v1/admin/blogs/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(err.detail ?? "Update failed"); }
  return res.json();
}

export async function apiAdminDeleteBlog(token: string, slug: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/blogs/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function apiAdminUploadImage(token: string, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/admin/blogs/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export interface AdminWaitlistEntry {
  id?: number;
  email: string;
  source?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

export async function apiAdminGetWaitlist(token: string, search?: string): Promise<AdminWaitlistEntry[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return get<AdminWaitlistEntry[]>(`/api/v1/admin/waitlist${qs}`, token);
}

export async function apiAdminExportWaitlist(token: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/v1/admin/waitlist/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

export async function apiAdminDeleteWaitlistEntry(token: string, email: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/waitlist/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export interface AdminUserEntry {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  tier: string;
}

export async function apiAdminGetUsers(token: string): Promise<AdminUserEntry[]> {
  return get<AdminUserEntry[]>("/api/v1/admin/users", token);
}

export async function apiAdminUpdateUserTier(token: string, userId: string, tier: string) {
  const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/tier`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) throw new Error("Tier update failed");
  return res.json();
}

export async function apiAdminGetConfig(token: string) {
  return get<{ is_launched: boolean; waitlist_full: boolean; admin_enabled: boolean; v22_scanner_disabled: boolean }>("/api/v1/admin/config", token);
}

export async function apiAdminGetStrategies(token: string): Promise<any[]> {
  return get<any[]>("/api/v1/admin/strategies", token);
}

export async function apiAdminGetBacktests(token: string): Promise<any[]> {
  return get<any[]>("/api/v1/admin/backtests", token);
}

// ── Public Blog fetch (fix for Blog.tsx) ──────────────────────────────────────
export async function apiGetBlogs() {
  const res = await fetch(`${API_BASE}/api/v1/blogs`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
}


// ── Interactive AI Strategy Lab Endpoints ─────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatStrategyResponse {
  reply: string;
  is_complete: boolean;
  doubts: string[];
  spec: {
    asset: string;
    timeframe: string;
    indicators: string[];
    entry: string;
    exit: string;
    stop_loss: string;
    target: string;
  };
}

export interface AuditStrategyResponse {
  analysis: string;
  optimized_prompt: string;
}

export async function apiChatStrategySpec(
  token: string,
  prompt: string,
  messages: ChatMessage[]
): Promise<ChatStrategyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/strategies/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt, messages }),
  });
  if (!res.ok) throw new Error("Quant Coach compilation failed");
  return res.json() as Promise<ChatStrategyResponse>;
}

export async function apiAnalyzeBacktest(
  token: string,
  runId: string
): Promise<AuditStrategyResponse> {
  const res = await fetch(`${API_BASE}/api/v1/backtests/${runId}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const msg = typeof err.detail === "object" && err.detail?.message ? err.detail.message : (err.detail ?? "Backtest analysis failed");
    throw new Error(msg);
  }
  return res.json() as Promise<AuditStrategyResponse>;
}

export async function apiListBacktests(token: string): Promise<any[]> {
  return get<any[]>("/api/v1/backtests", token);
}
