import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function KitchenDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadError, setLoadError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchKitchenData();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchKitchenData, 10000);
    return () => clearInterval(interval);
  }, [user?.stall_id, user?.role]);

  const fetchKitchenData = async () => {
    try {
      setLoadError("");
      const [ordersResponse, menuResponse] = await Promise.all([
        api.get("/orders/stall"),
        api.get("/menu"),
      ]);
      
      setOrders(ordersResponse.data);
      
      // Filter menu items by current user's stall_id
      const stallId = user?.stall_id;
      if (stallId) {
        const filteredMenu = menuResponse.data.filter(
          (item) => item.stall_id?._id === stallId || item.stall_id === stallId
        );
        setMenuItems(filteredMenu);
      } else {
        setMenuItems(menuResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch kitchen data:", error);
      const message = error.response?.data?.message || "Failed to load kitchen data";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchKitchenData();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      await api.patch(`/menu/${itemId}/availability`, {
        is_available: !currentStatus,
      });
      toast.success(`Menu item ${!currentStatus ? "enabled" : "disabled"}`);
      fetchKitchenData();
    } catch (error) {
      console.error("Failed to toggle item availability:", error);
      toast.error("Failed to update menu item");
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

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
            <h1>Kitchen Dashboard</h1>
            <p>Manage incoming orders and menu availability</p>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stats Grid */}
          <div className="grid grid-3" style={{ marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-label">Pending Orders</div>
              <div className="stat-value">{pendingOrders.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Preparing</div>
              <div className="stat-value">{preparingOrders.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Available Items</div>
              <div className="stat-value">
                {menuItems.filter((item) => item.is_available).length}
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            {/* Orders Queue */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Incoming Orders</h2>
                <p className="card-subtitle">Orders waiting to be prepared</p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {loadError ? (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                      {loadError}
                    </p>
                    <button onClick={fetchKitchenData} className="btn btn-secondary">
                      Retry
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: "44px", marginBottom: "12px" }}>🍳</div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                      No incoming orders right now
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                      New pending orders for your stall will appear here automatically.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <div className="order-card-id">Order #{order._id?.slice(-6)}</div>
                          <div className="order-card-time">
                            {new Date(order.order_date).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="order-card-items">
                        {(order.items || []).length > 0 && (
                          <div style={{ marginBottom: "12px" }}>
                            {(order.items || []).map((item) => (
                              <p
                                key={item._id}
                                style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                              >
                                {item.quantity}x {item.menu_item_id?.item_name || "Menu item"}
                              </p>
                            ))}
                          </div>
                        )}
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                          Table: {order.table_id?.table_number || "N/A"}
                        </p>
                        <p style={{ fontSize: "16px", fontWeight: "600", marginTop: "8px" }}>
                          ₹{order.total_amount}
                        </p>
                      </div>

                      <div className="order-card-footer">
                        {order.status === "pending" && (
                          <button
                            onClick={() => updateOrderStatus(order._id, "preparing")}
                            className="btn btn-primary"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() => updateOrderStatus(order._id, "ready")}
                            className="btn btn-primary"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Menu Availability */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Menu Availability</h2>
                <p className="card-subtitle">Toggle item availability</p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {menuItems.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>
                    No menu items found for your stall
                  </p>
                ) : (
                  menuItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: "16px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                            {item.item_name}
                          </h3>
                          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                            ₹{item.price} • {item.prep_time} min
                          </p>
                        </div>
                        <span className={`status-badge ${item.is_available ? "available" : "unavailable"}`}>
                          {item.is_available ? "available" : "unavailable"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleItemAvailability(item._id, item.is_available)}
                        className={item.is_available ? "btn btn-secondary" : "btn btn-primary"}
                        style={{ width: "100%" }}
                      >
                        {item.is_available ? "Set Unavailable" : "Set Available"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
