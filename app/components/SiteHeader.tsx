import Link from "next/link";

export default function SiteHeader() {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brand}>
          MagicProd
        </Link>

        <nav style={styles.nav}>
          <Link href="/#features" style={styles.navLink}>Features</Link>
          <Link href="/pricing" style={styles.navLink}>Pricing</Link>
          <Link href="/about" style={styles.navLink}>About</Link>
          <Link href="/contact" style={styles.navLink}>Contact</Link>
        </nav>

        <div style={styles.actions}>
          <Link href="/login" style={styles.secondaryBtn}>Log in</Link>
          <Link href="/signup" style={styles.primaryBtn}>Sign up</Link>
          <Link href="/dashboard" style={styles.ghostBtn}>Dashboard</Link>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(10,10,12,0.75)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "white",
    textDecoration: "none",
    fontSize: 18,
  },
  nav: { display: "flex", gap: 14, alignItems: "center" },
  navLink: {
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
    fontSize: 14,
  },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  primaryBtn: {
    background: "white",
    color: "black",
    padding: "8px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
  ghostBtn: {
    color: "rgba(255,255,255,0.85)",
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
};