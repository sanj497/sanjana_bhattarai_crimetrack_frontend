import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, MapPin, Bell, Search, Menu, X, Siren, LogOut, LayoutDashboard, PhoneCall } from 'lucide-react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import NotificationDropdown from '../Dashboard/NotificationDropdown';
import ThemeToggle from '../Dashboard/ThemeToggle';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

export default function PoliceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sosCount, setSosCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    { name: 'SOS Alerts', icon: Siren, path: '/police/sos', badge: sosCount > 0 ? sosCount.toString() : null },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Emergency', icon: PhoneCall, path: '/police/emergency' },
  ];

  const currentPage = menuItems.find(item => item.path === location.pathname)?.name || 'Police Dashboard';

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-blue-500">
                <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-black text-lg tracking-tighter text-white uppercase italic">Police HQ</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 py-3 px-4 rounded transition-all duration-200 ${
                location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  {(item.name === 'Notifications' && unreadCount > 0) ? (
                    <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  ) : item.badge && (
                    <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </div>
              )}
            </Link>
          ))}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">{currentPage}</h1>
          </div>
          
          <div className="flex items-center gap-6 relative">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search cases..." 
                className="bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2 text-slate-500" size={16} />
            </div>
            
            <div className="flex items-center gap-4 border-l border-slate-700 pl-6 relative">
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`p-2 rounded-xl transition-all duration-300 ${notifOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <Bell size={20} className={unreadCount > 0 && !notifOpen ? "animate-[swing_2s_ease-in-out_infinite] origin-top" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ring-2 ring-slate-800">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
              
              <ThemeToggle />

              {(() => {
                const u = getUser();
                const initials = u.username ? u.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "P";
                return (
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold">{u.username || "Officer"}</div>
                      <div className="text-[10px] text-slate-500">{u.email || "police@crimetrack.gov"}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs ring-2 ring-slate-700">{initials}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto">
            <Outlet />
        </div>
      </div>
    </div>
  );
}

