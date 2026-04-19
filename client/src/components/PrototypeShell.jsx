import { Link } from "react-router-dom";

export default function PrototypeShell({
  title,
  subtitle,
  role,
  actions,
  children
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>SmartServe</strong>
          <span>{subtitle}</span>
        </div>
        <nav className="role-links">
          <Link className={`role-link ${role === "landing" ? "active" : ""}`} to="/">
            Landing
          </Link>
          <Link
            className={`role-link ${role === "customer" ? "active" : ""}`}
            to="/customer"
          >
            Customer
          </Link>
          <Link
            className={`role-link ${role === "kitchen" ? "active" : ""}`}
            to="/kitchen"
          >
            Kitchen
          </Link>
          <Link className={`role-link ${role === "admin" ? "active" : ""}`} to="/admin">
            Admin
          </Link>
        </nav>
        <div className="actions">{actions}</div>
      </header>
      <main>
        {title ? (
          <section className="panel" style={{ marginBottom: 24 }}>
            <p className="eyebrow">Project Flow</p>
            <h1 className="section-title">{title}</h1>
          </section>
        ) : null}
        {children}
      </main>
    </div>
  );
}
