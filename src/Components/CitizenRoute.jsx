import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * CitizenRoute — requires authenticated user with role === "user".
 */
export default function CitizenRoute({ children }) {
  const location = useLocation();
  const [stamp, setStamp] = useState(Date.now());

  useEffect(() => {
    const handleStorage = () => setStamp(Date.now());
    window.addEventListener("storage", handleStorage);
    window.addEventListener("authChange", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authChange", handleStorage);
    };
  }, []);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== "user") {
      // Authenticated but wrong role — redirect to their own dashboard
      if (user.role === "admin") return <Navigate to="/dashboard" replace />;
      if (user.role === "police") return <Navigate to="/police/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
