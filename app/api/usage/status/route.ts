import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";
import type { PlanName } from "@/app/lib/plan";

/** helper: start of current month (UTC) */
function monthStart(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
}

/**
 * Return the user's plan + whether they have an active subscription.
 * Reads from `user_plans` which your dashboard uses.
 */
export async function getPlanForUser(userId: string): Promise<{
  plan: PlanName;
  subActive: boolean;
}> {
  const supabase = getSupabaseAdmin();

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("plan,status,current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const plan = (planRow?.plan as PlanName) ?? "free";

  const status = (planRow?.status ?? "").toLowerCase();
  const periodEnd = planRow?.current_period_end ? new Date(planRow.current_period_end) : null;

  // consider active if status active/trialing and not past end date (if present)
  const subActive =
    (status === "active" || status === "trialing") &&
    (!periodEnd || periodEnd.getTime() > Date.now());

  return { plan, subActive };
}

/** ✅ THIS is what your build is missing */
export async function countUsageThisMonth(userId: string, eventType: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const start = monthStart();

  const { count } = await supabaseAdmin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", start.toISOString());

  return count ?? 0;
}

/** optional helper if you want all event totals in one call */
export async function getUsedThisMonth(userId: string) {
  const types = ["generation", "export", "audio_minutes"] as const;

  const entries = await Promise.all(
    types.map(async (t) => [t, await countUsageThisMonth(userId, t)] as const)
  );

  return Object.fromEntries(entries) as Record<(typeof types)[number], number>;
}

/** log usage event */
export async function logUsage(userId: string, eventType: string, qty = 1, requestId?: string) {
  const supabaseAdmin = getSupabaseAdmin();

  await supabaseAdmin.from("usage_events").insert({
    user_id: userId,
    event_type: eventType,
    qty,
    request_id: requestId ?? null,
    created_at: new Date().toISOString(),
  });
}