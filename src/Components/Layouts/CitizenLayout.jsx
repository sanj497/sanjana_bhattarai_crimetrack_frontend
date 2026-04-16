import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Bell, MessageSquare, Settings, AlertTriangle, ShieldAlert, LogOut, ChevronLeft, ChevronRight, Shield, Users, BarChart3, MapPin, Activity } from "lucide-react";
import NotificationDropdown from "../Dashboard/NotificationDropdown";
import ThemeToggle from "../Dashboard/ThemeToggle";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Overview", path: "/citizen" },
  { icon: <Activity size={20} />, label: "Incident Tracker", path: "/citizen/tracking" },
  { icon: <Users size={20} />, label: "Community", path: "/community" },
  { icon: <MapPin size={20} />, label: "Safety Map", path: "/map-citizen" },
  { icon: <BarChart3 size={20} />, label: "Transparency", path: "/transparency" },
  { icon: <ShieldAlert size={20} />, label: "Admin Alerts", path: "/citizen/alerts" },
  { icon: <AlertTriangle size={20} />, label: "Emergency", path: "/emergency", badge: "SOS" },
  { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
  { icon: <MessageSquare size={20} />, label: "Complaints", path: "/complaints" },
  { icon: <Settings size={20} />, label: "Settings", path: "/citizen/settings" },
];

export default function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-300">
      {/* SIDEBAR - Theme based on logo (Deep Blue) */}
      <aside className={`flex flex-col bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 ${sidebarOpen ? "w-64" : "w-20"} shrink-0 shadow-2xl shadow-slate-900/10`}>
        {/* LOGO AREA */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-blue-500/30">
                <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-black text-white text-xl tracking-tight uppercase italic">CrimeTrack</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg overflow-hidden border-2 border-blue-500/30">
              <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-24 -right-3 h-6 w-6 bg-blue-600 text-white border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center z-50 cursor-pointer shadow-xl transition hover:scale-110"
        >
          {sidebarOpen ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
        </button>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2 relative scrollbar-hide">
          <div className={`text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-4 px-3 ${!sidebarOpen && "hidden"}`}>Command Hub</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasBadge = item.label === "Notifications" && unreadCount > 0;

            return (
              <Link key={item.label} to={item.path} title={!sidebarOpen ? item.label : ""} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-black" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <div className="flex items-center justify-center">
                   {item.icon}
                   {hasBadge && !sidebarOpen && (
                      <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-blue-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                   )}
                </div>
                {sidebarOpen && <span className="truncate text-[11px] font-black uppercase tracking-widest">{item.label}</span>}
                {hasBadge && sidebarOpen && (
                   <span className="ml-auto bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                     {unreadCount}
                   </span>
                )}
              </Link>
            )
          })}

          <div className={`mt-8 mb-4 border-t border-white/5 pt-8 px-4 text-[10px] font-black uppercase tracking-[4px] text-slate-500 ${!sidebarOpen && "hidden"}`}>Priority Ops</div>
          
          <Link to="/report" title={!sidebarOpen ? "Report Crime" : ""} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${location.pathname === "/report" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-400 hover:bg-white/5 hover:text-rose-500"}`}>
            <AlertTriangle size={20} />
            {sidebarOpen && <span className="truncate text-[11px] font-black uppercase tracking-widest">Report Crime</span>}
          </Link>
          
          <Link to="/emergency" title={!sidebarOpen ? "Emergency" : ""} className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/20 mt-4 group">
            <ShieldAlert size={20} className="animate-pulse" />
            {sidebarOpen && <span className="truncate font-black text-[11px] uppercase tracking-[2px]">Dispatch SOS</span>}
          </Link>
        </nav>

        {/* BOTTOM USER/LOGOUT AREA */}
        <div className="p-6 border-t border-white/5">
          <Link to="/logout" title={!sidebarOpen ? "Logout" : ""} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest leading-none">Terminate Session</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* HEADER */}
        <header className="h-24 bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 shrink-0 z-30 sticky top-0 shadow-sm backdrop-blur-md">
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[3px] mb-1">Citizen Protection Portal</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-6 relative">
             <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`p-3 rounded-2xl transition-all duration-300 ${notifOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Bell size={22} className={unreadCount > 0 && !notifOpen ? "animate-[swing_2s_ease-in-out_infinite] origin-top text-blue-500" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white ring-4 ring-white dark:ring-slate-900 shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
             </div>
             
             <ThemeToggle />
             
             <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block mx-1" />
             <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
               <Activity size={14} className="text-blue-500" />
               <span className="text-slate-600 dark:text-white">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
             </div>
             {(() => {
               const u = getUser();
               const initials = u.username ? u.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "C";
               return (
                 <div className="flex items-center gap-4">
                   <div className="hidden sm:block text-right">
                     <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{u.username || "Authorized Citizen"}</div>
                     <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{u.role || "Level 1 Access"}</div>
                   </div>
                   <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40 relative group cursor-pointer border border-blue-500/50">
                     <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" />
                     {initials}
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
