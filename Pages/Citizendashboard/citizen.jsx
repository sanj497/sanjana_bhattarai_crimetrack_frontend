import React, { useState, useEffect } from "react";
import { 
  Shield, 
  FileText, 
  Bell, 
  Activity, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ShieldCheck,
  Search,
  Eye
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CitizenDashboard() {
  const [user, setUser] = useState({});
  const [myCrimes, setMyCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchMyReports(parsedUser._id);
        
        // Real-time listener
        const handleNotification = () => {
          console.log("Citizen dashboard refreshing...");
          fetchMyReports(parsedUser._id);
        };
        window.addEventListener("new-notification-received", handleNotification);
        return () => window.removeEventListener("new-notification-received", handleNotification);
      } catch (e) {
        console.error("User parsing failed");
      }
    }
  }, []);

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMyCrimes(data.crimes);
    } catch (err) {
      console.error("Failed to fetch personal reports", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ["Pending", "Verified", "ForwardedToPolice", "UnderInvestigation", "Resolved"];
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const statusMap = {
    Pending: { label: "In Review", color: "amber", icon: <Clock size={16} /> },
    Verified: { label: "Incident Verified", color: "emerald", icon: <ShieldCheck size={16} /> },
    ForwardedToPolice: { label: "Dispatching Units", color: "blue", icon: <Activity size={16} /> },
    UnderInvestigation: { label: "Active Investigation", color: "indigo", icon: <Search size={16} /> },
    Resolved: { label: "Case Resolved", color: "cyan", icon: <CheckCircle2 size={16} /> },
    Rejected: { label: "Invalid Report", color: "rose", icon: <AlertCircle size={16} /> }
  };

  return (
    <div className="p-6 md:p-10 font-sans min-h-full bg-[#f8fafc]">
      {/* Welcome Banner */}
      <div className="mb-8 p-8 md:p-12 rounded-[32px] bg-[#020617] text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-[#020617] to-[#020617]" />
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] mb-6 uppercase tracking-widest border border-blue-500/20 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" /> Secure Citizen Access
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-none tracking-tighter uppercase whitespace-pre-line">
               Welcome back, {"\n"}<span className="text-blue-500">{user.username || 'Citizen'}</span>
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed text-sm font-medium mb-8">
               Your gateway to community safety. Monitor your reported incidents, receive real-time updates from dispatch, and access critical transparency metrics.
            </p>
            <div>
                <Link to="/report" className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                   File Intelligence Report <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
          </div>
          <div className="hidden lg:flex opacity-10">
            <Shield className="h-48 w-48 text-white" />
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {[
           { label: "Alerts Dispatched", val: "0", icon: <Bell />, color: "rose" },
           { label: "Intelligence Logs", val: myCrimes.length, icon: <FileText />, color: "blue" },
           { label: "Trust Score", val: "Optimal", icon: <Shield />, color: "emerald" },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center gap-6 group hover:border-blue-500/30 transition-all shadow-sm">
              <div className={`p-5 bg-${stat.color}-50 text-${stat.color}-500 rounded-2xl group-hover:scale-110 transition-transform`}>
                 {stat.icon}
              </div>
              <div>
                 <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-[2px]">{stat.label}</p>
                 <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.val}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* Active Investigations / Progress Tracker */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Incident Tracking</h2>
            <Link to="/report" className="text-xs font-bold text-blue-600 hover:underline">View All Records</Link>
        </div>

        {loading ? (
             <div className="h-40 bg-slate-100 animate-pulse rounded-[32px]" />
        ) : myCrimes.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-16 text-center shadow-sm">
            <div className="p-8 bg-slate-50 text-slate-300 rounded-full w-fit mx-auto mb-6">
               <Clock className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Recent Activity</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
              We haven't received any incident reports from your account recently. Your community is currently stable.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myCrimes.slice(0, 3).map((crime) => {
                const currentStep = getStatusStep(crime.status);
                const config = statusMap[crime.status] || statusMap.Pending;
                
                return (
                  <div key={crime._id} className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group overflow-hidden relative">
                    {/* Status Badge */}
                    <div className={`absolute top-10 right-10 px-6 py-2 rounded-full bg-${config.color}-50 text-${config.color}-600 text-[10px] font-black uppercase tracking-widest border border-${config.color}-100 flex items-center gap-2`}>
                        {config.icon}
                        {config.label}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-2">{crime.crimeType}</div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase leading-none mb-4 group-hover:text-blue-600 transition-colors">{crime.title}</h3>
                            <div className="flex items-center gap-4 text-slate-400 mb-8">
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                    <MapPin size={14} /> {crime.location?.address}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                    <Clock size={14} /> {new Date(crime.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Progress Tracker */}
                            <div className="relative pt-4">
                                <div className="flex justify-between mb-4">
                                    {["Reported", "Verified", "Dispatched", "Investigating", "Resolved"].map((label, i) => (
                                        <div key={i} className={`text-[8px] font-black uppercase tracking-widest ${i <= currentStep ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {label}
                                        </div>
                                    ))}
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                        style={{ width: `${(currentStep / 4) * 100}%` }}
                                    />
                                </div>
                                <div className="absolute top-[30px] left-0 w-full flex justify-between pointer-events-none">
                                    {[0,1,2,3,4].map((i) => (
                                        <div key={i} className={`h-4 w-4 rounded-full border-4 border-white shadow-sm ${i <= currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:border-l lg:border-slate-100 lg:pl-10">
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all whitespace-nowrap">
                                <Eye size={14} /> Intelligence Log
                            </button>
                            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <Activity size={14} /> Live Support
                            </button>
                        </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* Emergency SOS Signal Section */}
      <div className="bg-[#020617] rounded-[48px] p-8 md:p-16 shadow-2xl shadow-rose-900/10 relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 h-64 w-64 bg-rose-600 opacity-10 rounded-full translate-x-20 -translate-y-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="h-24 w-24 bg-rose-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(225,29,72,0.3)]">
                 <Activity className="h-12 w-12 text-white animate-pulse" />
              </div>
              <div className="max-w-md">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Immediate Dispatch</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">Instantly broadcast your live telemetry to the central police command. This action will bypass all verification and trigger an immediate field response.</p>
              </div>
           </div>
           
           <button 
             onClick={async () => {
               if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(async (pos) => {
                   const { latitude, longitude, accuracy } = pos.coords;
                   const token = localStorage.getItem("token");
                   try {
                     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos`, {
                       method: "POST",
                       headers: { 
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${token}` 
                       },
                       body: JSON.stringify({ latitude, longitude, accuracy })
                     });
                     const data = await res.json();
                     if (data.success) alert("🚨 SOS DISPATCHED: Authorities have been notified of your location.");
                   } catch (err) {
                     alert("Failed to send SOS. Please call emergency services.");
                   }
                 });
               } else {
                 alert("Geolocation is not supported by this browser.");
               }
             }}
             className="w-full lg:w-auto bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs tracking-[3px] px-12 py-6 rounded-[24px] transition-all shadow-2xl shadow-rose-600/30 active:scale-95 flex items-center justify-center gap-4"
           >
             <div className="h-2 w-2 rounded-full bg-white animate-ping" />
             Trigger Emergency SOS
           </button>
        </div>
      </div>
    </div>
  );
}