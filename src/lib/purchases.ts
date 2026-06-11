import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import { RevenueCatUI } from "@revenuecat/purchases-capacitor-ui";
import { toast } from "./toast";

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
const TRADER_ENTITLEMENT_IDS = [
  "StrategyLabs Trader",
  "Trader",
  "trader",
  "strategylabs_trader",
  "strategy_labs_trader",
] as const;
const AUTO_ENTITLEMENT_IDS = [
  "StrategyLabs Auto",
  "StrategyLabs Pro",
  "Auto",
  "Pro",
  "auto",
  "pro",
  "strategylabs_auto",
  "strategy_labs_auto",
  "strategylabs_pro",
  "strategy_labs_pro",
] as const;

export const REVENUECAT_PRODUCT_IDS = {
  trader: {
    monthly: "strategy_labs_subscription:trader-monthly",
    yearly: "strategy_labs_subscription:trader-yearly",
  },
  auto: {
    monthly: "strategy_labs_subscription:auto-monthly",
    yearly: "strategy_labs_subscription:auto-yearly",
  },
} as const;

type BillingPeriod = "monthly" | "yearly";
type PaidPlanId = "trader" | "auto";

export interface RCProductOfferings {
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
  rawOfferings: any;
}

function hasAnyActiveEntitlement(
  customerInfo: CustomerInfo,
  entitlementIds: readonly string[],
): boolean {
  return entitlementIds.some((id) => customerInfo.entitlements.active[id] !== undefined);
}

function isPaidPlanId(planId: string): planId is PaidPlanId {
  return planId === "trader" || planId === "auto";
}

function getExpectedProductId(planId: string, billingPeriod: BillingPeriod): string | null {
  if (!isPaidPlanId(planId)) return null;
  return REVENUECAT_PRODUCT_IDS[planId][billingPeriod];
}

function getRevenueCatErrorMessage(error: any): string {
  if (typeof error === "object" && error !== null) {
    const data = error.data || error;
    const readableCode = data.readableErrorCode || data.readable_error_code || error.readableErrorCode || "";
    const underlying = data.underlyingErrorMessage || error.underlyingErrorMessage || "";
    const baseMsg = data.message || error.message || "";

    if (readableCode === "ConfigurationError" || baseMsg.includes("ConfigurationError") || baseMsg.includes("Configuration")) {
      return "RevenueCat Dashboard Setup Required:\n\n" +
        "You have configured the SDK, but no Google Play Store products are registered under your Offerings in the RevenueCat dashboard.\n\n" +
        "How to fix:\n" +
        "1. Go to your RevenueCat Console -> Products.\n" +
        "2. Click 'Import Play Store products' and import your subscription product IDs.\n" +
        "3. Go to Offerings -> Select your Current Offering -> select your package -> click 'Attach product' to link your imported product.\n\n" +
        "Details: " + (underlying || baseMsg);
    }

    if (underlying) {
      return `${baseMsg} (Underlying error: ${underlying})`;
    }
    if (baseMsg) return baseMsg;
    if (readableCode) return `RevenueCat Error: ${readableCode}`;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Unknown RevenueCat purchase error";
}

export function tierFromCustomerInfo(customerInfo: CustomerInfo): "auto" | "trader" | "free" {
  console.log("[RevenueCat] Evaluating tier. CustomerInfo:", JSON.stringify(customerInfo));
  console.log("[RevenueCat] Active Entitlements on device:", Object.keys(customerInfo?.entitlements?.active ?? {}));
  
  if (hasAnyActiveEntitlement(customerInfo, AUTO_ENTITLEMENT_IDS)) {
    console.log("[RevenueCat] Matches Auto tier!");
    return "auto";
  }
  if (hasAnyActiveEntitlement(customerInfo, TRADER_ENTITLEMENT_IDS)) {
    console.log("[RevenueCat] Matches Trader tier!");
    return "trader";
  }
  console.log("[RevenueCat] No matching active entitlements found. Defaulting to free.");
  return "free";
}

export function findPackageForPlan(
  packages: PurchasesPackage[] | undefined,
  planId: string,
  billingPeriod: BillingPeriod,
): PurchasesPackage | null {
  if (!isPaidPlanId(planId)) return null;
  const expectedProductId = REVENUECAT_PRODUCT_IDS[planId][billingPeriod];
  const availablePackages = packages ?? [];

  const expectedBaseProductId = expectedProductId.split(":")[0] || expectedProductId;
  const expectedBasePlanId = expectedProductId.split(":")[1] || expectedProductId;

  const knownPackageIds = [
    expectedProductId,
    expectedBasePlanId,
    `${planId}-${billingPeriod}`,
    `${planId}_${billingPeriod}`,
    `${planId}.${billingPeriod}`,
  ];

  return (
    availablePackages.find((pkg) => {
      // 1. Check if package identifier matches expected pattern
      if (knownPackageIds.includes(pkg.identifier)) return true;

      // 2. Check if product identifier matches exact or base product ID
      const prodId = pkg.product.identifier;
      if (prodId === expectedProductId || prodId === expectedBaseProductId) return true;

      // 3. Check if any subscription options on Android match
      const hasMatchingOption = (pkg.product.subscriptionOptions ?? []).some(
        (option) => option.storeProductId === expectedProductId || option.storeProductId === expectedBaseProductId,
      );
      if (hasMatchingOption) return true;

      return false;
    }) ?? null
  );
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
 * Check if the user currently holds the active entitlement "StrategyLabs Auto".
 */
export async function checkAutoEntitlement(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.warn("[RevenueCat] Web sandbox bypass. Assuming free tier on web.");
    return false;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const isActive = hasAnyActiveEntitlement(customerInfo, AUTO_ENTITLEMENT_IDS);
    console.log("[RevenueCat] Auto entitlement active:", isActive);
    return isActive;
  } catch (error) {
    console.error("[RevenueCat] Error checking entitlements:", error);
    return false;
  }
}

/**
 * Check if the user currently holds the active entitlement "StrategyLabs Trader".
 */
export async function checkTraderEntitlement(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const isActive = hasAnyActiveEntitlement(customerInfo, TRADER_ENTITLEMENT_IDS);
    console.log("[RevenueCat] Trader entitlement active:", isActive);
    return isActive;
  } catch (error) {
    console.error("[RevenueCat] Error checking trader entitlement:", error);
    return false;
  }
}

/**
 * Determine the highest active subscription tier for the user based on active entitlements.
 */
export async function determineActiveTier(): Promise<"auto" | "trader" | "free"> {
  if (!Capacitor.isNativePlatform()) {
    return "free";
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return tierFromCustomerInfo(customerInfo);
  } catch (error) {
    console.error("[RevenueCat] Error determining active tier:", error);
    return "free";
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
    toast("In-app purchases are only available in the mobile app. Please purchase on our web platform.", "info");
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
    const activeTier = await determineActiveTier();
    return activeTier !== "free";
  } catch (error) {
    console.error("[RevenueCat] Error presenting paywall:", error);
    return false;
  }
}

/**
 * Purchase a specific package directly by plan ID (e.g. 'trader' or 'auto').
 * Returns true if the purchase was successful and the user is upgraded.
 */
export async function purchaseSubscriptionPackage(
  planId: string,
  billingPeriod: "monthly" | "yearly" = "monthly"
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    toast("In-app purchases are only available in the mobile app. Please purchase on our web platform.", "info");
    return false;
  }

  try {
    const expectedProductId = getExpectedProductId(planId, billingPeriod);
    if (!expectedProductId || !isPaidPlanId(planId)) {
      throw new Error(`Unknown subscription plan: ${planId}`);
    }

    console.log(`[RevenueCat] Direct purchase initiated for plan: ${planId} (${billingPeriod})`);
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) {
      throw new Error(
        `RevenueCat has no current offering configured. Please set an offering as current in the RevenueCat dashboard.`
      );
    }

    const pkgToBuy = findPackageForPlan(current.availablePackages, planId, billingPeriod);

    if (!pkgToBuy) {
      throw new Error(
        `No package found in the current offering matching plan "${planId}" and billing "${billingPeriod}". ` +
        `Please ensure the package is attached to the current offering in the RevenueCat dashboard.`
      );
    }

    console.log(`[RevenueCat] Purchasing package: ${pkgToBuy.identifier} (${pkgToBuy.product.identifier})`);
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkgToBuy });
    console.log("[RevenueCat] Purchase response customerInfo:", JSON.stringify(customerInfo));

    const resolvedTier = tierFromCustomerInfo(customerInfo);
    console.log(`[RevenueCat] Resolved tier after purchase: ${resolvedTier}`);
    return resolvedTier !== "free";
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("[RevenueCat] User cancelled the purchase.");
      return false;
    } else {
      console.error("[RevenueCat] Error during package purchase:", error);
    }
    throw new Error(getRevenueCatErrorMessage(error));
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
    const hasAuto = hasAnyActiveEntitlement(customerInfo, AUTO_ENTITLEMENT_IDS);

    if (hasAuto) {
      console.log("[RevenueCat] User already has Auto subscription. Skipping paywall.");
      return true;
    }

    await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: AUTO_ENTITLEMENT_IDS[0] });
    return await checkAutoEntitlement();
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
    toast("Subscription management is only available inside the mobile app.", "info");
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
    const hasPaidTier = tierFromCustomerInfo(customerInfo) !== "free";
    console.log("[RevenueCat] Restore finished. Paid tier active:", hasPaidTier);
    return hasPaidTier;
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
