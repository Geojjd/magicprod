"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const styles = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "64px 24px",
    background: "rgba(12, 12, 12, 0.95)",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    marginBottom: 10,
    fontWeight: 700,
    color: "#222",
    letterSpacing: 1,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 24,
    fontSize: 16,
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    width: "100%",
  },
  input: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 16,
    outline: "none",
    transition: "border 0.2s",
  },
  button: {
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#60a5fa)",
    color: "#2c0cbb",
    fontWeight: 600,
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
    transition: "background 0.2s",
  },
  error: {
    marginTop: 12,
    color: "tomato",
    fontWeight: 500,
    textAlign: "center" as const,
  },
  ok: {
    marginTop: 12,
    color: "green",
    fontWeight: 600,
    textAlign: "center" as const,
  },
};

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setOk(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setOk("Signed in! Redirecting…");

    // ✅ IMPORTANT: replace so we don't bounce back to /login
    router.replace(next);
    router.refresh();
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Log in</h1>
      <p style={styles.subtitle}>
        New here?{" "}
        <Link
          href="/signup"
          style={{ color: "#6366f1", fontWeight: 500 }}
        >
          Create account
        </Link>
      </p>

      <form onSubmit={onLogin} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          style={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <button style={styles.button} disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {msg ? <div style={styles.error}>{msg}</div> : null}
      {ok ? <div style={styles.ok}>{ok}</div> : null}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}