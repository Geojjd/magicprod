
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Step 3 will wire this to a real API route (email / DB)
    setSent(true);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.back}>← Home</Link>
      </header>

      <section style={styles.card}>
        <h1 style={styles.h1}>Contact</h1>
        <p style={styles.p}>
          Questions, feedback, or collabs — send a message and we’ll get back to you.
        </p>

        {sent ? (
          <div style={styles.success}>
            Sent ✅ We’ll reply to <strong>{email || "your email"}</strong>.
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setSent(false)} style={styles.secondaryBtn}>Send another</button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={styles.form}>
            <label style={styles.label}>
              Name
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

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
              Message
              <textarea
                style={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
              />
            </label>

            <button style={styles.primaryBtn}>Send message</button>
          </form>
        )}

        <div style={styles.footerRow}>
          <span style={styles.muted}>Or email:</span>
          <a style={styles.link} href="mailto:support@yourdomain.com">support@yourdomain.com</a>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 20, background: "#0a0a0c", color: "white" },
  header: { maxWidth: 760, margin: "0 auto 14px" },
  back: { color: "rgba(255,255,255,0.9)", textDecoration: "underline", fontWeight: 700 },
  card: {
    maxWidth: 760,
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 18,
  },
  h1: { margin: 0, fontSize: 34, fontWeight: 900 },
  p: { marginTop: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 },
  form: { marginTop: 14, display: "flex", flexDirection: "column", gap: 12 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14 },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
    resize: "vertical",
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
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  success: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,255,140,0.08)",
    color: "rgba(255,255,255,0.92)",
  },
  footerRow: { marginTop: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  muted: { color: "rgba(255,255,255,0.65)" },
  link: { color: "white", textDecoration: "underline" },
};