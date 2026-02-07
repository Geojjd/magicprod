import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";

type RequireUserResult =
  | { userId: string; res: null }
  | { userId: null; res: Response };

export async function requireUserId(): Promise<RequireUserResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return {
      userId: null,
      res: NextResponse.json({ error: "Not logged in" }, { status: 401 }),
    };
  }

  return {
    userId: data.user.id,
    res: null,
  };
}

export function errorJson(err: any) {
  const msg = err?.message ?? "Something went wrong";

  const isGate =
    msg.toLowerCase().includes("limit") ||
    msg.toLowerCase().includes("upgrade") ||
    msg.toLowerCase().includes("not logged") ||
    msg.toLowerCase().includes("unauthorized");

  return NextResponse.json(
    { error: msg },
    { status: isGate ? 403 : 500 }
  );
}