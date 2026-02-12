export type PlanName = "starter" | "pro";

export const SHOPIFY_PLANS: Record<
  PlanName,
  {
    variantId: string; // Shopify variant id (numeric as string)
    sellingPlanId?: string; // optional (subscriptions)
  }
> = {
  starter: {
    variantId: "YOUR_STARTER_VARIANT_ID",
    sellingPlanId: "YOUR_STARTER_SELLING_PLAN_ID", // optional
  },
  pro: {
    variantId: "YOUR_PRO_VARIANT_ID",
    sellingPlanId: "YOUR_PRO_SELLING_PLAN_ID", // optional
  },
};