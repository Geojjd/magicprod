import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";
import { PLANS, type PlanName } from "./plan";
import { PRICE_TO_PLAN } from "./stripePlans";

/* ---------------------------------- utils --------------------------------- */
function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

/* --------------------------- get plan for user ----------------------------- */
export async function getPlanForUser(
  userId: string
): Promise<{ plan: PlanName; subActive: boolean }> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status, price_id, current_period_end")
    .eq("user_id", userId)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const active =
    !!sub && (sub.status === "active" || sub.status === "trialing");

  if (!active) {
    return { plan: "free", subActive: false };
  }

  const plan =
    (sub.price_id && PRICE_TO_PLAN[sub.price_id]) ?? "starter";

  return { plan, subActive: true };
}

/* ------------------------- count monthly usage ------------------------------ */
export async function countUsageThisMonth(
  userId: string,
  eventType: string
) {
  const supabaseAdmin = getSupabaseAdmin();
  const start = monthStart();

  const { count, error } = await supabaseAdmin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", start);

  if (error) throw error;
  return count ?? 0;
}

/* --------------------------- feature gate logic ----------------------------- */
export async function assertCanUse(
  eventType: "export" | "stem_export" | "ai_generate"
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const { plan } = await getPlanForUser(user.id);
  const limits = PLANS[plan];

  // Stem export
  if (eventType === "stem_export" && !limits.stemExportAllowed) {
    throw new Error("Upgrade required: Stem export is Pro only.");
  }

  // Regular export
  if (eventType === "export") {
    if (limits.exportsPerMonth === 0) {
      throw new Error("No exports on this plan.");
    }
    if (limits.exportsPerMonth !== -1) {
      const used = await countUsageThisMonth(user.id, "export");
      if (used >= limits.exportsPerMonth) {
        throw new Error("Monthly export limit reached.");
      }
    }
  }

  // AI generate
  if (eventType === "ai_generate") {
    if (limits.aiGenerationsPerMonth === 0) {
      throw new Error("No AI generations on this plan.");
    }
    if (limits.aiGenerationsPerMonth !== -1) {
      const used = await countUsageThisMonth(user.id, "ai_generate");
      if (used >= limits.aiGenerationsPerMonth) {
        throw new Error("Monthly AI limit reached.");
      }
    }
  }

  return { user, plan };
}

/* ------------------------------ log usage ---------------------------------- */
export async function logUsage(
  userId: string,
  eventType: string,
  units = 1
) {
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("usage_events")
    .insert({
      user_id: userId,
      event_type: eventType,
      units,
    });

  if (error) throw error;
}