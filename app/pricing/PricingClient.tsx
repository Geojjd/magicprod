"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Plan = "starter" | "pro";

export default function PricingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");

  const [loading, setLoading] = useState<Plan | null>(null);

  const startCheckout = async (plan: Plan) => {
    setLoading(plan);

    try {
      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });

      if (res.status === 401) {
        router.push(`/login?next=/pricing`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
      setLoading(null);
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 44, margin: 0 }}>Pricing</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Choose a plan. You can cancel anytime.
      </p>

      {msg && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #333", borderRadius: 12 }}>
          {msg}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 22,
        }}
      >
        <PlanCard
          name="Starter"
          price="£9/mo"
          bullets={["Core AI tools", "Export stems", "Basic limits"]}
          cta="Get Starter"
          loading={loading === "starter"}
          onClick={() => startCheckout("starter")}
        />

        <PlanCard
          name="Pro"
          price="£29/mo"
          bullets={["Higher limits", "Priority processing", "Full toolset"]}
          cta="Get Pro"
          loading={loading === "pro"}
          onClick={() => startCheckout("pro")}
        />
      </div>

      <button
        style={{
          marginTop: 28,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #333",
          background: "transparent",
          cursor: "pointer",
        }}
        onClick={() => router.push("/app")}
      >
        Back to App
      </button>
    </main>
  );
}

function PlanCard(props: {
  name: string;
  price: string;
  bullets: string[];
  cta: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 16, padding: 18 }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{props.name}</div>
      <div style={{ fontSize: 34, marginTop: 10, fontWeight: 900 }}>{props.price}</div>

      <ul style={{ marginTop: 14, opacity: 0.85 }}>
        {props.bullets.map((b) => (
          <li key={b} style={{ marginTop: 6 }}>
            {b}
          </li>
        ))}
      </ul>

      <button
        onClick={props.onClick}
        disabled={props.loading}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #333",
          background: "black",
          color: "white",
          fontWeight: 800,
          cursor: "pointer",
          opacity: props.loading ? 0.7 : 1,
        }}
      >
        {props.loading ? "Redirecting..." : props.cta}
      </button>
    </div>
  );
}