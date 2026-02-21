import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/auth.css";

const Register = () => {
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    address: "",
    city: "",
    location: "",
    dateOfBirth: "",
    weight: "",
  });

  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // 1. Strict Frontend Validation
    if (!formData.bloodGroup)
      return setLocalError("Please select your blood group.");
    if (!formData.address) return setLocalError("Street Address is required.");
    if (!formData.city) return setLocalError("City is required.");
    if (!formData.location)
      return setLocalError("Area / District is required.");
    if (!formData.weight) return setLocalError("Weight is required.");
    if (!formData.dateOfBirth)
      return setLocalError("Date of Birth is required.");

    setIsSubmitting(true);

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      bloodGroup: formData.bloodGroup,
      address: formData.address,
      city: formData.city,
      location: formData.location,
      dateOfBirth: formData.dateOfBirth,
      weight: Number(formData.weight),
    };

    const result = await register(registrationData);

    if (result.success) {
      alert("Registration Successful! Please Login.");
      navigate("/login");
    } else {
      // Show the specific error from the backend
      setLocalError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join BloodLink</h2>

        {(error || localError) && (
          <div className="error-msg">{localError || error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Blood Group</label>
            <select name="bloodGroup" onChange={handleChange} required>
              <option value="">Select Group</option>
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

          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* LOCATION FIELDS */}
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              placeholder="House, Road..."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                onChange={handleChange}
                placeholder="Dhaka"
                required
              />
            </div>
            <div className="form-group">
              <label>Area / District</label>
              <input
                type="text"
                name="location"
                onChange={handleChange}
                placeholder="Dhanmondi"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already a member? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
