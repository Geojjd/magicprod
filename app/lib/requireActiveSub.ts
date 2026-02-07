import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export async function requireActiveSub() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard");

    const { data: sub} = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .order("current_period_end", { ascending: false})
        .limit(1)
        .maybeSingle();
    
        const ok = sub && (sub.status === "active" || sub.status === "trialing");
        if (!ok) redirect("/pricing");

        return { user, sub}; 


}