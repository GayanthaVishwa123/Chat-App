import React from "react";
import "../componets-Style/Profile.css";

const Profile = ({ user, onClose }) => {
  return (
    <div className="profile-root-overlay" onClick={onClose}>
      <div className="profile-root-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>
        <div className="profile-content">
          <img
            src={user.profilePic}
            alt={user.name}
            className="profile-image-lg"
          />
          <h3>{user.name}</h3>
          <p className="profile-status">🟢 Online</p>
          <div className="profile-buttons">
            <button>Edit Name</button>
            <button>Change Picture</button>
            <button className="logout">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
