import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'trade.strategylabs.app',
  appName: 'StrategyLabs',
  webDir: 'dist',
  plugins: {
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
