import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, MapPin, Bell, Search, Menu, X, Siren, LogOut, LayoutDashboard, PhoneCall } from 'lucide-react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import NotificationDropdown from '../Dashboard/NotificationDropdown';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

export default function PoliceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  React.useEffect(() => {
    fetchUnreadCount();
    const handleNewNotification = () => fetchUnreadCount();
    window.addEventListener("new-notification-received", handleNewNotification);
    return () => window.removeEventListener("new-notification-received", handleNewNotification);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/police/dashboard' },
    { name: 'Live Map', icon: MapPin, path: '/police/map' },
    { name: 'Reports', icon: FileText, path: '/police/reports' },
    { name: 'SOS Alerts', icon: Siren, path: '/police/sos', badge: '3' },
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
            <div className="flex items-center gap-2">
              <Shield className="text-blue-500" size={24} />
              <span className="font-bold text-lg tracking-tight">POLICE HQ</span>
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

