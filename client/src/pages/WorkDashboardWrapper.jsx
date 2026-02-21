import React, { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import HospitalDashboard from "./HospitalDashboard";
import CollectorDashboard from "./CollectorDashboard";
import VolunteerDashboard from "./VolunteerDashboard";

const WorkDashboardWrapper = () => {
  const { user } = useContext(AuthContext);

  // Default view is based on the user's actual role
  // If Lead Dev, default to Admin, but allow switching
  const [viewMode, setViewMode] = useState(
    user?.role === "lead_dev" ? "admin" : user?.role
  );

  if (!user) return <div>Loading...</div>;

  // --- RENDER CONTENT BASED ON VIEW MODE ---
  const renderDashboard = () => {
    switch (viewMode) {
      case "admin":
      case "lead_dev":
        return <AdminDashboard />;
      case "hospital":
      case "bloodbank":
        return <HospitalDashboard />;
      case "collector": // <--- NEW CASE
        return <CollectorDashboard />;
      case "volunteer":
        return <VolunteerDashboard />;
      default:
        return <div>Unauthorized Access</div>;
    }
  };

  return (
    <div>
      {/* --- GOD MODE TOOLBAR (Only for Lead Dev) --- */}
      {user.role === "lead_dev" && (
        <div
          style={{
            backgroundColor: "#222",
            color: "#0f0",
            padding: "10px 20px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: "0.9rem",
          }}
        >
          <span>👾 DEV_MODE_ACTIVE:</span>
          <button
            onClick={() => setViewMode("admin")}
            style={btnStyle(viewMode === "admin")}
          >
            Admin View
          </button>
          <button
            onClick={() => setViewMode("hospital")}
            style={btnStyle(viewMode === "hospital")}
          >
            Hospital View
          </button>
          <button
            onClick={() => setViewMode("collector")}
            style={btnStyle(viewMode === "collector")}
          >
            Collector View
          </button>
        </div>
      )}

      {/* Render the selected dashboard */}
      {renderDashboard()}
    </div>
  );
};

// Helper style for the Dev buttons
const btnStyle = (isActive) => ({
  backgroundColor: isActive ? "#0f0" : "#444",
  color: isActive ? "#000" : "#fff",
  border: "none",
  padding: "5px 10px",
  cursor: "pointer",
  fontWeight: "bold",
  borderRadius: "4px",
});

export default WorkDashboardWrapper;
