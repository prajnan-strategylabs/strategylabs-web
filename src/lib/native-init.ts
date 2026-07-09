import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

export function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  if (Capacitor.getPlatform() === "android") {
    StatusBar.setBackgroundColor({ color: "#0a0e1a" }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  }

  // Matches capacitor.config.ts — "native" only moves content the keyboard
  // would actually cover, instead of resizing the whole page (see there for why).
  Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => {});
  // Tag the DOM while the keyboard is open so fixed UI (bottom nav) can hide via CSS
  Keyboard.addListener("keyboardWillShow", () => {
    document.body.classList.add("keyboard-open");
  });
  Keyboard.addListener("keyboardWillHide", () => {
    document.body.classList.remove("keyboard-open");
  });
}
