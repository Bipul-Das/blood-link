import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/hospitalDashboard.css";

const HospitalDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stock");
  const [history, setHistory] = useState([]);

  // Add Unit Form State
  const [formData, setFormData] = useState({
    bloodGroup: "A+",
    batchNumber: "",
    expiryDate: "",
    units: 1,
  });

  // Fetch Current Stock
  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInventory(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transaction History
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/inventory/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") fetchHistory();
    else fetchInventory();
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Unit Added Successfully");
        setFormData({
          bloodGroup: "A+",
          batchNumber: "",
          expiryDate: "",
          units: 1,
        });
        fetchInventory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (item, status) => {
    let details = null;
    let unitsToUse = 0;

    if (status === "used") {
      const input = window.prompt(
        `How many units to use? (Available: ${item.units})`,
        "1"
      );
      if (!input) return;
      unitsToUse = parseInt(input);
      if (isNaN(unitsToUse) || unitsToUse <= 0 || unitsToUse > item.units) {
        alert("Invalid quantity.");
        return;
      }
      details = window.prompt(
        "Enter Usage Details (e.g., 'Surgery - Patient #1024'):"
      );
      if (!details) return;
    } else {
      if (!window.confirm(`Discard entire batch ${item.batchNumber}?`)) return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/inventory/${item._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            usageDetails: details,
            unitsUsed: unitsToUse,
          }),
        }
      );
      const data = await res.json();
      if (data.success) fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hospital-container">
      <h1>{user.name} - Inventory Manager</h1>

      <div className="dashboard-layout">
        {/* LEFT: ADD FORM */}
        <div className="form-card">
          <h3>➕ Add Blood Unit</h3>
          <form onSubmit={handleAdd}>
            <label>Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) =>
                setFormData({ ...formData, bloodGroup: e.target.value })
              }
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>

            <label>Batch Number</label>
            <input
              type="text"
              placeholder="Ex: B2023-X"
              value={formData.batchNumber}
              onChange={(e) =>
                setFormData({ ...formData, batchNumber: e.target.value })
              }
              required
            />

            <label>Expiry Date</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              required
            />

            <label>Units (Bags)</label>
            <input
              type="number"
              min="1"
              value={formData.units}
              onChange={(e) =>
                setFormData({ ...formData, units: parseInt(e.target.value) })
              }
              required
            />

            <button type="submit">Add to Stock</button>
          </form>
        </div>

        {/* RIGHT: DATA TABLE */}
        <div className="table-card">
          {/* TABS */}
          <div className="hos-tabs">
            <button
              onClick={() => handleTabChange("stock")}
              className={`hos-tab-btn ${activeTab === "stock" ? "active" : ""}`}
            >
              Current Stock
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`hos-tab-btn ${
                activeTab === "history" ? "active" : ""
              }`}
            >
              Usage History
            </button>
          </div>

          {loading ? (
            <p
              style={{ padding: "30px", textAlign: "center", color: "#64748b" }}
            >
              Loading inventory data...
            </p>
          ) : (
            <table className="hos-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Group</th>
                  <th>
                    {activeTab === "stock" ? "Available Units" : "Used Units"}
                  </th>
                  <th>
                    {activeTab === "stock" ? "Expiry Date" : "Transaction Date"}
                  </th>
                  <th>Status / Action Type</th>
                  {activeTab === "history" && <th>Usage Details</th>}
                  {activeTab === "stock" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === "stock" ? inventory : history).map((item) => {
                  // --- ACTIVE STOCK VIEW ---
                  if (activeTab === "stock") {
                    const isExpired = new Date() > new Date(item.expiryDate);
                    return (
                      <tr
                        key={item._id}
                        className={isExpired ? "hos-expired-row" : ""}
                      >
                        <td>
                          <strong>{item.batchNumber}</strong>
                        </td>
                        <td
                          style={{
                            fontWeight: "800",
                            color: "var(--hos-primary)",
                          }}
                        >
                          {item.bloodGroup}
                        </td>
                        <td style={{ fontWeight: "bold" }}>{item.units}</td>
                        <td>
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {isExpired && (
                            <span className="hos-badge-expired">(EXPIRED)</span>
                          )}
                        </td>
                        <td>
                          <span className="hos-badge-avail">Available</span>
                        </td>
                        <td>
                          {isExpired ? (
                            <button
                              onClick={() =>
                                handleStatusUpdate(item, "discarded")
                              }
                              className="btn-action-discard"
                            >
                              Discard
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(item, "used")}
                              className="btn-action-use"
                            >
                              Mark Used
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }

                  // --- HISTORY LOG VIEW ---
                  else {
                    return (
                      <tr key={item._id}>
                        <td>{item.batchNumber}</td>
                        <td style={{ fontWeight: "bold", color: "#64748b" }}>
                          {item.bloodGroup}
                        </td>
                        <td style={{ fontWeight: "bold", color: "#ef4444" }}>
                          -{item.units}
                        </td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>
                          <span
                            style={{
                              backgroundColor:
                                item.action === "used" ? "#e0f2fe" : "#fee2e2",
                              color:
                                item.action === "used" ? "#0369a1" : "#991b1b",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.action}
                          </span>
                        </td>
                        <td style={{ fontStyle: "italic", color: "#64748b" }}>
                          {item.details || "N/A"}
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
