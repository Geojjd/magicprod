import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <SiteHeader />

      <main style={styles.main}>
        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.badge}>About MagicProd</div>

          <h1 style={styles.h1}>
            We&apos;re building the fastest way for producers to create music
            with AI — without losing control.
          </h1>

          <p style={styles.sub}>
            MagicProd is an AI music toolkit designed for real producers. We
            focus on speed, taste, and control — so you can move from idea → loop
            → full export in minutes.
          </p>

          <div style={styles.ctaRow}>
            <Link href="/signup" style={styles.primaryBtn}>
              Create an account
            </Link>
            <Link href="/pricing" style={styles.secondaryBtn}>
              View pricing
            </Link>
            <Link href="/dashboard" style={styles.ghostBtn}>
              Go to dashboard
            </Link>
          </div>
        </section>

        {/* MISSION + VISION */}
        <section style={styles.section}>
          <div style={styles.split}>
            <div>
              <h2 style={styles.h2}>Mission</h2>
              <p style={styles.p}>
                Give producers powerful AI tools that feel like real creative
                instruments — not black boxes. We want you to keep your sound,
                your choices, and your identity.
              </p>

              <h2 style={{ ...styles.h2, marginTop: 22 }}>Vision</h2>
              <p style={styles.p}>
                A world where producers can create faster, experiment more, and
                release better music — while staying fully in control of the
                creative process.
              </p>

              <div style={styles.callout}>
                <div style={styles.calloutTitle}>What “control” means to us</div>
                <div style={styles.calloutText}>
                  Tempo, key, groove, vibe, intensity, structure — and clean
                  exports you can actually use in a real session.
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Built for producers</div>
              <ul style={styles.list}>
                <li>⚡ Fast workflow from idea to export</li>
                <li>🎚️ Controls for BPM, key, vibe, intensity</li>
                <li>🧩 Tools that fit into your existing setup</li>
                <li>📦 Clean stems + one-click downloads</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Our story</h2>
          <p style={styles.p}>
            MagicProd started from a simple frustration: AI could generate
            “stuff”, but it didn’t feel like making music. You’d get random
            results, no control, and outputs that didn’t fit your workflow.
          </p>
          <p style={styles.p}>
            We’re building MagicProd as a producer-first toolkit: generate ideas,
            refine with intention, match references, and export cleanly. The goal
            isn’t to replace producers — it’s to give you leverage.
          </p>

          <div style={styles.grid3}>
            <InfoCard
              title="Speed"
              desc="Move quickly when inspiration hits — create drafts, iterate, and export in minutes."
            />
            <InfoCard
              title="Taste"
              desc="Better defaults + reference-aware tools so outputs feel closer to your target sound."
            />
            <InfoCard
              title="Workflow"
              desc="Everything is designed to slot into real sessions — not just demos."
            />
          </div>
        </section>

        {/* VALUES */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Our values</h2>

          <div style={styles.grid2}>
            <ValueCard
              title="Creator-first"
              desc="Producers come first. If it doesn’t help creators make better music, we don’t ship it."
            />
            <ValueCard
              title="Control over chaos"
              desc="AI should be steerable. Controls matter more than randomness."
            />
            <ValueCard
              title="Quality outputs"
              desc="Clean exports, usable stems, reliable results — built for real production."
            />
            <ValueCard
              title="Fast iteration"
              desc="Ship quickly, listen to feedback, improve every week."
            />
          </div>
        </section>

        {/* WHAT WE’RE BUILDING */}
        <section style={styles.section}>
          <h2 style={styles.h2}>What we’re building</h2>
          <p style={styles.p}>
            MagicProd is evolving into a full AI production workflow. Here’s the
            direction:
          </p>

          <div style={styles.grid2}>
            <ValueCard
              title="Generation tools"
              desc="Beat, melody, vocal textures — designed to be tweakable, not random."
            />
            <ValueCard
              title="Reference matching"
              desc="Aim towards a target vibe and refine toward it with intention."
            />
            <ValueCard
              title="Saved projects"
              desc="Versions, presets, and exports organised per track."
            />
            <ValueCard
              title="Payments & plans"
              desc="Subscriptions that unlock features — already integrated into the app."
            />
          </div>

          <div style={styles.ctaBlock}>
            <div style={styles.ctaBlockTitle}>Want updates as we build?</div>
            <div style={styles.ctaBlockText}>
              Follow us on socials or contact us — we’re building this with the
              producer community.
            </div>
            <div style={styles.ctaRow}>
              <Link href="/contact" style={styles.primaryBtn}>
                Contact us
              </Link>
              <Link href="/" style={styles.secondaryBtn}>
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {/* SOCIAL */}
        <section style={styles.section}>
          <h2 style={styles.h2}>Socials</h2>
          <p style={styles.p}>
            Replace these links with your real profiles when ready.
          </p>

          <div style={styles.socialRow}>
            <a style={styles.socialBtn} href="#" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a style={styles.socialBtn} href="#" target="_blank" rel="noreferrer">
              TikTok
            </a>
            <a style={styles.socialBtn} href="#" target="_blank" rel="noreferrer">
              X
            </a>
            <a style={styles.socialBtn} href="#" target="_blank" rel="noreferrer">
              YouTube
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoDesc}>{desc}</div>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={styles.valueCard}>
      <div style={styles.valueTitle}>{title}</div>
      <div style={styles.valueDesc}>{desc}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 800px at 20% 10%, rgba(130,80,255,0.20), transparent 60%), radial-gradient(900px 700px at 80% 20%, rgba(0,200,255,0.12), transparent 55%), #07080c",
    color: "white",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px 70px",
  },

  hero: {
    padding: "70px 0 40px",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    marginBottom: 16,
  },
  h1: {
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    margin: "0 0 14px",
    maxWidth: 980,
  },
  h2: {
    fontSize: 28,
    margin: "0 0 10px",
    letterSpacing: "-0.02em",
  },
  sub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    lineHeight: 1.65,
    maxWidth: 820,
    margin: "0 0 22px",
  },
  p: {
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.75,
    margin: "0 0 14px",
    maxWidth: 920,
  },

  section: {
    padding: "34px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 18,
    alignItems: "start",
  },
  card: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 18,
  },
  cardTitle: {
    fontWeight: 800,
    marginBottom: 10,
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 1.8,
  },

  callout: {
    marginTop: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 14,
  },
  calloutTitle: { fontWeight: 800, marginBottom: 6 },
  calloutText: { color: "rgba(255,255,255,0.78)", lineHeight: 1.7 },

  ctaRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 18,
  },
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
    background: "rgba(255,255,255,0.05)",
  },
  ghostBtn: {
    color: "rgba(255,255,255,0.9)",
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 14,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginTop: 14,
  },

  infoCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 16,
  },
  infoTitle: { fontWeight: 900, marginBottom: 6 },
  infoDesc: { color: "rgba(255,255,255,0.78)", lineHeight: 1.7 },

  valueCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 16,
  },
  valueTitle: { fontWeight: 900, marginBottom: 6 },
  valueDesc: { color: "rgba(255,255,255,0.78)", lineHeight: 1.7 },

  ctaBlock: {
    marginTop: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
  },
  ctaBlockTitle: { fontWeight: 900, marginBottom: 6 },
  ctaBlockText: { color: "rgba(255,255,255,0.78)", lineHeight: 1.7 },

  socialRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  socialBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    padding: "10px 14px",
    color: "white",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
};