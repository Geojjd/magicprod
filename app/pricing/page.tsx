"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Plan = "starter" | "pro";

/* ---------------- INNER COMPONENT ---------------- */

function PricingInner() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const startCheckout = async (plan: Plan) => {
    setLoading(plan);

    try {
      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        const next = `/pricing?autocheckout=1&plan=${plan}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
      setLoading(null);
    }
  };

  /* -------- AUTO RESUME AFTER LOGIN -------- */

  useEffect(() => {
    const auto = searchParams.get("autocheckout");
    const plan = searchParams.get("plan") as Plan | null;

    if (auto === "1" && (plan === "starter" || plan === "pro")) {
      startCheckout(plan);
    }
    // eslint-disable-next-line
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  };

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 44, margin: 0 }}>Pricing</h1>
          <p style={{ opacity: 0.8, marginTop: 10 }}>
            Choose a plan. You can cancel anytime.
          </p>
        </div>

        <div>
          {email ? (
            <>
              <div style={{ fontSize: 14 }}>
                Signed in as <b>{email}</b>
              </div>
              <button
                onClick={logout}
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #333",
                  background: "transparent",
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                router.push("/login?next=" + encodeURIComponent("/pricing"))
              }
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
              }}
            >
              Log in
            </button>
          )}
        </div>
      </div>

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
    </main>
  );
}

/* ---------------- OUTER SUSPENSE WRAPPER ---------------- */

export default function PricingPage() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}

/* ---------------- PLAN CARD ---------------- */

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
      <div style={{ fontSize: 34, marginTop: 10, fontWeight: 900 }}>
        {props.price}
      </div>

      <ul style={{ marginTop: 14, opacity: 0.9 }}>
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
          border: "1px solid #444",
          background: "black",
          color: "white",
          fontWeight: 800,
          opacity: props.loading ? 0.7 : 1,
          cursor: "pointer",
        }}
      >
        {props.loading ? "Redirecting..." : props.cta}
      </button>
    </div>
  );
}