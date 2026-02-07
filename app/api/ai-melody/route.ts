import { NextResponse } from "next/server";
import { requireUserId, errorJson } from "@/app/api/_lib/apiAuth";
import { enforceUsage } from "@/app/lib/billing/enforceUsage";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.res) return auth.res;
  const userId = auth.userId;

  try {
    const body = await req.json();

    const result = { ok: true, type: "melody", input: body };

    await enforceUsage({
      userId,
      eventType: "generation",
      requestId: body?.requestId ?? crypto.randomUUID(),
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return errorJson(err);
  }
}