import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/collectorDashboard.css"; // Import premium styles

// Helper for fetching collections
const fetchCollectionsHelper = async (token) => {
  try {
    const res = await fetch("http://localhost:8080/api/collections", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network Error" };
  }
};

const CollectorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);

  // UI State
  const [step, setStep] = useState(1);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    identifier: "",
    donorName: "",
    donorSex: "Male",
    donorAge: "",
    donorWeight: "",
    bloodGroup: "A+",
    quantityUnits: 1,
    location: "",
    notes: "",
  });

  const [recentCollections, setRecentCollections] = useState([]);

  useEffect(() => {
    if (token) {
      fetchCollectionsHelper(token).then((data) => {
        if (data.success) setRecentCollections(data.data);
      });
    }
  }, [token]);

  // --- 1. SEARCH FUNCTION ---
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/collections/search-donor?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 2. SELECT DONOR ---
  const selectDonor = (donor) => {
    let calculatedAge = "";
    if (donor.dateOfBirth) {
      const diff = Date.now() - new Date(donor.dateOfBirth).getTime();
      calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    checkEligibility(donor.lastDonationDate);

    setFormData({
      ...formData,
      identifier: donor.phone,
      donorName: donor.name,
      donorSex: donor.gender || "Male",
      donorAge: calculatedAge || "",
      donorWeight: donor.weight || "",
      bloodGroup: donor.bloodGroup || "A+",
    });

    setShowDropdown(false);
    setSearchQuery("");
    setStep(2);
  };

  // --- 3. GUEST ENTRY ---
  const handleGuestEntry = () => {
    setEligibilityStatus({ eligible: true, msg: "Guest Donor (No History)" });
    setFormData({
      identifier: "",
      donorName: "",
      donorSex: "Male",
      donorAge: "",
      donorWeight: "",
      bloodGroup: "A+",
      quantityUnits: 1,
      location: "",
      notes: "",
    });
    setStep(2);
  };

  // --- 4. ELIGIBILITY LOGIC ---
  const checkEligibility = (lastDateString) => {
    if (!lastDateString) {
      setEligibilityStatus({
        eligible: true,
        msg: "✅ Eligible (First Time Donor)",
      });
      return;
    }

    const lastDate = new Date(lastDateString);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const waitPeriod = 90;

    if (diffDays >= waitPeriod) {
      setEligibilityStatus({ eligible: true, msg: "✅ Eligible to Donate" });
    } else {
      const remaining = waitPeriod - diffDays;
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + waitPeriod);

      setEligibilityStatus({
        eligible: false,
        lastDate: lastDate.toDateString(),
        remaining: remaining,
        nextDate: nextDate.toDateString(),
      });
    }
  };

  // --- 5. SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (eligibilityStatus && !eligibilityStatus.eligible) {
      alert("⛔ STOP: This donor is NOT ELIGIBLE yet due to the 90-day rule.");
      return;
    }

    if (!/^\d{6}$/.test(formData.identifier)) {
      alert("⚠️ Error: Donor ID must be EXACTLY 6 digits.");
      return;
    }
    if (formData.donorAge < 18) {
      alert("Donor must be at least 18 years old.");
      return;
    }
    if (formData.donorWeight < 45) {
      alert("Donor must weigh at least 45kg.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ Success! ${data.message}`);
        setStep(1);
        setEligibilityStatus(null);

        const refreshData = await fetchCollectionsHelper(token);
        if (refreshData.success) setRecentCollections(refreshData.data);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="cd-container">
      {/* HEADER */}
      <header className="cd-header">
        <div className="cd-title-group">
          <h1>Blood Collection Portal</h1>
          <p className="cd-subtitle">Documentation & Traceability System</p>
        </div>
        <div className="cd-user-info">
          <span className="cd-officer-badge">Officer: {user.name}</span>
          <br />
          <button onClick={logout} className="cd-btn-logout">
            Log Out
          </button>
        </div>
      </header>

      <div className="cd-grid">
        {/* LEFT: WORKFLOW CARD */}
        <div className="cd-workflow-card">
          {/* STEP 1: SEARCH */}
          {step === 1 && (
            <div className="cd-step-header">
              <h2>🔍 Identify Donor</h2>
              <p
                style={{ color: "var(--cd-text-muted)", marginBottom: "25px" }}
              >
                Search database or create a guest entry.
              </p>

              <div className="cd-search-box">
                <input
                  type="text"
                  placeholder="Search Name or Phone..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="cd-input-search"
                  autoFocus
                />

                {showDropdown && searchResults.length > 0 && (
                  <ul className="cd-dropdown">
                    {searchResults.map((u) => (
                      <li
                        key={u._id}
                        onClick={() => selectDonor(u)}
                        className="cd-dropdown-item"
                      >
                        <div>
                          <strong>{u.name}</strong>
                          <span>{u.phone}</span>
                        </div>
                        <span className="cd-blood-tag">{u.bloodGroup}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="cd-guest-section">
                <p style={{ marginBottom: "10px", fontSize: "0.9rem" }}>
                  Donor not found?
                </p>
                <button onClick={handleGuestEntry} className="cd-btn-ghost">
                  📝 Create Guest Entry
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FORM */}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="cd-back-link">
                ← Back to Search
              </button>

              {/* ELIGIBILITY BOX */}
              {eligibilityStatus && (
                <div
                  className={`cd-eligibility-box ${
                    eligibilityStatus.eligible ? "eligible" : "ineligible"
                  }`}
                >
                  {eligibilityStatus.eligible ? (
                    <h3 style={{ margin: 0, color: "var(--cd-success)" }}>
                      {eligibilityStatus.msg}
                    </h3>
                  ) : (
                    <div>
                      <h3
                        style={{
                          margin: "0 0 10px 0",
                          color: "var(--cd-danger)",
                        }}
                      >
                        ❌ Not Eligible
                      </h3>
                      <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                        <strong>Last Donation:</strong>{" "}
                        {eligibilityStatus.lastDate}
                      </p>
                      <p
                        style={{
                          margin: "5px 0",
                          color: "var(--cd-danger)",
                          fontWeight: "bold",
                        }}
                      >
                        Wait {eligibilityStatus.remaining} more days.
                      </p>
                      <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                        <strong>Next eligible:</strong>{" "}
                        {eligibilityStatus.nextDate}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <h3 className="cd-form-title">📝 Collection Details</h3>

              <form onSubmit={handleSubmit}>
                <div className="cd-row-2">
                  <div className="cd-form-group">
                    <label className="cd-label">Donor Mobile (ID)</label>
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      maxLength="6"
                      placeholder="6 Digits"
                      className="cd-input"
                      required
                    />
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-label">Donor Name</label>
                    <input
                      type="text"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="cd-input"
                      required
                    />
                  </div>
                </div>

                <div className="cd-row-3">
                  <div className="cd-form-group">
                    <label className="cd-label">Sex</label>
                    <select
                      name="donorSex"
                      value={formData.donorSex}
                      onChange={handleChange}
                      className="cd-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-label">Age</label>
                    <input
                      type="number"
                      name="donorAge"
                      value={formData.donorAge}
                      onChange={handleChange}
                      min="18"
                      className="cd-input"
                      required
                    />
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-label">Weight (kg)</label>
                    <input
                      type="number"
                      name="donorWeight"
                      value={formData.donorWeight}
                      onChange={handleChange}
                      min="45"
                      className="cd-input"
                      required
                    />
                  </div>
                </div>

                <div className="cd-row-2">
                  <div className="cd-form-group">
                    <label className="cd-label">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="cd-select"
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
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-label">Units (Bags)</label>
                    <input
                      type="number"
                      name="quantityUnits"
                      value={formData.quantityUnits}
                      onChange={handleChange}
                      min="1"
                      className="cd-input"
                    />
                  </div>
                </div>

                <div className="cd-form-group">
                  <label className="cd-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. City Center Mall"
                    className="cd-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={eligibilityStatus && !eligibilityStatus.eligible}
                  className="cd-btn-submit"
                >
                  {eligibilityStatus && !eligibilityStatus.eligible
                    ? "⛔ Donator Not Eligible"
                    : "Confirm Collection"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* RIGHT: RECENT LOGS */}
        <div className="cd-logs-section">
          <h3>📋 Recent Collections</h3>
          {recentCollections.length === 0 ? (
            <p
              style={{
                color: "var(--cd-text-muted)",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              No collections recorded yet.
            </p>
          ) : (
            <div className="cd-table-wrapper">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Batch #</th>
                    <th>Donor Info</th>
                    <th>Physical</th>
                    <th>Group</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCollections.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className="cd-batch-code">
                          {item.batchNumber}
                        </span>
                      </td>
                      <td>
                        <strong>{item.donorName}</strong>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--cd-text-muted)",
                          }}
                        >
                          ID: {item.identifier}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--cd-text-muted)",
                        }}
                      >
                        {item.donorSex}, {item.donorAge}y<br />
                        {item.donorWeight}kg
                      </td>
                      <td
                        style={{
                          color: "var(--cd-primary)",
                          fontWeight: "800",
                          fontSize: "1rem",
                        }}
                      >
                        {item.bloodGroup}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
