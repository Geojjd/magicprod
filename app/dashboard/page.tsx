"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.h1}>Dashboard</h1>
          <p style={styles.sub}>
            Overview of your account, usage, and recent activity.
          </p>
        </div>

        <div style={styles.actions}>
          <a href="/app" style={styles.primaryBtn}>Open App</a>
          <a href="/pricing" style={styles.secondaryBtn}>Upgrade</a>
        </div>
      </div>

      {/* Cards */}
      <div style={styles.grid}>
        <Card title="Plan" value="Starter" meta="Renews monthly" />
        <Card title="Credits" value="120" meta="Remaining this month" />
        <Card title="Exports" value="8" meta="This week" />
        <Card title="Status" value="Active" meta="All systems normal" />
      </div>

      {/* 2-column section */}
      <div style={styles.twoCol}>
        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <h2 style={styles.h2}>Recent activity</h2>
            <span style={styles.pill}>Last 7 days</span>
          </div>

          <ul style={styles.list}>
            <ActivityItem
              title="Generated beat idea"
              meta="2 hours ago • 92 BPM • Trap"
            />
            <ActivityItem
              title="Exported stems"
              meta="Yesterday • WAV • 6 files"
            />
            <ActivityItem
              title="Reference match"
              meta="3 days ago • Similarity 84%"
            />
            <ActivityItem
              title="Account created"
              meta="6 days ago"
            />
          </ul>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <h2 style={styles.h2}>Quick actions</h2>
            <span style={styles.pill}>Shortcuts</span>
          </div>

          <div style={styles.quickGrid}>
            <QuickAction
              title="New project"
              desc="Start a fresh idea with presets."
              href="/app"
            />
            <QuickAction
              title="Upload audio"
              desc="Bring in a loop or reference."
              href="/app"
            />
            <QuickAction
              title="Billing"
              desc="Manage plan and payments."
              href="/dashboard/settings"
            />
            <QuickAction
              title="Support"
              desc="Get help or report an issue."
              href="/dashboard/support"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  meta,
}: {
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.dot} />
      </div>
      <div style={styles.cardValue}>{value}</div>
      <div style={styles.cardMeta}>{meta}</div>
    </div>
  );
}

function ActivityItem({ title, meta }: { title: string; meta: string }) {
  return (
    <li style={styles.item}>
      <div style={styles.itemLeft}>
        <div style={styles.itemTitle}>{title}</div>
        <div style={styles.itemMeta}>{meta}</div>
      </div>
      <div style={styles.itemRight}>›</div>
    </li>
  );
}

function QuickAction({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a href={href} style={styles.quick}>
      <div style={styles.quickTitle}>{title}</div>
      <div style={styles.quickDesc}>{desc}</div>
      <div style={styles.quickGo}>Open →</div>
    </a>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: "28px 28px 40px",
    maxWidth: 1100,
  },
  headerRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  h1: { fontSize: 30, margin: "0 0 6px" },
  sub: { margin: 0, opacity: 0.75, lineHeight: 1.5 },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    textDecoration: "none",
    background: "white",
    color: "black",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
  },
  secondaryBtn: {
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginTop: 14,
  },

  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    minHeight: 108,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, opacity: 0.8, fontWeight: 700 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    background: "rgba(130,80,255,0.9)",
    boxShadow: "0 0 0 6px rgba(130,80,255,0.12)",
  },
  cardValue: { fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" },
  cardMeta: { marginTop: 6, fontSize: 12, opacity: 0.7 },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 12,
    marginTop: 12,
  },
  panel: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
  },
  panelTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  h2: { margin: 0, fontSize: 16 },
  pill: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    opacity: 0.85,
  },

  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.10)",
  },
  itemLeft: { display: "grid", gap: 3 },
  itemTitle: { fontWeight: 800, fontSize: 14 },
  itemMeta: { fontSize: 12, opacity: 0.7 },
  itemRight: { opacity: 0.6, fontSize: 18 },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 8,
  },
  quick: {
    textDecoration: "none",
    color: "white",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    padding: 12,
    display: "grid",
    gap: 6,
  },
  quickTitle: { fontWeight: 900 },
  quickDesc: { fontSize: 12, opacity: 0.75, lineHeight: 1.35 },
  quickGo: { fontSize: 12, opacity: 0.85, marginTop: 4 },
};