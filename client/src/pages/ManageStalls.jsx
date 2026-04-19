import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function ManageStalls() {
  const [loading, setLoading] = useState(true);
  const [stalls, setStalls] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showStallModal, setShowStallModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [stallForm, setStallForm] = useState({
    stall_name: "",
    cuisine_type: "",
    location: "",
    is_active: true,
  });
  const [menuForm, setMenuForm] = useState({
    stall_id: "",
    item_name: "",
    category: "",
    price: "",
    prep_time: "",
    is_available: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stallsRes, menuRes] = await Promise.all([
        api.get("/stalls"),
        api.get("/menu"),
      ]);
      setStalls(stallsRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStall = async (e) => {
    e.preventDefault();
    try {
      await api.post("/stalls", stallForm);
      toast.success("Stall added successfully");
      setShowStallModal(false);
      setStallForm({ stall_name: "", cuisine_type: "", location: "", is_active: true });
      fetchData();
    } catch (error) {
      console.error("Failed to add stall:", error);
      toast.error("Failed to add stall");
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      await api.post("/menu", menuForm);
      toast.success("Menu item added successfully");
      setShowMenuModal(false);
      setMenuForm({
        stall_id: "",
        item_name: "",
        category: "",
        price: "",
        prep_time: "",
        is_available: true,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to add menu item:", error);
      toast.error("Failed to add menu item");
    }
  };

  const toggleStallStatus = async (stallId, currentStatus) => {
    try {
      await api.put(`/stalls/${stallId}`, { is_active: !currentStatus });
      toast.success("Stall status updated");
      fetchData();
    } catch (error) {
      console.error("Failed to update stall:", error);
      toast.error("Failed to update stall");
    }
  };

  const toggleMenuItemAvailability = async (itemId, currentStatus) => {
    try {
      await api.patch(`/menu/${itemId}/availability`, { is_available: !currentStatus });
      toast.success("Menu item updated");
      fetchData();
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Failed to update menu item");
    }
  };

  const deleteStall = async (stallId) => {
    if (!confirm("Are you sure? This will also delete all menu items for this stall.")) return;
    
    try {
      await api.delete(`/stalls/${stallId}`);
      toast.success("Stall deleted");
      fetchData();
    } catch (error) {
      console.error("Failed to delete stall:", error);
      toast.error("Failed to delete stall");
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      await api.delete(`/menu/${itemId}`);
      toast.success("Menu item deleted");
      fetchData();
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  const getStallMenuItems = (stallId) => {
    return menuItems.filter((item) => item.stall_id?._id === stallId || item.stall_id === stallId);
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
            <h1>Manage Stalls & Menu</h1>
            <p>Full CRUD for stalls and menu items</p>
          </div>
          <div className="topbar-actions">
            <button onClick={() => setShowMenuModal(true)} className="btn btn-secondary">
              + Add Menu Item
            </button>
            <button onClick={() => setShowStallModal(true)} className="btn btn-primary">
              + Add Stall
            </button>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stats */}
          <div className="grid grid-3" style={{ marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-label">Total Stalls</div>
              <div className="stat-value">{stalls.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Stalls</div>
              <div className="stat-value" style={{ color: "var(--status-ready)" }}>
                {stalls.filter((s) => s.is_active).length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Menu Items</div>
              <div className="stat-value">{menuItems.length}</div>
            </div>
          </div>

          {/* Stalls List */}
          {stalls.map((stall) => (
            <div key={stall._id} className="card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>{stall.stall_name}</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {stall.cuisine_type} • {stall.location || "No location"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span className={`status-badge ${stall.is_active ? "available" : "unavailable"}`}>
                    {stall.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleStallStatus(stall._id, stall.is_active)}
                    className="btn btn-secondary btn-sm"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => deleteStall(stall._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ background: "var(--status-unavailable)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Menu Items for this Stall */}
              <div>
                <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text-secondary)" }}>
                  Menu Items ({getStallMenuItems(stall._id).length})
                </h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Prep Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getStallMenuItems(stall._id).length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                            No menu items yet
                          </td>
                        </tr>
                      ) : (
                        getStallMenuItems(stall._id).map((item) => (
                          <tr key={item._id}>
                            <td style={{ fontWeight: "600" }}>{item.item_name}</td>
                            <td>{item.category}</td>
                            <td>₹{item.price}</td>
                            <td>{item.prep_time} min</td>
                            <td>
                              <span className={`status-badge ${item.is_available ? "available" : "unavailable"}`}>
                                {item.is_available ? "Available" : "Unavailable"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => toggleMenuItemAvailability(item._id, item.is_available)}
                                  className="btn btn-ghost btn-sm"
                                >
                                  Toggle
                                </button>
                                <button
                                  onClick={() => deleteMenuItem(item._id)}
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--status-unavailable)" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Stall Modal */}
      {showStallModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowStallModal(false)}
        >
          <div className="card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>Add New Stall</h2>
            <form onSubmit={handleAddStall}>
              <div className="form-group">
                <label className="form-label">Stall Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={stallForm.stall_name}
                  onChange={(e) => setStallForm({ ...stallForm, stall_name: e.target.value })}
                  placeholder="Grill Station"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cuisine Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={stallForm.cuisine_type}
                  onChange={(e) => setStallForm({ ...stallForm, cuisine_type: e.target.value })}
                  placeholder="American, Asian, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={stallForm.location}
                  onChange={(e) => setStallForm({ ...stallForm, location: e.target.value })}
                  placeholder="Food Court Section A"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setShowStallModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Stall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showMenuModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowMenuModal(false)}
        >
          <div className="card" style={{ maxWidth: "500px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>Add Menu Item</h2>
            <form onSubmit={handleAddMenuItem}>
              <div className="form-group">
                <label className="form-label">Stall</label>
                <select
                  className="form-select"
                  value={menuForm.stall_id}
                  onChange={(e) => setMenuForm({ ...menuForm, stall_id: e.target.value })}
                  required
                >
                  <option value="">Select a stall</option>
                  {stalls.map((stall) => (
                    <option key={stall._id} value={stall._id}>
                      {stall.stall_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={menuForm.item_name}
                  onChange={(e) => setMenuForm({ ...menuForm, item_name: e.target.value })}
                  placeholder="Smoked Paneer Burger"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={menuForm.category}
                  onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  placeholder="Burgers, Drinks, etc."
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    placeholder="189"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={menuForm.prep_time}
                    onChange={(e) => setMenuForm({ ...menuForm, prep_time: e.target.value })}
                    placeholder="12"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setShowMenuModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
