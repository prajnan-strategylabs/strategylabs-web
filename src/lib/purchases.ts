import { Capacitor } from "@capacitor/core";
import {
  PRODUCT_CATEGORY,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesStoreProduct,
  type SubscriptionOption,
} from "@revenuecat/purchases-capacitor";
import { RevenueCatUI } from "@revenuecat/purchases-capacitor-ui";

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
const TRADER_ENTITLEMENT_IDS = [
  "StrategyLabs Trader",
  "trader",
  "strategylabs_trader",
  "strategy_labs_trader",
] as const;
const AUTO_ENTITLEMENT_IDS = [
  "StrategyLabs Auto",
  "auto",
  "strategylabs_auto",
  "strategy_labs_auto",
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

function getBaseSubscriptionId(storeProductId: string): string {
  return storeProductId.split(":")[0] || storeProductId;
}

function getBasePlanId(storeProductId: string): string {
  return storeProductId.split(":")[1] || storeProductId;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
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

function findSubscriptionOptionForProduct(
  product: PurchasesStoreProduct,
  expectedProductId: string,
): SubscriptionOption | null {
  const matchingOptions = (product.subscriptionOptions ?? []).filter(
    (option) => option.storeProductId === expectedProductId,
  );

  return (
    matchingOptions.find((option) => option.freePhase !== null) ??
    matchingOptions.find((option) => !option.isBasePlan) ??
    matchingOptions.find((option) => option.isBasePlan) ??
    (product.defaultOption?.storeProductId === expectedProductId ? product.defaultOption : null)
  );
}

function productMatchesExpectedId(
  product: PurchasesStoreProduct,
  expectedProductId: string,
): boolean {
  return (
    product.identifier === expectedProductId ||
    findSubscriptionOptionForProduct(product, expectedProductId) !== null
  );
}

function packageMatchesExpectedId(
  pkg: PurchasesPackage,
  planId: PaidPlanId,
  billingPeriod: BillingPeriod,
  expectedProductId: string,
): boolean {
  const basePlanId = getBasePlanId(expectedProductId);
  const knownPackageIds = [
    expectedProductId,
    basePlanId,
    `${planId}-${billingPeriod}`,
    `${planId}_${billingPeriod}`,
    `${planId}.${billingPeriod}`,
  ];

  return (
    knownPackageIds.includes(pkg.identifier) ||
    productMatchesExpectedId(pkg.product, expectedProductId)
  );
}

export function tierFromCustomerInfo(customerInfo: CustomerInfo): "auto" | "trader" | "free" {
  if (hasAnyActiveEntitlement(customerInfo, AUTO_ENTITLEMENT_IDS)) return "auto";
  if (hasAnyActiveEntitlement(customerInfo, TRADER_ENTITLEMENT_IDS)) return "trader";
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

  return (
    availablePackages.find((pkg) =>
      packageMatchesExpectedId(pkg, planId, billingPeriod, expectedProductId),
    ) ??
    null
  );
}

async function fetchStoreProductsForPlan(expectedProductId: string): Promise<PurchasesStoreProduct[]> {
  const productIds = uniqueValues([
    expectedProductId,
    getBaseSubscriptionId(expectedProductId),
  ]);

  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: productIds,
      type: PRODUCT_CATEGORY.SUBSCRIPTION,
    });
    return products;
  } catch (error) {
    const baseSubscriptionId = getBaseSubscriptionId(expectedProductId);
    if (baseSubscriptionId === expectedProductId) throw error;

    console.warn(
      `[RevenueCat] Could not fetch ${expectedProductId}; retrying base subscription ${baseSubscriptionId}.`,
      error,
    );
    const { products } = await Purchases.getProducts({
      productIdentifiers: [baseSubscriptionId],
      type: PRODUCT_CATEGORY.SUBSCRIPTION,
    });
    return products;
  }
}

async function purchaseStoreProductForPlan(
  product: PurchasesStoreProduct,
  expectedProductId: string,
): Promise<CustomerInfo> {
  const subscriptionOption = findSubscriptionOptionForProduct(product, expectedProductId);

  if (subscriptionOption && Capacitor.getPlatform() === "android") {
    console.log(
      `[RevenueCat] Purchasing subscription option: ${subscriptionOption.id} (${subscriptionOption.storeProductId})`,
    );
    const { customerInfo } = await Purchases.purchaseSubscriptionOption({ subscriptionOption });
    return customerInfo;
  }

  console.log(`[RevenueCat] Purchasing store product: ${product.identifier}`);
  const { customerInfo } = await Purchases.purchaseStoreProduct({ product });
  return customerInfo;
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
    alert("In-App Purchases are only available inside the iOS & Android mobile apps. Please purchase on our web platform.");
    return false;
  }

  try {
    const expectedProductId = getExpectedProductId(planId, billingPeriod);
    if (!expectedProductId || !isPaidPlanId(planId)) {
      throw new Error(`Unknown subscription plan: ${planId}`);
    }

    console.log(`[RevenueCat] Direct purchase initiated for plan: ${planId} (${billingPeriod})`);
    let offerings: any = null;
    try {
      offerings = await Purchases.getOfferings();
    } catch (offeringError) {
      console.warn("[RevenueCat] getOfferings failed. Falling back to direct product lookup.", offeringError);
    }
    const current = offerings?.current;

    if (!current) {
      console.warn("[RevenueCat] No current offering found. Falling back to direct product lookup.");
    }

    const pkgToBuy = current
      ? findPackageForPlan(current.availablePackages, planId, billingPeriod)
      : null;

    if (!pkgToBuy) {
      console.warn(
        `[RevenueCat] No package found for ${expectedProductId}. Falling back to direct product lookup.`,
      );
      const products = await fetchStoreProductsForPlan(expectedProductId);
      const productToBuy =
        products.find((product) => productMatchesExpectedId(product, expectedProductId)) ?? null;

      if (!productToBuy) {
        throw new Error(
          `RevenueCat could not find ${expectedProductId}. Add it to the current offering, or confirm the Google Play base plan is active and attached to an entitlement.`,
        );
      }

      const customerInfo = await purchaseStoreProductForPlan(productToBuy, expectedProductId);
      return tierFromCustomerInfo(customerInfo) !== "free";
    }

    console.log(`[RevenueCat] Purchasing package: ${pkgToBuy.identifier} (${pkgToBuy.product.identifier})`);
    const subscriptionOption = findSubscriptionOptionForProduct(pkgToBuy.product, expectedProductId);
    const { customerInfo } =
      subscriptionOption && Capacitor.getPlatform() === "android"
        ? await Purchases.purchaseSubscriptionOption({ subscriptionOption })
        : await Purchases.purchasePackage({ aPackage: pkgToBuy });

    return tierFromCustomerInfo(customerInfo) !== "free";
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
