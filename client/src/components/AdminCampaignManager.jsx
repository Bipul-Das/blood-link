import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/adminCampaignManager.css"; // Import the premium styles

const AdminCampaignManager = () => {
  const { token } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Campaign Launched Successfully!");
        setFormData({ title: "", description: "", date: "", location: "" });
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="acm-container">
      {/* HEADER */}
      <div className="acm-header">
        <div className="acm-icon">📢</div>
        <h3>Campaign Management Center</h3>
      </div>

      <div className="acm-layout">
        {/* --- LEFT SIDE: CREATION FORM --- */}
        <div className="acm-form-card">
          <h4 className="acm-form-title">Launch New Campaign</h4>
          <form onSubmit={handleSubmit} className="acm-form">
            <div className="acm-input-group">
              <label className="acm-label">Campaign Title</label>
              <input
                className="acm-input"
                type="text"
                placeholder="e.g. Summer Blood Drive"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="acm-input-group">
              <label className="acm-label">Description</label>
              <textarea
                className="acm-textarea"
                placeholder="Describe the mission & goals..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="acm-input-group">
              <label className="acm-label">Event Date</label>
              <input
                className="acm-input"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="acm-input-group">
              <label className="acm-label">Location</label>
              <input
                className="acm-input"
                type="text"
                placeholder="e.g. City Center Hall"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="acm-btn-submit">
              🚀 Publish Campaign
            </button>
          </form>
        </div>

        {/* --- RIGHT SIDE: CAMPAIGN LIST --- */}
        <div className="acm-list-section">
          <div className="acm-list-header">
            <h4>Active Campaigns Overview</h4>
          </div>

          <table className="acm-table">
            <thead>
              <tr>
                <th>Campaign Details</th>
                <th>Scheduled Date</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    No active campaigns yet. Start one today!
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="acm-campaign-title">{c.title}</div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        📍 {c.location}
                      </div>
                    </td>
                    <td>
                      <span className="acm-date">
                        📅 {new Date(c.date).toDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="acm-badge-participants">
                        👥 {c.participants.length} Interested
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignManager;
