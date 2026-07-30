import { Capacitor } from "@capacitor/core";
import { LiveUpdate } from "@capawesome/capacitor-live-update";

/**
 * Recovers a device stuck on a broken OTA bundle, for the boot window only.
 *
 * capacitor.config.ts's LiveUpdate.readyTimeout gives the plugin its own
 * native-level rollback: if `LiveUpdate.ready()` is never called in time, it
 * reverts to the embedded bundle on its own. But that only helps installs
 * built AFTER readyTimeout was configured — it ships in a native release, not
 * an OTA bundle — and it does nothing for a device already stuck on a bad
 * bundle right now. This is the OTA-deliverable half of the same protection:
 * if the app fails to even mount, reset to the embedded bundle and reload,
 * so a bad bundle can only crash a device once instead of forever.
 *
 * Deliberately narrow. This does NOT listen for `unhandledrejection` or wrap
 * the whole app lifetime — an unrelated runtime error (a failed analytics
 * beacon, an aborted fetch) must never nuke an otherwise-healthy, already-
 * running bundle back to the embedded one. It only watches the boot window:
 * from module load until `markBootReady()` fires once SplashScreen calls
 * `LiveUpdate.ready()`. After that this guard is inert for the rest of the
 * session.
 */

let bootReady = false;
let recovering = false;

export function markBootReady(): void {
  bootReady = true;
}

async function recoverToEmbeddedBundle(reason: unknown): Promise<void> {
  if (recovering) return;
  recovering = true;
  console.error("[ota-boot-guard] Fatal error before boot completed — resetting to the embedded bundle.", reason);
  try {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("LiveUpdate")) {
      await LiveUpdate.reset();
    }
  } catch (resetError) {
    console.error("[ota-boot-guard] LiveUpdate.reset() itself failed.", resetError);
  } finally {
    // Reload regardless of whether reset() succeeded — staying on a page that
    // failed to mount helps no one, and a plain reload at least retries.
    window.location.reload();
  }
}

/** Install once, before React ever renders. */
export function installBootGuard(): void {
  window.addEventListener("error", (event) => {
    if (!bootReady) void recoverToEmbeddedBundle(event.error ?? event.message);
  });
}

/** For the top-level ErrorBoundary — React's render-time errors don't
 *  reliably surface as a window 'error' event, so it needs its own hook into
 *  the same recovery path. No-ops once boot has completed. */
export function reportBootRenderError(error: unknown): void {
  if (!bootReady) void recoverToEmbeddedBundle(error);
}

/** Wrap the initial render call so a synchronous mount failure is caught too
 *  (an ErrorBoundary only catches errors React throws *during* rendering —
 *  it won't catch createRoot() itself throwing). */
export function guardInitialRender(render: () => void): void {
  try {
    render();
  } catch (error) {
    void recoverToEmbeddedBundle(error);
  }
}
