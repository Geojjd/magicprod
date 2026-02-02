"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) return setMsg(error.message);

    router.push("/dashboard");
  }

  async function onResetPassword() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);

    if (error) return setMsg(error.message);
    setMsg("Password reset email sent (if the email exists).");
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Welcome back</h1>
        <p style={styles.p}>Log in to your dashboard.</p>

        <form onSubmit={onLogin} style={styles.form}>
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
              required
            />
          </label>

          <button disabled={loading} style={styles.primaryBtn}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <button
            type="button"
            disabled={loading || !email}
            onClick={onResetPassword}
            style={styles.secondaryBtn}
          >
            Forgot password
          </button>

          {msg && <div style={styles.msg}>{msg}</div>}
        </form>

        <div style={styles.footerRow}>
          <span style={styles.muted}>No account?</span>
          <Link href="/signup" style={styles.link}>Sign up</Link>
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
  secondaryBtn: {
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  msg: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  footerRow: { display: "flex", gap: 8, marginTop: 14, fontSize: 14 },
  muted: { color: "rgba(255,255,255,0.7)" },
  link: { color: "white", textDecoration: "underline" },
};