"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";

type NavItem = { href: string; label: string; icon?: string };

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [email, setEmail] = useState<string>("");

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
    { href: "/dashboard/support", label: "Support", icon: "💬" },
  ];

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setEmail(data.user?.email ?? "");
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>MP</div>
          <div>
            <div style={styles.brand}>MagicProd</div>
            <div style={styles.brandSub}>Dashboard</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {nav.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon ?? "•"}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <Link href="/" style={styles.sidebarLink}>
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={styles.mainCol}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <div style={styles.breadcrumb}>/dashboard</div>
          </div>

          <div style={styles.topbarRight}>
            <div style={styles.userPill}>
              <span style={styles.userDot} />
              <span style={styles.userEmail}>{email || "Signed in"}</span>
            </div>

            <button onClick={logout} style={styles.logoutBtn}>
              Log out
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    background: "#0b0b0f",
    color: "white",
  },

  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "18px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "sticky",
    top: 0,
    height: "100vh",
    background:
      "radial-gradient(900px 500px at 20% 0%, rgba(130,80,255,0.18), transparent 60%), #0b0b0f",
  },

  brandRow: { display: "flex", alignItems: "center", gap: 12, padding: "6px 6px 10px" },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  brand: { fontWeight: 800, letterSpacing: "-0.02em" },
  brandSub: { fontSize: 12, opacity: 0.7 },

  nav: { display: "flex", flexDirection: "column", gap: 6 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 12,
    textDecoration: "none",
    color: "rgba(255,255,255,0.86)",
    border: "1px solid transparent",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  navIcon: { width: 20, display: "inline-block", opacity: 0.9 },

  sidebarFooter: { marginTop: "auto", padding: 6 },
  sidebarLink: { color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13 },

  mainCol: { display: "flex", flexDirection: "column", minWidth: 0 },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,10,14,0.75)",
    backdropFilter: "blur(10px)",
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  breadcrumb: { fontSize: 13, opacity: 0.7 },

  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    background: "#55ff99",
    boxShadow: "0 0 0 4px rgba(85,255,153,0.10)",
  },
  userEmail: { fontSize: 13, opacity: 0.9, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" },

  logoutBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  },

  content: { padding: "20px 18px", minWidth: 0 },
};