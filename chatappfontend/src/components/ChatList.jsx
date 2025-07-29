import React from "react";
import "../componets-Style/ChatList.css";

export default function ChatList({ chatList, selectedChat, setSelectedChat }) {
  if (!Array.isArray(chatList) || chatList.length === 0) {
    return <div className="chat_list">No chats available</div>;
  }

  return (
    <div className="chat_list">
      {chatList.map((chat) => {
        const displayName =
          chat.name || chat.username || chat.chatName || "Unknown";

        const lastMsgText =
          typeof chat.lastMessage === "string"
            ? chat.lastMessage
            : chat.lastMessage?.content || "No messages yet";

        return (
          <div
            key={chat._id || chat.id}
            className={`chat_list-item ${
              selectedChat?.id === chat._id ? "selected" : ""
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            <div className="chat-entry">
              <img
                src={
                  chat.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=random`
                }
                alt={displayName}
                className="chat-avatar"
              />
              <div className="chat-text">
                <div className="name">{displayName}</div>
                <div className="last-message">{lastMsgText}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
