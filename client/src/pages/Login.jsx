import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, role, stall_id, user } = response.data;
      
      login(token, user || { email, role, stall_id });
      toast.success(`Welcome back! Logged in as ${role}`);
      
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "kitchen") {
        navigate("/kitchen");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "120px 32px" }}>
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Welcome Back</h1>
            <p style={{ color: "var(--text-secondary)" }}>Sign in to SmartServe</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link to="/register" style={{ color: "var(--accent-primary)" }}>
              Don't have an account? Create one
            </Link>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
