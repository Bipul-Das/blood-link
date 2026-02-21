import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/adminrequestmanager.css";

const AdminRequestManager = () => {
  const { token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  // Persistent Pending State
  const [pendingActions, setPendingActions] = useState(() => {
    const saved = localStorage.getItem("adminPendingActions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("adminPendingActions", JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/requests/active?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleFindStock = async (reqId) => {
    setSelectedReqId(reqId);
    setMatches(null);
    const res = await fetch(
      `http://localhost:8080/api/requests/${reqId}/match`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.success) setMatches(data.data);
  };

  // --- STRICT ELIGIBILITY CHECKER ---
  const checkEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { eligible: true, days: 0 };

    const lastDate = new Date(lastDonationDate);
    if (isNaN(lastDate.getTime())) return { eligible: true, days: 0 };

    const today = new Date();
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const waitPeriod = 90;

    if (diffDays < waitPeriod) {
      return {
        eligible: false,
        days: waitPeriod - diffDays,
        dateStr: lastDate.toDateString(),
      };
    }
    return { eligible: true, days: 0, dateStr: lastDate.toDateString() };
  };

  // --- VERIFY & SELECT LOGIC ---
  const verifyAndSelectVolunteer = async (reqId, volunteer) => {
    setVerifyingId(volunteer._id);

    try {
      // 1. FETCH SPECIFIC USER LIVE DATA
      const res = await fetch(
        `http://localhost:8080/api/users/${volunteer.user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error(`API Error ${res.status}: Cannot verify donor status.`);
      }

      const data = await res.json();
      const freshUser = data.user || data.data;

      if (!freshUser) {
        alert("Error: Server returned empty user data.");
        setVerifyingId(null);
        return;
      }

      console.log(
        "LIVE VERIFICATION:",
        freshUser.name,
        "Last Donation:",
        freshUser.lastDonationDate
      );

      // 2. CHECK ELIGIBILITY ON FRESH DATA
      const { eligible, days, dateStr } = checkEligibility(
        freshUser.lastDonationDate
      );

      setVerifyingId(null);

      if (!eligible) {
        alert(
          `⛔ BLOCKED: Donor Ineligible.\n\nLIVE RECORD CHECK:\nLast Donated: ${dateStr}\n\nThey must wait ${days} more days.`
        );

        // --- CRITICAL FIX: SAFE UI UPDATE ---
        // We update the local state to show the real date immediately
        setRequests((prevRequests) =>
          prevRequests.map((req) => {
            // Only update the relevant request
            if (req._id !== reqId) return req;

            return {
              ...req,
              volunteers: req.volunteers.map((v) => {
                // SAFETY CHECK: Ensure v.user exists before checking _id
                // This prevents the "Cannot read properties of null" error
                if (v.user && v.user._id === freshUser._id) {
                  return { ...v, user: freshUser };
                }
                return v;
              }),
            };
          })
        );
        return; // Stop execution (Do not add to pending)
      }

      // 3. PROCEED IF ELIGIBLE
      addToPending(reqId, "volunteer", { ...volunteer, user: freshUser });
    } catch (err) {
      console.error("Verification failed:", err);
      alert(`⚠️ Network Error: Could not connect to server to verify donor.`);
      setVerifyingId(null);
    }
  };

  const handleSelectStock = (reqId, bag) => {
    const input = window.prompt(
      `How many units to use from Batch ${bag.batchNumber}? (Max: ${bag.units})`,
      "1"
    );
    if (input === null) return;
    const qty = parseInt(input);

    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid number greater than 0.");
      return;
    }
    if (qty > bag.units) {
      alert(`Error: You cannot use ${qty} units. Only ${bag.units} available.`);
      return;
    }
    addToPending(reqId, "stock", bag, qty);
  };

  const addToPending = (reqId, type, item, unitsUsed = null) => {
    const targetId = type === "stock" ? item._id : item.user._id;

    const newItem = {
      reqId,
      type,
      id: targetId,
      units: unitsUsed,
      name:
        type === "stock"
          ? `Batch ${item.batchNumber} (${unitsUsed} Units)`
          : `Donor ${item.user.name}`,
      details: item,
    };

    if (!pendingActions.some((a) => a.id === newItem.id && a.reqId === reqId)) {
      setPendingActions([...pendingActions, newItem]);
    }
  };

  const cancelPending = (id) => {
    setPendingActions(pendingActions.filter((a) => a.id !== id));
  };

  const confirmAction = async (action) => {
    try {
      let url = "";
      let body = {};
      if (action.type === "stock") {
        url = `http://localhost:8080/api/requests/${action.reqId}/fulfill`;
        body = { inventoryId: action.id, unitsUsed: action.units };
      } else {
        url = `http://localhost:8080/api/requests/${action.reqId}/assign-volunteer`;
        body = { volunteerId: action.id };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ Confirmed: ${action.name}`);
        cancelPending(action.id);
        fetchRequests();
        if (selectedReqId === action.reqId) handleFindStock(action.reqId);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="req-manager-container">
      <div className="rm-header">
        <div className="rm-pulse"></div>
        <h2>Emergency Queue Manager</h2>
      </div>

      {requests.map((req) => {
        const reqPending = pendingActions.filter((a) => a.reqId === req._id);
        const confirmedVolunteers =
          req.volunteers?.filter((v) => v.status === "assigned") || [];
        const confirmedStock = req.stockAssignments || [];
        const hasConfirmedItems =
          confirmedVolunteers.length > 0 || confirmedStock.length > 0;
        const isLocked =
          req.status === "completed" || req.status === "fulfilled";

        return (
          <div
            key={req._id}
            className={`rm-card ${isLocked ? "locked" : "active"}`}
          >
            {/* CARD HEADER */}
            <div className="rm-card-header">
              <div className="rm-title">
                <h4>
                  <span className="rm-blood-badge">{req.bloodGroup}</span>
                  for {req.patientName} (Needs: {req.units} Units)
                </h4>
              </div>
              <span className={`rm-status-badge status-${req.status}`}>
                {req.status}
              </span>
            </div>

            {/* CONFIRMED ALLOCATIONS BLOCK */}
            {hasConfirmedItems && (
              <div className="rm-confirmed-box">
                <span className="rm-confirmed-title">
                  ✅ Confirmed Allocations
                </span>
                <ul className="rm-list">
                  {confirmedVolunteers.map((v) => (
                    <li key={v._id}>
                      Donor: <strong>{v.user?.name || "Unknown"}</strong>{" "}
                      (Assigned)
                    </li>
                  ))}
                  {confirmedStock.map((s, idx) => (
                    <li key={idx}>
                      Stock:{" "}
                      <strong>
                        Batch {s.inventoryId?.batchNumber || "Unknown"}
                      </strong>{" "}
                      ({s.unitsAssigned || "N/A"} Units Deducted)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isLocked ? (
              <div className="rm-locked-msg">
                🔒 REQUEST COMPLETED. ACTIONS LOCKED.
              </div>
            ) : (
              <>
                {/* PENDING ACTIONS BLOCK */}
                {reqPending.length > 0 && (
                  <div className="rm-pending-box">
                    <h5 className="rm-pending-header">
                      ⚠️ Pending Confirmation ({reqPending.length})
                    </h5>
                    {reqPending.map((action) => (
                      <div key={action.id} className="rm-action-row">
                        <strong>{action.name}</strong>
                        <div>
                          <button
                            onClick={() => confirmAction(action)}
                            className="btn-sm btn-confirm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => cancelPending(action.id)}
                            className="btn-sm btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* VOLUNTEER SELECTION LIST */}
                {req.volunteers && req.volunteers.length > 0 && (
                  <div className="rm-vol-section">
                    <span className="rm-section-title">
                      ✋ Volunteers Available
                    </span>
                    {req.volunteers.map((vol) => {
                      if (!vol.user) return null;
                      if (vol.status === "assigned") return null;

                      const isPending = pendingActions.some(
                        (a) => a.id === vol.user._id
                      );
                      const isVerifying = verifyingId === vol._id;

                      // Visual check (Stale Data Possible - Verification cleans this up)
                      const { eligible, days } = checkEligibility(
                        vol.user.lastDonationDate
                      );

                      return (
                        <div key={vol._id} className="rm-vol-item">
                          <div className="rm-vol-info">
                            <span className="rm-vol-name">
                              {vol.user.name} ({vol.user.bloodGroup})
                            </span>
                            <span className="rm-vol-meta">
                              Last Donation:{" "}
                              {vol.user.lastDonationDate
                                ? new Date(
                                    vol.user.lastDonationDate
                                  ).toLocaleDateString()
                                : "Never"}
                            </span>
                          </div>

                          {isPending ? (
                            <span
                              style={{
                                color: "var(--rm-warning)",
                                fontStyle: "italic",
                                fontWeight: "600",
                              }}
                            >
                              Pending...
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                verifyAndSelectVolunteer(req._id, vol)
                              }
                              disabled={isVerifying}
                              className={!eligible ? "" : "btn-select"}
                              style={
                                !eligible
                                  ? {
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                    }
                                  : {}
                              }
                            >
                              {isVerifying ? (
                                "Checking..."
                              ) : !eligible ? (
                                <span className="badge-wait">
                                  ⛔ Wait {days}d
                                </span>
                              ) : (
                                "Select"
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* FIND STOCK BUTTON */}
                <div className="rm-stock-section">
                  <button
                    onClick={() => handleFindStock(req._id)}
                    className="btn-find-stock"
                  >
                    🔍 Find / Refresh Stock Matches
                  </button>
                </div>

                {/* STOCK MATCH RESULTS TABLE */}
                {selectedReqId === req._id && matches && (
                  <div className="rm-stock-results">
                    <h5>Inventory Matches</h5>
                    <table className="rm-table">
                      <thead>
                        <tr>
                          <th>Batch</th>
                          <th>Units Available</th>
                          <th>Expiry</th>
                          <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((bag) => {
                          const isPending = pendingActions.some(
                            (a) => a.id === bag._id
                          );
                          const isAssigned = req.stockAssignments?.some(
                            (sa) => sa.inventoryId?._id === bag._id
                          );

                          return (
                            <tr key={bag._id}>
                              <td>
                                <strong>{bag.batchNumber}</strong>
                              </td>
                              <td
                                className={
                                  bag.units < req.units
                                    ? "units-low"
                                    : "units-good"
                                }
                              >
                                {bag.units}
                              </td>
                              <td>
                                {new Date(bag.expiryDate).toLocaleDateString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {isAssigned ? (
                                  <span className="status-in-list">
                                    Confirmed
                                  </span>
                                ) : isPending ? (
                                  <span className="status-pending-text">
                                    Pending...
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleSelectStock(req._id, bag)
                                    }
                                    disabled={bag.units <= 0}
                                    className="btn-stock-select"
                                  >
                                    Select
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminRequestManager;
