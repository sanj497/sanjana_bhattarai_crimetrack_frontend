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
  Activity,
  AlertTriangle
} from "lucide-react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            
            { name: "Feedback",      icon: <MessageSquare size={20} />,   path: "/admin/feedback" },
            { name: "Emergency",      icon: <AlertTriangle size={20} />,   path: "/admin/emergency" },
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
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            
            {/* SIDEBAR */}
            <aside 
              className={`fixed lg:relative inset-y-0 left-0 flex flex-col bg-[#050B18] text-gray-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 ${sidebarOpen ? "w-72" : "w-24"} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shrink-0 border-r border-white/5 relative shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]`}
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
                              <span className="text-[10px] font-bold text-[#00B8D9] tracking-[3px] uppercase mt-1">Admin </span>
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
                    className="absolute top-12 -right-4 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-slate-950 hidden lg:flex"
                >
                    {sidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
                </button>

                {/* Close button for mobile */}
                <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-6 right-4 h-8 w-8 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all lg:hidden"
                >
                    <ChevronLeft size={16}/>
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
                        {sidebarOpen && <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Logout</span>}
                    </button>
                    
                    {/* {sidebarOpen && (
                      <div className="mt-4 px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <div className="h-8 w-8 bg-[#112445] rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-black text-[#00B8D9]">
                          V1.2
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none">Central System</span>
                          <span className="text-[10px] font-black text-[#00B8D9] uppercase mt-1">Encrypted</span>
                        </div>
                      </div>
                    )} */}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative text-left w-full max-w-full">
                {/* HEADER */}
                <header className="h-20 md:h-24 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-10 shrink-0 z-30 sticky top-0 shadow-2xl backdrop-blur-md bg-opacity-80">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="text-[9px] md:text-[10px] text-slate-600 font-black uppercase tracking-[2px] md:tracking-[3px] mb-1 truncate">Admin Control Center</div>
                            <h2 className="text-base sm:text-lg md:text-2xl font-black text-white italic tracking-tight uppercase truncate">{activeItem}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 relative">
                        <div className="relative">
                            <button 
                              onClick={() => setNotifOpen(!notifOpen)}
                              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 ${notifOpen ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Bell size={16} className="md:w-5 md:h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center rounded-full bg-blue-500 text-[7px] md:text-[8px] font-black text-white ring-2 ring-slate-900 shadow-lg">
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
                          const initials = (u.username || u.name || "Admin").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                          return (
                            <div className="flex items-center gap-2 md:gap-4">
                              <div className="hidden md:flex flex-col items-end">
                                <div className="text-sm font-black text-white tracking-tight leading-none capitalize">
                                  {u.username || u.name || "Administrator"}
                                </div>
                                <div className="text-[10px] font-bold text-blue-400/80 lowercase tracking-wide mt-1.5">
                                  {u.email || "admin@system.com"}
                                </div>
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

