import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/emergencyfeed.css";

// --- HELPER: BLOOD COMPATIBILITY RULES ---
const isBloodCompatible = (donorGroup, patientGroup) => {
  const rules = {
    "A+": ["A+", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "B+": ["B+", "AB+"],
    "AB+": ["AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal Donor
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB-": ["AB+", "AB-"],
  };

  return rules[donorGroup]?.includes(patientGroup);
};

const EmergencyFeed = ({ userOverride }) => {
  const { token, user: contextUser } = useContext(AuthContext);
  const activeUser = userOverride || contextUser;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondedIds, setRespondedIds] = useState([]);

  // --- NEW STATE: Sorting & Pagination ---
  const [showFulfilled, setShowFulfilled] = useState(false);
  const [visibleHistory, setVisibleHistory] = useState(3);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/requests/active",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setRequests(data.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    window.addEventListener("requestUpdated", fetchRequests);
    const interval = setInterval(fetchRequests, 5000);

    return () => {
      window.removeEventListener("requestUpdated", fetchRequests);
      clearInterval(interval);
    };
  }, [token]);

  const handleDonate = async (requestId, requestedGroup) => {
    if (!isBloodCompatible(activeUser.bloodGroup, requestedGroup)) {
      alert(
        `⚠️ Incompatible Blood Group!\n\nYou are ${activeUser.bloodGroup}, but this patient needs ${requestedGroup}.`
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/requests/${requestId}/volunteer`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRespondedIds([...respondedIds, requestId]);
        alert("Thank you! Admins have been notified.");
        window.dispatchEvent(new Event("requestUpdated"));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error volunteering:", error);
    }
  };

  // --- SORTING & FILTERING LOGIC ---
  const allRequests = requests.filter((req) =>
    ["pending", "arranging", "completed", "fulfilled"].includes(req.status)
  );

  // Sort: Oldest to Newest (Ascending)
  const sortedRequests = [...allRequests].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const activeList = sortedRequests.filter(
    (req) => req.status !== "completed" && req.status !== "fulfilled"
  );

  const historyList = sortedRequests.filter(
    (req) => req.status === "completed" || req.status === "fulfilled"
  );

  // --- RENDER HELPER ---
  const renderCard = (req) => {
    const isApplied =
      req.volunteers?.some((v) => v.user?._id === activeUser._id) ||
      respondedIds.includes(req._id);
    const isCompleted =
      req.status === "completed" || req.status === "fulfilled";

    // Eligibility Check
    let isMedicallyEligible = true;
    let eligibilityReason = "";

    if (activeUser) {
      if (activeUser.weight && activeUser.weight < 50) {
        isMedicallyEligible = false;
        eligibilityReason = "Weight < 50kg";
      } else if (activeUser.dateOfBirth) {
        const dob = new Date(activeUser.dateOfBirth);
        const age = Math.abs(
          new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970
        );
        if (age < 18) {
          isMedicallyEligible = false;
          eligibilityReason = "Under 18";
        }
      }

      if (isMedicallyEligible && activeUser.lastDonationDate) {
        const lastDate = new Date(activeUser.lastDonationDate);
        const diffDays = Math.ceil(
          Math.abs(new Date() - lastDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < 90) {
          isMedicallyEligible = false;
          eligibilityReason = `Wait ${90 - diffDays} days`;
        }
      }
    }

    return (
      <div
        key={req._id}
        className={`ef-card ${
          isCompleted
            ? "completed"
            : req.urgency === "high"
            ? "urgent"
            : "normal"
        }`}
      >
        <div className="ef-card-header">
          <div className="ef-blood-group">
            {req.bloodGroup} Blood
            {isCompleted ? (
              <span className="ef-badge completed">Fulfilled</span>
            ) : (
              req.urgency === "high" && (
                <span className="ef-badge critical">Critical</span>
              )
            )}
          </div>
          <span className="ef-date">
            {new Date(req.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="ef-details">
          <div className="ef-row">
            <strong>Patient:</strong> <span>{req.patientName}</span>
          </div>
          <div className="ef-row">
            <strong>Location:</strong> <span>{req.location}</span>
          </div>
        </div>

        {isCompleted ? (
          <button disabled className="ef-btn disabled">
            ✅ Request Fulfilled
          </button>
        ) : !isMedicallyEligible ? (
          <div>
            <button disabled className="ef-btn disabled">
              🚫 Not Eligible
            </button>
            <span className="ef-ineligible-msg">
              Reason: {eligibilityReason}
            </span>
          </div>
        ) : (
          <button
            onClick={() => handleDonate(req._id, req.bloodGroup)}
            disabled={isApplied || isCompleted}
            className={`ef-btn ${isApplied ? "applied" : "donate"}`}
          >
            {isApplied ? "Applied ✅" : "🙋‍♂️ I'll Donate"}
          </button>
        )}
      </div>
    );
  };

  if (loading) return <div className="emergency-feed-wrapper">Loading...</div>;

  return (
    <div className="emergency-feed-wrapper">
      <div className="ef-header">
        <div className="ef-live-indicator"></div>
        <h3>Emergency Requests</h3>
      </div>

      {/* Global Ineligibility Warning */}
      {activeUser?.weight < 50 && (
        <div className="ef-warning">
          ⚠️ <strong>Ineligible:</strong> Weight below 50kg.
        </div>
      )}

      {/* 1. ACTIVE REQUESTS */}
      <div className="ef-list">
        {activeList.length === 0 ? (
          <div className="ef-empty">No active emergency requests.</div>
        ) : (
          activeList.map((req) => renderCard(req))
        )}
      </div>

      {/* 2. HISTORY TOGGLE */}
      <div className="ef-history-section">
        <button
          onClick={() => setShowFulfilled(!showFulfilled)}
          className="ef-toggle-btn"
        >
          {showFulfilled ? "Hide History ⬆" : "Show Fulfilled History ⬇"}
        </button>

        {/* 3. FULFILLED REQUESTS */}
        {showFulfilled && (
          <div className="ef-list">
            {historyList.length === 0 ? (
              <div className="ef-empty">No fulfilled history found.</div>
            ) : (
              <>
                {historyList
                  .slice(0, visibleHistory)
                  .map((req) => renderCard(req))}

                {visibleHistory < historyList.length && (
                  <button
                    onClick={() => setVisibleHistory((prev) => prev + 3)}
                    className="ef-load-more"
                  >
                    Load More History
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyFeed;
