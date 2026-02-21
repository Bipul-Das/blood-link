import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create the Context
const AuthContext = createContext();

export default AuthContext;

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // --- API URL (Backend) ---
  const API_URL = "http://localhost:8080/api/auth";

  // --- 3. CHECK LOGGED IN STATUS ON LOAD ---
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          // Verify token by fetching current user data
          const response = await fetch(`${API_URL}/current-user`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token invalid/expired
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Auth Check Failed:", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // --- 4. LOGIN ACTION ---
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Success: Save Token & User
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);

        // Redirect based on role
        if (data.user.role === "donor") {
          navigate("/dashboard/donor");
        } else {
          navigate("/dashboard/work");
        }
        return { success: true };
      } else {
        // Fail: Set error message
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError("Server Error. Please try again.");
      return { success: false, message: "Server Error" };
    } finally {
      setLoading(false);
    }
  };

  // --- 5. REGISTER ACTION (Donors Only) ---
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        navigate("/dashboard/donor");
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError("Registration Failed.");
      return { success: false, message: "Server Error" };
    } finally {
      setLoading(false);
    }
  };

  // --- 6. LOGOUT ACTION ---
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Expose data to the rest of the app
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
