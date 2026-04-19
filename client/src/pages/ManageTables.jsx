import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function ManageTables() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: "",
    status: "free",
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      await api.put(`/tables/${tableId}`, { status: newStatus });
      toast.success("Table status updated");
      fetchTables();
    } catch (error) {
      console.error("Failed to update table:", error);
      toast.error("Failed to update table status");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tables", formData);
      toast.success("Table added successfully");
      setShowAddModal(false);
      setFormData({ table_number: "", capacity: "", status: "free" });
      fetchTables();
    } catch (error) {
      console.error("Failed to add table:", error);
      toast.error("Failed to add table");
    }
  };

  const deleteTable = async (tableId) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    
    try {
      await api.delete(`/tables/${tableId}`);
      toast.success("Table deleted");
      fetchTables();
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast.error("Failed to delete table");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "free":
        return "available";
      case "occupied":
        return "pending";
      case "maintenance":
        return "unavailable";
      default:
        return "";
    }
  };

  const stats = {
    total: tables.length,
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    maintenance: tables.filter((t) => t.status === "maintenance").length,
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Loading...
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
            <h1>Table Management</h1>
            <p>Real-time floor management and table status</p>
          </div>
          <div className="topbar-actions">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              + Add Table
            </button>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Stats Grid */}
          <div className="grid grid-4" style={{ marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-label">Total Tables</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Available</div>
              <div className="stat-value" style={{ color: "var(--status-ready)" }}>
                {stats.free}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Occupied</div>
              <div className="stat-value" style={{ color: "var(--status-pending)" }}>
                {stats.occupied}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Maintenance</div>
              <div className="stat-value" style={{ color: "var(--status-unavailable)" }}>
                {stats.maintenance}
              </div>
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-4">
            {tables.map((table) => (
              <div
                key={table._id}
                className="card"
                style={{
                  borderLeft: `4px solid ${
                    table.status === "free"
                      ? "var(--status-ready)"
                      : table.status === "occupied"
                      ? "var(--status-pending)"
                      : "var(--status-unavailable)"
                  }`,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedTable(table)}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      margin: "0 auto 16px",
                    }}
                  >
                    🪑
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
                    {table.table_number}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px" }}>
                    {table.capacity} seats
                  </p>
                  <span className={`status-badge ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                  <select
                    value={table.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateTableStatus(table._id, e.target.value);
                    }}
                    className="form-select"
                    style={{ fontSize: "13px", padding: "8px 12px" }}
                  >
                    <option value="free">Free</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>Add New Table</h2>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label className="form-label">Table Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({ ...formData, table_number: e.target.value })
                  }
                  placeholder="T-01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="4"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="free">Free</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Details Modal */}
      {selectedTable && (
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
          onClick={() => setSelectedTable(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
                  {selectedTable.table_number}
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  {selectedTable.capacity} seats
                </p>
              </div>
              <span className={`status-badge ${getStatusColor(selectedTable.status)}`}>
                {selectedTable.status}
              </span>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="form-label">Update Status</label>
              <select
                value={selectedTable.status}
                onChange={(e) => {
                  updateTableStatus(selectedTable._id, e.target.value);
                  setSelectedTable({ ...selectedTable, status: e.target.value });
                }}
                className="form-select"
              >
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setSelectedTable(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  deleteTable(selectedTable._id);
                  setSelectedTable(null);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, background: "var(--status-unavailable)" }}
              >
                Delete Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
