import React, { useContext } from "react"; // 1. Import useContext
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext"; // 2. Import Context
import "../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 3. Get Real Data from Context
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          BloodLink 🩸
        </Link>

        <div className="navbar-links">
          {/* Public Links */}
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            Home
          </Link>

          {/* CONDITIONAL RENDERING BASED ON USER */}
          {!user ? (
            // GUEST VIEW
            <>
              <Link to="/about" className={`nav-link ${isActive("/about")}`}>
                About Us
              </Link>
              <Link
                to="/services"
                className={`nav-link ${isActive("/services")}`}
              >
                Services
              </Link>
              <Link
                to="/contribute"
                className={`nav-link ${isActive("/contribute")}`}
              >
                Contribute
              </Link>

              <Link to="/login" className="btn-login">
                Login / Register
              </Link>
            </>
          ) : (
            // LOGGED IN VIEW
            <>
              {/* 4. The Link You Were Missing */}
              <Link
                to="/profile"
                className={`nav-link ${isActive("/profile")}`}
              >
                My Profile
              </Link>

              <Link
                to="/community"
                className={`nav-link ${isActive("/community")}`}
              >
                Community
              </Link>

              <Link
                to="/dashboard/donor"
                className={`nav-link ${isActive("/dashboard/donor")}`}
              >
                Dashboard
              </Link>

              {/* Work Dashboard (Only for Staff) */}
              {user.role !== "donor" && (
                <Link
                  to="/dashboard/work"
                  className={`nav-link ${isActive("/dashboard/work")}`}
                >
                  Work Space
                </Link>
              )}

              <div className="user-badge">
                <span className="user-name">{user.name}</span>
                <span className="user-role-pill">
                  {user.role === "lead_dev" ? "DEV MODE" : user.role}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
