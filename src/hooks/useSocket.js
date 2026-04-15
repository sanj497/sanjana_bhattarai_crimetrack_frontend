import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

export const useSocket = () => {
  const socketRef = useRef(null);

  const initializeSocket = useCallback(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      if (!userId) return null;

      // Initialize socket with reconnection limits
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 10000,
      });

      // Authenticate with server to join rooms
      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("authenticate", {
          userId,
          role: user.role
        });
      });

      // Listen for notifications
      socket.on("new_notification", (data) => {
        console.log("New Notification received:", data);
        toast.info(data.message, {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "colored",
        });
        
        window.dispatchEvent(new CustomEvent("new-notification-received"));
      });

      // Listen for critical SOS alerts
      socket.on("new_sos_alert", (data) => {
        console.log("🚨 SOS ALERT RECEIVED:", data);
        toast.error(`🆘 EMERGENCY SOS: ${data.user?.name || "Unknown"} needs help!`, {
          position: "top-center",
          autoClose: false, // Stay until dismissed
          closeOnClick: false,
          theme: "colored",
        });

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 400]);
        }

        // Dispatch for local component updates
        window.dispatchEvent(new CustomEvent("sos-alert-received", { detail: data }));
      });

      // Listen for location updates
      socket.on("sos_location_update", (data) => {
        console.log("📍 SOS Location Update:", data);
        window.dispatchEvent(new CustomEvent("sos-location-updated", { detail: data }));
      });

      // Graceful error handling - don't spam console
      socket.on("connect_error", (err) => {
        console.warn("Socket connection failed:", err.message);
      });

      socket.on("reconnect_failed", () => {
        console.warn("Socket reconnection failed after max attempts. Notifications will use HTTP polling.");
      });

      return socket;
    } catch (error) {
      console.error("Socket initialization failed:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const socket = initializeSocket();
    if (socket) {
      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket]);

  return socketRef.current;
};
