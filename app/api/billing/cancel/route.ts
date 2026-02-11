import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // NOTE: This only cancels access in YOUR app (Supabase).
  // If you also want to cancel on Shopify, we add Admin API later.
  const { error: upErr } = await supabase
    .from("user_plans")
    .update({ status: "canceled" })
    .eq("user_id", data.user.id);

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}