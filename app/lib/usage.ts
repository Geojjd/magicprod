import { getSupabaseAdmin } from "./SupabaseAdmin";

export async function getPlanForUser(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("user_plans")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return { plan: "free", subActive: false };
  }

  const subActive =
    data.status === "active" &&
    (!data.current_period_end ||
      new Date(data.current_period_end) > new Date());

  return {
    plan: data.plan ?? "free",
    subActive,
  };
}

export async function countUsageThisMonth(
  userId: string,
  eventType: string
) {
  const supabase = getSupabaseAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("usage_events")
    .select("qty")
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", startOfMonth.toISOString());

  if (!data) return 0;

  return data.reduce((total, row) => total + (row.qty ?? 1), 0);
}