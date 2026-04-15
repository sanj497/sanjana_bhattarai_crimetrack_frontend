import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Send, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Bell,
  Navigation,
  Clock,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmergencyCenter() {
    const navigate = useNavigate();
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [alertingId, setAlertingId] = useState(null);
    const [alertStatus, setAlertStatus] = useState({}); // { id: 'success' | 'error' | 'sending' }

    // Fetch verified crimes that haven't been alerted yet
    const fetchAlertQueue = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/alert-queue`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCrimes(data.queue || []);
            }
        } catch (err) {
            console.error("Fetch alert queue error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlertQueue();
        
        // Listen for socket events to live-refresh the queue
        const handleNewNotif = () => fetchAlertQueue();
        window.addEventListener("new-notification-received", handleNewNotif);
        return () => window.removeEventListener("new-notification-received", handleNewNotif);
    }, []);

    const sendEmergencyBroadcast = async (crimeId) => {
        if (!window.confirm("CONFIRMATION: Dispatch emergency geofenced alerts? This will notify all nearby citizens (except the reporter) via Email and Dashboard.")) return;
        
        setAlertingId(crimeId);
        setAlertStatus(prev => ({ ...prev, [crimeId]: 'sending' }));

        try {
            const token = localStorage.getItem("token");
            // The backend now automatically handles geofencing if citizenIds are not provided
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/${crimeId}/broadcast-safe-alert`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    customMessage: "" // Uses default template if empty
                })
            });
            const data = await res.json();

            if (data.success) {
                setAlertStatus(prev => ({ ...prev, [crimeId]: 'success' }));
                // Give user a moment to see the success state before removing from list
                setTimeout(() => {
                    setCrimes(prev => prev.filter(c => c._id !== crimeId));
                }, 1500);
            } else {
                setAlertStatus(prev => ({ ...prev, [crimeId]: 'error' }));
                alert(data.error || "Broadcast failed");
            }
        } catch (err) {
            console.error("Broadcast error:", err);
            setAlertStatus(prev => ({ ...prev, [crimeId]: 'error' }));
        } finally {
            setAlertingId(null);
        }
    };

    const filteredCrimes = crimes.filter(c => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white border border-slate-200 rounded-[32px] shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-rose-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-rose-600/40 animate-pulse">
                            <ShieldAlert size={34} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Emergency Center</h1>
                            <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-[3px] flex items-center gap-2">
                                <div className="h-2 w-2 bg-rose-500 rounded-full"/>
                                Real-Time Citizen Geofencing System
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Scan by Zone or Category..."
                                className="pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-80 shadow-inner transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchAlertQueue}
                            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:rotate-180 transition-all duration-700 shadow-sm"
                            title="Refresh Intelligence Queue"
                        >
                            <RefreshCw size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* LIVE QUEUE FEED */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
                    {[1,2,3].map(i => <div key={i} className="h-96 bg-white border border-slate-100 rounded-[40px] animate-pulse" />)}
                </div>
            ) : filteredCrimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
                    {filteredCrimes.map((crime) => {
                        const status = alertStatus[crime._id];
                        return (
                            <div key={crime._id} className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative">
                                {/* PRIORITY ACCENT */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all"/>
                                
                                <div className="p-10 relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 uppercase tracking-widest inline-block w-fit italic">
                                                Verified Output
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                              <Clock size={10}/> {new Date(crime.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <button 
                                          onClick={() => navigate(`/admin/verify/${crime._id}`)}
                                          className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                          title="View Full Case Intelligence"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase leading-[1.1] tracking-tight group-hover:text-rose-600 transition-colors">
                                        {crime.title}
                                    </h3>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 text-slate-600 text-[13px] font-black bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                              <AlertTriangle size={16} className="text-amber-500" />
                                            </div>
                                            {crime.crimeType}
                                        </div>
                                        <div className="flex items-start gap-3 text-slate-400 text-[11px] font-bold px-1 leading-relaxed">
                                            <MapPin size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                            <span>{crime.location?.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black px-1 pb-4 border-b border-slate-50">
                                            <div className="h-7 w-7 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-600 shadow-inner">
                                              {crime.userId?.username?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-tighter opacity-50">Originating Source</span>
                                                <span className="text-slate-800 uppercase tracking-tight">{crime.userId?.username || "Auth Citizen"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 flex items-center justify-between mb-10 border border-slate-100 shadow-inner">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white border border-slate-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                                <Navigation size={20} className="animate-pulse" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-widest">Target Zone</span>
                                                <span className="text-xs font-black text-slate-900 mt-1 uppercase tracking-tighter">10KM Geofence</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-rose-500 uppercase leading-none tracking-widest">Impact</span>
                                            <span className="text-lg font-black text-rose-600 mt-1 tabular-nums">{crime.nearbyCitizenCount || 0} People</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => sendEmergencyBroadcast(crime._id)}
                                        disabled={status === 'sending' || status === 'success'}
                                        className={`w-full py-5 rounded-[22px] text-[11px] font-black uppercase tracking-[4px] flex items-center justify-center gap-4 transition-all shadow-xl hover:-translate-y-1 active:scale-95 ${
                                            status === 'success' 
                                            ? "bg-emerald-500 text-white shadow-emerald-500/40" 
                                            : status === 'sending'
                                            ? "bg-slate-200 text-slate-500 cursor-wait"
                                            : "bg-[#050B18] text-white hover:bg-rose-600 shadow-slate-900/40"
                                        }`}
                                    >
                                        {status === 'success' ? (
                                            <><CheckCircle2 size={20} /> Alert Dispatched</>
                                        ) : status === 'sending' ? (
                                            <><RefreshCw size={20} className="animate-spin" /> Syncing Nodes...</>
                                        ) : (
                                            <><Send size={20} /> Send Safe Alert</>
                                        )}
                                    </button>
                                    
                                    <div className="mt-6 flex justify-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                       <span className="flex items-center gap-2 group-hover:text-blue-400 transition-colors"><Mail size={12} /> Email</span>
                                       <span className="flex items-center gap-2 group-hover:text-amber-400 transition-colors"><Bell size={12} /> Dashboard</span>
                                       <span className="flex items-center gap-2 group-hover:text-rose-400 transition-colors"><ShieldAlert size={12} /> Live</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-48">
                    <div className="relative mb-10">
                        <div className="h-32 w-32 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 size={64} className="text-emerald-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-10 w-10 bg-white shadow-xl rounded-full flex items-center justify-center border-2 border-emerald-500">
                             <ShieldAlert size={18} className="text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">All Sectors Secure</h2>
                    <p className="text-slate-400 font-bold text-sm max-w-sm text-center uppercase tracking-[3px] leading-loose">
                        Zero pending verified incidents requiring geofenced safety alerts.
                    </p>
                </div>
            )}
            
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
