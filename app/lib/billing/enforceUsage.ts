import { getPlanForUser, countUsageThisMonth } from "@/app/lib/usage";
import { getSupabaseAdmin } from "@/app/lib/SupabaseAdmin";

const LIMITS = {
  free: { generation: 10, export: 5, audio_minutes: 15 },
  starter: { generation: 200, export: 50, audio_minutes: 300 },
  pro: { generation: 2000, export: 500, audio_minutes: 5000 },
} as const;

type PlanKey = keyof typeof LIMITS;
type EventType = keyof (typeof LIMITS)["free"];

export async function enforceUsage(args: {
  userId: string;
  eventType: EventType;
  qty?: number; // only used for audio_minutes
  requestId?: string;
}) {
  const { userId, eventType, requestId } = args;
  const qty = args.qty ?? 1;

  // qty rules
  if (eventType !== "audio_minutes" && qty !== 1) {
    throw new Error("qty is only supported for audio_minutes");
  }
  if (eventType === "audio_minutes" && qty <= 0) {
    throw new Error("qty must be > 0 for audio_minutes");
  }

  // plan gate (free if not active)
  const { plan, subActive } = await getPlanForUser(userId);
  const effectivePlan = (subActive ? plan : "free") as PlanKey;

  const limit = LIMITS[effectivePlan]?.[eventType] ?? LIMITS.free[eventType];
  const used = await countUsageThisMonth(userId, eventType);

  // for minutes we add qty, for others qty is 1 anyway
  if (used + qty > limit) {
    return {
      ok: false as const,
      plan: effectivePlan,
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  }

  // log usage
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("usage_events").insert({
    user_id: userId,
    event_type: eventType,
    qty,
    request_id: requestId ?? null,
    created_at: new Date().toISOString(),
  });

  return {
    ok: true as const,
    plan: effectivePlan,
    used: used + qty,
    limit,
    remaining: Math.max(0, limit - (used + qty)),
  };
}