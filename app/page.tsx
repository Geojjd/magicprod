
'use client'
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>MagicProd</strong>
        <nav style={{ display: "flex", gap: 16 }}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/app">Open App</Link>
        </nav>
      </header>

      <section style={{ marginTop: 80 }}>
        <h1 style={{ fontSize: 48 }}>
          AI music tools for modern producers
        </h1>
        <p style={{ marginTop: 16, fontSize: 18, opacity: 0.8 }}>
          Beats, melodies, vocals, mastering and exports — in one workflow.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Link href="/pricing">
            <button>View Pricing</button>
          </Link>
          <Link href="/app">
            <button>Try the App</button>
          </Link>
        </div>
      </section>
    </main>
  );
}