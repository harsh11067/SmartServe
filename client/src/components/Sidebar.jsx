import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // Customer navigation
  const customerNav = [
    { path: "/customer", icon: "🏠", label: "Dashboard" },
    { path: "/menu", icon: "🍽️", label: "Menu" },
    { path: "/track", icon: "📍", label: "Track Order" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  // Kitchen navigation
  const kitchenNav = [
    { path: "/kitchen", icon: "🍳", label: "Orders" },
  ];

  // Admin navigation
  const adminNav = [
    { path: "/admin", icon: "📊", label: "Dashboard" },
    { path: "/kitchen", icon: "🍳", label: "Kitchen View" },
    { path: "/admin/stalls", icon: "🏪", label: "Manage Stalls" },
    { path: "/admin/tables", icon: "🪑", label: "Manage Tables" },
  ];

  const getNavItems = () => {
    if (user?.role === "admin") return adminNav;
    if (user?.role === "kitchen") return kitchenNav;
    return customerNav;
  };

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Admin";
    if (user?.role === "kitchen") return "Kitchen";
    return "Customer";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🍽️</div>
        <div className="sidebar-brand-text">
          <h2>SmartServe</h2>
          <p>{getRoleLabel()}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getNavItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ width: "100%", border: "none", background: "none" }}
        >
          <span className="sidebar-nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
