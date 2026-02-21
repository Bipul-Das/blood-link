import React, { useState, useEffect } from "react";
import "../styles/contribute.css";

const Contribute = () => {
  const [activeTab, setActiveTab] = useState("money");

  // State for Data
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // --- STATE: Volunteer Form ---
  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    email: "",
    phone: "",
    motivation: "",
  });

  // --- STATE: Donation (Professional Gateway) ---
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'paypal'
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    holder: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch Hospitals & Blood Banks
  useEffect(() => {
    if (activeTab === "blood") {
      setLoading(true);
      fetch("http://localhost:8080/api/auth/hospitals")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrganizations(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Filter Logic
  const filteredOrgs = organizations.filter((org) => {
    const term = searchTerm.toLowerCase();
    return (
      org.name.toLowerCase().includes(term) ||
      (org.city && org.city.toLowerCase().includes(term)) ||
      (org.location && org.location.toLowerCase().includes(term)) ||
      (org.address && org.address.toLowerCase().includes(term))
    );
  });

  // --- HANDLER: Volunteer Form ---
  const handleVolunteerChange = (e) => {
    const { name, value } = e.target;
    setVolunteerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    alert(
      `🎉 Thank you, ${volunteerForm.name}!\n\nYour application has been received. We will contact you shortly.`
    );
    setVolunteerForm({ name: "", email: "", phone: "", motivation: "" });
  };

  // --- HANDLER: Donation Payment ---
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    // Simple formatter for visual appeal
    let formattedValue = value;

    if (name === "number") {
      // Allow only numbers and limit to 19 chars (16 digits + 3 spaces)
      formattedValue = value.replace(/\D/g, "").slice(0, 16);
    } else if (name === "expiry") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 3) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(
          2
        )}`;
      }
    } else if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardDetails((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (!donationAmount || donationAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    if (paymentMethod === "card") {
      if (cardDetails.number.length < 16 || cardDetails.cvc.length < 3) {
        alert("Please enter valid card details.");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate Secure Payment Gateway Delay
    setTimeout(() => {
      setIsProcessing(false);
      alert(
        `✅ Payment Successful!\n\nTransaction ID: TXN-${Math.floor(
          Math.random() * 1000000
        )}\nAmount: $${donationAmount}\nMethod: ${
          paymentMethod === "card" ? "Credit/Debit Card" : "PayPal"
        }\n\nThank you for your generosity! A receipt has been sent to your email.`
      );
      // Reset
      setDonationAmount("");
      setCardDetails({ number: "", expiry: "", cvc: "", holder: "" });
    }, 2500);
  };

  return (
    <div className="contribute-container">
      <h1>Make a Difference</h1>

      {/* Tab Controls */}
      <div className="contribute-tabs">
        <button
          onClick={() => setActiveTab("money")}
          style={{ fontWeight: activeTab === "money" ? "bold" : "normal" }}
        >
          Donate Money
        </button>
        <button
          onClick={() => setActiveTab("blood")}
          style={{ fontWeight: activeTab === "blood" ? "bold" : "normal" }}
        >
          Donate Blood
        </button>
        <button
          onClick={() => setActiveTab("volunteer")}
          style={{ fontWeight: activeTab === "volunteer" ? "bold" : "normal" }}
        >
          Be a Volunteer
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="contribute-content">
        {/* 1. PROFESSIONAL PAYMENT GATEWAY UI */}
        {activeTab === "money" && (
          <div
            className="form-section"
            style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Secure Donation
            </h2>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
              }}
            >
              {/* Amount Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  Donation Amount (USD)
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "10px",
                      color: "#555",
                      fontSize: "1.1rem",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      paddingLeft: "30px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                    min="1"
                  />
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
              >
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor:
                      paymentMethod === "card" ? "#e3f2fd" : "white",
                    border:
                      paymentMethod === "card"
                        ? "2px solid #2196f3"
                        : "1px solid #ccc",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: paymentMethod === "card" ? "#1565c0" : "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor:
                      paymentMethod === "paypal" ? "#fff3e0" : "white",
                    border:
                      paymentMethod === "paypal"
                        ? "2px solid #ff9800"
                        : "1px solid #ccc",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: paymentMethod === "paypal" ? "#e65100" : "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  🅿️ PayPal
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        margin: "10px",
                      }}
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      required
                      style={{ letterSpacing: "1px" }}
                    />
                    <div
                      style={{ display: "flex", gap: "10px", marginTop: "5px" }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#999",
                          border: "1px solid #ddd",
                          padding: "2px 5px",
                          borderRadius: "3px",
                        }}
                      >
                        VISA
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#999",
                          border: "1px solid #ddd",
                          padding: "2px 5px",
                          borderRadius: "3px",
                        }}
                      >
                        Mastercard
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          margin: "10px",
                        }}
                      >
                        Expiry
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          margin: "10px",
                        }}
                      >
                        CVC
                      </label>
                      <input
                        type="password"
                        name="cvc"
                        value={cardDetails.cvc}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        margin: "10px",
                      }}
                    >
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="holder"
                      value={cardDetails.holder}
                      onChange={handleCardChange}
                      placeholder="Name on Card"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: isProcessing ? "#90caf9" : "#2196f3",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      cursor: isProcessing ? "wait" : "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    {isProcessing
                      ? "Processing Payment..."
                      : `Pay $${donationAmount || "0.00"}`}
                  </button>

                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "15px",
                      fontSize: "0.8rem",
                      color: "#888",
                    }}
                  >
                    🔒 Encrypted & Secure Payment
                  </div>
                </form>
              )}

              {/* PayPal View */}
              {paymentMethod === "paypal" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ marginBottom: "20px", color: "#666" }}>
                    You will be redirected to PayPal to complete your secure
                    transaction.
                  </p>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: "20px", // PayPal style pill button
                      fontSize: "1rem",
                      fontWeight: "bold",
                      cursor: isProcessing ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isProcessing ? "Redirecting..." : "Pay with PayPal"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. BLOOD DONATION INFO */}
        {activeTab === "blood" && (
          <div className="info-section">
            <h2>Donate Blood</h2>
            <p>Find verified Blood Banks and Hospitals near you.</p>

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="🔍 Search by Name, Location, or City..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                }}
              />
            </div>

            {loading ? (
              <p>Loading locations...</p>
            ) : filteredOrgs.length === 0 ? (
              <p style={{ fontStyle: "italic", color: "#666" }}>
                No results found matching "{searchTerm}".
              </p>
            ) : (
              <div
                className="bank-list"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredOrgs.map((org) => (
                  <div
                    key={org._id}
                    className="bank-card"
                    style={{
                      border: "1px solid #ddd",
                      padding: "20px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      textAlign: "left",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        backgroundColor:
                          org.role === "bloodbank" ? "#e3f2fd" : "#fbe9e7",
                        color: org.role === "bloodbank" ? "#1565c0" : "#d32f2f",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {org.role === "bloodbank" ? "Blood Bank" : "Hospital"}
                    </span>

                    <h3
                      style={{
                        margin: "0 0 15px 0",
                        color: "#333",
                        paddingRight: "70px",
                      }}
                    >
                      {org.name}
                    </h3>

                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ fontSize: "0.95rem" }}>
                        <strong>📍 Location:</strong>{" "}
                        {org.location || (
                          <span style={{ color: "#999" }}>N/A</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.95rem" }}>
                        <strong>🏙️ City:</strong>{" "}
                        {org.city || <span style={{ color: "#999" }}>N/A</span>}
                      </div>
                      <div style={{ fontSize: "0.95rem" }}>
                        <strong>📞 Phone:</strong> {org.phone}
                      </div>
                      {org.address && (
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#555",
                            marginTop: "5px",
                            borderTop: "1px solid #eee",
                            paddingTop: "8px",
                          }}
                        >
                          {org.address}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. VOLUNTEER APPLICATION FORM */}
        {activeTab === "volunteer" && (
          <div className="form-section">
            <h2>Join as a Volunteer</h2>
            <form onSubmit={handleVolunteerSubmit}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={volunteerForm.name}
                onChange={handleVolunteerChange}
                placeholder="Ex: John Doe"
                required
              />
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={volunteerForm.email}
                onChange={handleVolunteerChange}
                placeholder="Ex: john@example.com"
                required
              />
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={volunteerForm.phone}
                onChange={handleVolunteerChange}
                placeholder="Ex: +1 234 567 890"
                required
              />
              <label>Why do you want to join?</label>
              <textarea
                name="motivation"
                value={volunteerForm.motivation}
                onChange={handleVolunteerChange}
                placeholder="Write a brief motivation..."
                rows="4"
              ></textarea>
              <button type="submit">Submit Application</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contribute;
