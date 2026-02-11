import AuthBanner from "@/app/components/AuthBanner";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getPlanForUser } from "@/app/lib/billing/getPlanForUser";

export default async function AuthBannerServer() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return (
      <AuthBanner
        initial={{
          loggedIn: false,
          user: null,
          plan: "free",
          status: "inactive",
          currentPeriodEnd: null,
          isActive: false,
        }}
      />
    );
  }

  const planInfo = await getPlanForUser(supabase, data.user.id);

  return (
    <AuthBanner
      initial={{
        loggedIn: true,
        user: { id: data.user.id, email: data.user.email },
        plan: planInfo.plan,
        status: planInfo.status,
        currentPeriodEnd: planInfo.currentPeriodEnd,
        isActive: planInfo.isActive,
      }}
    />
  );
}