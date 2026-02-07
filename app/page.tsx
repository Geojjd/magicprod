import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";


export default function HomePage() {
  return (
    <main style={page}>
      {/* HERO */}
      <section style={hero}>
        <div style={{ maxWidth: 760 }}>
          <div style={pill}>MagicProd • AI Music Production Suite</div>

          <h1 style={h1}>
            Make beats faster.
            <br />
            Finish tracks cleaner.
          </h1>

          <p style={sub}>
            Beats, melodies, vocals, mastering, reference match and exports — all in one workflow.
            Built for modern producers who want speed without losing quality.
          </p>

          <div style={ctaRow}>
            <Link href="/signup">
              <button style={btnPrimary}>Start free</button>
            </Link>
            <Link href="/pricing">
              <button style={btn}>View pricing</button>
            </Link>
            <Link href="/app">
              <button style={btn}>Open editor</button>
            </Link>
          </div>

          <div style={fineRow}>
            <span style={fine}>Monthly subscriptions • Cancel anytime</span>
            <span style={dot}>•</span>
            <span style={fine}>Built for drill, rap, R&B, trap, pop</span>
          </div>
        </div>

        <div style={heroCard}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>What you can do</div>
            <ul style={list}>
              <li>Generate beats (WAV)</li>
              <li>Generate melodies (MIDI / audio preview)</li>
              <li>AI vocals chain presets</li>
              <li>Mastering presets (streaming / loud / club)</li>
              <li>Reference match (safe MVP)</li>
              <li>Export stems as ZIP</li>
            </ul>

            <div style={miniStats}>
              <div style={miniStat}>
                <div style={miniNum}>1</div>
                <div style={miniLabel}>Upload audio</div>
              </div>
              <div style={miniStat}>
                <div style={miniNum}>2</div>
                <div style={miniLabel}>Pick tools</div>
              </div>
              <div style={miniStat}>
                <div style={miniNum}>3</div>
                <div style={miniLabel}>Export</div>
              </div>
            </div>

            <Link href="/app" style={{ textDecoration: "none" }}>
              <button style={{ ...btnPrimary, width: "100%" }}>Try the editor</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={h2}>Everything you need to finish tracks</h2>
          <p style={desc}>
            Use tools individually or run a workflow. Keep it simple, fast, and producer-friendly.
          </p>
        </div>

        <div style={grid3}>
          {FEATURES.map((f) => (
            <div key={f.title} style={card}>
              <div style={iconBox}>{f.icon}</div>
              <h3 style={h3}>{f.title}</h3>
              <p style={p}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={h2}>How it works</h2>
          <p style={desc}>A simple workflow that fits your process.</p>
        </div>

        <div style={steps}>
          {STEPS.map((s) => (
            <div key={s.title} style={stepCard}>
              <div style={stepNum}>{s.num}</div>
              <div>
                <div style={stepTitle}>{s.title}</div>
                <div style={stepText}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={h2}>Pricing</h2>
          <p style={desc}>Monthly plans. Cancel anytime.</p>
        </div>

        <div style={grid2}>
          <PlanCard
            title="Starter"
            price="£19/mo"
            features={[
              "Core AI tools",
              "Monthly credits",
              "Export stems",
              "Standard processing",
            ]}
            ctaHref="/pricing"
            ctaLabel="Choose Starter"
          />
          <PlanCard
            title="Pro"
            price="£49/mo"
            features={[
              "Everything in Starter",
              "More credits",
              "Priority processing",
              "Best value for daily producers",
            ]}
            ctaHref="/pricing"
            ctaLabel="Choose Pro"
            highlight
          />
        </div>

        <div style={{ marginTop: 14, opacity: 0.85 }}>
          Want the full comparison? <Link href="/pricing">Go to pricing</Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={section}>
        <div style={sectionHeader}>
          <h2 style={h2}>FAQ</h2>
          <p style={desc}>Quick answers.</p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {FAQ.map((x) => (
            <details key={x.q} style={faq}>
              <summary style={faqQ}>{x.q}</summary>
              <div style={faqA}>{x.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={finalCta}>
        <h2 style={{ ...h2, margin: 0 }}>Ready to build faster?</h2>
        <p style={{ ...desc, marginTop: 8 }}>
          Start free and upgrade when you’re ready.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Link href="/signup"><button style={btnPrimary}>Start free</button></Link>
          <Link href="/app"><button style={btn}>Open editor</button></Link>
        </div>
      </section>
    </main>
  );
}

function PlanCard(props: {
  title: string;
  price: string;
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        ...planCard,
        borderColor: props.highlight ? "#fff" : "#222",
      }}
    >
      {props.highlight && <div style={badge}>Most popular</div>}
      <h3 style={{ margin: 0, fontSize: 20 }}>{props.title}</h3>
      <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{props.price}</div>
      <ul style={{ marginTop: 14, opacity: 0.9, paddingLeft: 18 }}>
        {props.features.map((f) => (
          <li key={f} style={{ marginBottom: 6 }}>{f}</li>
        ))}
      </ul>
      <Link href={props.ctaHref} style={{ textDecoration: "none" }}>
        <button style={{ ...btnPrimary, width: "100%", marginTop: 10 }}>
          {props.ctaLabel}
        </button>
      </Link>
    </div>
  );
}

/** Content */
const FEATURES = [
  { icon: "🎛️", title: "AI Editing", text: "Tell it what you want: punchier drums, louder mix, more bass, brighter top end." },
  { icon: "🥁", title: "Beat Generator", text: "Generate a WAV beat from prompt + BPM + bars. Use seeds to keep ideas consistent." },
  { icon: "🎹", title: "Melody Generator", text: "Get MIDI, audio preview, or both. Perfect for quick inspiration and layering." },
  { icon: "🎙️", title: "Vocal Chains", text: "One-click vocal processing: clean, rap, melodic or aggressive styles." },
  { icon: "📈", title: "Mastering", text: "Streaming / Loud / Club presets. Fast loudness control without clipping." },
  { icon: "📦", title: "Export Stems", text: "Export your mix, mastered version, vocal chain output, and edits — in one ZIP." },
];

const STEPS = [
  { num: "1", title: "Upload or generate", text: "Upload audio or generate a beat/melody to start your session." },
  { num: "2", title: "Use the tools", text: "AI edit, vocals, mastering, reference match — run what you need." },
  { num: "3", title: "Export & share", text: "Download stems/outputs and drop them into your DAW or send to clients." },
];

const FAQ = [
  { q: "Is it monthly only?", a: "Yes — monthly subscriptions only. Cancel anytime." },
  { q: "Do I need a DAW?", a: "You can create ideas here, but most producers export and finish inside a DAW." },
  { q: "What genres does it support?", a: "It works across genres. You’ll get the best results when your prompts are specific." },
  { q: "Can I use it on mobile?", a: "Yes — the site works on mobile, but desktop gives the best workflow for audio." },
];

/** Styles */
const page: React.CSSProperties = { maxWidth: 1100, margin: "0 auto" };

const hero: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 18,
  alignItems: "start",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #222",
  fontSize: 13,
  opacity: 0.85,
  marginBottom: 12,
};

const h1: React.CSSProperties = { fontSize: 52, lineHeight: 1.05, margin: 0 };
const sub: React.CSSProperties = { fontSize: 18, opacity: 0.85, marginTop: 14, marginBottom: 0, maxWidth: 720 };

const ctaRow: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 };
const fineRow: React.CSSProperties = { display: "flex", gap: 10, marginTop: 14, alignItems: "center", flexWrap: "wrap" };
const fine: React.CSSProperties = { fontSize: 13, opacity: 0.75 };
const dot: React.CSSProperties = { opacity: 0.5 };

const heroCard: React.CSSProperties = {
  border: "1px solid #222",
  borderRadius: 16,
  padding: 16,
  background: "rgba(255,255,255,0.02)",
};

const list: React.CSSProperties = { margin: 0, paddingLeft: 18, opacity: 0.9, lineHeight: 1.7 };

const miniStats: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 };
const miniStat: React.CSSProperties = { border: "1px solid #222", borderRadius: 12, padding: 10, textAlign: "center" };
const miniNum: React.CSSProperties = { fontWeight: 900, fontSize: 18 };
const miniLabel: React.CSSProperties = { fontSize: 12, opacity: 0.8, marginTop: 4 };

const section: React.CSSProperties = { marginTop: 70 };
const sectionHeader: React.CSSProperties = { maxWidth: 720, marginBottom: 16 };
const h2: React.CSSProperties = { fontSize: 32, margin: 0 };
const desc: React.CSSProperties = { marginTop: 10, marginBottom: 0, opacity: 0.85 };

const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 };
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 };

const card: React.CSSProperties = { border: "1px solid #222", borderRadius: 16, padding: 16 };
const iconBox: React.CSSProperties = { width: 40, height: 40, borderRadius: 12, border: "1px solid #222", display: "grid", placeItems: "center", marginBottom: 10 };
const h3: React.CSSProperties = { margin: 0, fontSize: 18 };
const p: React.CSSProperties = { margin: "8px 0 0", opacity: 0.85, lineHeight: 1.5 };

const steps: React.CSSProperties = { display: "grid", gap: 12, marginTop: 12 };
const stepCard: React.CSSProperties = { display: "flex", gap: 12, alignItems: "flex-start", border: "1px solid #222", borderRadius: 16, padding: 14 };
const stepNum: React.CSSProperties = { width: 32, height: 32, borderRadius: 10, border: "1px solid #222", display: "grid", placeItems: "center", fontWeight: 900 };
const stepTitle: React.CSSProperties = { fontWeight: 800 };
const stepText: React.CSSProperties = { opacity: 0.85, marginTop: 4 };

const planCard: React.CSSProperties = { border: "1px solid #222", borderRadius: 16, padding: 18, position: "relative" };
const badge: React.CSSProperties = { position: "absolute", top: 12, right: 12, fontSize: 12, border: "1px solid #222", padding: "4px 8px", borderRadius: 999, opacity: 0.9 };

const faq: React.CSSProperties = { border: "1px solid #222", borderRadius: 14, padding: 12 };
const faqQ: React.CSSProperties = { cursor: "pointer", fontWeight: 800 };
const faqA: React.CSSProperties = { marginTop: 10, opacity: 0.85, lineHeight: 1.6 };

const finalCta: React.CSSProperties = {
  marginTop: 70,
  border: "1px solid #222",
  borderRadius: 18,
  padding: 22,
  textAlign: "center",
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "white",
  color: "black",
  border: "1px solid white",
  fontWeight: 800,
}