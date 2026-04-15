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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Submit Feedback</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold p-2">✕</button>
        </div>
        
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Incident Reference</p>
          <p className="font-bold text-slate-700">{crime.title}</p>
          <p className="text-xs text-slate-500 mt-1">
            Assigned Officer: {crime.workflow?.assignedToOfficer?.username || "Not assigned yet"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Rate the Investigation</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                <Star className={`h-8 w-8 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Your Comments</label>
          <textarea
             rows={4}
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             placeholder="How was your experience with this investigation?"
             className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const [user, setUser] = useState({});
  const [myCrimes, setMyCrimes] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch {
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

  const [feedbackCrime, setFeedbackCrime] = useState(null);

  return (
    <div className="p-6 md:p-10 font-sans min-h-full bg-[#f8fafc]">
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
                            {currentStep >= 3 && crime.workflow?.assignedToOfficer?._id && (
                               <button onClick={() => setFeedbackCrime(crime)} className="px-8 py-4 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 transition-all">
                                   <MessageSquare size={14} /> Provide Feedback
                               </button>
                            )}
                        </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

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
                       { label: "Live Tracking", icon: <Activity size={14} /> },
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
