import { useEffect, useState } from "react";
import React from "react";
import { 
  Shield, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Activity,
  CheckSquare,
  ClipboardList,
  RefreshCw,
  Eye
} from "lucide-react";

const Policereport = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedCrimeIds, setExpandedCrimeIds] = useState(new Set());
  
  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

  const fetchCrimes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please re-authenticate.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}?page=${currentPage}&limit=${itemsPerPage}&status=${filter}&search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Data bridge failure");
      
      setCrimes(Array.isArray(data.crimes) ? data.crimes : []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrimes();
  }, [currentPage, filter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchCrimes();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes: `Status updated by Field Office: ${status}` }),
      });

      if (!res.ok) throw new Error("Status transmission failed");

      setCrimes((prev) =>
        prev.map((crime) => (crime._id === id ? { ...crime, status } : crime))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status on secure ledger.");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleDetails = (crimeId) => {
    setExpandedCrimeIds((prev) => {
      const next = new Set(prev);
      if (next.has(crimeId)) {
        next.delete(crimeId);
      } else {
        next.add(crimeId);
      }
      return next;
    });
  };

  const statusConfig = {
    Pending: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <Clock size={12} /> },
    Verified: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <CheckCircle2 size={12} /> },
    Rejected: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: <XCircle size={12} /> },
    ForwardedToPolice: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: <Shield size={12} /> },
    UnderInvestigation: { color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: <Activity size={12} /> },
    Resolved: { color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: <CheckSquare size={12} /> }
  };

  if (loading && crimes.length === 0) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Accessing Field Intelligence...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-12 font-sans text-slate-300">
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Shield size={18} />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Police Intelligence Bureau</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Command Center</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-xl w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-3 text-xs font-bold outline-none text-white placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Active Intelligence", value: totalItems, icon: <ClipboardList />, color: "blue" },
          { label: "Pending Response", value: crimes.filter(c => c.status === "ForwardedToPolice").length, icon: <Shield />, color: "amber" },
        ].slice(0, 4).map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-[32px] group hover:border-blue-500/30 transition-all">
            <div className={`p-3 rounded-2xl w-fit mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {["All", "ForwardedToPolice", "UnderInvestigation", "Resolved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filter === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700'}`}
          >
            {s === "ForwardedToPolice" ? "New Assignments" : s}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        {error ? (
          <div className="col-span-full py-20 text-center bg-rose-500/5 border border-rose-500/10 rounded-[48px]">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-white font-black uppercase tracking-widest mb-2">Access Denied</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{error}</p>
          </div>
        ) : crimes.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/40 border border-slate-800/50 rounded-[48px]">
             <ClipboardList size={48} className="text-slate-700 mx-auto mb-4" />
             <h3 className="text-slate-500 font-black uppercase tracking-widest">No Intelligence Available</h3>
             <p className="text-slate-600 text-xs">Awaiting new case assignments for your district.</p>
          </div>
        ) : (
          crimes.map((crime) => (
            <div key={crime._id} className="bg-slate-900/40 border border-slate-800/50 rounded-[48px] p-10 hover:border-blue-500/20 transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl border-l border-b ${statusConfig[crime.status]?.bg} ${statusConfig[crime.status]?.border} ${statusConfig[crime.status]?.color} text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2`}>
                {statusConfig[crime.status]?.icon}
                {crime.status}
              </div>

              <div className="flex items-start gap-6 mb-8">
                <div className="h-14 w-14 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 border border-slate-800 shadow-xl group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div className="flex-1 pr-24">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-1">{crime.crimeType}</div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors line-clamp-1">{crime.title}</h3>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800/30 mb-8">
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">"{crime.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="flex items-center gap-3">
                   <MapPin size={16} className="text-slate-600" />
                   <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase">Incident Location</div>
                      <div className="text-xs font-bold text-white line-clamp-1">{crime.location?.address}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <Clock size={16} className="text-slate-600" />
                   <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase">Received At</div>
                      <div className="text-xs font-bold text-white">{new Date(crime.createdAt).toLocaleDateString()}</div>
                   </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/50">
                <button
                  onClick={() => toggleDetails(crime._id)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
                >
                  {expandedCrimeIds.has(crime._id) ? "Hide Details" : "View Details"}
                </button>

                {crime.status === "ForwardedToPolice" && (
                  <button 
                    onClick={() => updateStatus(crime._id, "UnderInvestigation")}
                    disabled={updatingId === crime._id}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
                  >
                    {updatingId === crime._id ? "Processing..." : "Accept & Investigate"}
                    <ChevronRight size={14} />
                  </button>
                )}

                {crime.status === "UnderInvestigation" && (
                   <>
                     <button 
                      onClick={() => updateStatus(crime._id, "Resolved")}
                      disabled={updatingId === crime._id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        Confirm Resolution <CheckCircle2 size={14} />
                     </button>
                     <button 
                      onClick={() => updateStatus(crime._id, "Rejected")}
                      disabled={updatingId === crime._id}
                      className="bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                     >
                        False Alarm
                     </button>
                   </>
                )}
              </div>
              
              {expandedCrimeIds.has(crime._id) && (
                <div className="mt-6 p-6 rounded-3xl bg-slate-950/60 border border-slate-800/40 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-400">
                      <div>Case ID: <span className="text-white font-mono">{crime._id}</span></div>
                      <div>Reported: <span className="text-white">{new Date(crime.createdAt).toLocaleString()}</span></div>
                      <div>Priority: <span className={crime.priority === 'High' ? 'text-red-500' : 'text-blue-500'}>{crime.priority || 'Medium'}</span></div>
                   </div>
                   
                   {/* Tactical Map Location */}
                    {crime.location?.lat && crime.location?.lng && (
                       <div className="pt-4 border-t border-slate-800/20">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Incident Ground Zero</div>
                          <div className="rounded-2xl overflow-hidden border border-slate-800 h-48 relative group shadow-inner bg-slate-900">
                             <iframe
                                title="Incident Location"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'contrast(1.2) brightness(0.8) saturate(1.4)' }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(crime.location.lng) - 0.005}%2C${Number(crime.location.lat) - 0.005}%2C${Number(crime.location.lng) + 0.005}%2C${Number(crime.location.lat) + 0.005}&layer=mapnik&marker=${Number(crime.location.lat)}%2C${Number(crime.location.lng)}`}
                             />
                             <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-slate-400 border border-slate-800">
                                {Number(crime.location.lat).toFixed(6)}, {Number(crime.location.lng).toFixed(6)}
                             </div>
                          </div>
                       </div>
                    )}

                    {crime.evidence && crime.evidence.length > 0 && (
                       <div className="pt-4 border-t border-slate-800/20">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Audited Evidence Artifacts ({crime.evidence.length})</div>
                          <div className="grid grid-cols-3 gap-3">
                            {crime.evidence.map((file, idx) => (
                              <a 
                                key={idx} 
                                href={file.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="h-24 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 block relative group/ev shadow-lg"
                              >
                                <img src={file.url} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-all group-hover/ev:scale-110" alt="Evidence" />
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/ev:opacity-100 pointer-events-none" />
                              </a>
                            ))}
                          </div>
                       </div>
                   )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-8 bg-slate-900/40 border border-slate-800/50 rounded-[40px] mt-8 gap-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-1">Pagination Control</span>
            <span className="text-xs font-bold text-white uppercase tracking-widest leading-none">
              Dossier {currentPage} <span className="text-slate-600 font-medium">of</span> {totalPages} <span className="text-slate-600 font-medium">—</span> {totalItems} Intelligence Files
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="px-2 text-slate-600">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`h-12 w-12 rounded-2xl text-xs font-black transition-all flex items-center justify-center ${
                        currentPage === p 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' 
                          : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policereport;