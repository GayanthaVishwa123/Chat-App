import React, { useState, useEffect } from "react";
import Sidebar from "../components/Slidebar.jsx";
import ChatList from "../components/ChatList.jsx";
import CallList from "../components/CallList.jsx";
import Settings from "../components/Settings.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import Profile from "../components/Profile.jsx";
import axios from "axios";
import "../Pages-Style/WhatsAppHomePage.css";

export default function WhatsAppHomePage() {
  const [activeSection, setActiveSection] = useState("chats");
  const [selectedChat, setSelectedChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLists, setChatLists] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const userId = "6881fb89df9706e9fd24701b";
  const user = {
    name: "Shantha Premajith",
    profilePic: "https://i.pravatar.cc/150?u=gayantha",
    id: userId,
  };

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODFmYjg5ZGY5NzA2ZTlmZDI0NzAxYiIsImlhdCI6MTc1MzM0OTM2MywiZXhwIjoxNzYxMTI1MzYzfQ.I90uR3_eVJ41gZjvnLDW2rk2zLbwCOfyaKKsxtsPaGg";

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:3001/chat-app/v1/chats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setChatLists(res.data.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch chats:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("jwt");
        }
      });

    axios
      .get("http://localhost:3001/chat-app/v1/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllUsers(res.data.data.users || []))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, [token]);

  const chatUsers = chatLists.map((chat) => {
    const otherParticipant = chat.participants.find((p) => p._id !== userId);

    return {
      _id: otherParticipant?._id || chat._id,
      name: otherParticipant?.username || chat.chatName || "No Name",
      profilePic:
        otherParticipant?.avatar?.trim() !== ""
          ? otherParticipant.avatar
          : `https://i.pravatar.cc/150?u=${otherParticipant?._id || chat._id}`,
      lastMessage: chat.lastMessage?.content || "No messages yet",
    };
  });
  console.log("chat use :", chatUsers);
  const otherUsers = allUsers.map((user) => ({
    _id: user._id,
    name: user.username || "No Name",
    profilePic:
      user.avatar && user.avatar.trim() !== ""
        ? user.avatar
        : `https://i.pravatar.cc/150?u=${user._id}`,
    lastMessage: "",
  }));

  return (
    <div className={`main-container ${darkMode ? "dark" : "light"}`}>
      <div className="layout-container">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          setShowProfile={setShowProfile}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="middle-panel">
          {activeSection === "chats" && (
            <>
              <h3>Chats</h3>
              <ChatList
                chatList={chatUsers}
                selectedChat={selectedChat}
                setSelectedChat={(chat) => {
                  setSelectedChat({
                    id: chat._id,
                    name: chat.name,
                    profilePic: chat.profilePic,
                    lastMessage: chat.lastMessage || "No messages yet",
                  });
                  setChatMessages([]); // Clear old messages
                }}
              />

              <h3>All Users</h3>
              <ChatList
                chatList={otherUsers}
                selectedChat={selectedChat}
                setSelectedChat={(chat) => {
                  setSelectedChat({
                    id: chat._id,
                    name: chat.name,
                    profilePic: chat.profilePic,
                  });
                  setChatMessages([]); // Clear old messages
                }}
              />
            </>
          )}

          {activeSection === "calls" && <CallList callLogs={[]} />}
          {activeSection === "settings" && <Settings />}
        </div>

        <div className="right-panel">
          <ChatWindow
            selectedChat={selectedChat}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            user={user}
            message={message}
            setMessage={setMessage}
            token={token}
          />
        </div>
      </div>

      {showProfile && (
        <Profile user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
