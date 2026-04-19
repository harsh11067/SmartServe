import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function OrderTracking() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState("");

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (loading) {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ["pending", "preparing", "ready", "delivered"];
    const currentIndex = steps.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      name: step,
      completed: index < currentIndex,
      active: index === currentIndex,
    }));
  };

  const getStatusIcon = (step) => {
    if (step.completed) return "✓";
    if (step.active) return "●";
    return "○";
  };

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  );
  const pastOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled"
  );
  const trackedOrder = useMemo(() => {
    const normalized = searchOrderId.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    return orders.find((order) => {
      const fullId = order._id?.toLowerCase() || "";
      const shortId = order._id?.slice(-6).toLowerCase() || "";
      return fullId === normalized || shortId === normalized || `#${shortId}` === normalized;
    });
  }, [orders, searchOrderId]);

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>Order Tracking</h1>
            <p>Track your orders in real-time</p>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          <div className="card" style={{ marginBottom: "32px" }}>
            <div className="card-header">
              <h2 className="card-title">Track by Order ID</h2>
              <p className="card-subtitle">Enter a full ID or the last 6 characters</p>
            </div>
            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                className="form-input"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="e.g. 67ab12 or full order id"
              />
              {searchOrderId.trim() && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "var(--bg-tertiary)",
                  }}
                >
                  {trackedOrder ? (
                    <>
                      <p style={{ marginBottom: "8px", fontWeight: "600" }}>
                        Order #{trackedOrder._id?.slice(-6)}
                      </p>
                      <p style={{ color: "var(--text-secondary)" }}>
                        Status: <span style={{ textTransform: "capitalize" }}>{trackedOrder.status}</span>
                      </p>
                    </>
                  ) : (
                    <p style={{ color: "var(--text-secondary)" }}>
                      No matching order found in your account yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Active Orders</h2>
              {activeOrders.map((order) => (
                <div key={order._id} className="card" style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                      <h3 style={{ fontSize: "24px", marginBottom: "8px" }}>
                        Order #{order._id?.slice(-6)}
                      </h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent-primary)", marginBottom: "4px" }}>
                        ₹{order.total_amount}
                      </div>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div style={{ position: "relative", margin: "48px 0" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "0",
                        right: "0",
                        height: "2px",
                        background: "var(--border-color)",
                        zIndex: 1,
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                      {getStatusSteps(order.status).map((step, index) => (
                        <div key={step.name} style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: step.completed || step.active
                                ? step.completed
                                  ? "var(--status-ready)"
                                  : "var(--accent-primary)"
                                : "var(--bg-tertiary)",
                              border: `2px solid ${
                                step.completed || step.active
                                  ? step.completed
                                    ? "var(--status-ready)"
                                    : "var(--accent-primary)"
                                  : "var(--border-color)"
                              }`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto",
                              fontSize: "18px",
                              fontWeight: "700",
                              color: step.completed || step.active ? "white" : "var(--text-muted)",
                            }}
                          >
                            {getStatusIcon(step)}
                          </div>
                          <div
                            style={{
                              marginTop: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              color: step.completed || step.active
                                ? "var(--text-primary)"
                                : "var(--text-muted)",
                            }}
                          >
                            {step.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div
                    style={{
                      background: "var(--bg-tertiary)",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-secondary)" }}>
                      Order Details
                    </h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Table:</span>
                      <span style={{ fontWeight: "600" }}>
                        {order.table_id?.table_number || "Pickup"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Estimated Time:</span>
                      <span style={{ fontWeight: "600" }}>
                        {order.status === "pending"
                          ? "15-20 min"
                          : order.status === "preparing"
                          ? "10-15 min"
                          : order.status === "ready"
                          ? "Ready for pickup"
                          : "Delivered"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Past Orders</h2>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Table</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastOrders.map((order) => (
                      <tr key={order._id}>
                        <td style={{ fontWeight: "600" }}>#{order._id?.slice(-6)}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>{order.table_id?.table_number || "Pickup"}</td>
                        <td>₹{order.total_amount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Orders */}
          {orders.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "80px 32px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
              <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>No Orders Yet</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                Start by browsing our menu and placing your first order
              </p>
              <Link to="/menu" className="btn btn-primary">
                Browse Menu
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
