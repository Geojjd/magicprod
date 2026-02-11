import type { PlanName } from "./plan";
import { getSupabaseAdmin } from "./SupabaseAdmin";

export async function getPlanForUser(userId: string): Promise<{ plan: PlanName; subActive: boolean }> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: row } = await supabaseAdmin
    .from("user_plans")
    .select("plan,status,current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const plan = (row?.plan as PlanName) ?? "free";
  const status = (row?.status ?? "").toString().toLowerCase();
  const end = row?.current_period_end ? new Date(row.current_period_end).getTime() : null;

  const activeStatus = status === "active" || status === "trialing";
  const notExpired = end == null ? true : end > Date.now();

  const subActive = activeStatus && notExpired;

  return { plan: subActive ? plan : "free", subActive };
}