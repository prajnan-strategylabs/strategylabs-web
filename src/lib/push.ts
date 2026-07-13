import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "./supabase";
import { apiRegisterPushToken, apiUnregisterPushToken } from "./api";
import { toast } from "./toast";

const LAST_TOKEN_KEY = "sl_push_device_token";

async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

let listenersBound = false;

function bindListenersOnce() {
  if (listenersBound) return;
  listenersBound = true;

  // Fired once the OS hands back a registration token.
  PushNotifications.addListener("registration", (token) => {
    window.localStorage.setItem(LAST_TOKEN_KEY, token.value);
    void (async () => {
      const authToken = await getAuthToken();
      if (!authToken) return; // not signed in yet — AuthContext re-registers on login
      try {
        await apiRegisterPushToken(authToken, token.value, Capacitor.getPlatform());
      } catch (err) {
        console.error("[push] failed to register device token with backend:", err);
      }
    })();
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("[push] registration error:", err);
  });

  // App is open and in the foreground when a signal fires — surface it as
  // an in-app toast since Android won't show a system notification banner
  // for the currently-focused app.
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    const title = notification.title ?? "Strategy Labs";
    const body = notification.body ?? "";
    toast(body ? `${title} — ${body}` : title, "info");
  });
}

/**
 * Request notification permission and register this device for FCM push
 * alerts on V22 signal open/close events. Safe to call multiple times
 * (e.g. on every login) — Capacitor no-ops a repeat register() call.
 */
export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  bindListenersOnce();

  try {
    const perm = await PushNotifications.checkPermissions();
    let receive = perm.receive;
    if (receive === "prompt" || receive === "prompt-with-rationale") {
      const requested = await PushNotifications.requestPermissions();
      receive = requested.receive;
    }
    if (receive !== "granted") return;

    await PushNotifications.register();
  } catch (err) {
    console.error("[push] initPushNotifications failed:", err);
  }
}

/** Re-send the last-known device token to the backend — used right after
 *  login, since the OS 'registration' event may have already fired before
 *  the user was signed in (nothing to attach the token to yet). */
export async function reRegisterKnownToken(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const token = window.localStorage.getItem(LAST_TOKEN_KEY);
  const authToken = await getAuthToken();
  if (!token || !authToken) return;
  try {
    await apiRegisterPushToken(authToken, token, Capacitor.getPlatform());
  } catch (err) {
    console.error("[push] failed to re-register device token:", err);
  }
}

/** Unregister this device's token (e.g. user disables push in Settings). */
export async function unregisterPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const token = window.localStorage.getItem(LAST_TOKEN_KEY);
  const authToken = await getAuthToken();
  if (!token || !authToken) return;
  try {
    await apiUnregisterPushToken(authToken, token);
  } catch (err) {
    console.error("[push] failed to unregister device token:", err);
  }
}
