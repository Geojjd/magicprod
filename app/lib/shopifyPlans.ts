export type PlanName = "starter" | "pro";

export const SHOPIFY_PLANS: Record<
  PlanName,
  { variantId: string; sellingPlanId: string }
> = {
  starter: {
    variantId: "SHOPIFY_STARTER_VARIANT_ID",
    sellingPlanId: "SHOPIFY_STARTER_SELLING_PLAN_ID",
  },
  pro: {
    variantId: "SHOPIFY_PRO_VARIANT_ID",
    sellingPlanId: "SHOPIFY_PRO_SELLING_PLAN_ID",
  },
};

// 🔥 THIS is what your webhook needs
export const PLAN_BY_VARIANT_ID: Record<string, PlanName> = {
  [SHOPIFY_PLANS.starter.variantId]: "starter",
  [SHOPIFY_PLANS.pro.variantId]: "pro",
};