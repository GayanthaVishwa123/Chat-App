import React from "react";
import "../componets-Style/Chatinput.css";
export default function ChatInput({ message, setMessage, sendMessage }) {
  return (
    <div className="chat-input-area">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
