import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoDot} />
          <span style={styles.brandText}>MagicProd</span>
        </div>

        <nav style={styles.nav}>
          <NavItem href="/dashboard" label="Overview" />
          <NavItem href="/dashboard/settings" label="Settings" />
          <NavItem href="/dashboard/support" label="Support" />
          <NavItem href="/about" label="About" />
          <NavItem href="/contact" label="Contact" />
        </nav>

        <div style={styles.social}>
          <a style={styles.socialLink} href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a style={styles.socialLink} href="https://tiktok.com" target="_blank" rel="noreferrer">
            TikTok
          </a>
          <a style={styles.socialLink} href="https://x.com" target="_blank" rel="noreferrer">
            X
          </a>
        </div>

        <div style={styles.footerNote}>© {new Date().getFullYear()} MagicProd</div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Dashboard</div>
          <Link href="/" style={styles.topbarLink}>Home</Link>
        </div>

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={styles.navItem}>
      {label}
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    background: "#0a0a0c",
    color: "white",
  },
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.10)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, padding: "10px 10px" },
  logoDot: { width: 12, height: 12, borderRadius: 999, background: "white" },
  brandText: { fontWeight: 900, letterSpacing: 0.2 },
  nav: { display: "flex", flexDirection: "column", gap: 8, marginTop: 6 },
  navItem: {
    textDecoration: "none",
    color: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
  },
  social: { marginTop: "auto", display: "flex", gap: 10, flexWrap: "wrap" },
  socialLink: {
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    paddingBottom: 2,
    fontSize: 13,
  },
  footerNote: { marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" },
  main: { padding: 16 },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: "12px 14px",
  },
  topbarTitle: { fontWeight: 900 },
  topbarLink: { color: "white", textDecoration: "underline", fontWeight: 700 },
  content: { marginTop: 14 },
};