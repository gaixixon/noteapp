// src/components/SplashMessage.jsx
import { useEffect, useState } from "react";

export default function SplashMessage({
  message,
  duration = 3000,
  onClose = () => console.log("Splash closed"),
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start fade-out slightly before actual close
    const fadeTimer = setTimeout(() => setVisible(false), duration - 500);
    const closeTimer = setTimeout(onClose, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  return (
<div
  className={`fixed bottom-4 right-4 bg-white text-gray-900 border-l-4 border-blue-600 shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-500
    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
>
  <span className="text-blue-600 text-xl">💾</span>
  <span className="font-medium">{message}</span>
</div>
);
}
