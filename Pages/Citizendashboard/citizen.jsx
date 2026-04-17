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
        fetchProfile(); // Fetch full profile with picture from backend

        // Real-time listener
        const handleNotification = () => {
          console.log("Citizen dashboard refreshing due to new notification...");
          fetchMyReports(parsedUser._id);
          fetchUnreadCount();
          fetchCrimeAlerts(); // Keep feed synced
          fetchProfile(); // Also refresh profile
        };
        window.addEventListener("new-notification-received", handleNotification);
        return () => window.removeEventListener("new-notification-received", handleNotification);
      } catch {
        console.error("User parsing failed");
      }
    }
    fetchCrimeAlerts();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If endpoint doesn't exist yet (404), use localStorage data
      if (res.status === 404) {
        console.warn("Profile endpoint not deployed yet, using localStorage data");
        return;
      }
      
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

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

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

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

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

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
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 font-body min-h-full bg-primary-dark text-text-secondary">
      {feedbackCrime && (
         <FeedbackModal 
           crime={feedbackCrime} 
           onClose={() => setFeedbackCrime(null)} 
           onSubmit={() => fetchMyReports()} 
         />
      )}
      {/* Welcome Banner */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 lg:p-8 rounded-card bg-secondary-dark text-text-primary relative overflow-hidden shadow-xl border border-border-subtle">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-gold via-primary-dark to-primary-dark" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold font-semibold text-xs mb-4 uppercase tracking-wide border border-accent-gold/20 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" /> Secure Citizen Access
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
               Welcome back, {"\n"}<span className="text-accent-gold">{user.username || user.name || user.email || 'User'}</span>
            </h1>
            <p className="text-text-secondary max-w-lg leading-relaxed text-sm mb-6">
               Your gateway to safety. Monitor your reported incidents and receive real-time updates from dispatch.
            </p>
            <div>
                <Link to="/report" className="ct-btn-primary inline-flex items-center justify-center gap-2">
                   File Crime Report <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
          </div>
          <div className="hidden lg:flex opacity-10">
            <Shield className="h-48 w-48 text-text-primary" />
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
         {[
           { label: "Active Alerts", val: unreadCount > 0 ? unreadCount : "0 New", icon: <Bell />, color: "danger" },
           { label: "Reported Cases", val: myCrimes.length, icon: <FileText />, color: "accent-gold" },
           { label: "Assigned Units", val: myCrimes.filter(c => c.status !== 'Pending').length, icon: <Shield />, color: "success" },
         ].map((stat, i) => (
           <div key={i} className="ct-card flex items-center gap-4 md:gap-default group border border-border-subtle hover:border-accent-gold transition-all p-4 md:p-6">
              <div className={`p-3 md:p-default bg-${stat.color === 'accent-gold' ? 'accent-gold' : stat.color}/10 text-${stat.color === 'accent-gold' ? 'accent-gold' : stat.color} rounded-lg group-hover:bg-${stat.color === 'accent-gold' ? 'accent-gold' : stat.color} group-hover:text-primary-dark transition-all shadow-lg`}>
                 {React.cloneElement(stat.icon, { size: 20 })}
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] md:text-xs text-text-secondary mb-0.5 font-medium uppercase tracking-wider">{stat.label}</p>
                 <h3 className="text-xl md:text-2xl font-bold text-text-primary leading-none">{stat.val}</h3>
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
      <div className="bg-primary-dark rounded-[48px] p-section md:p-section shadow-xl relative overflow-hidden group border border-border-subtle">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-danger/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[120px] group-hover:bg-danger/20 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-accent-gold/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-[80px]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="flex flex-col xl:flex-row items-center justify-between gap-section relative z-10">
           <div className="flex flex-col items-center md:items-start gap-section text-center md:text-left max-w-2xl">
              <div className="flex items-center gap-default">
                 <div className="h-20 w-20 bg-danger rounded-xl flex items-center justify-center shadow-xl relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-xl border-4 border-white/20 animate-ping opacity-20" />
                    <Activity className="h-10 w-10 text-text-primary animate-pulse" />
                 </div>
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 text-danger text-xs font-semibold uppercase tracking-wide border border-danger/20 mb-2">
                       <Shield className="h-3 w-3" /> Priority Alpha Channel
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-text-primary uppercase leading-tight">
                       Tactical <span className="text-danger">SOS</span> Dispatch
                    </h3>
                 </div>
              </div>
              
              <div className="space-y-default">
                 <p className="text-text-secondary text-base leading-relaxed">
                    Instantly broadcast your encrypted telemetry to the <span className="text-text-primary font-semibold">Central Police Command</span>. Once triggered, this bypasses all secondary verification protocols for an immediate physical field response.
                 </p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                       { label: "GPS Telemetry", icon: <MapPin size={14} /> },
                       { label: "Identity Hash", icon: <ShieldCheck size={14} /> },
                    ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-2 text-xs font-semibold text-text-secondary bg-white/5 px-default py-2 rounded-lg border border-white/5">
                          <span className="text-danger">{feat.icon}</span> {feat.label}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="w-full xl:w-auto flex flex-col items-center gap-default">
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
               className="group/btn relative w-full md:w-72 h-72 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95"
             >
               {/* Orbital Rings */}
               <div className="absolute inset-0 rounded-full border-2 border-danger/30 animate-[spin_10s_linear_infinite]" />
               <div className="absolute inset-4 rounded-full border border-danger/10 animate-[spin_15s_linear_infinite_reverse]" />
               
               <div className="absolute inset-10 bg-danger rounded-full shadow-xl group-hover/btn:scale-105 transition-transform duration-500 flex flex-col items-center justify-center gap-2 text-center p-section border-8 border-primary-dark">
                  <Activity className="h-8 w-8 text-text-primary animate-pulse" />
                  <div>
                    <span className="block text-xs font-semibold text-danger-200 uppercase tracking-wide mb-1">Critical</span>
                    <span className="block text-3xl font-bold text-text-primary uppercase">TRIGGER</span>
                    <span className="block text-xs font-semibold text-danger-200 uppercase tracking-wide mt-1">SOS SIGNAL</span>
                  </div>
               </div>
             </button>
             <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide animate-pulse">Waiting for manual authorization</p>
           </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-section bg-gradient-to-br from-secondary-dark to-primary-dark rounded-card p-section shadow-xl border border-border-subtle relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 h-64 w-64 bg-accent-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-success/5 rounded-full translate-x-1/2 translate-y-1/2 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-default mb-section">
            <div className="p-default bg-accent-gold/10 text-accent-gold rounded-lg">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Submit Your Feedback</h2>
              <p className="text-text-secondary text-sm">Help us improve safety services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-section">
            {/* Quick Feedback Card */}
            <div className="bg-primary-dark/50 rounded-card p-section border border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary mb-default">Rate Our Service</h3>
              <p className="text-text-secondary text-sm mb-section">
                Your feedback helps us enhance the platform and improve response times for all citizens.
              </p>
              
              <div className="space-y-default">
                <div className="flex items-center gap-default p-default bg-secondary-dark rounded-lg border border-border-subtle">
                  <Star className="h-5 w-5 text-accent-gold" />
                  <div>
                    <p className="text-text-primary font-medium text-sm">Rate Your Experience</p>
                    <p className="text-text-secondary text-xs">Provide a rating for overall platform satisfaction</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-default p-default bg-secondary-dark rounded-lg border border-border-subtle">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-text-primary font-medium text-sm">Report Quality</p>
                    <p className="text-text-secondary text-xs">Feedback on crime report handling and resolution</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-default p-default bg-secondary-dark rounded-lg border border-border-subtle">
                  <Bell className="h-5 w-5 text-accent-gold" />
                  <div>
                    <p className="text-text-primary font-medium text-sm">Communication</p>
                    <p className="text-text-secondary text-xs">Rate our notification and update system</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/feedback')}
                className="ct-btn-primary w-full mt-section inline-flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Submit General Feedback
              </button>
            </div>

            {/* Case-Specific Feedback */}
            <div className="bg-primary-dark/50 rounded-card p-section border border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary mb-default">Case Feedback</h3>
              <p className="text-text-secondary text-sm mb-section">
                Provide feedback on specific incidents that have been assigned to police officers.
              </p>
              
              {loading ? (
                <div className="space-y-default">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-secondary-dark rounded-card animate-pulse" />
                  ))}
                </div>
              ) : myCrimes.filter(crime => crime.workflow?.assignedToOfficer).length > 0 ? (
                <div className="space-y-default max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {myCrimes
                    .filter(crime => crime.workflow?.assignedToOfficer)
                    .slice(0, 5)
                    .map((crime) => (
                      <div
                        key={crime._id}
                        className="p-default bg-secondary-dark rounded-lg border border-border-subtle hover:border-accent-gold/30 transition-all cursor-pointer group"
                        onClick={() => setFeedbackCrime(crime)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-text-primary font-semibold text-sm group-hover:text-accent-gold transition-colors line-clamp-1">
                            {crime.title}
                          </h4>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-accent-gold/10 text-accent-gold font-medium">
                            {crime.status}
                          </span>
                        </div>
                        <p className="text-text-secondary text-xs line-clamp-1 mb-2">
                          {crime.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-text-secondary text-xs flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-success" />
                            Officer: {crime.workflow.assignedToOfficer.username}
                          </p>
                          <ChevronRight className="h-4 w-4 text-text-secondary group-hover:text-accent-gold transition-colors" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-text-secondary/20 mx-auto mb-default" />
                  <p className="text-text-secondary text-sm font-medium">No assigned cases yet</p>
                  <p className="text-text-secondary text-xs mt-1">Feedback available once officer is assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
