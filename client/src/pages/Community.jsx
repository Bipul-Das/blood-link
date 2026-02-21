import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/community.css";

const Community = () => {
  const { token, user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  const fetchPublic = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/questions/public");
      const data = await res.json();
      if (data.success) setQuestions(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPublic();
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!token) return alert("Please login to ask a question.");

    try {
      const res = await fetch("http://localhost:8080/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newQuestion }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Question posted! Waiting for a volunteer to reply.");
        setNewQuestion("");
        // Optionally refetch questions here to show the new one immediately
        // fetchPublic();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="community-container">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* HEADER */}
        <div className="community-header">
          <h1>
            🩸 <span>Community Q&A</span>
          </h1>
          <p>
            Connect with donors, volunteers, and medical experts. Ask questions
            and get verified answers.
          </p>
        </div>

        {/* ASK BOX */}
        <div className="ask-box">
          <div className="ask-header">
            <div className="ask-avatar">
              {user ? getInitials(user.name) : "G"}
            </div>
            <h3>Have a question about donating?</h3>
          </div>
          <form className="ask-form" onSubmit={handleAsk}>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here (e.g., 'Can I donate if I took antibiotics last week?')"
              required
            />
            <button type="submit" className="btn-post">
              <span>Post Question</span> ➤
            </button>
          </form>
        </div>

        {/* FEED */}
        <div className="feed-container">
          {questions.map((q) => (
            <div key={q._id} className="qna-card">
              {/* Question Part */}
              <div className="question-section">
                <div className="user-avatar">
                  {getInitials(q.askedBy?.name)}
                </div>
                <div className="content-body">
                  <div className="meta-info">
                    <span className="author-name">
                      {q.askedBy?.name || "Anonymous"}
                    </span>
                    {/* Optional: Add date here if available in data */}
                  </div>
                  <p className="post-text">{q.text}</p>
                </div>
              </div>

              {/* Answer Part */}
              {q.answer ? (
                <div className="answer-section">
                  <div className="volunteer-avatar">✓</div>
                  <div className="content-body">
                    <div className="meta-info">
                      <span className="author-name">
                        {q.answeredBy?.name || "Volunteer"}
                      </span>
                      <span className="volunteer-badge">
                        Verified Volunteer
                      </span>
                    </div>
                    <p className="post-text answer-text">{q.answer}</p>
                  </div>
                </div>
              ) : (
                <div className="no-answer">
                  ⏳ Waiting for a volunteer to respond...
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
