import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./Pages/loginPage";
import SignupPage from "./Pages/signupPage";
import HomePage from "./Pages/WhatsAppHomePage";
import ResetPage from "./Pages/resetPasswordPage"; // Import ResetPage

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check local storage on initial load to keep user logged in
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    if (loggedInStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginStatus = (status) => {
    setIsLoggedIn(status);
    localStorage.setItem("isLoggedIn", status); // Persist state across sessions
  };

  return (
    <div>
      <HomePage />
    </div>
  );
}

//   <Router>
//     <Routes>
//       {/* Root path redirects to signup */}
//       <Route path="/" element={<Navigate to="/signup" replace />} />

//       {/* Signup route */}
//       <Route
//         path="/signup"
//         element={
//           isLoggedIn ? <Navigate to="/home" replace /> : <SignupPage />
//         }
//       />

//       {/* Login route */}
//       <Route
//         path="/login"
//         element={
//           isLoggedIn ? (
//             <Navigate to="/home" replace />
//           ) : (
//             <LoginPage setIsLoggedIn={handleLoginStatus} />
//           )
//         }
//       />

//       {/* Protected Home route */}
//       <Route
//         path="/home"
//         element={
//           isLoggedIn ? (
//             <HomePage setIsLoggedIn={handleLoginStatus} />
//           ) : (
//             <Navigate to="/login" replace />
//           )
//         }
//       />

//       {/* Reset Password route */}
//       <Route path="/reset-password" element={<ResetPage />} />
//     </Routes>
//   </Router>
