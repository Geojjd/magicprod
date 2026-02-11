import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getPlanForUser } from "@/app/lib/billing/getPlanForUser";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({
      loggedIn: false,
      user: null,
      plan: "free",
      status: "inactive",
      currentPeriodEnd: null,
      isActive: false,
    });
  }

  const user = data.user;
  const planInfo = await getPlanForUser(supabase, user.id);

  return NextResponse.json({
    loggedIn: true,
    user: { id: user.id, email: user.email },
    plan: planInfo.plan,
    status: planInfo.status,
    currentPeriodEnd: planInfo.currentPeriodEnd,
    isActive: planInfo.isActive,
  });
}