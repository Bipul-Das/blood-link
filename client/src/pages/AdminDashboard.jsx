import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import AdminCampaignManager from "../components/AdminCampaignManager";
import AdminRequestManager from "../components/AdminRequestManager";
import QuestionManager from "../components/QuestionManager";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("staff");
  const [hospitals, setHospitals] = useState([]);

  // --- 1. Form State Initialization ---
  const initialFormState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "volunteer",
    bloodGroup: "",
    address: "",
    city: "",
    location: "",
    affiliatedHospital: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // --- 2. Fetch Users & Extract Hospitals ---
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);

        // Filter Hospitals/Blood Banks for the Dropdown
        const hospitalList = data.data.filter(
          (u) => u.role === "hospital" || u.role === "bloodbank"
        );
        setHospitals(hospitalList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // --- 3. Handle Submit (Create/Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:8080/api/admin/users/${editingId}`
      : "http://localhost:8080/api/admin/users";
    const method = editingId ? "PUT" : "POST";

    const submissionData = { ...formData };

    if (
      submissionData.role !== "collector" ||
      !submissionData.affiliatedHospital
    ) {
      submissionData.affiliatedHospital = null;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });
      const data = await res.json();

      if (data.success) {
        alert(
          editingId ? "User Updated Successfully" : "User Created Successfully"
        );
        setFormData(initialFormState);
        setEditingId(null);
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. Handle Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await fetch(`http://localhost:8080/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // --- 5. Populate Form for Edit ---
  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone || "",
      role: user.role,
      bloodGroup: user.bloodGroup || "",
      address: user.address || "",
      city: user.city || "",
      location: user.location || "",
      affiliatedHospital: user.affiliatedHospital || "",
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- 6. Handle Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- 7. Handle Blur ---
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "name") {
      formattedValue = value
        .toLowerCase()
        .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
    }

    if (name === "email") {
      formattedValue = value.toLowerCase();
    }

    if (formattedValue !== value) {
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  // Helper for Badge Classes
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-admin";
      case "hospital":
        return "role-hospital";
      case "collector":
        return "role-collector";
      case "volunteer":
        return "role-volunteer";
      default:
        return "role-donor";
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Control Center</h1>

      {/* --- NAVIGATION TABS --- */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab("staff")}
          style={{ fontWeight: activeTab === "staff" ? "bold" : "normal" }}
        >
          Staff Management
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          style={{ fontWeight: activeTab === "queue" ? "bold" : "normal" }}
        >
          Emergency Queue
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          style={{ fontWeight: activeTab === "qa" ? "bold" : "normal" }}
        >
          Community Q&A
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          style={{ fontWeight: activeTab === "campaigns" ? "bold" : "normal" }}
        >
          Campaigns
        </button>
      </div>

      {/* --- CONTENT SECTIONS --- */}
      {activeTab === "queue" && <AdminRequestManager />}
      {activeTab === "campaigns" && <AdminCampaignManager />}
      {activeTab === "qa" && <QuestionManager />}

      {activeTab === "staff" && (
        <div className="staff-section">
          {/* --- STAFF FORM --- */}
          <div className="staff-form-card">
            <h3>
              {editingId
                ? "✏️ Edit User Details"
                : "✨ Create New Staff Member"}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Email Address"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder={
                  editingId ? "New Password (Leave blank to keep)" : "Password"
                }
                value={formData.password}
                onChange={handleChange}
                required={!editingId}
              />

              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="volunteer">Volunteer</option>
                <option value="collector">Blood Collector</option>
                <option value="hospital">Hospital Representative</option>
                <option value="bloodbank">Blood Bank Representative</option>
                <option value="admin">Administrator</option>
                <option value="donor">Donor</option>
              </select>

              {/* Conditional Employer Field */}
              {formData.role === "collector" && (
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "var(--adm-text-muted)",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Assign to Hospital/Bank:
                  </label>
                  <select
                    name="affiliatedHospital"
                    value={formData.affiliatedHospital}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Affiliation --</option>
                    {hospitals.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address"
                required
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Area / District"
                required
              />

              <button type="submit">
                {editingId ? "Update User Profile" : "Create Account"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(initialFormState);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* --- STAFF LIST TABLE --- */}
          <h3>Registered System Users</h3>
          <table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role & Affiliation</th>
                <th>Contact</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.name}</strong>
                    <div className="staff-phone">{u.phone || "No phone"}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                      {u.role.toUpperCase()}
                    </span>
                    {u.affiliatedHospital && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          marginTop: "6px",
                        }}
                      >
                        🏢{" "}
                        {users.find((h) => h._id === u.affiliatedHospital)
                          ?.name || "Unknown"}
                      </div>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleEdit(u)}
                      className="btn-edit-user"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="btn-delete-user"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
