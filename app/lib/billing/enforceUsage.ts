import { getPlanForUser, countUsageThisMonth } from "../usage";
import { getSupabaseAdmin } from "../SupabaseAdmin";
import { supabase } from "../supabaseClient";


const LIMITS = {
    free: { generation: 10, export: 5,  audio_minutes:15},
    starter: {generation: 200, export: 50, audio_minutes: 300},
    pro: {generation: 2000, export:500, audio_minutes: 5000}
};

type PlanKey = keyof typeof LIMITS;
type EventType = keyof (typeof LIMITS) ["free"];


export async function enforceUsage(args: {
    userId: string;
    eventType: EventType;
    qty?: number;
    requestId?: string;
}) {
    const { userId, eventType, requestId } = args;
    const qty = args.qty ?? 1;

    if ( eventType !== "audio_minutes" && qty !== 1) {
        throw new Error("qty is only supported for audio_minutes");
    }

    if (eventType === "audio_minutes" && qty <= 0) {
        throw new Error("qty must be > 0 for audio_minutes");
    }

    const { plan, subActive} = await getPlanForUser(userId);
    const effectivePlan = (subActive ? plan : "free") as PlanKey;

    const limit = LIMITS[effectivePlan]?.[eventType] ?? LIMITS.free[eventType];
    const used = await countUsageThisMonth(userId, eventType);

    if (used + qty > limit) {
        return { ok: false as const, plan: effectivePlan, used, limit, remaining: Math.max(0, limit -used) };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("usage_events").insert({
        user_id: userId,
        event_type: eventType,
        qty,
        request_id: requestId ?? null,
        creatyed_at: new Date().toISOString(),
    });

    if(error && !String(error.message || "").includes("duplicate key")) throw error;

    return { ok: true as const, plan:effectivePlan, used: used + qty, limit, remaining: limit - (used + qty)}
}