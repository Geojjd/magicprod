import { NextRequest, NextResponse } from 'next/server';

export const runtime = "nodejs";

const backend = process.env.NEXT_PUBLIC_API_BASE;


export async function POST(req: Request) {

    if(!backend) {
        return NextResponse.json(
            { error: "NEXT_PUBLIC_API_BASE is missing"},
            { status: 500}
        );
    }

    const body = await req.formData();

    const res = await fetch(`${backend}/ai-generate`, {
        method: 'POST',
        body
    });

    const text = await res.text();

    return new NextResponse(text, {
        status: res.status,
        headers: {
            "Content-Type": res.headers.get("content-type") || "application/json",
        },
        });
    }