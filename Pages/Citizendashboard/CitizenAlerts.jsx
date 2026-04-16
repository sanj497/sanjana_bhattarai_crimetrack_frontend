import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, MapPin, Clock, MessageSquare, ShieldCheck, Activity } from "lucide-react";

export default function CitizenAlerts() {
  const [adminAlerts, setAdminAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.notifications) {
        const isAutoSystemPing = (msg) => msg?.includes("COMMUNITY SAFETY ALERT");
        
        // Filter for Verified Broadcasts sent by Admin
        setAdminAlerts(data.notifications.filter(n => n.type === "citizen_alert" && !isAutoSystemPing(n.message)));
      }
    } catch (err) {
      console.error("Failed to fetch admin alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    const handler = () => fetchAlerts();
    window.addEventListener("new-notification-received", handler);
    return () => window.removeEventListener("new-notification-received", handler);
  }, []);

  return (
    <div className="p-8 lg:p-12 font-sans min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-6xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-500 font-black text-[10px] mb-6 uppercase tracking-[3px] border border-blue-500/20 shadow-sm shadow-blue-500/10">
          <ShieldAlert className="h-4 w-4" /> Official Transmissions
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic underline decoration-blue-500 decoration-8 underline-offset-8 decoration-opacity-20">
          Admin <span className="text-blue-600 dark:text-blue-500">Alerts</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed text-sm font-bold uppercase tracking-widest opacity-80">
          Verified tactical broadcasts and urgent safety directives from the Command Hub.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-6">
             <div className="h-16 w-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin shadow-xl"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[5px] animate-pulse">Syncing Intel...</span>
          </div>
        ) : adminAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800/50 rounded-[48px] p-24 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/[0.02] dark:to-blue-500/[0.05] pointer-events-none" />
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-slate-100 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
               <ShieldCheck className="h-12 w-12 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Sector Secured</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-black uppercase tracking-[4px] max-w-sm mx-auto leading-relaxed">
              No active threat vectors detected. Command Hub reports zero active priority broadcasts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {adminAlerts.map(alert => (
              <div key={alert._id} className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-[40px] p-10 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden group ${!alert.isRead ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-blue-500'}`}>
                <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                   <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-[24px] shadow-sm ${!alert.isRead ? 'bg-rose-500/10 text-rose-600 dark:text-rose-500' : 'bg-blue-600/10 text-blue-600 dark:text-blue-500'}`}>
                          <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-[4px] italic ${!alert.isRead ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-blue-600 dark:text-blue-500'}`}>
                            {!alert.isRead ? 'Critical Transmission' : 'Operation Record'}
                          </span>
                          {alert.crimeId && alert.crimeId.crimeType && (
                            <span className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight mt-1">
                               {alert.crimeId.crimeType}
                            </span>
                          )}
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-blue-500/20 transition-all">
                      <Clock size={14} className="text-blue-500"/>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{new Date(alert.createdAt).toLocaleString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-10 rounded-[32px] border border-slate-100 dark:border-slate-800/30 mb-8 relative z-10 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                  <p className="text-xl font-black text-slate-800 dark:text-white leading-[1.4] max-w-4xl italic uppercase tracking-tight">
                    "{alert.message}"
                  </p>
                </div>

                {alert.crimeId && alert.crimeId.title && (
                  <div className="p-8 bg-blue-600/5 dark:bg-blue-600/[0.02] rounded-[32px] border border-blue-500/10 dark:border-blue-500/[0.05] flex flex-col md:flex-row justify-between md:items-center gap-8 group-hover:bg-blue-600/10 transition-all duration-500 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[24px] border border-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-blue-600 dark:text-blue-500 mb-2 underline decoration-blue-500/20 underline-offset-4">Linked Case Intel</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic leading-none">{alert.crimeId.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black flex items-center gap-2 uppercase tracking-widest leading-none"><MapPin size={12} className="text-rose-500" /> {alert.crimeId?.location?.address || "Location Analysis Encrypted"}</p>
                        </div>
                    </div>
                    <Link to={`/citizen/tracking`} className="px-8 py-5 bg-slate-950 dark:bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[4px] hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-2xl hover:shadow-blue-600/40 transition-all shrink-0 active:scale-95 shadow-xl">
                       Datalink Access
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
