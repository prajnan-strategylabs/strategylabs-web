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

// ── Waitlist ──────────────────────────────────────────────────────────────────

export type WaitlistResponse = { ok: boolean; already_member: boolean };

export async function apiJoinWaitlist(email: string, source = "hero"): Promise<WaitlistResponse> {
  return post<WaitlistResponse>("/api/v1/waitlist", { email, source });
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
