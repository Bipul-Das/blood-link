import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateRequest = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // New loading state

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: 1,
    location: "",
    urgency: "standard",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    console.log("Submitting Form Data:", formData); // Debug log

    try {
      const res = await fetch("http://localhost:8080/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Server Response:", data); // Debug log

      if (data.success) {
        alert("✅ Request Created! Admins have been notified.");
        navigate("/dashboard/donor");
      } else {
        // Show the actual error message from backend
        alert(`❌ Error: ${data.message || "Unknown error occurred"}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("❌ Network Error: Could not connect to server.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🚑 Create Emergency Request</h2>
      <p>This will broadcast an alert to all donors and admins.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <label>Patient Name:</label>
        <input
          type="text"
          placeholder="Ex: John Doe"
          required
          value={formData.patientName}
          onChange={(e) =>
            setFormData({ ...formData, patientName: e.target.value })
          }
          style={{ padding: "10px" }}
        />

        <label>Blood Group:</label>
        <select
          required
          value={formData.bloodGroup}
          onChange={(e) =>
            setFormData({ ...formData, bloodGroup: e.target.value })
          }
          style={{ padding: "10px" }}
        >
          <option value="">Select Blood Group Needed</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <label>Units Needed:</label>
        <input
          type="number"
          min="1"
          placeholder="Ex: 2"
          required
          value={formData.units}
          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
          style={{ padding: "10px" }}
        />

        <label>Location / Hospital:</label>
        <input
          type="text"
          placeholder="Ex: City General Hospital, Room 302"
          required
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          style={{ padding: "10px" }}
        />

        <label>Urgency Level:</label>
        <select
          value={formData.urgency}
          onChange={(e) =>
            setFormData({ ...formData, urgency: e.target.value })
          }
          style={{ padding: "10px" }}
        >
          <option value="standard">Standard Priority</option>
          <option value="critical">CRITICAL (Life Threatening)</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#ccc" : "#d32f2f",
            color: "white",
            padding: "15px",
            fontSize: "1.1rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Broadcasting..." : "Broadcast Request"}
        </button>
      </form>
    </div>
  );
};

export default CreateRequest;
