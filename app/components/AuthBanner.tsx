"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

type MePlan = {
  loggedIn: boolean;
  user: { id: string; email?: string | null } | null;
  plan: "free" | "starter" | "pro";
  status: string;
  currentPeriodEnd: string | null;
  isActive: boolean;
};

export default function AuthBanner(props: { initial?: MePlan | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<MePlan | null>(props.initial ?? null);
  const [loading, setLoading] = useState(!props.initial);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/me/plan", { cache: "no-store" });
      const data = (await res.json()) as MePlan;
      setMe(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // If we already have initial server data, no need to refetch immediately.
    if (!props.initial) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  const loggedIn = !!me?.loggedIn;
  const email = me?.user?.email || "Signed in";
  const plan = me?.plan ?? "free";

  return (
    <div
      style={{
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>MagicProd</div>

          {loading ? (
            <span style={{ opacity: 0.7, fontSize: 13 }}>Checking session…</span>
          ) : loggedIn ? (
            <span style={{ opacity: 0.85, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>
              {email}
            </span>
          ) : (
            <span style={{ opacity: 0.75, fontSize: 13 }}>Not signed in</span>
          )}

          <span
            style={{
              fontSize: 12,
              padding: "3px 8px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              opacity: 0.9,
            }}
          >
            {plan.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
          <button
            onClick={refresh}
            style={{
              padding: "7px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "transparent",
              color: "white",
              opacity: 0.9,
            }}
          >
            Refresh
          </button>

          {loggedIn ? (
            <>
              <Link
                href="/settings/billing"
                style={{
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "white",
                  textDecoration: "none",
                  opacity: 0.9,
                }}
              >
                Billing
              </Link>
              <button
                onClick={logout}
                style={{
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "transparent",
                  color: "white",
                  opacity: 0.9,
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname || "/")}`}
              style={{
                padding: "7px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                color: "white",
                textDecoration: "none",
                opacity: 0.9,
              }}
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}