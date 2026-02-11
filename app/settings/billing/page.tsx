import Link from "next/link";
import { createSupabaseServerClient } from "@/app/lib/supabaseServer";
import { getPlanForUser } from "@/app/lib/billing/getPlanForUser";

export default async function BillingSettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px" }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Billing</h1>
        <p style={{ opacity: 0.8, marginTop: 10 }}>You need to sign in.</p>
        <Link href="/login?next=/settings/billing">Go to login</Link>
      </main>
    );
  }

  const p = await getPlanForUser(supabase, data.user.id);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 20px" }}>
      <h1 style={{ fontSize: 34, margin: 0 }}>Billing</h1>
      <p style={{ opacity: 0.85, marginTop: 10 }}>
        Plan: <b>{p.plan.toUpperCase()}</b> ({p.status})
      </p>
      <p style={{ opacity: 0.75 }}>
        Current period ends: <b>{p.currentPeriodEnd ? new Date(p.currentPeriodEnd).toLocaleString() : "—"}</b>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <Link
          href="/pricing"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
          }}
        >
          Change plan
        </Link>

        <form action="/api/billing/cancel" method="post">
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "transparent",
            }}
          >
            Cancel in-app access
          </button>
        </form>

        {/* Optional: point users to Shopify account page if you have one */}
        {process.env.SHOPIFY_ACCOUNT_URL ? (
          <a
            href={process.env.SHOPIFY_ACCOUNT_URL}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
            }}
          >
            Manage in Shopify
          </a>
        ) : null}
      </div>

      <p style={{ opacity: 0.7, marginTop: 18 }}>
        Note: “Cancel in-app access” only updates Supabase. If you want a full Shopify cancellation (stop billing), we’ll add
        Shopify Admin API next.
      </p>
    </main>
  );
}