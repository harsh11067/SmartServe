import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    freeTables: 0,
    activeStalls: 0,
  });
  const [orders, setOrders] = useState([]);
  const [stalls, setStalls] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [ordersResponse, stallsResponse, tablesResponse] = await Promise.all([
        api.get("/orders/all"),
        api.get("/stalls"),
        api.get("/tables"),
      ]);

      setOrders(ordersResponse.data);
      setStalls(stallsResponse.data);

      const freeTables = tablesResponse.data.filter(
        (table) => table.status === "free"
      ).length;

      setStats({
        totalOrders: ordersResponse.data.length,
        freeTables,
        activeStalls: stallsResponse.data.filter((s) => s.is_active).length,
      });
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast.error("Failed to load admin dashboard");
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
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading...</p>
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
            <h1>Admin Dashboard</h1>
            <p>System-wide operations and control</p>
          </div>
          <div className="topbar-actions">
            <Link to="/admin/stalls" className="btn btn-secondary">
              Manage Stalls
            </Link>
            <Link to="/admin/tables" className="btn btn-primary">
              Manage Tables
            </Link>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stats Grid */}
          <div className="grid grid-3" style={{ marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-label">Total Orders Today</div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-change positive">+12% from yesterday</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Free Tables</div>
              <div className="stat-value">{stats.freeTables}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Stalls</div>
              <div className="stat-value">{stats.activeStalls}</div>
            </div>
          </div>

          {/* All Orders Table */}
          <div className="card" style={{ marginBottom: "32px" }}>
            <div className="card-header">
              <h2 className="card-title">All Orders</h2>
              <p className="card-subtitle">System-wide order tracking</p>
            </div>

            <div className="table-container" style={{ marginTop: "20px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Table</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id?.slice(-6)}</td>
                        <td>{order.customer_id?.name || "N/A"}</td>
                        <td>{order.table_id?.table_number || "Pickup"}</td>
                        <td>₹{order.total_amount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.order_date).toLocaleTimeString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stalls Health */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Stalls Health</h2>
              <p className="card-subtitle">Active food stalls overview</p>
            </div>

            <div className="grid grid-3" style={{ marginTop: "20px" }}>
              {stalls.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
                  No stalls found
                </p>
              ) : (
                stalls.map((stall) => (
                  <div
                    key={stall._id}
                    style={{
                      padding: "20px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "12px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                        {stall.stall_name}
                      </h3>
                      <span className={`status-badge ${stall.is_active ? "available" : "unavailable"}`}>
                        {stall.is_active ? "active" : "inactive"}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                      {stall.cuisine_type}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {stall.location || "No location"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
