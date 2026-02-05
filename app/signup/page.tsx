"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Create account</h1>

      <form onSubmit={handleSignup}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </main>
  );
}
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY first 10:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,10));