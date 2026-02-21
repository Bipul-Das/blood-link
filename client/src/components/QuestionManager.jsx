import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/questionManager.css"; // Import premium styles

const QuestionManager = () => {
  const { token } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeQId, setActiveQId] = useState(null);

  // Fetch Pending
  const fetchPending = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/questions/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQuestions(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  // Submit Answer
  const submitAnswer = async (id) => {
    if (!replyText.trim()) return alert("Answer cannot be empty");

    try {
      const res = await fetch(
        `http://localhost:8080/api/questions/${id}/answer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answer: replyText }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ Answer Posted Successfully!");
        setReplyText("");
        setActiveQId(null);
        fetchPending(); // Refresh list
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="qm-container">
      {/* HEADER */}
      <div className="qm-header">
        <h3>
          💬 Community Questions
          {questions.length > 0 && (
            <span className="qm-badge">{questions.length}</span>
          )}
        </h3>
      </div>

      {/* CONTENT AREA */}
      {questions.length === 0 ? (
        <div className="qm-empty">
          <p>🎉 All caught up! No pending questions from the community.</p>
        </div>
      ) : (
        <div className="qm-grid">
          {questions.map((q) => (
            <div key={q._id} className="qm-card">
              {/* Question Text */}
              <p className="qm-question-text">"{q.text}"</p>

              {/* Metadata */}
              <div className="qm-meta">
                <span>Asked by:</span>
                <span className="qm-user-badge">{q.askedBy.name}</span>
                <span
                  className="qm-user-badge"
                  style={{
                    color: "#ef4444",
                    borderColor: "#fecaca",
                    background: "#fef2f2",
                  }}
                >
                  {q.askedBy.bloodGroup}
                </span>
              </div>

              {/* Interaction Area */}
              {activeQId === q._id ? (
                <div className="qm-reply-area">
                  <textarea
                    className="qm-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your helpful answer here..."
                    autoFocus
                  />
                  <div className="qm-actions">
                    <button
                      onClick={() => submitAnswer(q._id)}
                      className="btn-qm btn-submit"
                    >
                      Post Answer
                    </button>
                    <button
                      onClick={() => {
                        setActiveQId(null);
                        setReplyText("");
                      }}
                      className="btn-qm btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveQId(q._id);
                    setReplyText("");
                  }}
                  className="btn-qm btn-reply-trigger"
                >
                  ↩ Reply to this
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
