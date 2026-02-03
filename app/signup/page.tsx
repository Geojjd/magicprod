"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

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
    });

    setLoading(false);

    if (error) return setMsg(error.message);

    // If email confirmations are ON, user may need to confirm.
    // Still send them to dashboard; middleware will block if session isn't active yet.
    router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Create account</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>

      <form onSubmit={onSignup} style={{ display: "grid", gap: 12 }}>
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
        <button disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12, color: "tomato" }}>{msg}</p>}
    </main>
  );
}