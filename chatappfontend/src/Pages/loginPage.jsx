import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Pages-Style/loginPage.css"; // Add this CSS for styling

export default function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if both fields are filled
    if (!email || !password) {
      setError("Please fill in all fields.");
      setSuccessMsg("");
      return;
    }

    try {
      // Make API call to check credentials
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      if (response.data.success) {
        setSuccessMsg("Login Successful!");
        setIsLoggedIn(true);
        // Redirect after successful login
        setTimeout(() => {
          setSuccessMsg("");
          navigate("/home"); // Redirect to home page
        }, 1000);
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Server error, please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login to Your Account</h2>

        {error && (
          <p className={`error-message ${error ? "visible" : ""}`}>
            <i className="fas fa-times-circle icon"></i>
            {error}
          </p>
        )}

        {successMsg && (
          <p className={`success-message ${successMsg ? "visible" : ""}`}>
            <i className="fas fa-check-circle icon"></i>
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>

        <div className="auth-links">
          <p className="forgot-password">
            Forgot your password?{" "}
            <Link to="/reset-password" className="link">
              Reset it here
            </Link>
          </p>
          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup" className="link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
