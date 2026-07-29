import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const isNative = Capacitor.isNativePlatform();

function safely(action: () => Promise<void>) {
  if (!isNative) return;
  action().catch(() => {});
}

export function hapticLight() {
  safely(() => Haptics.impact({ style: ImpactStyle.Light }));
}

export function hapticSuccess() {
  safely(() => Haptics.notification({ type: NotificationType.Success }));
}
