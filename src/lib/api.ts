/**
 * Strategy Labs API client.
 * All DB operations go through the FastAPI backend (not Supabase directly).
 */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8080";

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
