import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import NotificationDropdown from "../Dashboard/NotificationDropdown";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  Users, 
  Send, 
  Settings, 
  MessageSquare, 
  Shield, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  RefreshCw,
  BarChart3
} from "lucide-react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        const handleNewNotification = () => {
            fetchUnreadCount();
        };

        window.addEventListener("new-notification-received", handleNewNotification);
        return () => window.removeEventListener("new-notification-received", handleNewNotification);
    }, []);

    const menu = useMemo(
        () => [
            { name: "Dashboard",     icon: <LayoutDashboard size={20} />, path: "/dashboard" },
            { name: "Live Map",      icon: <MapIcon size={20} />,         path: "/admin/map"       },
            { name: "Report Desk",   icon: <FileText size={20} />,        path: "/adReport"  },
            { name: "User Directory",icon: <Users size={20} />,           path: "/user"      },
            { name: "Forward Queue", icon: <Send size={20} />,            path: "/forward-admin" },
            { name: "Complaints",    icon: <Settings size={20} />,        path: "/admin/complaints"      },
            { name: "Notifications", icon: <Bell size={20} />,            path: "/notifications" },
            { name: "Feedback",      icon: <MessageSquare size={20} />,   path: "/admin/feedback" },
            { name: "Performance",   icon: <BarChart3 size={20} />,       path: "/admin/performance" },
        ],
        []
    );

    const activeItem = useMemo(() => {
        const found = menu.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
        return found ? found.name : "Admin Panel";
    }, [location.pathname, menu]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7F9FC] font-sans text-[#111827]">
            {/* SIDEBAR */}
            <aside 
              className={`flex flex-col bg-[#050B18] text-gray-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 ${sidebarOpen ? "w-72" : "w-24"} shrink-0 border-r border-white/5 relative shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]`}
            >
                
                {/* LOGO AREA */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A1324]/50 backdrop-blur-md">
                    {sidebarOpen && (
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <div className="h-11 w-11 bg-gradient-to-br from-[#00B8D9] to-[#1E5EFF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,184,217,0.3)] group-hover:scale-105 transition-transform">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-white text-lg tracking-tight uppercase leading-none">CrimeTrack</span>
                              <span className="text-[10px] font-bold text-[#00B8D9] tracking-[3px] uppercase mt-1">Admin Ops</span>
                            </div>
                        </div>
                    )}
                    {!sidebarOpen && (
                        <div className="h-11 w-11 bg-gradient-to-br from-[#00B8D9] to-[#1E5EFF] rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,184,217,0.3)]">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>

                {/* Navigation Toggle - Floating Style */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-12 -right-4 h-8 w-8 bg-[#1E5EFF] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(30,94,255,0.4)] z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-[#F7F9FC]"
                >
                    {sidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                </button>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-1.5 scrollbar-hide">
                    <div className={`text-[10px] font-black uppercase tracking-[4px] text-gray-500 mb-4 px-4 ${!sidebarOpen && "hidden"}`}>Command Suite</div>
                    
                    {menu.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                        const hasBadge = item.name === "Notifications" && unreadCount > 0;

                        return (
                            <Link 
                                key={item.name} 
                                to={item.path} 
                                title={!sidebarOpen ? item.name : ""} 
                                className={`group flex items-center gap-4 px-4 py-4 rounded-[18px] transition-all relative overflow-hidden ${isActive ? "bg-gradient-to-r from-[#1E5EFF]/20 to-transparent text-[#00B8D9] font-bold" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}
                            >
                                {isActive && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00B8D9] rounded-r-full shadow-[0_0_15px_#00B8D9]" />
                                )}
                                
                                <div className={`flex items-center justify-center min-w-[24px] transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                   {React.cloneElement(item.icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
                                   {hasBadge && !sidebarOpen && (
                                      <div className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-[#050B18] animate-pulse" />
                                   )}
                                </div>
                                
                                {sidebarOpen && <span className="truncate text-sm tracking-tight">{item.name}</span>}
                                
                                {hasBadge && sidebarOpen && (
                                   <span className="ml-auto bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                                     {unreadCount}
                                   </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER AREA / USER BOX */}
                <div className="p-4 mt-auto border-t border-white/5 bg-[#0A1324]/30">
                    <button 
                        onClick={() => navigate("/logout")}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-[18px] text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 group"
                    >
                        <div className="group-hover:rotate-12 transition-transform">
                          <LogOut size={20} />
                        </div>
                        {sidebarOpen && <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Terminate Session</span>}
                    </button>
                    
                    {sidebarOpen && (
                      <div className="mt-4 px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <div className="h-8 w-8 bg-[#112445] rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-black text-[#00B8D9]">
                          V1.2
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none">Central System</span>
                          <span className="text-[10px] font-black text-[#00B8D9] uppercase mt-1">Encrypted</span>
                        </div>
                      </div>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative text-left">
                {/* HEADER */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-30 sticky top-0 shadow-sm">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Administrator Portal</div>
                        <h2 className="text-xl font-extrabold text-[#0B1F3B] tracking-tight">{activeItem}</h2>
                    </div>

                    <div className="flex items-center gap-6 relative">
                        <div className="relative">
                            <button 
                              onClick={() => setNotifOpen(!notifOpen)}
                              className={`p-2 rounded-xl transition-all duration-300 ${notifOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-[#1E5EFF] hover:bg-slate-50'}`}
                            >
                                <Bell size={22} className={unreadCount > 0 && !notifOpen ? "animate-[swing_2s_ease-in-out_infinite] origin-top" : ""} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                        </div>

                        <div className="h-8 w-px bg-gray-100 hidden md:block" />
                        {(() => {
                          const u = getUser();
                          const initials = u.username ? u.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "A";
                          return (
                            <>
                              <div className="hidden md:flex flex-col items-end mr-2">
                                <div className="text-xs font-bold text-[#0B1F3B]">{u.username || "Administrator"}</div>
                                <div className="text-[10px] text-gray-400">{u.email || "admin@crimetrack.gov"}</div>
                              </div>
                              <div className="h-10 w-10 bg-[#0B1F3B] text-white flex items-center justify-center rounded-xl font-black shadow-lg transform rotate-3 hover:rotate-0 transition-transform cursor-default">
                                {initials}
                              </div>
                            </>
                          );
                        })()}
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-[#F7F9FC]">
                    <div className="p-0 text-left">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

