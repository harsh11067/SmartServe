import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await api.get("/customers/me");
      setCustomerData(response.data);
      
      // Fetch active order if exists
      const ordersResponse = await api.get("/orders/my");
      const active = ordersResponse.data.find(
        (order) => order.status !== "delivered" && order.status !== "cancelled"
      );
      setActiveOrder(active || null);
      setRecentOrders(ordersResponse.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      toast.error("Failed to load dashboard data");
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
            <h1>Welcome Back!</h1>
            <p>Ready to order something delicious?</p>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stats Grid */}
          <div className="grid grid-3" style={{ marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-label">Loyalty Points</div>
              <div className="stat-value">{customerData?.loyalty_points || 0}</div>
              <div className="stat-change positive">+20 this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Order</div>
              <div className="stat-value">
                {activeOrder ? (
                  <span className={`status-badge ${activeOrder.status}`}>
                    {activeOrder.status}
                  </span>
                ) : (
                  "None"
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{recentOrders.length}</div>
              <div className="stat-change positive">From your account history</div>
            </div>
          </div>

          {/* Active Order Card */}
          {activeOrder && (
            <div className="card" style={{ marginBottom: "32px" }}>
              <div className="card-header">
                <h2 className="card-title">Active Order</h2>
                <span className={`status-badge ${activeOrder.status}`}>
                  {activeOrder.status}
                </span>
              </div>
              <div style={{ marginTop: "16px" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Order #{activeOrder._id?.slice(-6)}
                </p>
                <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
                  ₹{activeOrder.total_amount}
                </p>
                <Link to="/track" className="btn btn-primary">
                  Track Order
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-2" style={{ marginBottom: "32px" }}>
            <Link to="/menu" className="card" style={{ textDecoration: "none" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
              <h3 className="card-title">Browse Menu</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                Explore food stalls and place a new order
              </p>
            </Link>

            <Link to="/profile" className="card" style={{ textDecoration: "none" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📜</div>
              <h3 className="card-title">Order History</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                View past orders and loyalty rewards
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="table-container" style={{ marginTop: "20px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                        No recent activity yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id?.slice(-6)}</td>
                        <td>{new Date(order.order_date).toLocaleString()}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>₹{order.total_amount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
