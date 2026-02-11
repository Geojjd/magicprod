// app/lib/shopifyPlans.ts
import type { PlanName } from "./plan";

export type ShopifyPlanKey = Exclude<PlanName, "free">; // "starter" | "pro"

export const SHOPIFY_PLANS: Record<
  ShopifyPlanKey,
  { variantId: string; sellingPlanId: string }
> = {
  starter: {
    variantId: process.env.SHOPIFY_STARTER_VARIANT_ID!,
    sellingPlanId: process.env.SHOPIFY_STARTER_SELLING_PLAN_ID!,
  },
  pro: {
    variantId: process.env.SHOPIFY_PRO_VARIANT_ID!,
    sellingPlanId: process.env.SHOPIFY_PRO_SELLING_PLAN_ID!,
  },
};

// helps webhook map variant -> plan
export const VARIANT_TO_PLAN: Record<string, ShopifyPlanKey> = {
  [process.env.SHOPIFY_STARTER_VARIANT_ID!]: "starter",
  [process.env.SHOPIFY_PRO_VARIANT_ID!]: "pro",
};