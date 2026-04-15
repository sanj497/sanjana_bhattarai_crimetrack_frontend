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

    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
    });

    // Authenticate with server to join rooms
    socketRef.current.emit("authenticate", {
      userId,
      role: user.role
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
