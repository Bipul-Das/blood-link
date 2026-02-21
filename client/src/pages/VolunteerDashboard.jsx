import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import QuestionManager from "../components/QuestionManager";
import "../styles/volunteerDashboard.css"; // Import the premium styles

const VolunteerDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="vol-dashboard-container">
      {/* --- HEADER SECTION --- */}
      <header className="vol-header">
        <div className="vol-title-group">
          <h1>Volunteer Portal</h1>
          <p className="vol-subtitle">
            Welcome back,{" "}
            <span className="vol-user-highlight">{user.name}</span>. Ready to
            make an impact?
          </p>
        </div>

        <button onClick={logout} className="btn-logout">
          <span>Sign Out</span>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="vol-content">
        {/* Module Wrapper gives the imported component a polished card look */}
        <section className="vol-module-wrapper">
          <QuestionManager />
        </section>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
