import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Glass Navigation */}
      <nav className="nav-glass" style={{ padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🍽️
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", fontFamily: "Space Grotesk, sans-serif" }}>
            SmartServe
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={() => navigate("/login")} className="btn btn-ghost">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "700",
            fontFamily: "Space Grotesk, sans-serif",
            marginBottom: "24px",
            lineHeight: "1.1",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to <span className="highlight">SmartServe</span>
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "var(--text-secondary)",
            maxWidth: "700px",
            margin: "0 auto 48px",
            lineHeight: "1.6",
          }}
        >
          Experience seamless food court management with real-time order tracking,
          smart table management, and efficient kitchen operations.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button onClick={() => navigate("/login")} className="btn-cta">
            Get Started →
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn btn-secondary btn-lg"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="feature-grid">
        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            📱
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Real-Time Tracking
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Track your orders in real-time from preparation to delivery with live status updates.
          </p>
        </div>

        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            🪑
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Smart Tables
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Intelligent table management system with real-time availability and reservations.
          </p>
        </div>

        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            👨‍🍳
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Kitchen Dashboard
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Streamlined kitchen operations with order queue management and menu controls.
          </p>
        </div>

        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            💳
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Easy Payments
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Secure and seamless payment processing with multiple payment options.
          </p>
        </div>

        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            📊
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Analytics
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Comprehensive analytics and insights for better business decisions.
          </p>
        </div>

        <div className="feature-card">
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255, 107, 74, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "24px",
            }}
          >
            🎁
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>
            Loyalty Rewards
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Earn points with every order and unlock exclusive rewards and discounts.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "60px 5%", textAlign: "center", borderTop: "1px solid var(--border-color)" }}>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          © 2026 SmartServe. All rights reserved. | DBMS Mini Project
        </p>
      </div>
    </div>
  );
}
