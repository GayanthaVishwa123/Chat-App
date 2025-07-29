import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Pages-Style/resetPasswordPage.css"; // Add this CSS for styling

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      setSuccessMsg("");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/reset-password", // API endpoint for password reset
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccessMsg("Password reset link sent! Please check your email.");
      setTimeout(() => {
        navigate("/login"); // Redirect to login page after success
      }, 3000);
    } catch (err) {
      setError("Failed to send reset link. Please try again later.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Your Password</h2>
      {/* Display error message */}
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
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          Reset Password
        </button>
      </form>

      <p className="back-to-login">
        Remembered your password? <a href="/login">Login here</a>
      </p>
    </div>
  );
}
