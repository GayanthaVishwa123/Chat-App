import React, { useEffect, useRef } from "react";
import axios from "axios";
import { FaVideo } from "react-icons/fa";
import OnlineDot from "./OnlineDot";
import SeenTick from "./SeenTick";
import "../componets-Style/ChatWindow.css";

export default function ChatWindow({
  selectedChat,
  chatMessages,
  setChatMessages,
  user,
  message,
  setMessage,
  token,
}) {
  const scrollRef = useRef();

  // Scroll to the latest message whenever chatMessages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Fetch messages when the selected chat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/chat-app/v1/message/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatMessages(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChat, token, setChatMessages]);

  // Send a new message
  const sendMessage = async () => {
    if (!message.trim()) return;

    // Create a temporary message to optimistically update UI
    const tempMsg = {
      _id: Math.random().toString(36).substr(2, 9), // temporary ID
      from: user.id,
      to: selectedChat._id,
      content: message,
      seen: false,
      createdAt: new Date().toISOString(),
    };

    // Update UI optimistically
    setChatMessages((prev) => [...prev, tempMsg]);
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3001/chat-app/v1/message/send",
        {
          from: user.id,
          to: selectedChat._id,
          content: message.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Replace temporary message with the real message from server
      setChatMessages((prev) =>
        prev.map((msg) => (msg._id === tempMsg._id ? res.data.data : msg))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally, remove the tempMsg or notify user here
    }
  };

  if (!selectedChat) {
    return <div className="no-chat">Select a chat to start messaging</div>;
  }

  return (
    <>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <img
            src={selectedChat.profilePic}
            alt={selectedChat.name}
            className="chat-avatar-lg"
          />
          <div>
            <h2>{selectedChat.name}</h2>
            <p>
              <OnlineDot /> Online
            </p>
          </div>
        </div>
        <FaVideo className="video-icon" />
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div
            key={msg._id}
            className={msg.from === user.id ? "my-message" : "friend-message"}
            ref={index === chatMessages.length - 1 ? scrollRef : null}
          >
            <div className="message-bubble">
              <span className="message-text">{msg.content}</span>
              {msg.from === user.id && (
                <span className="seen-tick">
                  {msg.seen ? (
                    <SeenTick />
                  ) : (
                    <span style={{ fontSize: "12px", color: "#999" }}>✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ color: "black" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </>
  );
}
