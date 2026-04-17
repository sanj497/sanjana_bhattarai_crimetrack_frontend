import React, { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, MapPin, Bell, Search, Menu, X, Siren, LogOut, LayoutDashboard, PhoneCall, Settings } from 'lucide-react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import NotificationDropdown from '../Dashboard/NotificationDropdown';
import ThemeToggle from '../Dashboard/ThemeToggle';
import { toast } from 'react-toastify';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

export default function PoliceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sosCount, setSosCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
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

  const fetchDataCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Notifications
      const nRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, { headers });
      const nData = await nRes.json();
      if (nData.success) setUnreadCount(nData.unreadCount || 0);

      // Active SOS
      const sRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos`, { headers });
      const sData = await sRes.json();
      if (sData.success) {
        // Count SOS alerts that are not resolved (status not "Resolved")
        const activeSos = sData.data.filter(s => s.status !== "Resolved").length;
        setSosCount(activeSos);
      }
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  React.useEffect(() => {
    fetchDataCounts();
    const handleSync = () => fetchDataCounts();
    window.addEventListener("new-notification-received", handleSync);
    window.addEventListener("sos-alert-received", handleSync);
    return () => {
      window.removeEventListener("new-notification-received", handleSync);
      window.removeEventListener("sos-alert-received", handleSync);
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/police/dashboard' },
    { name: 'Live Map', icon: MapPin, path: '/police/map' },
    { name: 'Reports', icon: FileText, path: '/police/reports' },
    { name: 'SOS Alerts', icon: Siren, path: '/police/sos' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Emergency', icon: PhoneCall, path: '/police/emergency' },
    { name: 'Settings', icon: Settings, path: '/police/settings' },
  ];

  const currentPage = menuItems.find(item => item.path === location.pathname)?.name || 'Police Dashboard';

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-24'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-blue-500/20">
                <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-black text-xl tracking-tight text-white uppercase italic">Police Dashboard</span>
            </div>
          )}
          {!sidebarOpen && (
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg overflow-hidden border border-blue-500/20">
                <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-2 relative scrollbar-hide">
          {/* <div className={`text-[10px] font-black uppercase tracking-[4px] text-slate-600 mb-4 px-4 ${!sidebarOpen && "hidden"}`}>Dashboard Operational</div> */}
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const hasBadge = item.badge;
            const badgeLabel = item.badge;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                    {hasBadge && (
                      <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                )}
                {hasBadge && !sidebarOpen && (
                  <div className="absolute top-3 right-3 h-2.5 w-2.5 bg-rose-600 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => navigate('/logout')}
            className="flex items-center gap-3 py-3 px-4 rounded w-full bg-slate-700 hover:bg-red-600 transition-colors font-semibold shadow-sm"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-24 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10 shrink-0 z-30 sticky top-0 shadow-2xl backdrop-blur-md bg-opacity-80">
          <div className="flex items-center gap-4">
             <div>
                <div className="text-[10px] text-slate-600 font-black uppercase tracking-[3px] mb-1">Operational Command Node</div>
                <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{currentPage}</h1>
             </div>
          </div>
          
          <div className="flex items-center gap-6 relative">
            <div className="relative hidden xl:block">
              <input 
                type="text" 
                placeholder="Search Active Intel..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.dispatchEvent(new CustomEvent('global-search', { detail: globalSearch }));
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-blue-500 w-64 transition-all shadow-inner placeholder:text-slate-700 font-black uppercase tracking-widest"
              />
              <Search className="absolute left-4 top-3 text-slate-700" size={16} />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
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

              {(() => {
                const u = getUser();
                const initials = (u.username || u.name || "Police").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="text-sm font-black text-white tracking-tight leading-none capitalize">{u.username || u.name || "Officer"}</div>
                      <div className="text-[10px] font-bold text-blue-400/80 lowercase tracking-wide mt-1.5">{u.email || "officer@crimetrack.com"}</div>
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
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
            <Outlet context={{ globalSearch }} />
        </div>
      </div>
    </div>
  );
}

