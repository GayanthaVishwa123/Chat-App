import React, { createContext, useContext, useState } from "react";
import "../StylePages/messageBar.css"

// Create Context
const MessageContext = createContext();

// Custom Hook to Use the Context
export const useMessage = () => {
  return useContext(MessageContext);
};

// Context Provider Component
export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState("success"); 

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setType(type);
    setTimeout(() => {
      setMessage(null); 
    }, 5000);
  };

  return (
    <MessageContext.Provider value={{ message, type, showMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
