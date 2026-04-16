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
  return (    <div className="p-6 md:p-10 font-sans min-h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300 transition-colors duration-300">
      {feedbackCrime && (
         <FeedbackModal 
            crime={feedbackCrime} 
            onClose={() => setFeedbackCrime(null)} 
            onSubmit={() => fetchMyReports()} 
         />
      )}
      {/* Welcome Banner */}
      <div className="mb-12 p-8 md:p-16 rounded-[48px] bg-slate-950 text-white relative overflow-hidden shadow-2xl border border-slate-800 group">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950 to-slate-950" />
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 text-blue-400 font-black text-[10px] mb-8 uppercase tracking-[3px] border border-white/10 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" /> Secure Citizen Access Enabled
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
               Welcome back, {"\n"}<span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">{user.username || 'Citizen'}</span>
            </h1>
            <p className="text-slate-400 max-w-xl leading-relaxed text-lg font-medium mb-12">
               Your gateway to community safety. Monitor reported incidents, receive real-time updates from dispatch, and access critical transparency metrics.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link to="/report" className="inline-flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-[2px] transition-all shadow-xl hover:scale-105 active:scale-95">
                   File Intelligence Report <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/citizen/tracking" className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-[2px] transition-all hover:bg-white/10 hover:border-white/20">
                   Track Cases <Activity className="h-4 w-4" />
                </Link>
            </div>
          </div>
          <div className="hidden lg:flex opacity-20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <Shield className="h-64 w-64 text-white" />
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
         {[
           { label: "Active Regional Datalinks", val: unreadCount > 0 ? unreadCount : "0 New", icon: <Bell />, color: "blue" },
           { label: "Submitted Artifacts", val: myCrimes.length, icon: <FileText />, color: "blue" },
           { label: "Citizen Trust Index", val: "Optimal", icon: <TrendingUp />, color: "emerald" },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-10 rounded-[40px] flex items-center gap-8 group hover:border-blue-500/30 transition-all shadow-sm hover:shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className={`p-6 bg-slate-50 dark:bg-slate-800/80 text-${stat.color}-600 dark:text-${stat.color}-500 rounded-[28px] shadow-inner group-hover:scale-110 transition-transform`}>
                 {stat.icon}
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase tracking-[3px] italic">{stat.label}</p>
                 <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">{stat.val}</h3>
              </div>
           </div>
         ))}
      </div>

      {/* Live Active Pings (Safeguard) */}
      {localPings.length > 0 && (
        <div className="mb-16 bg-rose-600 rounded-[48px] p-10 md:p-16 text-white shadow-2xl border border-rose-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 h-96 w-96 bg-rose-500 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-50" />
           <div className="flex flex-col md:flex-row items-center md:items-center gap-6 mb-12 relative z-10 text-center md:text-left">
              <div className="h-20 w-20 rounded-3xl bg-white text-rose-600 flex items-center justify-center shadow-2xl shadow-rose-950/20 shrink-0 transform group-hover:rotate-12 transition-transform">
                 <Siren size={40} className="animate-pulse" />
              </div>
              <div>
                 <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-2 italic">Proximal Safety Alerts</h2>
                 <p className="text-rose-100/80 text-sm font-black uppercase tracking-[2px]">Real-time Geofenced Intelligence Dispatch</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
             {localPings.map((ping) => (
               <div key={ping._id} className="bg-white/10 backdrop-blur-2xl rounded-[32px] p-8 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] shadow-xl cursor-default group/ping">
                  <div className="flex justify-between items-center mb-6">
                     <span className="px-4 py-2 bg-white text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2">
                       <ShieldAlert size={12} className="animate-pulse" />
                       Danger Zone
                     </span>
                     <span className="text-rose-100 text-[10px] font-black uppercase tracking-widest">
                       {new Date(ping.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <p className="text-lg font-black text-white leading-tight italic tracking-tight uppercase group-hover/ping:text-yellow-300 transition-colors uppercase">{ping.message}</p>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        
        {/* Incident Summary Card */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-[48px] p-10 lg:p-12 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-2xl" />
           <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1">Incident Registry</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px]">Verified Personal History</p>
              </div>
              <div className="h-16 w-16 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                 <ShieldCheck size={32} />
              </div>
           </div>

           <div className="space-y-6 relative z-10">
              {myCrimes.length > 0 ? (
                myCrimes.slice(0, 3).map((crime) => (
                  <div key={crime._id} className="group/item cursor-pointer">
                    <div className="flex items-center gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-lg">
                       <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner group-hover/item:scale-110 transition-transform">
                          <MapPin size={24} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight line-clamp-1 italic">{crime.crimeType}</h4>
                          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[2px] mt-1">
                             <Clock size={12} className="text-blue-500" /> {new Date(crime.date).toLocaleDateString()}
                          </div>
                       </div>
                       <div className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-white text-[9px] font-black uppercase tracking-[3px] border border-slate-100 dark:border-slate-700 shadow-sm">
                          {crime.status.replace(/([A-Z])/g, ' $1').trim()}
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-10 opacity-30">
                   <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <FileText size={40} className="text-slate-400" />
                   </div>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[4px] leading-relaxed">Encrypted Registry Integrity Maintained {"\n"}Zero Active Records Located</p>
                </div>
              )}
           </div>
           
           <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <Link to="/citizen/tracking" className="flex items-center justify-center gap-4 w-full py-6 rounded-[24px] bg-slate-900 text-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-[4px] hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                 Examine Full Operational History <ChevronRight size={16} />
              </Link>
           </div>
        </div>

        {/* Global Security Feed Preview */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-[48px] p-10 lg:p-12 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 rounded-full -mr-20 -mt-20 blur-2xl" />
           <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1">Safety Feed</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px]">Live Community Intelligence</p>
              </div>
              <div className="h-16 w-16 bg-rose-500/10 text-rose-600 dark:text-rose-500 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                 <Siren size={32} className="animate-pulse" />
              </div>
           </div>

           <div className="space-y-6 relative z-10">
              {alertsLoading ? (
                 <div className="h-64 flex flex-col items-center justify-center opacity-40">
                    <div className="w-10 h-10 border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                 </div>
              ) : crimeAlerts.length > 0 ? (
                crimeAlerts.map((alert) => (
                  <div key={alert._id} className="group/alert">
                    <div className="flex items-center gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm">
                       <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-rose-600 dark:text-rose-500 shadow-inner group-hover/alert:scale-110 transition-transform">
                          <AlertCircle size={24} />
                       </div>
                       <div className="flex-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight line-clamp-1 italic">{alert.title}</h4>
                          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[2px] mt-1">
                             <MapPin size={12} className="text-rose-500" /> {alert.location?.address || 'Grid Locked'}
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                         {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-10 opacity-30">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[4px]">Sector Synchronization Success {"\n"}No Active Threats Reported</p>
                </div>
              )}
           </div>
           
           <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <Link to="/citizen/alerts" className="flex items-center justify-center gap-4 w-full py-6 rounded-[24px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[4px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95">
                 Access Regional Threat Map <ChevronRight size={16} />
              </Link>
           </div>
        </div>
      </div>

      {/* Emergency SOS Signal Section - Tactical Response Unit */}
      <div className="bg-slate-950 rounded-[64px] p-10 md:p-24 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group border border-slate-800/50">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-rose-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[150px] group-hover:bg-rose-500/20 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 h-80 w-80 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-[100px]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="flex flex-col xl:flex-row items-center justify-between gap-20 relative z-10">
           <div className="flex flex-col items-center md:items-start gap-12 text-center md:text-left max-w-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="h-28 w-28 bg-rose-600 rounded-[40px] flex items-center justify-center shadow-[0_20px_80px_rgba(225,29,72,0.5)] relative group-hover:scale-110 transition-all duration-700 rotate-3 group-hover:rotate-0">
                    <div className="absolute inset-0 rounded-[40px] border-4 border-white/20 animate-ping opacity-30" />
                    <Activity className="h-14 w-14 text-white animate-pulse" />
                 </div>
                 <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[4px] border border-rose-500/20 mb-4 backdrop-blur-md italic">
                       <ShieldAlert className="h-4 w-4" /> Tactical Response Link
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">
                       Tactical <span className="text-rose-600 underline decoration-rose-600/30 decoration-8 underline-offset-8">SOS</span> Dispatch
                    </h3>
                 </div>
              </div>
              
              <div className="space-y-8">
                 <p className="text-slate-400 text-xl font-medium leading-relaxed">
                    Instantly broadcast your encrypted telemetry to the <span className="text-white font-black uppercase italic">Command Center</span>. This bypasses all secondary verification protocols for an immediate field response.
                 </p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {[
                       { label: "GPS Telemetry", icon: <MapPin size={16} /> },
                       { label: "Identity Hash", icon: <ShieldCheck size={16} /> },
                       { label: "Priority Alpha", icon: <Star size={16} /> },
                    ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-5 py-3.5 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors">
                          <span className="text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]">{feat.icon}</span> {feat.label}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="w-full xl:w-auto flex flex-col items-center gap-10">
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
               className="group/btn relative w-full md:w-96 h-96 rounded-full flex items-center justify-center transition-all duration-700 active:scale-90"
             >
                {/* Orbital Rings - Advanced FX */}
                <div className="absolute inset-0 rounded-full border-4 border-rose-600/20 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-6 rounded-full border-2 border-rose-600/10 animate-[spin_12s_linear_infinite_reverse]" />
                <div className="absolute inset-12 rounded-full border border-blue-500/10 animate-[spin_15s_linear_infinite]" />
                
                <div className="absolute inset-16 bg-rose-600 rounded-full shadow-[0_0_100px_rgba(225,29,72,0.8)] group-hover/btn:shadow-[0_0_150px_rgba(225,29,72,1)] group-hover/btn:scale-105 transition-all duration-500 flex flex-col items-center justify-center gap-6 text-center p-12 border-[12px] border-slate-950">
                   <div className="relative">
                      <Siren className="h-16 w-16 text-white animate-[pulse_1s_infinite]" />
                      <div className="absolute inset-0 bg-white/40 blur-[20px] rounded-full animate-ping opacity-50" />
                   </div>
                   <div className="relative z-10">
                     <span className="block text-[10px] font-black text-rose-100 uppercase tracking-[6px] mb-2 opacity-80">Operational Condition</span>
                     <span className="block text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-1">TRIGGER</span>
                     <span className="block text-[12px] font-black text-white uppercase tracking-[8px] mt-2 italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">SOS LINK</span>
                   </div>
                </div>
             </button>
             <div className="flex flex-col items-center gap-3">
                <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-rose-600 w-1/3 animate-[shimmer_2s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, #e11d48, transparent)' }} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[6px] animate-pulse">Awaiting Manual Override</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
