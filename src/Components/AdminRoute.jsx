import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * AdminRoute — requires authenticated user with role === "admin".
 */
export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      // Authenticated but wrong role — redirect to their own dashboard
      if (user.role === "police") return <Navigate to="/police/dashboard" replace />;
      if (user.role === "user") return <Navigate to="/citizen" replace />;
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
