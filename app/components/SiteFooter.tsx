import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div>
          <div style={styles.brand}>MagicProd</div>
          <div style={styles.muted}>AI music tools for modern producers.</div>
        </div>

        <div style={styles.cols}>
          <div style={styles.col}>
            <div style={styles.colTitle}>Company</div>
            <Link href="/about" style={styles.link}>About</Link>
            <Link href="/contact" style={styles.link}>Contact</Link>
            <Link href="/pricing" style={styles.link}>Pricing</Link>
          </div>

          <div style={styles.col}>
            <div style={styles.colTitle}>Product</div>
            <Link href="/dashboard" style={styles.link}>Dashboard</Link>
            <Link href="/login" style={styles.link}>Log in</Link>
            <Link href="/signup" style={styles.link}>Sign up</Link>
          </div>

          <div style={styles.col}>
            <div style={styles.colTitle}>Social</div>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.link}>Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" style={styles.link}>TikTok</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" style={styles.link}>X</a>
          </div>
        </div>
      </div>

      <div style={styles.bottom}>
        <div style={styles.muted}>© {new Date().getFullYear()} MagicProd. All rights reserved.</div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: 80,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "40px 0 18px",
    background: "rgba(10,10,12,0.7)",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    gap: 32,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  brand: { color: "white", fontWeight: 800, marginBottom: 8 },
  muted: { color: "rgba(255,255,255,0.65)", fontSize: 14 },
  cols: { display: "flex", gap: 40, flexWrap: "wrap" },
  col: { display: "flex", flexDirection: "column", gap: 8, minWidth: 140 },
  colTitle: { color: "rgba(255,255,255,0.9)", fontWeight: 700, marginBottom: 6 },
  link: { color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 },
  bottom: { maxWidth: 1100, margin: "24px auto 0", padding: "0 20px" },
}