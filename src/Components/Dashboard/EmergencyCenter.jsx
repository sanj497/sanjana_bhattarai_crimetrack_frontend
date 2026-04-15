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
  Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmergencyCenter() {
    const navigate = useNavigate();
    const [crimes, setCrimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [alertingId, setAlertingId] = useState(null);
    const [alertStatus, setAlertStatus] = useState({}); // { id: 'success' | 'error' | 'sending' }

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

        const handleNewNotif = () => {
          console.log("Emergency Center refreshing queue...");
          fetchAlertQueue();
        };

        window.addEventListener("new-notification-received", handleNewNotif);
        return () => window.removeEventListener("new-notification-received", handleNewNotif);
    }, []);

    const sendEmergencyBroadcast = async (crimeId) => {
        if (!window.confirm("Confirm: Dispatch emergency alerts to all nearby citizens? This will send dashboard notifications and emails.")) return;
        
        setAlertingId(crimeId);
        setAlertStatus(prev => ({ ...prev, [crimeId]: 'sending' }));

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/${crimeId}/broadcast-safe-alert`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setAlertStatus(prev => ({ ...prev, [crimeId]: 'success' }));
                setTimeout(() => {
                    setCrimes(prev => prev.filter(c => c._id !== crimeId));
                }, 2000);
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
        <div className="min-h-screen bg-[#F7F9FC] p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Emergency Response Center</h1>
                        <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest leading-none">
                            Broadcast verified safety alerts to nearby citizens
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by zone or crime type..."
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-80 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchAlertQueue}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse" />)}
                </div>
            ) : filteredCrimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCrimes.map((crime) => {
                        const status = alertStatus[crime._id];
                        return (
                            <div key={crime._id} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-rose-500">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100 italic">
                                            Priority Verified
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Navigation size={14} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase leading-tight group-hover:text-rose-600 transition-colors">
                                        {crime.title}
                                    </h3>

                                    <div className="flex flex-col gap-3 mb-8">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-50 p-2 rounded-xl">
                                            <AlertTriangle size={14} className="text-amber-500" />
                                            {crime.crimeType}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium leading-relaxed px-1">
                                            <MapPin size={14} className="text-slate-300" />
                                            {crime.location?.address}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold px-1 mt-1 border-t border-slate-50 pt-3">
                                            <div className="h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-black">
                                              {crime.userId?.username?.[0] || 'U'}
                                            </div>
                                            <span>Reported by: <span className="text-slate-600 font-black">{crime.userId?.username || "Authenticated User"}</span></span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-8 border border-dashed border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                <Users size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Scanning Zone</span>
                                                <span className="text-xs font-black text-slate-700 mt-1 uppercase tracking-tighter">10KM Radius</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => sendEmergencyBroadcast(crime._id)}
                                        disabled={status === 'sending' || status === 'success'}
                                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[3px] flex items-center justify-center gap-3 transition-all shadow-lg ${
                                            status === 'success' 
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                                            : status === 'sending'
                                            ? "bg-slate-200 text-slate-500 cursor-wait"
                                            : "bg-slate-900 text-white hover:bg-rose-600 shadow-slate-900/20"
                                        }`}
                                    >
                                        {status === 'success' ? (
                                            <><CheckCircle2 size={18} /> Broadcasted</>
                                        ) : status === 'sending' ? (
                                            <><RefreshCw size={18} className="animate-spin" /> Dispatching...</>
                                        ) : (
                                            <><Send size={18} /> Dispatch Alert</>
                                        )}
                                    </button>
                                    
                                    <div className="mt-4 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                       <span className="flex items-center gap-1.5"><Mail size={10} /> Email Alerts</span>
                                       <span className="flex items-center gap-1.5"><Bell size={10} /> Push Alerts</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Area Secure</h2>
                    <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs text-center uppercase tracking-widest leading-relaxed">
                        No pending verified incidents requiring urgent community alerts.
                    </p>
                </div>
            )}
        </div>
    );
}
