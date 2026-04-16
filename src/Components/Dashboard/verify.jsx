import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  User, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldAlert,
  Bell,
  Send,
  ArrowLeft,
  Activity,
  Zap,
  Radio
} from "lucide-react";

// The base API URL from environment
const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

const Verify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState("verify");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyPolice, setNearbyPolice] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [fetchingPolice, setFetchingPolice] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [nearbyCitizens, setNearbyCitizens] = useState([]);
  const [fetchingCitizens, setFetchingCitizens] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [safeMessage, setSafeMessage] = useState("");

  // Fetch the specific report details
  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/detail/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response received:", text.slice(0, 100));
          throw new Error("Endpoint returned incompatible response.");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error fetching report intelligence");
        }

        setReport(data.crime);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, navigate]);

  // Fetch nearby police officers
  useEffect(() => {
    const fetchNearbyPolice = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id || !report) return;

      setFetchingPolice(true);
      try {
        const response = await fetch(`${API_BASE}/${id}/nearby-police`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setNearbyPolice(data.policeOfficers);
        }
      } catch (err) {
        console.error("Error fetching nearby police:", err);
      } finally {
        setFetchingPolice(false);
      }
    };

    if (report && report.status === "Verified") {
      fetchNearbyPolice();
    }
  }, [id, report]);

  // Fetch nearby citizens
  useEffect(() => {
    const fetchNearbyCitizens = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id || !report) return;

      setFetchingCitizens(true);
      try {
        const response = await fetch(`${API_BASE}/${id}/nearby-citizens?radius=10000`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setNearbyCitizens(data.citizens || []);
        }
      } catch (err) {
        console.error("Error fetching nearby citizens:", err);
      } finally {
        setFetchingCitizens(false);
      }
    };

    if (report && report.status === "Verified") {
      fetchNearbyCitizens();
    }
  }, [id, report]);

  const handleForwardToPolice = async () => {
    if (!selectedOfficer) {
      alert("Please select a police officer to forward the case.");
      return;
    }

    setIsForwarding(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${id}/forward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedOfficerId: selectedOfficer._id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Forwarding failed");
      }

      alert(`Case successfully forwarded to ${selectedOfficer.name || selectedOfficer.username}`);
      navigate("/admin");
    } catch (err) {
      console.error("Forward error:", err);
      alert(`Forwarding Error: ${err.message}`);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleBroadcastSafeAlert = async () => {
    if (!nearbyCitizens.length) {
      alert("No citizens identified in this zone to alert.");
      return;
    }

    setIsBroadcasting(true);
    const token = localStorage.getItem("token");

    try {
      const citizenIds = nearbyCitizens.map(c => c._id);
      const response = await fetch(`${API_BASE}/${id}/broadcast-safe-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          citizenIds,
          customMessage: safeMessage || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Broadcast failed");
      }

      alert(`✅ Safety alert successfully dispatched to ${data.notifiedCount} citizens.`);
      setSafeMessage("");
    } catch (err) {
      console.error("Broadcast alert error:", err);
      alert(`Alert failure: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleBroadcastAlert = async () => {
    if (!window.confirm("CRITICAL ACTION: Broadcast community-wide alert?")) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${id}/broadcast-community-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Broadcast failed");
      }

      alert(`✅ Community Alert successful! Notified ${data.notifiedCount} citizens.`);
    } catch (err) {
      console.error("Broadcast error:", err);
      alert(`Broadcast Failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/${id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: action,
          adminNotes: adminNotes,
          verificationNotes: adminNotes
        }),
      });

      const data = await response.json();

      if (action === "verify") {
        setReport({ ...report, status: "Verified" });
        alert("Intelligence Verified. You can now forward to police.");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert(`Decision Rejection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
      Verified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
      Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20",
      ForwardedToPolice: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20"
    };
    return configs[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#020617] text-slate-500 gap-6">
        <div className="h-16 w-16 border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin shadow-xl" />
        <p className="text-[10px] font-black uppercase tracking-[5px] animate-pulse">Synchronizing Record Cache...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#020617] p-8">
        <div className="bg-rose-500/5 border border-rose-500/20 p-16 rounded-[48px] text-center max-w-lg shadow-2xl">
           <ShieldAlert size={64} className="text-rose-500 mx-auto mb-8" />
           <h3 className="text-slate-900 dark:text-white text-3xl font-black mb-4 uppercase tracking-tighter italic">Record Inaccessible</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest opacity-80">{error || "Intelligence file could not be located or clearance level insufficient."}</p>
           <button onClick={() => navigate("/admin")} className="px-10 py-5 bg-slate-950 dark:bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[4px] hover:bg-blue-600 transition-all shadow-xl active:scale-95">
             Return to Command Console
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] font-sans pb-32 transition-colors duration-300">
      
      {/* Header Area */}
      <div className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/50 px-8 lg:px-12 py-10 lg:py-16 mb-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 h-64 w-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
         
         <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] mb-12 uppercase tracking-[4px] hover:shadow-xl transition-all active:scale-95 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Operation Console
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
               <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                     <span className="text-[10px] font-black uppercase tracking-[4px] bg-blue-500/10 text-blue-600 dark:text-blue-500 px-5 py-2 rounded-full border border-blue-500/20 italic">Case Review Protocol</span>
                     <ChevronRight size={16} className="text-slate-300" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] font-mono italic">NODE_{report._id.slice(-12).toUpperCase()}</span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic">
                    {report.title || "Unclassified Intelligence"}
                  </h1>
               </div>

               <div className="flex flex-wrap items-center gap-4 shrink-0">
                  {report.notificationsSent?.community && (
                     <div className="px-6 py-3 rounded-[24px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-500 text-[10px] font-black uppercase tracking-[3px] flex items-center gap-3 italic">
                        <Radio size={16} className="animate-pulse" />
                        Community Neutralized
                     </div>
                  )}
                  <div className={`px-8 py-3 rounded-[24px] border text-[10px] font-black uppercase tracking-[3px] italic shadow-sm backdrop-blur-md ${getStatusBadge(report.status)}`}>
                     Grid Status: {report.status}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
         
         {/* INTEL PANEL */}
         <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-5 duration-700">
            <div className="bg-white dark:bg-slate-900/40 rounded-[64px] border border-slate-100 dark:border-slate-800/50 p-12 lg:p-16 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-16 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity pointer-events-none">
                  <FileText size={200} />
               </div>
               
               <div className="flex items-center gap-6 mb-16 relative z-10">
                  <div className="h-20 w-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 rotate-12 group-hover:rotate-0 transition-all duration-500">
                     <ShieldCheck size={40} />
                  </div>
                  <div>
                     <h3 className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter uppercase italic">Case Narrative</h3>
                     <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[5px] mt-2 italic underline decoration-blue-500/20 underline-offset-4">Incident Log & Intelligence Artifacts</p>
                  </div>
               </div>

               <div className="space-y-16 relative z-10">
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] block ml-4 italic">Intelligence Stream</label>
                     <div className="bg-slate-50 dark:bg-slate-950/60 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-lg font-bold leading-relaxed italic border-l-[12px] border-l-blue-600 shadow-inner">
                        "{report.description || "No descriptive intelligence synchronized for this node."}"
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] block mb-4 italic">Category Identifier</label>
                        <div className="flex items-center gap-4 text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight italic">
                           <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                             <Zap size={20} />
                           </div>
                           {report.crimeType || "Unidentified"}
                        </div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] block mb-4 italic">Timestamp Node</label>
                        <div className="flex items-center gap-4 text-slate-900 dark:text-white font-black text-lg uppercase tracking-tight italic">
                           <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600">
                             <Clock size={20} />
                           </div>
                           <div className="flex flex-col">
                             <span className="leading-none">{new Date(report.createdAt).toLocaleDateString()}</span>
                             <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] block ml-4 italic">Geospatial Intelligence</label>
                     <div className="rounded-[48px] border-4 border-white dark:border-slate-900 overflow-hidden h-80 w-full shadow-2xl relative group/map transition-transform hover:scale-[1.01] duration-700">
                       <div className="absolute inset-0 bg-blue-600/5 group-hover/map:bg-transparent transition-colors z-10 pointer-events-none" />
                       {report.location?.lat && report.location?.lng ? (
                         <iframe
                           width="100%"
                           height="100%"
                           frameBorder="0"
                           style={{ border: 0, filter: document.documentElement.classList.contains('dark') ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none' }}
                           src={`https://maps.google.com/maps?q=${report.location.lat},${report.location.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`}
                           allowFullScreen
                         ></iframe>
                       ) : (
                         <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 gap-6">
                           <MapPin size={64} className="opacity-20 animate-bounce" />
                           <span className="text-[11px] font-black uppercase tracking-[6px] opacity-40 italic">Vector Synchronization Error</span>
                         </div>
                       )}
                     </div>

                     <div className="flex items-center gap-6 p-8 bg-slate-950 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-blue-900/20 group">
                        <div className="h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                           <MapPin size={32} />
                        </div>
                        <div className="text-left">
                           <div className="text-white text-xl font-black tracking-tight leading-none italic mb-2 uppercase">{report.location?.address || "Coordinate Data Only"}</div>
                           <div className="text-blue-500/60 text-[10px] font-black uppercase tracking-[4px] italic">LNG: {report.location?.lng?.toFixed(6) || "—"} / LAT: {report.location?.lat?.toFixed(6) || "—"}</div>
                        </div>
                     </div>
                  </div>

                  {report.evidence?.length > 0 && (
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] block ml-4 italic">Evidence Repository</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {report.evidence.map((img, idx) => (
                              <div key={idx} className="relative group/img overflow-hidden rounded-[40px] border-4 border-white dark:border-slate-800 shadow-xl transition-all hover:scale-[1.05] hover:shadow-2xl duration-500">
                                 <div className="absolute inset-0 bg-blue-600/0 group-hover/img:bg-blue-600/10 transition-colors z-10 pointer-events-none" />
                                 <img 
                                   src={img.url} 
                                   alt="Evidence" 
                                   className="w-full h-64 object-cover grayscale group-hover/img:grayscale-0 transition-all duration-700" 
                                 />
                                 <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <div className="px-5 py-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[3px] rounded-xl border border-white/10">Artifact_{idx + 1}</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* ACTION PANEL */}
         <div className="lg:col-span-5 space-y-10 animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="sticky top-12 space-y-10">
               <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/60 rounded-[64px] border border-slate-100 dark:border-slate-800 p-12 lg:p-14 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[12px] bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
                  
                  <div className="flex items-center gap-5 mb-12">
                     <div className="h-16 w-16 bg-slate-950 dark:bg-slate-800 rounded-[28px] flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <Activity size={32} />
                     </div>
                     <h3 className="text-slate-900 dark:text-white text-2xl font-black tracking-tighter uppercase italic leading-none">Command Decision</h3>
                  </div>

                  <div className="space-y-12">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] block ml-4 italic">Verification Protocol</label>
                        <div className="grid grid-cols-2 gap-5">
                           <button 
                              type="button" 
                              onClick={() => setAction("verify")}
                              className={`py-8 rounded-[32px] border-4 transition-all flex flex-col items-center justify-center gap-4 group/btn ${action === "verify" ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 shadow-2xl shadow-emerald-500/20' : 'border-slate-50 dark:border-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800 text-slate-400 dark:text-slate-700'}`}
                           >
                              <CheckCircle2 size={32} className={action === "verify" ? "animate-pulse" : ""} />
                              <span className="text-[10px] font-black uppercase tracking-[4px] italic">Bind Intel</span>
                           </button>
                           <button 
                              type="button" 
                              onClick={() => setAction("reject")}
                              className={`py-8 rounded-[32px] border-4 transition-all flex flex-col items-center justify-center gap-4 group/btn ${action === "reject" ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 shadow-2xl shadow-rose-500/20' : 'border-slate-50 dark:border-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800 text-slate-400 dark:text-slate-700'}`}
                           >
                              <XCircle size={32} className={action === "reject" ? "animate-pulse" : ""} />
                              <span className="text-[10px] font-black uppercase tracking-[4px] italic">Void Node</span>
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] block ml-4 italic">Justification Log</label>
                        <div className="relative group/area">
                           <textarea 
                              className="w-full bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-50 dark:border-slate-800 rounded-[40px] p-10 text-base font-black uppercase tracking-tight outline-none focus:border-blue-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[220px] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-800 italic"
                              placeholder="Describe the operational reasoning..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              required
                           />
                           <div className="absolute top-8 right-8 text-blue-500 opacity-20 group-hover/area:opacity-100 transition-opacity">
                              <MessageSquare size={24} />
                           </div>
                        </div>
                     </div>

                     <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[6px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 italic italic group/submit ${action === "verify" ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/40' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/40'} disabled:opacity-30`}
                      >
                        {loading ? 'Executing Transaction...' : (action === "verify" ? 'Authenticate Intelligence' : 'Neutralize Record')}
                        <Zap size={18} className="group-hover/submit:scale-125 transition-transform" />
                     </button>
                  </div>
               </form>

               {/* DISPATCH MODULE */}
                {report.status === "Verified" && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-700">
                    <button 
                      onClick={handleBroadcastAlert}
                      disabled={loading}
                      className="w-full py-8 bg-rose-600 text-white rounded-[40px] text-[11px] font-black uppercase tracking-[6px] shadow-2xl shadow-rose-600/40 hover:bg-white hover:text-rose-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 italic"
                    >
                      <Bell size={24} className="animate-bounce" />
                      Global Community Alert
                    </button>

                    <div className="bg-slate-950 dark:bg-blue-600 rounded-[56px] p-12 lg:p-14 shadow-2xl shadow-blue-900/40 space-y-10 relative overflow-hidden group/fwd text-white">
                      <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover/fwd:bg-white/10 transition-all" />
                      
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="h-20 w-20 bg-white/10 dark:bg-white/20 rounded-[32px] flex items-center justify-center text-white border border-white/20 animate-pulse">
                           <ShieldAlert size={40} />
                        </div>
                        <div className="text-left">
                           <h3 className="text-2xl font-black tracking-tighter uppercase leading-none italic mb-2">Field Dispatch</h3>
                           <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[4px] italic">Deployment Synchronization</p>
                        </div>
                      </div>
                      
                      <div className="p-8 bg-white/5 dark:bg-white/10 rounded-[40px] border border-white/10 backdrop-blur-md relative z-10">
                         <p className="text-blue-50 text-sm font-bold leading-relaxed uppercase tracking-tight italic text-left">
                           Select intercept unit within <span className="underline decoration-white/30 decoration-4 underline-offset-8">target sector</span> to initialize tactical assignment.
                         </p>
                      </div>

                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between px-4">
                           <label className="text-[10px] font-black text-blue-200 uppercase tracking-[5px] block italic">Available Units</label>
                           <Radio size={14} className="text-blue-200 animate-pulse" />
                        </div>
                        
                        <div className="max-h-[300px] overflow-y-auto pr-2 no-scrollbar custom-scrollbar space-y-4">
                          {fetchingPolice ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-6">
                               <div className="h-12 w-12 border-4 border-blue-200/20 border-t-white rounded-full animate-spin shadow-xl" />
                               <span className="text-[10px] font-black text-blue-100 uppercase tracking-[6px] italic animate-pulse">Scanning Grid...</span>
                            </div>
                          ) : nearbyPolice.length > 0 ? (
                            nearbyPolice.map(officer => (
                              <button
                                key={officer._id}
                                onClick={() => setSelectedOfficer(officer)}
                                className={`w-full p-8 rounded-[36px] flex items-center justify-between transition-all border-4 text-left group/unit ${selectedOfficer?._id === officer._id ? 'bg-white border-white scale-[1.05] shadow-2xl' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                              >
                                <div>
                                  <div className={`text-xl font-black uppercase tracking-tighter italic leading-none mb-3 ${selectedOfficer?._id === officer._id ? 'text-blue-700' : 'text-white'}`}>
                                    {officer.name || officer.username}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                     <div className={`text-[10px] font-black uppercase tracking-[3px] flex items-center gap-2 ${selectedOfficer?._id === officer._id ? 'text-blue-500' : 'text-blue-200/60'}`}>
                                       <MapPin size={12} /> Station: {officer.stationDistrict || "Unknown Sector"}
                                     </div>
                                     <div className={`text-[10px] font-black uppercase tracking-[3px] flex items-center gap-2 ${selectedOfficer?._id === officer._id ? 'text-blue-500' : 'text-blue-200/60'}`}>
                                       <Activity size={12} /> {officer.distanceText || "Analyzing Proxy..."}
                                     </div>
                                  </div>
                                </div>
                                {selectedOfficer?._id === officer._id ? (
                                   <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12">
                                      <ShieldCheck size={24} />
                                   </div>
                                ) : (
                                   <div className="h-10 w-10 border-2 border-white/10 rounded-2xl flex items-center justify-center text-white/20 group-hover/unit:border-white/40 group-hover/unit:text-white/40 transition-all">
                                      <User size={20} />
                                   </div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="p-10 bg-white/5 rounded-[40px] border-4 border-dashed border-white/10 text-[11px] font-black text-white/30 text-center uppercase tracking-[5px] italic">
                              Zero Response Units Identified
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={handleForwardToPolice}
                        disabled={!selectedOfficer || isForwarding}
                        className="w-full py-7 bg-white text-slate-900 rounded-[36px] text-[11px] font-black uppercase tracking-[6px] shadow-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 italic relative z-10 group/fwdbtn"
                      >
                        {isForwarding ? "Encrypting Signal..." : "Deploy Intercept Assignment"}
                        <Send size={18} className="group-hover/fwdbtn:translate-x-2 group-hover/fwdbtn:-translate-y-2 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TARGETED SECTOR ALERT */}
                {report.status === "Verified" && (
                   <div className="bg-white dark:bg-slate-900/60 rounded-[64px] border border-slate-100 dark:border-slate-800 p-12 lg:p-14 space-y-8 relative overflow-hidden group/geo shadow-sm hover:shadow-2xl transition-all duration-700">
                      <div className="absolute bottom-0 right-0 h-48 w-48 bg-rose-500/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover/geo:bg-rose-500/10 transition-all" />
                      
                      <div className="flex items-center gap-6 relative z-10">
                         <div className="h-16 w-16 bg-rose-500/10 rounded-[24px] flex items-center justify-center text-rose-600 dark:text-rose-500 shadow-inner group-hover/geo:scale-110 transition-transform">
                           <MapPin size={32} className="animate-pulse" />
                         </div>
                         <div className="text-left">
                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-none italic mb-1 text-slate-900 dark:text-white">Geo-Fence Alert</h3>
                            <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[4px] italic">Targeted Radius Broadcast</p>
                         </div>
                      </div>

                      <div className="p-8 bg-slate-50 dark:bg-slate-950/60 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-inner">
                         <p className="text-slate-500 dark:text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-tight italic text-left">
                            Issue high-priority directives to nodes within <span className="text-rose-500">10,000 meters</span>. System will initialize email and dashboard overlays.
                         </p>
                      </div>

                      <div className="space-y-6 relative z-10">
                         <div className="bg-slate-50 dark:bg-slate-950/60 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] italic">Radius Scan</span>
                            <div className="px-5 py-2 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-[3px] italic border border-blue-500/10">
                               {fetchingCitizens ? "Scanning..." : `${nearbyCitizens.length} Nodes Active`}
                            </div>
                         </div>

                         <div className="relative group/box">
                            <textarea 
                               className="w-full bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-8 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white outline-none focus:border-rose-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[160px] placeholder:text-slate-300 dark:placeholder:text-slate-800 resize-none italic"
                               placeholder="Directive content (Blank for system default)..."
                               value={safeMessage}
                               onChange={(e) => setSafeMessage(e.target.value)}
                            />
                            <div className="absolute top-6 right-6 text-rose-500/20 group-hover/box:text-rose-500 transition-colors">
                               <Info size={20} />
                            </div>
                         </div>

                         <button 
                            onClick={handleBroadcastSafeAlert}
                            disabled={isBroadcasting || fetchingCitizens || nearbyCitizens.length === 0}
                            className="w-full py-6 bg-rose-600/10 dark:bg-rose-500/5 border-2 border-rose-500/30 text-rose-600 dark:text-rose-500 rounded-[32px] text-[11px] font-black uppercase tracking-[5px] hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 shadow-xl hover:shadow-rose-600/30 italic"
                         >
                            {isBroadcasting ? "Transmitting..." : "Initialize Proximity Alert"}
                            <Send size={18} />
                         </button>
                      </div>
                   </div>
                )}
            </div>
         </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Verify;