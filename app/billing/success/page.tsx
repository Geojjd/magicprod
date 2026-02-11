"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MePlan = {
  loggedIn: boolean;
  user: { id: string; email?: string | null } | null;
  plan: "free" | "starter" | "pro";
  status: string;
  currentPeriodEnd: string | null;
  isActive: boolean;
};

export default function BillingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => sp.get("next") || "/app", [sp]);
  const [msg, setMsg] = useState("Activating your subscription…");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setErr(null);

      // Poll for up to ~12 seconds to let webhook land
      const start = Date.now();
      while (Date.now() - start < 12_000) {
        const res = await fetch("/api/me/plan", { cache: "no-store" });
        const data = (await res.json()) as MePlan;

        if (!alive) return;

        if (!data.loggedIn) {
          setMsg("You’re not signed in. Redirecting to login…");
          router.replace(`/login?next=${encodeURIComponent("/billing/success?next=" + encodeURIComponent(next))}`);
          return;
        }

        // Active plan -> proceed
        if (data.isActive && data.plan !== "free") {
          setMsg(`✅ Subscription active: ${data.plan.toUpperCase()}. Redirecting…`);
          setTimeout(() => router.replace(next), 700);
          return;
        }

        // Not active yet
        setMsg("Activating your subscription… (waiting for Shopify confirmation)");
        await new Promise((r) => setTimeout(r, 1200));
      }

      // Timeout fallback (webhook might be delayed)
      setMsg("We’re still confirming your subscription. You can continue to the app, and it will unlock when confirmed.");
    }

    run().catch((e: any) => {
      setErr(e?.message || "Something went wrong");
    });

    return () => {
      alive = false;
    };
  }, [router, next]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 20px" }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Success</h1>
      <p style={{ opacity: 0.85, marginTop: 10 }}>{msg}</p>
      {err ? <p style={{ color: "tomato" }}>{err}</p> : null}

      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "transparent" }}
        >
          Refresh
        </button>
        <button
          onClick={() => router.replace(next)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "black", color: "white" }}
        >
          Continue
        </button>
      </div>
    </main>
  );
}