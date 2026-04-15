import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user._id || user.id;
    if (!userId) return;

    // Initialize socket with reconnection limits
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    // Authenticate with server to join rooms
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      socketRef.current.emit("authenticate", {
        userId,
        role: user.role
      });
    });

    // Listen for notifications
    socketRef.current.on("new_notification", (data) => {
      console.log("New Notification received:", data);
      toast.info(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
      // Dispatch custom event to refresh notification list components if active
      window.dispatchEvent(new CustomEvent("new-notification-received"));
    });

    // Graceful error handling - don't spam console
    socketRef.current.on("connect_error", (err) => {
      console.warn("Socket connection failed:", err.message);
    });

    socketRef.current.on("reconnect_failed", () => {
      console.warn("Socket reconnection failed after max attempts. Notifications will use HTTP polling.");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
