import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import NotificationDropdown from "../Dashboard/NotificationDropdown";
import ThemeToggle from "../Dashboard/ThemeToggle";
import { toast } from "react-toastify";

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
  BarChart3,
  ShieldAlert,
  Activity
} from "lucide-react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const fileInputRef = useRef(null);

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
                
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                storedUser.profilePicture = data.user.profilePicture;
                localStorage.setItem("user", JSON.stringify(storedUser));
                
                // Force re-render
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
            { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
            { name: "Map",     icon: <MapIcon size={20} />,         path: "/admin/map"       },
            { name: "Reports", icon: <FileText size={20} />,        path: "/adReport"  },
            { name: "Users",  icon: <Users size={20} />,           path: "/user"      },
            {name: "Verify",   icon: <ShieldAlert size={20} />,     path: "/forward-admin" },
            { name: "Complaints", icon: <Settings size={20} />,        path: "/admin/complaints"      },
            { name: "Notifications",    icon: <Bell size={20} />,            path: "/notifications" },
            { name: "Feedback",    icon: <MessageSquare size={20} />,   path: "/admin/feedback" },
            { name: "Performance",    icon: <BarChart3 size={20} />,       path: "/admin/performance" },
            { name: "Settings",          icon: <Settings size={20} />,        path: "/admin/settings" },
        ],
        []
    );

    const activeItem = useMemo(() => {
        const found = menu.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
        return found ? found.name : "Admin Panel";
    }, [location.pathname, menu]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300">
            {/* SIDEBAR */}
            <aside 
              className={`flex flex-col bg-[#050B18] text-gray-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 ${sidebarOpen ? "w-72" : "w-24"} shrink-0 border-r border-white/5 relative shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]`}
            >
                
                {/* LOGO AREA */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A1324]/50 backdrop-blur-md">
                    {sidebarOpen && (
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border-2 border-[#1E5EFF]">
                              <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-white text-lg tracking-tight uppercase leading-none">CrimeTrack </span>
                              <span className="text-[10px] font-bold text-[#00B8D9] tracking-[3px] uppercase mt-1">Admin HQ</span>
                            </div>
                        </div>
                    )}
                    {!sidebarOpen && (
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg overflow-hidden border-2 border-[#1E5EFF]">
                           <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Navigation Toggle - Floating Style */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-12 -right-4 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-slate-950"
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
                                className={`group flex items-center gap-4 px-5 py-4 rounded-[22px] transition-all relative overflow-hidden ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black" : "hover:bg-white/5 text-slate-500 hover:text-white"}`}
                            >
                                <div className={`flex items-center justify-center min-w-[24px] transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                   {React.cloneElement(item.icon, { size: 20 })}
                                   {hasBadge && !sidebarOpen && (
                                      <div className="absolute top-3 right-3 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                                   )}
                                </div>
                                
                                {sidebarOpen && <span className="truncate text-xs font-black uppercase tracking-widest leading-none">{item.name}</span>}
                                
                                {hasBadge && sidebarOpen && (
                                   <span className="ml-auto bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">
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
                <header className="h-24 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10 shrink-0 z-30 sticky top-0 shadow-2xl backdrop-blur-md bg-opacity-80">
                    <div>
                        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[3px] mb-1">Administrative Clearing House</div>
                        <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">{activeItem}</h2>
                    </div>

                    <div className="flex items-center gap-6 relative">
                        <div className="relative">
                            <button 
                              onClick={() => setNotifOpen(!notifOpen)}
                              className={`p-3 rounded-2xl transition-all duration-300 ${notifOpen ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Bell size={22} className={unreadCount > 0 && !notifOpen ? "animate-[swing_2s_ease-in-out_infinite] origin-top text-blue-500" : ""} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white ring-4 ring-slate-900 shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                        </div>

                        <div className="h-10 w-px bg-slate-800 hidden md:block mx-1" />
                        <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-inner">
                           <Activity size={14} className="text-blue-500" />
                           <span className="text-white">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        </div>
                        {(() => {
                          const u = getUser();
                          const initials = u.username ? u.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "A";
                          return (
                            <div className="flex items-center gap-4">
                              <div className="hidden md:flex flex-col items-end">
                                <div className="text-xs font-black text-white uppercase tracking-tighter leading-none">{u.username || "Administrator"}</div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{u.role || "Executive Access"}</div>
                              </div>
                              <div 
                                className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40 relative group cursor-pointer border border-blue-500/50 overflow-hidden"
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

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-slate-950">
                    <div className="p-0 text-left">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

