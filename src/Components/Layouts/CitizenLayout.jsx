import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Bell, MessageSquare, Settings, AlertTriangle, ShieldAlert, LogOut, ChevronLeft, ChevronRight, Shield, Activity } from "lucide-react";
import NotificationDropdown from "../Dashboard/NotificationDropdown";
import ThemeToggle from "../Dashboard/ThemeToggle";
import { toast } from "react-toastify";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", path: "/citizen" },
  { icon: <Activity size={20} />, label: "Report Tracking", path: "/citizen/tracking" },
  { icon: <ShieldAlert size={20} />, label: "Admin Alerts", path: "/citizen/alerts" },
  { icon: <MessageSquare size={20} />, label: "Feedback", path: "/feedback" },
  { icon: <AlertTriangle size={20} />, label: "Emergency", path: "/emergency", badge: "SOS" },
  { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
  { icon: <Settings size={20} />, label: "Settings", path: "/citizen/settings" },
];

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);
  const location = useLocation();

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      // Handle 404 - endpoint not deployed yet
      if (res.status === 404) {
        toast.error("Profile upload endpoint not deployed yet. Please use Settings page.");
        setUploadingPicture(false);
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile picture updated!");

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.profilePicture = data.user.profilePicture;
        localStorage.setItem("user", JSON.stringify(storedUser));

        window.location.reload();
      } else {
        toast.error(data.msg || "Failed to upload picture");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload picture. Backend may not be deployed.");
    } finally {
      setUploadingPicture(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const handler = () => fetchUnreadCount();
    window.addEventListener("new-notification-received", handler);
    return () => window.removeEventListener("new-notification-received", handler);
  }, []);

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    if (item) return item.label;
    if (location.pathname === "/report") return "Report Crime";
    if (location.pathname === "/citizen/tracking") return "Incident Tracker";
    if (location.pathname === "/emergency") return "Emergency Services";
    if (location.pathname === "/feedback") return "Submit Feedback";
    return "Citizen Portal";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:relative inset-y-0 left-0 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out z-40 ${sidebarOpen ? "w-64" : "w-20"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shrink-0`}>
        {/* LOGO AREA */}
        <div className="h-20 md:h-24 flex items-center justify-between px-4 md:px-6 border-b border-slate-800/50">
          {sidebarOpen && (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-blue-500/20">
                <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-black text-white text-base md:text-xl tracking-tight uppercase italic">CrimeTrack</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center mx-auto shadow-lg overflow-hidden border border-blue-500/20">
              <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
          )}
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 md:top-24 -right-3 h-6 w-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white z-50 cursor-pointer shadow-xl transition hidden lg:flex"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2 relative">
          <div className={`text-[10px] font-black uppercase tracking-[4px] text-slate-600 mb-4 px-3 ${!sidebarOpen && "hidden"}`}>Command Hub</div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasBadge = item.label === "Notifications" && unreadCount > 0;

            return (
              <Link key={item.label} to={item.path} title={!sidebarOpen ? item.label : ""} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-black" : "text-slate-500 hover:bg-slate-800 hover:text-white"}`}>
                <div className="flex items-center justify-center">
                  {item.icon}
                  {hasBadge && !sidebarOpen && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-blue-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                  )}
                </div>
                {sidebarOpen && <span className="truncate text-xs font-black uppercase tracking-widest">{item.label}</span>}
                {hasBadge && sidebarOpen && (
                  <span className="ml-auto bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}

          <div className={`mt-8 mb-4 border-t border-slate-800/50 pt-8 px-4 text-[10px] font-black uppercase tracking-[4px] text-slate-600 ${!sidebarOpen && "hidden"}`}>Priority Ops</div>

          <Link to="/report" title={!sidebarOpen ? "Report Crime" : ""} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${location.pathname === "/report" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-500 hover:bg-slate-800 hover:text-rose-500"}`}>
            <AlertTriangle size={20} />
            {sidebarOpen && <span className="truncate text-xs font-black uppercase tracking-widest">Report Crime</span>}
          </Link>

          <Link to="/emergency" title={!sidebarOpen ? "Emergency" : ""} className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/20 mt-4 group">
            <ShieldAlert size={20} className="animate-pulse" />
            {sidebarOpen && <span className="truncate font-black text-xs uppercase tracking-[2px]">Dispatch SOS</span>}
          </Link>
        </nav>

        {/* BOTTOM USER/LOGOUT AREA */}
        <div className="p-6 border-t border-slate-800/50">
          <Link to="/logout" title={!sidebarOpen ? "Logout" : ""} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Logout</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* HEADER */}
        <header className="h-20 md:h-24 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-10 shrink-0 z-30 sticky top-0 shadow-2xl backdrop-blur-md bg-opacity-80">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-[2px] md:tracking-[3px] mb-1">Citizen Protection Portal</div>
              <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter italic">{pageTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6 relative">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${notifOpen ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
              >
                <Bell size={18} className="md:size-22" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 md:top-2 md:right-2 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-blue-500 text-[8px] md:text-[10px] font-black text-white ring-4 ring-slate-900 shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div className="h-10 w-px bg-slate-800 hidden sm:block mx-2" />
            <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-inner">
              <Activity size={14} className="text-blue-500" />
              <span className="text-white">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
            {(() => {
              const u = getUser();
              const initials = (u.username || u.name || u.email || "User").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="text-xs md:text-sm font-black text-white tracking-tight leading-none capitalize">{u.username || u.name || u.email || "User"}</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-blue-400/80 lowercase tracking-wide mt-1.5">{u.email || "user@crimetrack.com"}</div>
                  </div>
                  <div
                    className="h-10 w-10 md:h-12 md:w-12 bg-blue-600 text-white flex items-center justify-center rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-blue-900/40 relative group cursor-pointer border border-blue-500/50 overflow-hidden"
                    onClick={handleProfilePictureClick}
                    title="Click to change profile picture"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
                    {uploadingPicture ? (
                      <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : u.profilePicture ? (
                      <img src={u.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </header>

        {/* OUTLET CONTAINER */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
