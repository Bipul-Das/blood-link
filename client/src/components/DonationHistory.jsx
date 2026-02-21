import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

const DonationHistory = () => {
  const { token } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/donations/my-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setDonations(data.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div className="history-section">
      <h3>My Donation Journey</h3>

      {donations.length === 0 ? (
        <p>You haven't donated yet. Your first donation can save 3 lives!</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Date
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Location
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Batch ID
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {donations.map((record) => (
              <tr key={record._id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {new Date(record.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {record.hospitalId?.name || "Unknown Hospital"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  {record.batchNumber}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      backgroundColor:
                        record.status === "available" ? "#e8f5e9" : "#eee",
                      color: record.status === "available" ? "green" : "#555",
                    }}
                  >
                    {record.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DonationHistory;
