// src/contexts/FlashContext.jsx
import React, { createContext, useContext, useState } from "react";

const FlashContext = createContext();
export const useFlash = () => useContext(FlashContext);

export const FlashProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);

  const showFlash = (text, type = "info", duration = 3000) => {
    setMessage({ text, type });
    setVisible(true);

    setTimeout(() => {
      setVisible(false); // start fade-out animation
      setTimeout(() => setMessage(null), 300); // remove after animation
    }, duration);
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "error": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <FlashContext.Provider value={{ showFlash }}>
      {children}

      {/* Flash message */}
      {message && (
        <div
          className={`
            fixed top-5 left-1/2 transform -translate-x-1/2 
            px-6 py-3 rounded-lg text-white shadow-lg
            transition-all duration-300
            ${getBgColor(message.type)}
            ${visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}
          `}
        >
          {message.text}
        </div>
      )}
    </FlashContext.Provider>
  );
};
