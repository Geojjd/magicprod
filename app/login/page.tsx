"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import LoginClient from "./LoginClient";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

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

    router.push(next);
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Log in</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        New here? <Link href="/signup">Create an account</Link>
      </p>

      <form onSubmit={onLogin} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <button disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      </form>

      {msg && <p style={{ marginTop: 12, color: "tomato" }}>{msg}</p>}
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