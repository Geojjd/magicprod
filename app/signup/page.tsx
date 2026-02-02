"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If you later enable email confirmations, Supabase will redirect here
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) return setMsg(error.message);

    // If email confirmations are OFF, user is logged in immediately
    // If confirmations are ON, they’ll need to confirm first
    router.push("/dashboard");
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Create your account</h1>
        <p style={styles.p}>Sign up to access your dashboard.</p>

        <form onSubmit={onSignup} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <button disabled={loading} style={styles.primaryBtn}>
            {loading ? "Creating account..." : "Sign up"}
          </button>

          {msg && <div style={styles.msg}>{msg}</div>}
        </form>

        <div style={styles.footerRow}>
          <span style={styles.muted}>Already have an account?</span>
          <Link href="/login" style={styles.link}>Log in</Link>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "#0a0a0c",
    color: "white",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 18,
  },
  h1: { fontSize: 26, margin: "0 0 6px", fontWeight: 900 },
  p: { margin: "0 0 16px", color: "rgba(255,255,255,0.75)" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14 },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  },
  primaryBtn: {
    marginTop: 4,
    background: "white",
    color: "black",
    border: "none",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  msg: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,0,0,0.08)",
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  footerRow: { display: "flex", gap: 8, marginTop: 14, fontSize: 14 },
  muted: { color: "rgba(255,255,255,0.7)" },
  link: { color: "white", textDecoration: "underline" },
};