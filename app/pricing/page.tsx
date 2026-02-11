"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Plan = "starter" | "pro";

type MePlan = {
  loggedIn: boolean;
  user: { id: string; email?: string | null } | null;
  plan: "free" | "starter" | "pro";
  status: string;
  currentPeriodEnd: string | null;
  isActive: boolean;
};

export default function PricingPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [me, setMe] = useState<MePlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autobuy = useMemo(() => {
    const v = sp.get("autobuy");
    return v === "starter" || v === "pro" ? (v as Plan) : null;
  }, [sp]);

  // 1) Load session/plan once (prevents UI flicker)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/me/plan", { cache: "no-store" });
        const data = (await res.json()) as MePlan;
        if (!alive) return;
        setMe(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load session");
      } finally {
        if (!alive) return;
        setBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2) If we returned from login with ?autobuy=starter|pro, auto-start checkout once
  useEffect(() => {
    if (booting) return;
    if (!autobuy) return;

    // Must be logged in to continue
    if (!me?.loggedIn) return;

    // If already subscribed, go to app (or show message)
    if (me.isActive && me.plan !== "free") {
      router.replace("/app");
      return;
    }

    // Start checkout automatically
    startCheckout(autobuy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting, autobuy, me?.loggedIn]);

  async function startCheckout(plan: Plan) {
    setError(null);
    setLoadingPlan(plan);

    try {
      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      // Not logged in -> send to login and remember what they clicked
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/pricing?autobuy=${plan}`)}`);
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      // Shopify checkout redirect
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Checkout failed");
      setLoadingPlan(null);
    }
  }

  const alreadyPro = me?.loggedIn && me?.isActive && me?.plan === "pro";
  const alreadyStarter = me?.loggedIn && me?.isActive && me?.plan === "starter";

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 44, margin: 0 }}>Pricing</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>Choose a plan. You can cancel anytime.</p>

      {booting ? (
        <div style={{ marginTop: 18, opacity: 0.75 }}>Loading…</div>
      ) : (
        <>
          <div style={{ marginTop: 14, opacity: 0.85, fontSize: 14 }}>
            {me?.loggedIn ? (
              <>
                Signed in as <b>{me.user?.email || "user"}</b> — Current plan:{" "}
                <b>{(me.plan || "free").toUpperCase()}</b>
              </>
            ) : (
              <>
                You are <b>not signed in</b>. If you click a plan, you’ll be sent to login, then returned here automatically.
              </>
            )}
          </div>

          {error ? (
            <div style={{ marginTop: 14, color: "tomato" }}>
              {error}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <PlanCard
              name="Starter"
              price="£9/mo"
              bullets={["Core AI tools", "Export stems", "Basic limits"]}
              cta={alreadyStarter ? "Current plan" : "Get Starter"}
              disabled={alreadyStarter || alreadyPro}
              loading={loadingPlan === "starter"}
              onClick={() => startCheckout("starter")}
            />

            <PlanCard
              name="Pro"
              price="£29/mo"
              bullets={["Higher limits", "Priority processing", "Full toolset"]}
              cta={alreadyPro ? "Current plan" : "Get Pro"}
              disabled={alreadyPro}
              loading={loadingPlan === "pro"}
              onClick={() => startCheckout("pro")}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "transparent",
              }}
              onClick={() => router.push("/app")}
            >
              Back to App
            </button>

            <button
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "transparent",
              }}
              onClick={() => router.push("/settings/billing")}
            >
              Billing settings
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function PlanCard(props: {
  name: string;
  price: string;
  bullets: string[];
  cta: string;
  loading: boolean;
  disabled?: boolean;
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
        disabled={props.loading || props.disabled}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #ddd",
          background: props.disabled ? "#222" : "black",
          color: "white",
          fontWeight: 800,
          opacity: props.loading ? 0.75 : 1,
          cursor: props.disabled ? "not-allowed" : "pointer",
        }}
      >
        {props.loading ? "Redirecting…" : props.cta}
      </button>

      {props.disabled ? (
        <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
          {props.name === "Starter" ? "You already have an active plan." : "You already have Pro."}
        </div>
      ) : null}
    </div>
  );
}