import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";

const isNative = Capacitor.isNativePlatform();

function safely(action: () => Promise<unknown>) {
  if (!isNative) return;
  action().catch(() => {});
}

export function hapticLight() {
  // Match the Android shell: a short, deliberately timed physical tap.
  safely(() => Haptics.vibrate({ duration: 15 }));
}

export function hapticSuccess() {
  // Success gets a slightly longer confirmation without falling back to a
  // platform-defined impact/notification pattern.
  safely(() => Haptics.vibrate({ duration: 25 }));
}
