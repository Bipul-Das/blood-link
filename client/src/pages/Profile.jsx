import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/profile.css";

const Profile = () => {
  const { token, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    address: "",
    city: "",
    location: "", // Added Area
    weight: "",
    dateOfBirth: "",
    password: "",
    newPassword: "",
  });

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const u = data.user;
          const formattedDOB = u.dateOfBirth
            ? new Date(u.dateOfBirth).toISOString().split("T")[0]
            : "";

          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            bloodGroup: u.bloodGroup || "",
            address: u.address || "",
            city: u.city || "",
            location: u.location || "", // Map Area
            weight: u.weight || "",
            dateOfBirth: formattedDOB,
            password: "",
            newPassword: "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Updates
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && !formData.password) {
      alert("Please enter your current password to set a new one.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Profile Updated Successfully!");
        setIsEditing(false);
        updateUser(data.user);
        setFormData((prev) => ({ ...prev, password: "", newPassword: "" }));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="profile-container">Loading Profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* --- HEADER --- */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn-toggle ${isEditing ? "active" : ""}`}
          >
            {isEditing ? (
              <>
                <span>✕</span> Cancel Edit
              </>
            ) : (
              <>
                <span>✎</span> Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="profile-content">
          <form onSubmit={handleSubmit}>
            {/* --- SECTION 1: PERSONAL INFO --- */}
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className={`form-input ${isEditing ? "locked" : ""}`}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* --- SECTION 2: ADDRESS & PHYSICAL --- */}
            <h3 className="section-title">Address & Physical Details</h3>
            <div className="form-grid">
              <div className="input-group form-full-width">
                <label className="input-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="House No, Street Name"
                />
              </div>

              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="City"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Area / District</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Area or District"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="0"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>

            {/* --- SECTION 3: CHANGE PASSWORD (Only in Edit Mode) --- */}
            {isEditing && (
              <div className="password-section">
                <h3 className="password-header">🔒 Security Settings</h3>
                <p className="password-desc">
                  To change your password, enter your current password and the
                  new one below. Leave blank to keep current.
                </p>
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Current Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Required for changes"
                      className="form-input"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <button type="submit" className="btn-save">
                Save Changes
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
