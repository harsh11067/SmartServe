import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function Menu() {
  const [loading, setLoading] = useState(true);
  const [stalls, setStalls] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedStall, setSelectedStall] = useState("all");
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const fetchData = async () => {
    try {
      const [stallsRes, menuRes] = await Promise.all([
        api.get("/stalls"),
        api.get("/menu"),
      ]);
      setStalls(stallsRes.data.filter((s) => s.is_active));
      setMenuItems(menuRes.data.filter((item) => item.is_available));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.item_name} added to cart`);
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((cartItem) => cartItem._id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem._id !== itemId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredItems =
    selectedStall === "all"
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.stall_id?._id === selectedStall || item.stall_id === selectedStall
        );

  const categories = [...new Set(menuItems.map((item) => item.category))];

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Loading menu...
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
            <h1>Menu</h1>
            <p>Browse and order from our food stalls</p>
          </div>
          <div className="topbar-actions">
            {cart.length > 0 && (
              <button
                onClick={() => navigate("/order")}
                className="btn btn-primary"
                style={{ position: "relative" }}
              >
                🛒 View Cart ({getCartItemCount()})
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "var(--status-ready)",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {getCartItemCount()}
                </span>
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stall Filter */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelectedStall("all")}
                className={`btn ${
                  selectedStall === "all" ? "btn-primary" : "btn-secondary"
                }`}
              >
                All Stalls
              </button>
              {stalls.map((stall) => (
                <button
                  key={stall._id}
                  onClick={() => setSelectedStall(stall._id)}
                  className={`btn ${
                    selectedStall === stall._id ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {stall.stall_name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-3">
            {filteredItems.map((item) => {
              const cartItem = cart.find((c) => c._id === item._id);
              const quantity = cartItem ? cartItem.quantity : 0;

              return (
                <div key={item._id} className="menu-card">
                  <div className="menu-card-image">
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "64px",
                      }}
                    >
                      🍽️
                    </div>
                  </div>
                  <div className="menu-card-content">
                    <h3 className="menu-card-title">{item.item_name}</h3>
                    <p className="menu-card-description">
                      {item.stall_id?.stall_name || "Unknown Stall"} • {item.category}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                      ⏱️ {item.prep_time} min
                    </p>
                    <div className="menu-card-footer">
                      <div className="menu-card-price">₹{item.price}</div>
                      {quantity > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                          >
                            −
                          </button>
                          <span style={{ fontWeight: "700", fontSize: "16px" }}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="btn btn-primary btn-sm"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="btn btn-primary btn-sm"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "80px 32px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🍽️</div>
              <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>No Items Available</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Try selecting a different stall
              </p>
            </div>
          )}
        </div>

        {/* Floating Cart Summary */}
        {cart.length > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "var(--shadow-lg)",
              minWidth: "300px",
              zIndex: 100,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontWeight: "600" }}>Cart Total</span>
              <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--accent-primary)" }}>
                ₹{getCartTotal()}
              </span>
            </div>
            <button
              onClick={() => navigate("/order")}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Proceed to Order →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
