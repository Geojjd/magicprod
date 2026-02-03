export default function SupportPage() {
  return (
    <div style={card}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Support</h1>
      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.75)" }}>
        Need help? Use the Contact page or email us at <strong>support@yourdomain.com</strong>.
      </p>
      <div style={{ marginTop: 10 }}>
        <a href="/contact" style={linkBtn}>Go to Contact</a>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  borderRadius: 16,
  padding: 16,
};

const linkBtn: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.03)",
  fontWeight: 700,
};