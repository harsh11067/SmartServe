import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function Order() {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables");
      const availableTables = response.data.filter((t) => t.status === "free");
      setTables(availableTables);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to load tables");
    }
  };

  const updateQuantity = (itemId, delta) => {
    const updatedCart = cart.map((item) => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (itemId) => {
    const updatedCart = cart.filter((item) => item._id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        table_id: selectedTable,
        items: cart.map((item) => ({
          menu_item_id: item._id,
          quantity: item.quantity,
        })),
      };

      await api.post("/orders", orderData);
      
      // Clear cart
      localStorage.removeItem("cart");
      setCart([]);
      
      toast.success("Order placed successfully!");
      navigate("/order-tracking");
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-left">
              <h1>Your Order</h1>
              <p>Review and place your order</p>
            </div>
          </div>

          <div style={{ padding: "32px" }}>
            <div className="card" style={{ textAlign: "center", padding: "80px 32px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
              <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Your cart is empty</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                Add some delicious items from our menu
              </p>
              <button onClick={() => navigate("/menu")} className="btn btn-primary">
                Browse Menu
              </button>
            </div>
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
            <h1>Your Order</h1>
            <p>Review and place your order</p>
          </div>
          <div className="topbar-actions">
            <button onClick={() => navigate("/menu")} className="btn btn-secondary">
              ← Back to Menu
            </button>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          <div className="grid grid-2">
            {/* Cart Items */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Order Items</h2>
                <p className="card-subtitle">{cart.length} items in cart</p>
              </div>

              <div style={{ marginTop: "20px" }}>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      padding: "20px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
                          {item.item_name}
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                          {item.stall_id?.stall_name || "Unknown Stall"}
                        </p>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent-primary)", marginTop: "8px" }}>
                          ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="btn btn-ghost"
                        style={{ color: "var(--status-unavailable)", padding: "8px" }}
                      >
                        🗑️
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: "36px", height: "36px", padding: "0" }}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: "700", fontSize: "16px", minWidth: "30px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="btn btn-primary btn-sm"
                        style={{ width: "36px", height: "36px", padding: "0" }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Table Selection */}
            <div>
              <div className="card" style={{ marginBottom: "24px" }}>
                <div className="card-header">
                  <h2 className="card-title">Select Table</h2>
                  <p className="card-subtitle">Choose your dining table</p>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a table</option>
                    {tables.map((table) => (
                      <option key={table._id} value={table._id}>
                        Table {table.table_number} ({table.capacity} seats)
                      </option>
                    ))}
                  </select>

                  {tables.length === 0 && (
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "12px" }}>
                      No tables available at the moment
                    </p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Order Summary</h2>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                    <span style={{ fontWeight: "600" }}>₹{getCartTotal()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Tax (5%)</span>
                    <span style={{ fontWeight: "600" }}>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", marginTop: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700" }}>Total</span>
                    <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--accent-primary)" }}>
                      ₹{(getCartTotal() * 1.05).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || !selectedTable}
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", marginTop: "16px" }}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "16px" }}>
                    By placing this order, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
