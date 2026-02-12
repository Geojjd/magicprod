"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Plan = "starter" | "pro";

export default function PricingClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const planFromQuery = (sp.get("plan") as Plan | null) ?? null;
  const [loading, setLoading] = useState<Plan | null>(null);

  // Prevent repeated auto-checkout loops
  const autoRanRef = useRef(false);

  const nextAfterLogin = useMemo(() => {
    // Preserve plan in URL so we can auto-start after login
    return planFromQuery ? `/pricing?plan=${planFromQuery}` : "/pricing";
  }, [planFromQuery]);

  async function startCheckout(plan: Plan) {
    setLoading(plan);

    try {
      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        // Not logged in → go login and come back with plan
        router.push(`/login?next=${encodeURIComponent(`/pricing?plan=${plan}`)}`);
        return;
      }

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout failed");
      }

      // Go to Shopify checkout
      window.location.href = data.url as string;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
      setLoading(null);
    }
  }

  // Auto-start checkout after login if URL has ?plan=...
  useEffect(() => {
    if (!planFromQuery) return;
    if (autoRanRef.current) return;

    autoRanRef.current = true;
    startCheckout(planFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planFromQuery]);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 44, margin: 0 }}>Pricing</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Choose a plan. You can cancel anytime.
      </p>

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
          border: "1px solid #ddd",
          background: "transparent",
        }}
        onClick={() => router.push("/app")}
      >
        Back to App
      </button>

      {/* Optional: show a subtle message after login */}
      <p style={{ marginTop: 14, opacity: 0.7 }}>
        {planFromQuery
          ? `Continuing checkout for: ${planFromQuery}…`
          : `Tip: if you’re not logged in, you’ll be asked to sign in first.`}
      </p>
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
    <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 18 }}>
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
          border: "none",
          background: "black",
          color: "white",
          fontWeight: 800,
          opacity: props.loading ? 0.7 : 1,
          cursor: "pointer",
        }}
      >
        {props.loading ? "Redirecting…" : props.cta}
      </button>
    </div>
  );
}