import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanName = "free" | "starter" | "pro";
export type PlanStatus = "active" | "inactive" | "past_due" | "canceled";

export type UserPlanRow = {
  user_id: string;
  plan: PlanName;
  status: PlanStatus;
  current_period_end: string | null; // timestamptz ISO
  shopify_customer_id?: string | null;
  shopify_subscription_id?: string | null;
  updated_at?: string | null;
};

export type EffectivePlanResult = {
  plan: PlanName;
  status: PlanStatus;
  currentPeriodEnd: string | null;
  isActive: boolean;
};

export function computeEffectivePlan(row: UserPlanRow | null): EffectivePlanResult {
  if (!row) {
    return { plan: "free", status: "inactive", currentPeriodEnd: null, isActive: false };
  }

  const endOk =
    row.current_period_end &&
    !Number.isNaN(Date.parse(row.current_period_end)) &&
    Date.parse(row.current_period_end) > Date.now();

  const isActive = row.status === "active" && !!endOk;

  return {
    plan: isActive ? row.plan : "free",
    status: row.status ?? "inactive",
    currentPeriodEnd: row.current_period_end ?? null,
    isActive,
  };
}

export async function getPlanForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<EffectivePlanResult & { row: UserPlanRow | null }> {
  const { data, error } = await supabase
    .from("user_plans")
    .select("user_id, plan, status, current_period_end, shopify_customer_id, shopify_subscription_id, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // fail closed -> free
    return { ...computeEffectivePlan(null), row: null };
  }

  const row = (data as UserPlanRow | null) ?? null;
  return { ...computeEffectivePlan(row), row };
}