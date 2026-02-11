"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic"; // avoids static prerender issues

type Plan = "starter" | "pro";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<Plan | null>(null);

  // ✅ auth state (prevents flicker)
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // ✅ load user once + listen for auth changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setAuthReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const startCheckout = async (plan: "starter" | "pro") => {
  setLoading(plan);

  try {
    const res = await fetch("/api/shopify/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
      credentials: "include"
    });

    if (res.status === 401) {
      router.push(`/login?next=/pricing`);
      return;
    }

    const data = await res.json();

    if (!res.ok) throw new Error(data?.error || "Checkout failed");

    window.location.href = data.url;
  } catch (e: any) {
    alert(e.message || "Checkout failed");
    setLoading(null);
  }
};

  // ✅ auto-checkout after login, but ONLY after auth is ready
  // ✅ also clears params first so it never loops
  useEffect(() => {
    if (!authReady) return;

    const auto = searchParams.get("autocheckout");
    const plan = searchParams.get("plan") as Plan | null;

    if (auto === "1" && (plan === "starter" || plan === "pro")) {
      // IMPORTANT: clear params so it cannot re-trigger and bounce
      router.replace("/pricing");
      startCheckout(plan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 44, margin: 0 }}>Pricing</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Choose a plan. You can cancel anytime.
      </p>

      {/* ✅ Auth banner to show user status (no flicker) */}
      <div
        style={{
          marginTop: 18,
          padding: 14,
          border: "1px solid #222",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {!authReady ? (
          <div style={{ fontSize: 14, opacity: 0.8 }}>Checking login…</div>
        ) : email ? (
          <>
            <div style={{ fontSize: 14 }}>
              Signed in as <b>{email}</b>
            </div>
            <button
              onClick={logout}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              You’re not signed in.
            </div>
            <button
              onClick={() =>
                router.push(
                  "/login?next=" + encodeURIComponent("/pricing")
                )
              }
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "white",
                color: "black",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Log in
            </button>
          </>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 18,
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
    <div style={{ border: "1px solid #222", borderRadius: 16, padding: 18 }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{props.name}</div>
      <div style={{ fontSize: 34, marginTop: 10, fontWeight: 900 }}>
        {props.price}
      </div>

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
          background: "black",
          color: "white",
          fontWeight: 800,
          cursor: props.loading ? "default" : "pointer",
          opacity: props.loading ? 0.7 : 1,
          border: "none",
        }}
      >
        {props.loading ? "Redirecting…" : props.cta}
      </button>
    </div>
  );
}