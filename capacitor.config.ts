import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'trade.strategylabs.app',
  appName: 'StrategyLabs',
  webDir: 'dist',
  plugins: {
    // readyTimeout defaults to 0 (disabled) if unset. SplashScreen.tsx's OTA
    // logic calls LiveUpdate.ready() to mark a freshly-activated bundle
    // healthy, assuming the plugin will roll back to the embedded bundle if
    // ready() is never reached in time -- but that safety net does not exist
    // unless a nonzero readyTimeout is configured here. Without it, a bundle
    // that fails before React mounts (a thrown error, a bad build) crash-loops
    // forever with no self-healing. This is a native-level setting: it takes
    // effect on the next real app-store / APK build, not via OTA.
    LiveUpdate: {
      readyTimeout: 10000,
      autoBlockRolledBackBundles: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#0a0e1a",
      splashFullScreen: true,
      splashImmersive: true
    },
    CapacitorHttp: {
      enabled: true
    },
    Keyboard: {
      // "native" delegates to Android's own keyboard-overlap calculation
      // (via windowSoftInputMode=adjustResize below) so only inputs the
      // keyboard would actually cover get scrolled up. "body" shrinks the
      // whole WebView, reflowing every full-height layout and dragging
      // unrelated inputs upward with it.
      resize: "native",
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0e1a",
      overlaysWebView: false
    }
  }
};

export default config;
