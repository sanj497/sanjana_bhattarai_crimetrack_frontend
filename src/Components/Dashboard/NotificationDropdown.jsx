import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock, ShieldAlert, FileText, CheckCircle2, ChevronRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/notifications`;

export default function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    
    const handleNotify = () => {
      if (isOpen) fetchNotifications();
    };
    
    window.addEventListener("new-notification-received", handleNotify);
    return () => window.removeEventListener("new-notification-received", handleNotify);
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications.slice(0, 5)); // Show only latest 5
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      // Trigger a refresh of the count in the layout
      window.dispatchEvent(new Event("new-notification-received"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
       await handleMarkRead(n._id);
    }
    onClose();

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const role = user.role;
      const pathSuffix = n.message.toLowerCase().includes("complain") ? "complain" : "reports";

      if (role === "admin") {
        if (n.message.toLowerCase().includes("complain")) navigate("/dashboard/complain");
        else navigate("/dashboard"); 
      } else if (role === "police") {
        if (n.message.toLowerCase().includes("sos")) navigate("/police/sos");
        else navigate("/police/reports");
      } else {
        if (n.message.toLowerCase().includes("complain")) navigate("/citizen/complain");
        else navigate("/citizen"); // General citizen dashboard where tracking is shown
      }
    } catch (e) {
      console.error("Navigation error", e);
    }
  };

  const getIcon = (msg) => {
    if (msg.includes("verified")) return <CheckCircle2 className="text-emerald-500" size={14} />;
    if (msg.includes("forwarded") || msg.includes("police")) return <FileText className="text-blue-500" size={14} />;
    if (msg.includes("SOS") || msg.includes("emergency")) return <ShieldAlert className="text-rose-500" size={14} />;
    return <Bell className="text-slate-400" size={14} />;
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "M";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-14 right-0 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in duration-200"
    >
      <div className="p-5 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{notifications.filter(n => !n.isRead).length} New</span>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 italic text-xs">Synchronizing...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-3">
             <Bell className="text-slate-100" size={40} />
             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Recent Logs</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-blue-100/50' : 'bg-slate-50'}`}>
                    {getIcon(n.message)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                        {n.crimeId?.crimeType || 'Alert'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">{timeSince(n.createdAt)}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed mb-2 break-words ${!n.isRead ? 'font-black text-slate-900' : 'font-medium text-slate-500'}`}>
                      {n.message}
                    </p>
                    {!n.isRead && (
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                         className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                       >
                         Acknowledge
                       </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link 
        to="/notifications" 
        onClick={onClose}
        className="block p-4 bg-slate-50 text-center text-[10px] font-black text-slate-500 uppercase tracking-[2px] hover:text-[#0B1F3B] hover:bg-slate-100 transition-all"
      >
        View Complete Archive
      </Link>
    </div>
  );
}
