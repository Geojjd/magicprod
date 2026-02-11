export type PlanName = "starter" | "pro";

export const SHOPIFY_PLANS: Record<
  PlanName,
  { variantId: string; sellingPlanId: string; label: string }
> = {
  starter: {
    variantId: process.env.SHOPIFY_STARTER_VARIANT_ID!,
    sellingPlanId: process.env.SHOPIFY_STARTER_SELLING_PLAN_ID!,
    label: "Starter",
  },
  pro: {
    variantId: process.env.SHOPIFY_PRO_VARIANT_ID!,
    sellingPlanId: process.env.SHOPIFY_PRO_SELLING_PLAN_ID!,
    label: "Pro",
  },
};

export function assertShopifyPlansConfigured() {
  for (const [k, v] of Object.entries(SHOPIFY_PLANS)) {
    if (!v.variantId || !v.sellingPlanId) {
      throw new Error(`Missing Shopify plan env vars for: ${k}`);
    }
  }
}