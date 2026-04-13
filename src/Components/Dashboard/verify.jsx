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
  ShieldAlert
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
          throw new Error("The intelligence endpoint returned an incompatible response (404/HTML). Please ensure the backend is synchronized.");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error fetching report intelligence");
        }

        setReport(data.crime);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message); // Explicitly state the error in UI
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, navigate]);

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
          verificationNotes: adminNotes // Adding for backend compatibility
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Administrative action failed");
      }

      navigate("/admin");
    } catch (err) {
      console.error("Verify error:", err);
      alert(`Decision Rejection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      Rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      ForwardedToPolice: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };
    return colors[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-slate-500 gap-4">
        <div className="h-10 w-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[4px]">Accessing Record Cache...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] p-8">
        <div className="bg-rose-500/10 border border-rose-500/20 p-12 rounded-[40px] text-center max-w-md">
           <ShieldAlert size={48} className="text-rose-500 mx-auto mb-6" />
           <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tighter">Record Inaccessible</h3>
           <p className="text-slate-400 text-sm mb-8">{error || "The requested intelligence file could not be located or you lack necessary clearance."}</p>
           <button onClick={() => navigate("/admin")} className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
             Return to Console
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] font-sans pb-20">
      
      {/* Header Overlay */}
      <div className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-2xl px-12 py-10 mb-12">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
               <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <span className="text-[10px] font-black uppercase tracking-[3px] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Case Review Protocol</span>
                  <ChevronRight size={14} className="text-slate-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">{report._id.slice(-8)}</span>
               </div>
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{report.title || "Unclassified Intelligence"}</h1>
            </div>

            <div className={`px-6 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[2px] ${getStatusBadge(report.status)}`}>
               System Status: {report.status}
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         {/* INTEL PANEL */}
         <div className="lg:col-span-7 space-y-8">
            <div className="bg-slate-900/40 rounded-[48px] border border-slate-800/50 p-12 shadow-2xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  <FileText size={160} />
               </div>
               
               <div className="flex items-center gap-3 mb-10">
                  <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h3 className="text-white text-lg font-black tracking-tight uppercase">Crime Intelligence Narrative</h3>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Incident breakdown & Evidence Profile</p>
                  </div>
               </div>

               <div className="space-y-10">
                  <div>
                     <label className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] block mb-3">Incident Description</label>
                     <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/30 text-slate-300 text-sm font-medium leading-relaxed italic border-l-4 border-l-blue-600">
                        "{report.description || "No descriptive intelligence provided for this case."}"
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] block mb-2">Category Tag</label>
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                           <AlertTriangle size={14} className="text-blue-500" />
                           {report.crimeType || "Unidentified"}
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] block mb-2">Timestamp</label>
                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                           <Clock size={14} className="text-slate-400" />
                           {new Date(report.createdAt).toLocaleDateString()} @ {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] block mb-3">Field Deployment Location</label>
                     <div className="flex items-start gap-3 p-5 bg-slate-950/30 rounded-3xl border border-slate-800/30">
                        <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                           <div className="text-white text-sm font-black tracking-tight mb-1">{report.location?.address || "Coordinate Vectors Only"}</div>
                           <div className="text-slate-500 text-[9px] font-bold">Lat: {report.location?.coordinates?.[1] || "—"} / Lon: {report.location?.coordinates?.[0] || "—"}</div>
                        </div>
                     </div>
                  </div>

                  {report.evidence?.length > 0 && (
                     <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[2px] block mb-4">Visual Evidence Artifacts</label>
                        <div className="grid grid-cols-2 gap-4">
                           {report.evidence.map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img.url} 
                                alt="Evidence" 
                                className="w-full h-40 object-cover rounded-3xl border border-slate-800/50 hover:scale-[1.02] transition-transform cursor-crosshair shadow-lg" 
                              />
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* ACTION PANEL */}
         <div className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
               <form onSubmit={handleSubmit} className="bg-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                  
                  <div className="flex items-center gap-3 mb-10">
                     <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <ShieldCheck size={20} />
                     </div>
                     <h3 className="text-slate-900 text-lg font-black tracking-tighter uppercase">Administrative Decision</h3>
                  </div>

                  <div className="space-y-8">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block mb-3">Assign Status Decision</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              type="button" 
                              onClick={() => setAction("verify")}
                              className={`py-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${action === "verify" ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-500/10' : 'border-slate-50 hover:border-slate-100 text-slate-400'}`}
                           >
                              <CheckCircle2 size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Verify Intelligence</span>
                           </button>
                           <button 
                              type="button" 
                              onClick={() => setAction("reject")}
                              className={`py-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${action === "reject" ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xl shadow-rose-500/10' : 'border-slate-50 hover:border-slate-100 text-slate-400'}`}
                           >
                              <XCircle size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Reject as Invalid</span>
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] block mb-3">Justification Notes</label>
                        <div className="relative">
                           <MessageSquare className="absolute top-4 left-4 text-slate-300" size={18} />
                           <textarea 
                              className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] p-12 pl-12 text-sm font-semibold outline-none focus:border-blue-500/20 focus:bg-white transition-all min-h-[160px] text-slate-700 placeholder:text-slate-300"
                              placeholder="Describe the reasoning for this administrative action..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              required
                           />
                        </div>
                     </div>

                     <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-5 rounded-[32px] text-xs font-black uppercase tracking-[3px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${action === "verify" ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'} disabled:opacity-30`}
                      >
                        {loading ? 'Processing Transaction...' : (action === "verify" ? 'Confirm Intelligence Verification' : 'Finalize Incident Rejection')}
                        <ChevronRight size={16} />
                     </button>
                  </div>
               </form>

               <div className="bg-slate-900/40 rounded-[40px] border border-slate-800/50 p-8 space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                     <User size={16} className="text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Reporter Profile</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-black text-white">{report.isAnonymous ? "Anonymous Signal" : (report.userId?.username || "Verified Citizen")}</span>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-800 rounded-lg">{report.isAnonymous ? "Low Confidence" : "Verified Identity"}</span>
                  </div>
                  {!report.isAnonymous && <div className="text-[10px] text-slate-500 font-bold">{report.userId?.email}</div>}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Verify;