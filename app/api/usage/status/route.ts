import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getPlanForUser } from "@/app/lib/usage";
import { countUsageThisMonth } from "@/app/lib/usage";

const LIMITS = {
  free:    { generation: 10,  export: 5,   audio_minutes: 15 },
  starter: { generation: 200, export: 50,  audio_minutes: 300 },
  pro:     { generation: 2000,export: 500, audio_minutes: 5000 },
} as const;

type PlanKey = keyof typeof LIMITS;
type EventType = keyof (typeof LIMITS)["free"];

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = data.user.id;

  const { plan, subActive } = await getPlanForUser(userId);
  const effectivePlan = (subActive ? plan : "free") as PlanKey;

  const types: EventType[] = ["generation", "export", "audio_minutes"];

  const usedEntries = await Promise.all(
    types.map(async (t) => [t, await countUsageThisMonth(userId, t)] as const)
  );

  const used = Object.fromEntries(usedEntries) as Record<EventType, number>;  
  const limits = LIMITS[effectivePlan] ?? LIMITS.free;

  const remaining = {
    generation: Math.max(0, limits.generation - used.generation),
    export: Math.max(0, limits.export - used.export),
    audio_minutes: Math.max(0, limits.audio_minutes - used.audio_minutes),
  };

  return NextResponse.json({
    plan: effectivePlan,
    subActive,
    used,
    limits,
    remaining,
  });
}