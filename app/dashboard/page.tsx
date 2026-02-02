"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? null);
      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main style={{ padding: 24, color: "white", background: "#0a0a0c", minHeight: "100vh" }}>
        Loading...
      </main>
    );
  }

  return (
    <main style={{ padding: 24, color: "white", background: "#0a0a0c", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Dashboard</h1>
      <p style={{ color: "rgba(255,255,255,0.75)" }}>
        Logged in as: <strong>{email}</strong>
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/dashboard/settings" style={btnSecondary}>Settings</a>
        <a href="/contact" style={btnSecondary}>Contact</a>
        <a href="/about" style={btnSecondary}>About</a>
        <button onClick={logout} style={btnPrimary}>Log out</button>
      </div>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
  background: "white",
  color: "black",
  border: "none",
  borderRadius: 12,
  padding: "10px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "white",
  borderRadius: 12,
  padding: "10px 12px",
  textDecoration: "none",
  fontWeight: 700,
  background: "rgba(255,255,255,0.04)",
};