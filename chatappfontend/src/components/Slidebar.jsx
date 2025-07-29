import React from "react";
import { FaComments, FaPhone, FaCog } from "react-icons/fa";
import "../componets-Style/Slidebar.css"; // Make sure file name is correct

export default function Sidebar({
  activeSection,
  setActiveSection,
  user,
  setShowProfile,
  darkMode,
  setDarkMode,
}) {
  return (
    <div className="sidebar-icons">
      <div className="icons-top">
        <FaComments
          className={`icon ${activeSection === "chats" ? "active" : ""}`}
          onClick={() => setActiveSection("chats")}
          title="Chats"
        />
        <FaPhone
          className={`icon ${activeSection === "calls" ? "active" : ""}`}
          onClick={() => setActiveSection("calls")}
          title="Calls"
        />
        <FaCog
          className={`icon ${activeSection === "settings" ? "active" : ""}`}
          onClick={() => setActiveSection("settings")}
          title="Settings"
        />
      </div>
      <div className="icons-bottom">
        <img
          src={user.profilePic}
          alt={user.name}
          className="profile-pic"
          title={user.name}
          onClick={() => setShowProfile(true)}
        />
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="dark-toggle"
          title="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
