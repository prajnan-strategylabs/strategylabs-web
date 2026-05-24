import { apiJoinWaitlist } from "./api";

export type WaitlistJoinResult =
  | { ok: true; alreadyMember: boolean }
  | { ok: false; error: string };

function isValidEmail(raw: string): boolean {
  if (!raw) return false;
  const e = raw.trim();
  if (e.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/**
 * Add an email to the waitlist via the API backend.
 * Falls back to localStorage when API is unreachable (dev convenience).
 */
export async function joinWaitlist(
  rawEmail: string,
  source: string = "hero",
): Promise<WaitlistJoinResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    const res = await apiJoinWaitlist(email, source);
    return { ok: true, alreadyMember: res.already_member };
  } catch (err) {
    // Dev fallback: if API is not running, write to localStorage so form still works
    if (import.meta.env.DEV) {
      try {
        const key = "waitlist";
        const list: { email: string; ts: string; source: string }[] =
          JSON.parse(localStorage.getItem(key) || "[]");
        const exists = list.some((e) => e.email === email);
        if (!exists) {
          list.push({ email, source, ts: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(list));
        }
        return { ok: true, alreadyMember: exists };
      } catch {
        // ignore
      }
    }
    return { ok: false, error: "Could not join right now. Please try again." };
  }
}
