import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
} from "@capacitor-community/admob";

// Google AdMob Test Ad Unit IDs for Android
// (These are safe to use publicly during testing/development)
const ANDROID_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const ANDROID_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";

// Map platforms to their respective ad unit IDs
const AD_IDS = {
  banner: Capacitor.isNativePlatform() ? ANDROID_BANNER_ID : "test-banner",
  interstitial: Capacitor.isNativePlatform() ? ANDROID_INTERSTITIAL_ID : "test-interstitial",
};

let isInitialized = false;
let bannerVisible = false;
let interstitialInFlight = false;
let lastInterstitialAt = 0;
const INTERSTITIAL_COOLDOWN_MS = 60_000;

/**
 * Initialize AdMob SDK. Safe to call multiple times.
 */
export async function initializeAdMob(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[AdMob] Web environment. SDK initialization skipped.");
    return;
  }

  if (isInitialized) return;

  try {
    console.log("[AdMob] Initializing SDK...");
    await AdMob.initialize({
      initializeForTesting: true,
    });
    isInitialized = true;
    console.log("[AdMob] SDK initialized successfully.");
  } catch (error) {
    console.error("[AdMob] Failed to initialize SDK:", error);
  }
}

/**
 * Show a Banner Ad at the bottom of the screen.
 */
export async function showBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[AdMob] Web simulation: Show Banner.");
    return;
  }

  if (bannerVisible) return;

  try {
    await initializeAdMob();
    console.log("[AdMob] Displaying Banner Ad...");
    
    // We listen to the loaded event
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log("[AdMob] Banner ad loaded.");
      bannerVisible = true;
    });

    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 55, // Set margin to stay above the bottom navigation bar (approx 55px)
      isTesting: true,
    });
  } catch (error) {
    console.error("[AdMob] Error displaying banner:", error);
  }
}

/**
 * Hide and remove the Banner Ad from the screen.
 */
export async function hideBanner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[AdMob] Web simulation: Hide Banner.");
    return;
  }

  if (!bannerVisible) return;

  try {
    console.log("[AdMob] Hiding Banner Ad...");
    await AdMob.removeBanner();
    bannerVisible = false;
    console.log("[AdMob] Banner Ad removed.");
  } catch (error) {
    console.error("[AdMob] Error removing banner:", error);
  }
}

/**
 * Load and show an Interstitial Ad (full-screen overlay).
 * Prompts Google's native dialog overlay.
 */
export async function showInterstitial(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[AdMob] Web simulation: Show Interstitial Ad.");
    return true;
  }

  const now = Date.now();
  if (interstitialInFlight) {
    console.log("[AdMob] Interstitial already in flight. Skipping duplicate request.");
    return false;
  }
  if (now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) {
    console.log("[AdMob] Interstitial cooldown active. Skipping request.");
    return false;
  }

  interstitialInFlight = true;
  try {
    await initializeAdMob();
    console.log("[AdMob] Preloading Interstitial Ad...");
    await AdMob.prepareInterstitial({
      adId: AD_IDS.interstitial,
      isTesting: true,
    });

    console.log("[AdMob] Displaying Interstitial Ad...");
    await AdMob.showInterstitial();
    lastInterstitialAt = Date.now();
    return true;
  } catch (error) {
    console.error("[AdMob] Failed to show Interstitial Ad:", error);
    return false;
  } finally {
    interstitialInFlight = false;
  }
}
