"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // optional: read whatever query params you add
  const plan = sp.get("plan");

  useEffect(() => {
    // You can route them to dashboard/settings after a short delay
    const t = setTimeout(() => {
      router.push("/app");
      router.refresh();
    }, 1200);

    return () => clearTimeout(t);
  }, [router]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ margin: 0, fontSize: 40 }}>Payment received ✅</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        {plan ? `Plan: ${plan}. ` : ""}
        We’re activating your account now…
      </p>
      <p style={{ opacity: 0.7, marginTop: 18 }}>Taking you back to the app…</p>
    </main>
  );
}