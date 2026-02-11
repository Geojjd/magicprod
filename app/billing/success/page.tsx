export const dynamic = "force-dynamic";

"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const t = setTimeout(() => router.push("/app"), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Subscription Successful 🎉</h1>
      <p style={{ opacity: 0.8 }}>Order ID: {orderId ?? "—"}</p>
      <p style={{ marginTop: 10 }}>Redirecting you to your dashboard…</p>
    </main>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 40 }}>
          <h1>Finishing up…</h1>
          <p style={{ opacity: 0.8 }}>Loading your order…</p>
        </main>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}