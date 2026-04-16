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
  Eye,
  MessageSquare,
  Star,
  Siren,
  ShieldAlert,
  TrendingUp
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function FeedbackModal({ crime, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message) return toast.error("Please provide your feedback message.");
    if (!crime?.workflow?.assignedToOfficer?._id) {
      return toast.error("Feedback can be submitted after a police officer is assigned to the case.");
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message,
          rating,
          crimeId: crime._id,
          policeId: crime.workflow.assignedToOfficer._id,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback submitted successfully. Thank you!");
        onSubmit();
        onClose();
      } else {
        throw new Error(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
           <MessageSquare size={120} />
        </div>
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic underline decoration-blue-500 decoration-4 underline-offset-8">Submit Feedback</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white font-bold p-2 transition-colors">✕</button>
        </div>
        
        <div className="mb-6 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 relative z-10">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Activity size={10} /> Incident Reference
          </p>
          <p className="font-bold text-white text-lg tracking-tight mb-1">{crime.title}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-2">
            <Shield size={10} /> Agent: {crime.workflow?.assignedToOfficer?.username || "PENDING"}
          </p>
        </div>

        <div className="mb-8 relative z-10 text-center">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Investigative Quality Rating</label>
          <div className="flex justify-center gap-3">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-all hover:scale-125 hover:rotate-12 active:scale-90">
                <Star className={`h-10 w-10 ${rating >= star ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" : "text-slate-800"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 relative z-10">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileText size={10} /> Witness Statement / Feedback
          </label>
          <textarea
             rows={4}
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             placeholder="Report your interaction experience..."
             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all placeholder:text-slate-700 font-medium"
          />
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
             <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
             <>TRANSFORM FEEDBACK <ChevronRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [myCrimes, setMyCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crimeAlerts, setCrimeAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [localPings, setLocalPings] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchMyReports(parsedUser._id);
        fetchUnreadCount();

        // Real-time listener
        const handleNotification = () => {
          console.log("Citizen dashboard refreshing due to new notification...");
          fetchMyReports(parsedUser._id);
          fetchUnreadCount();
          fetchCrimeAlerts(); // Keep feed synced
        };
        window.addEventListener("new-notification-received", handleNotification);
        return () => window.removeEventListener("new-notification-received", handleNotification);
      } catch {
        console.error("User parsing failed");
      }
    }
    fetchCrimeAlerts();
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

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

  const fetchCrimeAlerts = async () => {
    try {
      setAlertsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/community`);
      const data = await res.json();
      if (data.success) setCrimeAlerts(data.reports.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch community alerts", err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
        if (data.notifications) {
          const isAutoSystemPing = (msg) => msg?.includes("COMMUNITY SAFETY ALERT");
          
          // Unread Automated system warnings generated immediately when someone reports near you
          setLocalPings(data.notifications.filter(n => n.type === "citizen_alert" && isAutoSystemPing(n.message) && !n.isRead));
        }
      }
    } catch (err) {}
  };

  const [feedbackCrime, setFeedbackCrime] = useState(null);

  return (
    <div className="p-6 md:p-10 font-sans min-h-full bg-slate-950 text-slate-300">
      {feedbackCrime && (
         <FeedbackModal 
           crime={feedbackCrime} 
           onClose={() => setFeedbackCrime(null)} 
           onSubmit={() => fetchMyReports()} 
         />
      )}
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
           { label: "Alerts Dispatched", val: unreadCount > 0 ? unreadCount : "0 New", icon: <Bell />, color: "rose" },
           { label: "Intelligence Logs", val: myCrimes.length, icon: <FileText />, color: "blue" },
           { label: "Trust Score", val: "Optimal", icon: <Shield />, color: "emerald" },
         ].map((stat, i) => (
           <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-[40px] flex items-center gap-6 group hover:border-blue-500/20 transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
              <div className={`p-5 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-3xl group-hover:bg-${stat.color}-500 group-hover:text-white transition-all shadow-lg`}>
                 {stat.icon}
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-[3px]">{stat.label}</p>
                 <h3 className="text-3xl font-black text-white leading-none tracking-tight">{stat.val}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* Live Active Pings (Safeguard) */}
      {localPings.length > 0 && (
        <div className="mb-12 bg-rose-600 rounded-[32px] p-8 md:p-10 text-white shadow-[0_20px_40px_-15px_rgba(225,29,72,0.6)] border border-rose-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 h-64 w-64 bg-rose-500 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
           <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 relative z-10">
              <div className="h-16 w-16 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-2xl shadow-white/20 shrink-0">
                 <AlertCircle size={32} className="animate-pulse" />
              </div>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">Local Area Pings</h2>
                 <p className="text-rose-200 text-sm font-bold">Unverified alerts routed specifically to you due to proximate reporting.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
             {localPings.map((ping) => (
               <div key={ping._id} className="bg-rose-700/50 backdrop-blur-md rounded-[24px] p-6 border border-rose-500 hover:bg-rose-700/80 transition-all hover:-translate-y-1 shadow-lg cursor-default">
                  <div className="flex justify-between items-center mb-4">
                     <span className="px-3 py-1 bg-white text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                       Proximity Ping
                     </span>
                     <span className="text-rose-200 text-[10px] font-black uppercase tracking-wider bg-rose-900/50 px-2 py-1 rounded-lg">
                       {new Date(ping.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <p className="text-white font-bold leading-relaxed text-sm mb-4">
                    {ping.message}
                  </p>
                  
                  {ping.crimeId && (
                     <div className="flex items-center gap-2 pt-4 border-t border-rose-500/50 text-[10px] font-black uppercase tracking-widest text-rose-200">
                        <MapPin size={14} /> 
                        {ping.crimeId.crimeType || "Incident"} IN YOUR SECTOR
                     </div>
                  )}
               </div>
             ))}
           </div>
        </div>
      )}




      {/* Emergency SOS Signal Section - Tactical Response Unit */}
      <div className="bg-slate-950 rounded-[64px] p-10 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group border border-slate-800/50">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-rose-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[120px] group-hover:bg-rose-500/20 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-[80px]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10">
           <div className="flex flex-col items-center md:items-start gap-10 text-center md:text-left max-w-2xl">
              <div className="flex items-center gap-6">
                 <div className="h-24 w-24 bg-rose-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_60px_rgba(225,29,72,0.4)] relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-[32px] border-4 border-white/20 animate-ping opacity-20" />
                    <Activity className="h-12 w-12 text-white animate-pulse" />
                 </div>
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[3px] border border-rose-500/20 mb-3">
                       <Shield className="h-3 w-3" /> Priority Alpha Channel
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                       Tactical <span className="text-rose-600">SOS</span> Dispatch
                    </h3>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Instantly broadcast your encrypted telemetry to the <span className="text-white font-bold">Central Police Command</span>. Once triggered, this bypasses all secondary verification protocols for an immediate physical field response.
                 </p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                       { label: "GPS Telemetry", icon: <MapPin size={14} /> },
                       { label: "Identity Hash", icon: <ShieldCheck size={14} /> },
                    ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                          <span className="text-rose-500">{feat.icon}</span> {feat.label}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="w-full xl:w-auto flex flex-col items-center gap-6">
             <button 
               onClick={async () => {
                 if (!window.confirm("CONFIRM CRITICAL SOS DISPATCH? All police units will be alerted to your location immediately.")) return;
                 
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
                       if (data.success) {
                         toast.success("🚨 CRITICAL SOS DISPATCHED! All police units have been notified. Maintain current coordinates if safe.", {
                           position: "top-center",
                           autoClose: 10000,
                           theme: "dark"
                         });
                         if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
                       } else {
                         throw new Error(data.message);
                       }
                     } catch (error) {
                       toast.error("DISPATCH FAILED: Network interference. Dial 100 immediately.", {
                         position: "top-center",
                         theme: "dark"
                       });
                     }
                   });
                 } else {
                   toast.error("GEOLOCATION UNAVAILABLE. Call emergency services now.", {
                     position: "top-center",
                     theme: "dark"
                   });
                 }
               }}
               className="group/btn relative w-full md:w-80 h-80 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95"
             >
               {/* Orbital Rings */}
               <div className="absolute inset-0 rounded-full border-2 border-rose-600/30 animate-[spin_10s_linear_infinite]" />
               <div className="absolute inset-4 rounded-full border border-rose-600/10 animate-[spin_15s_linear_infinite_reverse]" />
               
               <div className="absolute inset-10 bg-rose-600 rounded-full shadow-[0_0_80px_rgba(225,29,72,0.6)] group-hover/btn:scale-105 transition-transform duration-500 flex flex-col items-center justify-center gap-4 text-center p-8 border-8 border-slate-950">
                  <Activity className="h-10 w-10 text-white animate-pulse" />
                  <div>
                    <span className="block text-[10px] font-black text-rose-200 uppercase tracking-[4px] mb-1">Critical</span>
                    <span className="block text-4xl font-black text-white uppercase tracking-tighter">TRIGGER</span>
                    <span className="block text-[10px] font-black text-rose-200 uppercase tracking-[4px] mt-1">SOS SIGNAL</span>
                  </div>
               </div>
             </button>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] animate-pulse">Waiting for manual authorization</p>
           </div>
        </div>
      </div>
    </div>
  );
}
