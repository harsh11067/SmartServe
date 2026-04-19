import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [customerRes, ordersRes] = await Promise.all([
        api.get("/customers/me"),
        api.get("/orders/my"),
      ]);
      setCustomer(customerRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "delivered");
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const displayName = customer?.name || user?.name || "User";
  const displayEmail = customer?.user_id?.email || user?.email || "";

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>My Profile</h1>
            <p>Manage your account and view order history</p>
          </div>
        </div>

        <div style={{ padding: "40px" }}>
          {/* Profile Header Card */}
          <div
            className="card"
            style={{
              marginBottom: "32px",
              overflow: "hidden",
              padding: "0",
            }}
          >
            {/* Cover Photo */}
            <div
              style={{
                height: "200px",
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                position: "relative",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "40px",
                  background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  border: "4px solid var(--bg-card)",
                  position: "absolute",
                  bottom: "-60px",
                  left: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ padding: "80px 40px 32px" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
                {displayName}
              </h2>
              <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                {displayEmail}
              </p>

              {/* Stats Row */}
              <div className="grid grid-3" style={{ gap: "16px" }}>
                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent-primary)", marginBottom: "4px" }}>
                    {customer?.loyalty_points || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Loyalty Points
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--status-ready)", marginBottom: "4px" }}>
                    {completedOrders.length}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Orders Completed
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                    ₹{totalSpent}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Total Spent
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-2" style={{ marginBottom: "32px" }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Account Information</h2>
                <p className="card-subtitle">Your personal details</p>
              </div>

              <div style={{ marginTop: "20px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={displayEmail}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={customer?.phone || "Not provided"}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <input
                    type="text"
                    className="form-input"
                    value={
                      customer?.created_at
                        ? new Date(customer.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"
                    }
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Loyalty Rewards</h2>
                <p className="card-subtitle">Earn points with every order</p>
              </div>

              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    borderRadius: "20px",
                    padding: "32px",
                    textAlign: "center",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                    {customer?.loyalty_points || 0}
                  </div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
                    Available Points
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      🎁 Next reward at
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "700" }}>500 points</span>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      💰 Points to earn
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent-primary)" }}>
                      {Math.max(0, 500 - (customer?.loyalty_points || 0))}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px", textAlign: "center" }}>
                  Earn 1 point for every ₹10 spent
                </p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Order History</h2>
              <p className="card-subtitle">{orders.length} total orders</p>
            </div>

            <div style={{ marginTop: "20px" }}>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
                  <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>No orders yet</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                    Start ordering to see your history here
                  </p>
                  <button onClick={() => navigate("/menu")} className="btn btn-primary">
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Table</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: "600", fontFamily: "monospace" }}>
                            #{order._id?.slice(-6)}
                          </td>
                          <td>
                            {new Date(order.order_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td>Table {order.table_id?.table_number || "N/A"}</td>
                          <td style={{ fontWeight: "700", color: "var(--accent-primary)" }}>
                            ₹{order.total_amount}
                          </td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => navigate("/order-tracking")}
                              className="btn btn-ghost btn-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
