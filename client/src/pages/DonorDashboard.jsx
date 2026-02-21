import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import EmergencyFeed from "../components/EmergencyFeed";
import { Link } from "react-router-dom";
import "../styles/donordashboard.css";

const DonorDashboard = () => {
  const { user, logout, token } = useContext(AuthContext);

  // --- 1. LIVE PROFILE STATE ---
  const [profile, setProfile] = useState(user);

  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verifiedHistory, setVerifiedHistory] = useState([]);

  // --- NEW STATE FOR SORTING & PAGINATION ---
  const [showFulfilled, setShowFulfilled] = useState(false);
  const [visibleFulfilledCount, setVisibleFulfilledCount] = useState(3);

  // --- 2. FETCH LIVE PROFILE DATA (Auto-Refresh) ---
  useEffect(() => {
    if (!token) return;

    const fetchLiveProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      }
    };

    fetchLiveProfile();
    const intervalId = setInterval(fetchLiveProfile, 5000);
    return () => clearInterval(intervalId);
  }, [token]);

  // --- 3. FETCH DASHBOARD DATA ---
  useEffect(() => {
    if (!token || !user) return;

    const fetchData = async () => {
      try {
        // 1. Fetch Requests
        const res = await fetch("http://localhost:8080/api/requests/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          // A. Contributions
          const donations = data.data.filter((req) =>
            req.volunteers.some(
              (v) =>
                v.user &&
                v.user._id.toString() === user._id.toString() &&
                v.status === "assigned"
            )
          );
          setMyDonations(donations);

          // B. My Requests
          const requests = data.data.filter(
            (req) =>
              req.requesterId &&
              req.requesterId._id.toString() === user._id.toString()
          );
          setMyRequests(requests);
        }

        // 2. Fetch Campaigns
        const campRes = await fetch("http://localhost:8080/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campData = await campRes.json();
        if (campData.success) setCampaigns(campData.data);

        // 3. Fetch Verified History
        const historyRes = await fetch(
          "http://localhost:8080/api/collections/my-history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const historyData = await historyRes.json();
        if (historyData.success) setVerifiedHistory(historyData.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token, user]);

  // Handle Mark Completed
  const handleComplete = async (reqId) => {
    if (
      !window.confirm(
        "Are you sure you received the blood? This will close the request."
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/${reqId}/complete`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Request Closed Successfully.");
        window.dispatchEvent(new Event("requestUpdated"));
        setMyRequests((prev) =>
          prev.map((r) =>
            r._id === reqId ? { ...r, status: "completed" } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Join Campaign
  const handleJoinCampaign = async (campaignId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/campaigns/${campaignId}/join`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ You have joined this campaign!");
        setCampaigns((prev) =>
          prev.map((c) =>
            c._id === campaignId
              ? { ...c, participants: [...c.participants, user._id] }
              : c
          )
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Calculate Age
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  // --- SORTING LOGIC ---
  const activeRequests = myRequests
    .filter((req) => req.status !== "completed" && req.status !== "fulfilled")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const fulfilledRequests = myRequests
    .filter((req) => req.status === "completed" || req.status === "fulfilled")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (!profile)
    return <div className="dashboard-container">Loading profile...</div>;

  const currentAge = calculateAge(profile.dateOfBirth);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dash-header">
        <div className="dash-welcome">
          <h1>
            Hello, <span>{profile.name}</span> 👋
          </h1>
          <span className="dash-id">
            ID: {profile._id.slice(-6).toUpperCase()}
          </span>
        </div>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </header>

      {/* ACTION BAR */}
      <div className="action-bar">
        <Link to="/create-request" className="btn-create-request">
          <span>🚑</span> Create Emergency Request
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <aside className="left-col">
          
          {/* PROFILE CARD */}
          <div className="dash-card profile-card">
            <h3>👤 My Profile</h3>
            <div className="profile-details">
              <p>
                Blood Group:{" "}
                <span className="blood-group-badge">{profile.bloodGroup}</span>
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
              <p>
                <strong>Weight:</strong>{" "}
                {profile.weight ? `${profile.weight} kg` : "Not Set"}
              </p>
              <p>
                <strong>Age:</strong>{" "}
                {currentAge !== null ? `${currentAge} years` : "Unknown"}
              </p>
              <p>
                <strong>Last Donation:</strong>{" "}
                {profile.lastDonationDate
                  ? new Date(profile.lastDonationDate).toDateString()
                  : "Never"}
              </p>
            </div>

            {/* LIVE ELIGIBILITY LOGIC */}
            {(() => {
              // 1. Age Check
              if (currentAge !== null && currentAge < 18) {
                return (
                  <div className="status-box error">
                    ❌ <strong>Not Eligible</strong>
                    <span className="status-detail">Must be 18+ years old.</span>
                  </div>
                );
              }
              // 2. Weight Check
              if (profile.weight && profile.weight < 50) {
                return (
                  <div className="status-box error">
                    ❌ <strong>Not Eligible</strong>
                    <span className="status-detail">Min weight 50kg required.</span>
                  </div>
                );
              }
              // 3. Date Check
              if (!profile.lastDonationDate) {
                return (
                  <div className="status-box success">
                    ✅ Eligible to Donate Now
                  </div>
                );
              }
              const lastDate = new Date(profile.lastDonationDate);
              const today = new Date();
              const diffTime = Math.abs(today - lastDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const waitPeriod = 90;

              if (diffDays >= waitPeriod) {
                return (
                  <div className="status-box success">
                    ✅ Eligible to Donate Now
                  </div>
                );
              } else {
                const remaining = waitPeriod - diffDays;
                const nextDate = new Date(lastDate);
                nextDate.setDate(lastDate.getDate() + waitPeriod);
                return (
                  <div className="status-box error">
                    ⏳ <strong>Wait {remaining} Days</strong>
                    <span className="status-detail">
                      Next eligible: {nextDate.toDateString()}
                    </span>
                  </div>
                );
              }
            })()}
          </div>

          {/* MY REQUESTS SECTION */}
          <div className="dash-card requests-card">
            <h3>📢 My Requests</h3>

            {/* A. UNFULFILLED REQUESTS */}
            <div className="sub-header">
              <span>⚠️ Pending / Active</span>
            </div>
            {activeRequests.length === 0 ? (
              <p className="empty-msg">No active requests.</p>
            ) : (
              <div>
                {activeRequests.map((req) => (
                  <RequestCard
                    key={req._id}
                    req={req}
                    handleComplete={handleComplete}
                  />
                ))}
              </div>
            )}

            {/* TOGGLE HISTORY */}
            <div className="history-toggle-area">
              <div className="sub-header" style={{margin: 0, color: 'var(--dash-success)'}}>
                <span>✅ Fulfilled History</span>
              </div>
              <button
                onClick={() => setShowFulfilled(!showFulfilled)}
                className="btn-toggle-history"
              >
                {showFulfilled ? "Hide History ⬆" : "Show History ⬇"}
              </button>
            </div>

            {/* B. FULFILLED REQUESTS */}
            {showFulfilled && (
              <div className="fulfilled-list" style={{ marginTop: '15px' }}>
                {fulfilledRequests.length === 0 ? (
                  <p className="empty-msg">No history found.</p>
                ) : (
                  <>
                    {fulfilledRequests
                      .slice(0, visibleFulfilledCount)
                      .map((req) => (
                        <RequestCard
                          key={req._id}
                          req={req}
                          handleComplete={handleComplete}
                        />
                      ))}

                    {/* Load More */}
                    {visibleFulfilledCount < fulfilledRequests.length && (
                      <button
                        onClick={() =>
                          setVisibleFulfilledCount((prev) => prev + 3)
                        }
                        className="btn-load-more"
                      >
                        Load More Records
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* UPCOMING CAMPAIGNS */}
          <div className="dash-card campaigns-card">
            <h3>🎉 Upcoming Campaigns</h3>
            {campaigns.length === 0 ? (
              <p className="empty-msg">No active campaigns.</p>
            ) : (
              <div>
                {campaigns.map((camp) => {
                  const isJoined = camp.participants.includes(user._id);
                  return (
                    <div key={camp._id} className="camp-item">
                      <div className="camp-title-row">
                        <h4>{camp.title}</h4>
                        <span className="camp-date">
                          {new Date(camp.date).toDateString()}
                        </span>
                      </div>
                      <p className="camp-desc">{camp.description}</p>
                      <div className="camp-footer">
                        <span className="camp-interest">
                          {camp.participants.length} Interested
                        </span>
                        {isJoined ? (
                          <button disabled className="btn-join-camp" style={{backgroundColor: '#cbd5e1', color: '#64748b'}}>
                            Joined ✅
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinCampaign(camp._id)}
                            className="btn-join-camp"
                          >
                            Join Campaign
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CONTRIBUTION HISTORY */}
          <div className="dash-card contributions-card">
            <h3>🏆 My Contributions</h3>
            {myDonations.length === 0 ? (
              <p className="empty-msg">No confirmed donations yet.</p>
            ) : (
              <ul style={{ paddingLeft: "20px", color: 'var(--dash-gray)' }}>
                {myDonations.map((req) => (
                  <li key={req._id} style={{marginBottom: '5px'}}>
                    Donated to <strong>{req.patientName}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* VERIFIED DONATION HISTORY */}
          <div className="dash-card verified-card">
            <h3>🏥 Verified History</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: '15px' }}>
              Official records from Blood Collectors.
            </p>
            {verifiedHistory.length === 0 ? (
              <p className="empty-msg">No verified records yet.</p>
            ) : (
              <div>
                {verifiedHistory.map((record) => (
                  <div key={record._id} className="verified-item">
                    <div>
                      <span className="verified-loc">{record.location}</span>
                      <span className="verified-meta">
                        Batch: {record.batchNumber} • {record.quantityUnits} Unit(s)
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: "700", color: "#0f766e", fontSize: '0.9rem' }}>
                        {new Date(record.collectionDate).toLocaleDateString()}
                      </span>
                      <span className="badge-verified">VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <main className="right-col">
          <EmergencyFeed userOverride={profile} />
        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT FOR REQUEST CARD ---
const RequestCard = ({ req, handleComplete }) => (
  <div className={`req-item status-${req.status === 'completed' ? 'completed' : 'active'}`}>
    <div className="req-header">
      <span className="req-patient">
        {req.patientName} ({req.bloodGroup})
      </span>
      <span className="req-status-badge">
        {req.status}
      </span>
    </div>

    <div className="req-details">
      <strong>Assigned Donors:</strong>
      {req.volunteers.filter((v) => v.status === "assigned").length === 0 ? (
        " None yet"
      ) : (
        <ul>
          {req.volunteers
            .filter((v) => v.status === "assigned")
            .map((v) => (
              <li key={v._id}>
                {v.user?.name} ({v.user?.phone})
              </li>
            ))}
        </ul>
      )}
    </div>
    
    <div className="req-details">
      <strong>Stock Allocated:</strong>
      {req.stockAssignments.length === 0 ? (
        " None yet"
      ) : (
        <ul>
          {req.stockAssignments.map((s, i) => (
            <li key={i}>
              Batch {s.inventoryId?.batchNumber} ({s.unitsAssigned} units)
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="req-date">
      {new Date(req.createdAt).toLocaleDateString()}
    </div>

    {req.status !== "completed" && (
      <button
        onClick={() => handleComplete(req._id)}
        className="btn-mark-complete"
      >
        ✅ Mark Completed (Received)
      </button>
    )}
  </div>
);

export default DonorDashboard;