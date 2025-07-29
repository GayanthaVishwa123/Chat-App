import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../Pages-Style/singupPage.css"; // Use this updated CSS for a better design

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, passwordConfirm } = formData;

    if (!username || !email || !password || !passwordConfirm) {
      setError("Please fill in all fields");
      setSuccessMsg("");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setSuccessMsg("");
      return;
    }

    try {
      setError("");
      const response = await axios.post(
        "http://localhost:3001/chat-app/v1/auth/signup",
        { username, email, password, passwordConfirm },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMsg("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create New Account</h2>

      {/* Display error message as a fixed bar */}
      {error && (
        <p className={`error-message ${error ? "visible" : ""}`}>
          <i className="fas fa-times-circle icon"></i>
          {error}
        </p>
      )}

      {/* Display success message */}
      {successMsg && (
        <p className={`success-message ${successMsg ? "visible" : ""}`}>
          <i className="fas fa-check-circle icon"></i>
          {successMsg}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <input
          name="passwordConfirm"
          type="password"
          placeholder="Confirm Password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>

      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
