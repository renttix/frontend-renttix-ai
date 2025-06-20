"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NoInternetPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showGreen, setShowGreen] = useState(false); // Controls green transition after 2 seconds

  useEffect(() => {
    const handleOnline = () => {
      setTimeout(() => {
        setShowGreen(true);
        setTimeout(() => {
          const lastPage = localStorage.getItem("lastPage") || "/";
          localStorage.removeItem("lastPage");
          router.push(lastPage);
        }, 3000); // Redirect 1 sec after turning green
      }, 100); // 2 seconds before turning green
    };

    const handleOffline = () => {
      setShowGreen(false); // Reset when offline
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* SVG Icon - Changes color after 2 sec online */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 24 24"
          className=""
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={showGreen ? "#35530e" : "#FF6B6B"} // Green when online
            strokeWidth="2"
          />
          <path
            d="M6 9C7.65685 7.34315 9.82843 6.5 12 6.5C14.1716 6.5 16.3431 7.34315 18 9"
            stroke={showGreen ? "#35530e" : "#FF6B6B"}
            strokeWidth="2"
          />
          <path
            d="M8 12C9.10457 10.8954 10.5523 10 12 10C13.4477 10 14.8954 10.8954 16 12"
            stroke={showGreen ? "#35530e" : "#FF6B6B"}
            strokeWidth="2"
          />
          <path
            d="M10 15C10.5523 14.4477 11.4477 14.4477 12 15C12.5523 15.5523 13.4477 15.5523 14 15"
            stroke={showGreen ? "#35530e" : "#FF6B6B"}
            strokeWidth="2"
          />
          {/* Cross line only when offline */}
          {!showGreen && (
            <line x1="3" y1="3" x2="21" y2="21" stroke="#FF6B6B" strokeWidth="2" />
          )}
        </svg>

        <img src="/images/logo/logo-dark.svg" className="w-52 mx-auto mb-6 mt-10" alt="Logo" />
      </motion.div>

      <motion.h1
        className="text-3xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {showGreen ? "Connected! Redirecting..." : "No Internet Connection"}
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {showGreen ? "You're back online!" : "You are offline. Check your connection and try again."}
      </motion.p>

      {!showGreen && (
        <motion.button
          className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </motion.button>
      )}
    </div>
  );
}
