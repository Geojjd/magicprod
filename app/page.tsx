import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default function Home() {
  return (
    <div style={styles.page}>
      <SiteHeader />

      <main style={styles.main}>
        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.badge}>MagicProd • AI Music Toolkit</div>

          <h1 style={styles.h1}>
            Create beats, melodies & vocals faster — with AI you actually control.
          </h1>

          <p style={styles.sub}>
            Generate ideas, refine loops, and export stems. Built for producers who want speed without losing style.
          </p>

          <div style={styles.ctaRow}>
            <Link href="/signup" style={styles.primaryBtn}>Get started free</Link>
            <Link href="/pricing" style={styles.secondaryBtn}>View pricing</Link>
            <Link href="/dashboard" style={styles.ghostBtn}>Go to dashboard</Link>
          </div>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statNum}>⚡</div>
              <div>
                <div style={styles.statTitle}>Fast workflow</div>
                <div style={styles.statText}>From idea → export in minutes.</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>🎛️</div>
              <div>
                <div style={styles.statTitle}>Producer controls</div>
                <div style={styles.statText}>BPM, key, vibe & intensity.</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>📦</div>
              <div>
                <div style={styles.statTitle}>Clean exports</div>
                <div style={styles.statText}>Stems + one-click downloads.</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={styles.section}>
          <h2 style={styles.h2}>Features</h2>
          <p style={styles.p}>
            Everything you need for a modern AI production workflow.
          </p>

          <div style={styles.grid}>
            <Feature title="Beat generation" desc="Kickstart drums with genre-aware presets and tweakable swing." />
            <Feature title="Melody builder" desc="Draft hooks quickly, then refine note density and movement." />
            <Feature title="Vocal ideas" desc="Generate vocal textures and stacks (depending on your pipeline)." />
            <Feature title="Reference matching" desc="Push towards a reference vibe while keeping your own sound." />
            <Feature title="Saved projects" desc="Keep versions, presets, and exports organised per track." />
            <Feature title="Payments ready" desc="Subscriptions + billing routes already set up." />
          </div>
        </section>

        {/* TRUST / ABOUT */}
        <section style={styles.section}>
          <div style={styles.split}>
            <div>
              <h2 style={styles.h2}>Built for your brand</h2>
              <p style={styles.p}>
                This homepage is your marketing front. Your app lives at <code style={styles.code}>/dashboard</code>.
                Next we’ll add Sign up / Log in and protect the dashboard.
              </p>

              <div style={styles.ctaRow}>
                <Link href="/about" style={styles.secondaryBtn}>About the company</Link>
                <Link href="/contact" style={styles.secondaryBtn}>Contact us</Link>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>What we’ll build next</div>
              <ul style={styles.list}>
                <li>✅ Login + Signup pages (Supabase)</li>
                <li>✅ Protected Dashboard route</li>
                <li>✅ Settings page</li>
                <li>✅ About + Contact pages</li>
                <li>✅ Social links + footer polish</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={styles.feature}>
      <div style={styles.featureTitle}>{title}</div>
      <div style={styles.featureDesc}>{desc}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(1200px 800px at 20% 10%, rgba(130,80,255,0.20), transparent 60%), radial-gradient(900px 700px at 80% 20%, rgba(0,190,255,0.12), transparent 60%), #0a0a0c",
    color: "white",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px" },

  hero: { padding: "70px 0 40px" },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginBottom: 16,
  },
  h1: { fontSize: 54, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 14px" },
  sub: { color: "rgba(255,255,255,0.75)", fontSize: 18, lineHeight: 1.6, maxWidth: 720, margin: "0 0 24px" },

  ctaRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 },
  primaryBtn: {
    background: "white",
    color: "black",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 14,
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    background: "rgba(255,255,255,0.04)",
  },
  ghostBtn: {
    color: "rgba(255,255,255,0.85)",
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },

  stats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 },
  statCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  statNum: { fontSize: 22 },
  statTitle: { fontWeight: 800, marginBottom: 2 },
  statText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },

  section: { padding: "54px 0 0" },
  h2: { fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 10px" },
  p: { color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 18px", maxWidth: 780 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 },

  feature: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
  },
  featureTitle: { fontWeight: 800, marginBottom: 6 },
  featureDesc: { color: "rgba(255,255,255,0.72)", lineHeight: 1.6, fontSize: 14 },

  split: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, alignItems: "start" },
  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontWeight: 900, marginBottom: 10 },
  list: { margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.9 },
  code: { background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 8 },
};