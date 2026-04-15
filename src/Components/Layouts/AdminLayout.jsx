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
            <aside className={`flex flex-col bg-[#0B1F3B] text-gray-300 transition-all duration-300 ease-in-out z-20 ${sidebarOpen ? "w-64" : "w-20"} shrink-0 border-r border-[#112445] relative`}>
                
                {/* LOGO AREA */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-[#112445]">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-[#00B8D9]" />
                            <span className="font-bold text-white text-xl tracking-tight">AdminHQ</span>
                        </div>
                    )}
                    {!sidebarOpen && (
                        <Shield className="h-8 w-8 text-[#00B8D9] mx-auto" />
                    )}
                </div>

                {/* Toggle Button */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-20 -right-3 h-6 w-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#1E5EFF] z-50 cursor-pointer shadow-sm transition"
                >
                    {sidebarOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
                </button>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
                    <div className={`text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-3 ${!sidebarOpen && "hidden"}`}>Command Center</div>
                    
                    {menu.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                        const hasBadge = item.name === "Notifications" && unreadCount > 0;

                        return (
                            <Link 
                                key={item.name} 
                                to={item.path} 
                                title={!sidebarOpen ? item.name : ""} 
                                className={`flex items-center gap-3 px-3 py-3 rounded-[10px] transition-all relative ${isActive ? "bg-[#1E5EFF]/10 text-[#00B8D9] font-semibold" : "hover:bg-[#112445] hover:text-white"}`}
                            >
                                <div className="flex items-center justify-center min-w-[20px]">
                                   {item.icon}
                                   {hasBadge && !sidebarOpen && (
                                      <div className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full ring-1 ring-[#0B1F3B]" />
                                   )}
                                </div>
                                {sidebarOpen && <span className="truncate text-sm">{item.name}</span>}
                                {hasBadge && sidebarOpen && (
                                   <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                                     {unreadCount}
                                   </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER AREA */}
                <div className="p-4 border-t border-[#112445]">
                    <button 
                        onClick={() => navigate("/logout")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
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

