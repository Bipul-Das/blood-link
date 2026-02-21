import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

const CampaignList = () => {
  const { token, user } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Campaigns on Mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/campaigns/active",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setCampaigns(data.data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [token]);

  // Handle Join Action
  const handleJoin = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/campaigns/${id}/join`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        // Optimistically update UI: Add current user ID to participants list locally
        setCampaigns(
          campaigns.map((camp) =>
            camp._id === id
              ? { ...camp, participants: [...camp.participants, user._id] }
              : camp
          )
        );
      }
    } catch (error) {
      console.error("Error joining:", error);
    }
  };

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="campaign-section">
      <h3>📢 Active Campaigns</h3>

      {campaigns.length === 0 ? (
        <p>No active donation drives nearby. Check back later!</p>
      ) : (
        <div className="campaign-grid" style={{ display: "grid", gap: "15px" }}>
          {campaigns.map((camp) => {
            const isJoined = camp.participants.includes(user._id);

            return (
              <div
                key={camp._id}
                style={{
                  border: "1px solid #2196f3",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#e3f2fd",
                }}
              >
                <h4 style={{ margin: "0 0 5px 0", color: "#1565c0" }}>
                  {camp.title}
                </h4>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                  {camp.description}
                </p>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#555",
                    marginBottom: "10px",
                  }}
                >
                  <strong>📍 {camp.location}</strong> <br />
                  📅 {new Date(camp.startDate).toLocaleDateString()} -{" "}
                  {new Date(camp.endDate).toLocaleDateString()}
                </div>

                <button
                  onClick={() => handleJoin(camp._id)}
                  disabled={isJoined}
                  style={{
                    backgroundColor: isJoined ? "#4caf50" : "#2196f3",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: isJoined ? "default" : "pointer",
                  }}
                >
                  {isJoined ? "Joined ✅" : "Join Campaign"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
