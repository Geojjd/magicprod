import { NextResponse } from "next/server";
import { requireUserId, errorJson } from "@/app/api/_lib/apiAuth";
import { enforceUsage } from "@/app/lib/billing/enforceUsage";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.res) return auth.res;
  const userId = auth.userId;

  try {
    const body = await req.json();

    // ✅ your real vocal logic here
    // Ideally return durationSeconds or minutes from your backend
    const result = {
      ok: true,
      type: "vocal",
      input: body,
      // minutes: 2.5, // if you can compute it, put it here
    };

    const requestId = body?.requestId ?? crypto.randomUUID();

    // ✅ charge 1 generation AFTER success
    await enforceUsage({
      userId,
      eventType: "generation",
      requestId: `${requestId}:gen`,
    });

    // ✅ charge minutes if available (best: compute from output, not user input)
    const minutes =
      typeof (result as any).minutes === "number"
        ? Number((result as any).minutes)
        : typeof body?.minutes === "number"
          ? Number(body.minutes)
          : 0;

    if (minutes > 0) {
      await enforceUsage({
        userId,
        eventType: "audio_minutes",
        qty: minutes,
        requestId: `${requestId}:min`,
      });
    }

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return errorJson(err);
  }
}