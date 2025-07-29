import React from "react";
import "../componets-Style/CallList.css";

export default function CallList({ callLogs }) {
  return (
    <div className="call_list">
      {callLogs.map((call) => (
        <div key={call.id} className="call_list-item">
          <div className="call-entry">
            <img
              src={call.profilePic}
              alt={call.name}
              className="chat-avatar"
            />
            <div className="call-text">
              <div className="call-header">
                <span>{call.name}</span>
                <span className={`call-type ${call.type.toLowerCase()}`}>
                  {call.type}
                </span>
              </div>
              <div className="call-time">{call.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
