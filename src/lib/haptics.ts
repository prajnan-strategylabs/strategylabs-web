import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";

const isNative = Capacitor.isNativePlatform();

function pulse() {
  if (!isNative) return;
  Haptics.vibrate({ duration: 15 }).catch(() => {});
}

export function hapticLight() {
  pulse();
}

export function hapticSuccess() {
  pulse();
}
