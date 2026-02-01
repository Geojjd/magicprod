import { NextResponse } from "next/server";

const backend = process.env.backend_URL!;

export async function POST(req: Request) {
    try {
        const { plan } = await req.json();

        const res = await fetch('${backend}/stripe/checkout', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify ({plan }),

        });

        const data = await res.json();
        return NextResponse.json(data, {status: res.status});
    }   catch (err: any) {
        return NextResponse.json({ error: err.message || "Checkout failed"}, {status: 500});
    }
    }
