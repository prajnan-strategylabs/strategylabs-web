import { Capacitor } from "@capacitor/core";
import { Purchases, type CustomerInfo, type PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { RevenueCatUI } from "@revenuecat/purchases-capacitor-ui";

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
const PRO_ENTITLEMENT_NAME = "StrategyLabs Pro";

export interface RCProductOfferings {
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
  rawOfferings: any;
}

/**
 * Configure the RevenueCat Purchases SDK on native iOS or Android platforms.
 * Passes the logged-in user's ID as the appUserID so that transactions are synced.
 */
export async function configurePurchases(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[RevenueCat] Native platform not detected. SDK configuration skipped on Web.");
    return;
  }

  try {
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });
    console.log("[RevenueCat] SDK initialized successfully for user:", userId);
  } catch (error) {
    console.error("[RevenueCat] Failed to configure Purchases SDK:", error);
  }
}

/**
 * Check if the user currently holds the active entitlement "StrategyLabs Pro".
 */
export async function checkProEntitlement(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[RevenueCat] Web sandbox bypass. Assuming free tier on web.");
    return false;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const isActive = customerInfo.entitlements.active[PRO_ENTITLEMENT_NAME] !== undefined;
    console.log(`[RevenueCat] Entitlement "${PRO_ENTITLEMENT_NAME}" active:`, isActive);
    return isActive;
  } catch (error) {
    console.error("[RevenueCat] Error checking entitlements:", error);
    return false;
  }
}

/**
 * Fetch the latest CustomerInfo object from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("[RevenueCat] Error retrieving CustomerInfo:", error);
    return null;
  }
}

/**
 * Present the pre-configured RevenueCat Paywall UI.
 * Returns true if a purchase was completed, false otherwise.
 */
export async function presentPaywall(offeringId?: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    alert("In-App Purchases are only available inside the iOS & Android mobile apps. Please purchase on our web platform.");
    return false;
  }

  try {
    console.log("[RevenueCat] Presenting Paywall...");
    let options = {};
    
    if (offeringId) {
      const offerings = await Purchases.getOfferings();
      const specificOffering = offerings.all[offeringId];
      if (specificOffering) {
        options = { offering: specificOffering };
      }
    }

    await RevenueCatUI.presentPaywall(options);
    
    // Check entitlement status immediately after the paywall closes
    const isPro = await checkProEntitlement();
    return isPro;
  } catch (error) {
    console.error("[RevenueCat] Error presenting paywall:", error);
    return false;
  }
}

/**
 * Purchase a specific package directly by plan ID (e.g. 'trader' or 'auto').
 * Returns true if the purchase was successful and the user is upgraded to Pro.
 */
export async function purchaseSubscriptionPackage(
  planId: string,
  billingPeriod: "monthly" | "yearly" = "monthly"
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    alert("In-App Purchases are only available inside the iOS & Android mobile apps. Please purchase on our web platform.");
    return false;
  }

  try {
    console.log(`[RevenueCat] Direct purchase initiated for plan: ${planId} (${billingPeriod})`);
    const offerings = await Purchases.getOfferings();
    if (!offerings.current) {
      console.warn("[RevenueCat] No current offering found.");
      return false;
    }

    let pkgToBuy: PurchasesPackage | null = null;
    const current = offerings.current;

    if (planId === "trader") {
      if (billingPeriod === "yearly") {
        pkgToBuy = current.annual || null;
        if (!pkgToBuy) {
          pkgToBuy = current.availablePackages.find((pkg) =>
            (pkg.identifier.toLowerCase().includes("trader") || pkg.product.identifier.toLowerCase().includes("trader")) &&
            (pkg.identifier.toLowerCase().includes("year") || pkg.identifier.toLowerCase().includes("annual") ||
             pkg.product.identifier.toLowerCase().includes("year") || pkg.product.identifier.toLowerCase().includes("annual"))
          ) || null;
        }
      } else {
        pkgToBuy = current.monthly || null;
        if (!pkgToBuy) {
          pkgToBuy = current.availablePackages.find((pkg) =>
            (pkg.identifier.toLowerCase().includes("trader") || pkg.product.identifier.toLowerCase().includes("trader")) &&
            (pkg.identifier.toLowerCase().includes("month") || pkg.product.identifier.toLowerCase().includes("month"))
          ) || null;
        }
      }
      
      // General fallback for trader plan
      if (!pkgToBuy) {
        pkgToBuy = current.monthly || current.annual || null;
      }
    } else if (planId === "auto") {
      if (billingPeriod === "yearly") {
        pkgToBuy = current.availablePackages.find((pkg) =>
          (pkg.identifier.toLowerCase().includes("auto") || pkg.product.identifier.toLowerCase().includes("auto")) &&
          (pkg.identifier.toLowerCase().includes("year") || pkg.identifier.toLowerCase().includes("annual") ||
           pkg.product.identifier.toLowerCase().includes("year") || pkg.product.identifier.toLowerCase().includes("annual"))
        ) || null;
      } else {
        pkgToBuy = current.availablePackages.find((pkg) =>
          (pkg.identifier.toLowerCase().includes("auto") || pkg.product.identifier.toLowerCase().includes("auto")) &&
          (pkg.identifier.toLowerCase().includes("month") || pkg.product.identifier.toLowerCase().includes("month"))
        ) || null;
      }

      // General fallback for auto plan
      if (!pkgToBuy) {
        pkgToBuy = current.availablePackages.find((pkg) =>
          pkg.identifier.toLowerCase().includes("auto") ||
          pkg.product.identifier.toLowerCase().includes("auto")
        ) || null;
      }
    }

    if (!pkgToBuy) {
      console.warn(`[RevenueCat] No matching package found for plan: ${planId}. Falling back to default paywall.`);
      // Fallback: present paywall UI
      return await presentPaywall();
    }

    console.log(`[RevenueCat] Purchasing package: ${pkgToBuy.identifier} (${pkgToBuy.product.identifier})`);
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkgToBuy });
    const hasPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_NAME] !== undefined;
    return hasPro;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("[RevenueCat] User cancelled the purchase.");
    } else {
      console.error("[RevenueCat] Error during package purchase:", error);
    }
    return false;
  }
}

/**
 * Present the RevenueCat Paywall UI ONLY if the user does not already have an active subscription.
 */
export async function presentPaywallIfNeeded(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const hasPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_NAME] !== undefined;

    if (hasPro) {
      console.log("[RevenueCat] User already has Pro subscription. Skipping paywall.");
      return true;
    }

    await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: PRO_ENTITLEMENT_NAME });
    return await checkProEntitlement();
  } catch (error) {
    console.error("[RevenueCat] Error executing presentPaywallIfNeeded:", error);
    return false;
  }
}

/**
 * Present the RevenueCat Customer Center to let the user manage their subscription,
 * request refunds, or cancel/upgrade.
 */
export async function presentCustomerCenter(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    alert("Subscription management is only available inside the mobile application.");
    return;
  }

  try {
    console.log("[RevenueCat] Opening Customer Center...");
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    console.error("[RevenueCat] Failed to open Customer Center:", error);
  }
}

/**
 * Retrieve the active offerings configured in RevenueCat.
 * Automatically maps products with 'monthly' and 'yearly' keys.
 */
export async function getSubscriptionOfferings(): Promise<RCProductOfferings> {
  const result: RCProductOfferings = {
    monthly: null,
    yearly: null,
    rawOfferings: null,
  };

  if (!Capacitor.isNativePlatform()) {
    return result;
  }

  try {
    const offerings = await Purchases.getOfferings();
    result.rawOfferings = offerings;

    if (offerings.current) {
      result.monthly = offerings.current.monthly || null;
      result.yearly = offerings.current.annual || null;
    }
  } catch (error) {
    console.error("[RevenueCat] Error getting offerings:", error);
  }

  return result;
}

/**
 * Restore previously purchased transactions (e.g. if the user reinstalls the app).
 */
export async function restorePurchases(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    console.log("[RevenueCat] Restoring purchases...");
    const { customerInfo } = await Purchases.restorePurchases();
    const isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_NAME] !== undefined;
    console.log("[RevenueCat] Restore finished. Pro active:", isPro);
    return isPro;
  } catch (error) {
    console.error("[RevenueCat] Error restoring transactions:", error);
    return false;
  }
}

/**
 * Register a listener to capture real-time subscription changes.
 * This is useful to sync UI states immediately when a transaction completes.
 */
export function addSubscriptionListener(onUpdate: (customerInfo: CustomerInfo) => void): (() => void) | null {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    let listenerHandle: any = null;
    
    void Purchases.addCustomerInfoUpdateListener((data: any) => {
      if (data && data.customerInfo) {
        onUpdate(data.customerInfo);
      }
    }).then((handle) => {
      listenerHandle = handle;
    });
    
    // Return a cleanup/unsubscribing method
    return () => {
      if (listenerHandle && typeof listenerHandle.remove === "function") {
        listenerHandle.remove();
      }
    };
  } catch (error) {
    console.error("[RevenueCat] Failed to bind CustomerInfo listener:", error);
    return null;
  }
}
