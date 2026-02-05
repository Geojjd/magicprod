"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return setError(error.message);

    router.push(next);
    router.refresh();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Log in</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginTop: 12 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginTop: 12 }}
        />

        <button
          disabled={loading}
          style={{ width: "100%", padding: 12, marginTop: 12 }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      </form>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={() => router.push("/signup")} style={{ padding: 10 }}>
          Create account
        </button>
        <button onClick={handleLogout} style={{ padding: 10 }}>
          Log out
        </button>
      </div>
    </main>
  );
}