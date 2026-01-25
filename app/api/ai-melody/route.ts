import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.formData();

  const res = await fetch(
    "https://magicprod-backend-production.up.railway.app/ai-melody",
    {
      method: "POST",
      body,
    }
  );

  const data = await res.blob();
  return new NextResponse(data, { status: res.status });
}

