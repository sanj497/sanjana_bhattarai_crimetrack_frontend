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
  Eye,
  ExternalLink,
  Siren,
  Filter,
  Zap
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50" />
      <div className="relative">
        <div className="h-24 w-24 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-[0_0_50px_rgba(59,130,246,0.2)]" />
        <Siren size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="ct-tactical-label text-blue-400">Police Intelligence Bureau</span>
        <span className="text-white text-xs font-black uppercase tracking-[8px] animate-pulse">Syncing Operational Grid...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-6 lg:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* ── AMBIENT FX ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] -ml-48 -mb-48" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] rotate-3">
                <Shield size={24} />
              </div>
              <div>
                <span className="ct-tactical-label text-blue-500 block mb-1">Command Control v4.0</span>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[3px] flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> System Link Restricted
                </span>
              </div>
            </div>
            <h1 className="ct-tactical-title text-7xl lg:text-9xl text-white">POLICE <br/> <span className="text-blue-600 underline decoration-blue-500/10 decoration-[12px] underline-offset-[-5px]">INTERFACE</span></h1>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-6 w-full xl:w-auto">
             <div className="ct-glass p-2 rounded-[32px] flex items-center gap-4 w-full md:w-[450px]">
                <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                   <Search size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="SEARCH INTEL BY TITLE OR ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent w-full text-white font-black uppercase tracking-[3px] text-xs outline-none placeholder:text-slate-600 truncate"
                />
             </div>
             
             <button onClick={fetchCrimes} className="ct-glass px-10 py-5 rounded-[32px] text-white ct-tactical-label flex items-center justify-center gap-4 hover:bg-white hover:text-slate-950 transition-all active:scale-95 group">
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                Force Sync
             </button>
          </div>
        </div>

        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Total Intel Flow", val: totalItems, icon: <ClipboardList />, color: "blue" },
            { label: "Pending Deployment", val: crimes.filter(c => c.status === "ForwardedToPolice").length, icon: <Siren />, color: "rose" },
            { label: "In Investigation", val: crimes.filter(c => c.status === "UnderInvestigation").length, icon: <Activity />, color: "amber" },
            { label: "Confirmed Closed", val: crimes.filter(c => c.status === "Resolved").length, icon: <CheckCircle2 />, color: "emerald" },
          ].map((stat, i) => (
            <div key={i} className="ct-card p-10 group overflow-hidden">
               <div className={`absolute top-0 right-0 h-40 w-40 bg-${stat.color}-600/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-all duration-700`} />
               <div className={`h-16 w-16 bg-${stat.color}-600/10 rounded-[24px] flex items-center justify-center text-${stat.color}-500 mb-10 group-hover:scale-110 transition-transform shadow-inner`}>
                  {stat.icon}
               </div>
               <div className="ct-tactical-label text-slate-500 mb-3">{stat.label}</div>
               <div className="text-7xl font-black text-white tracking-tighter leading-none italic">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER PROTOCOLS ── */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-6 no-scrollbar">
          <div className="ct-glass p-2 rounded-[28px] flex items-center gap-2">
            {["All", "ForwardedToPolice", "UnderInvestigation", "Resolved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setCurrentPage(1); }}
                className={`px-10 py-4 rounded-[20px] transition-all whitespace-nowrap ct-tactical-label ${
                  filter === s 
                    ? 'bg-blue-600 text-white shadow-2xl scale-105 ct-glow-blue' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {s === "ForwardedToPolice" ? "DEPLOYMENT REQ" : s.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-20">
          {error ? (
            <div className="col-span-full ct-glass p-32 rounded-[64px] text-center">
               <AlertCircle size={80} className="text-rose-600 mx-auto mb-10 animate-bounce" />
               <h2 className="ct-tactical-title text-5xl text-white mb-6">Protocol Breach</h2>
               <p className="text-slate-400 ct-tactical-label">{error}</p>
            </div>
          ) : crimes.length === 0 ? (
            <div className="col-span-full ct-glass p-40 rounded-[80px] text-center">
               <Shield className="text-slate-800 mx-auto mb-10 h-32 w-32 opacity-20" />
               <h2 className="ct-tactical-title text-4xl text-slate-600 mb-4">Vault Silent</h2>
               <p className="text-slate-700 ct-tactical-label">No matching intelligence vectors located in current sector.</p>
            </div>
          ) : (
            crimes.map((crime) => (
              <div key={crime._id} className="ct-card p-12 lg:p-14 group hover:scale-[1.01] duration-500">
                {/* Status Indicator */}
                <div className={`absolute top-12 right-12 px-8 py-3 rounded-2xl ${statusConfig[crime.status]?.bg} ${statusConfig[crime.status]?.border} ${statusConfig[crime.status]?.color} ct-tactical-label flex items-center gap-3 shadow-lg backdrop-blur-md italic`}>
                  <div className="relative flex h-2 w-2">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                    <div className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </div>
                  {crime.status === "ForwardedToPolice" ? "NEW DEPLOYMENT" : crime.status.replace(/([A-Z])/g, ' $1').trim()}
                </div>

                <div className="flex items-start gap-10 mb-12">
                  <div className="h-24 w-24 bg-slate-950 rounded-[32px] flex items-center justify-center text-blue-600 shrink-0 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <Shield size={40} />
                  </div>
                  <div className="flex-1 pr-24">
                    <div className="ct-tactical-label text-blue-500 mb-3">CASE_{crime._id.slice(-8).toUpperCase()} // {crime.crimeType}</div>
                    <h3 className="ct-tactical-title text-4xl lg:text-5xl text-white group-hover:text-blue-500 transition-colors line-clamp-2 leading-[0.9]">
                      {crime.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-10 rounded-[48px] border border-white/5 mb-12 shadow-inner">
                  <p className="text-slate-400 text-xl font-bold italic leading-relaxed">
                    "{crime.description}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12 border-b border-white/5 pb-12">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="ct-tactical-label text-slate-500 mb-1">Sector Grid</div>
                      <div className="text-white font-black text-sm uppercase tracking-tight truncate max-w-[200px] italic">{crime.location?.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="ct-tactical-label text-slate-500 mb-1">Inbound Sync</div>
                      <div className="text-white font-black text-sm uppercase tracking-tight italic">{new Date(crime.createdAt).toLocaleDateString()} // {new Date(crime.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5">
                  <button
                    onClick={() => toggleDetails(crime._id)}
                    className="flex-1 bg-white text-slate-950 px-10 py-6 rounded-[28px] ct-tactical-label hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 group/exp shadow-2xl"
                  >
                    {expandedCrimeIds.has(crime._id) ? "Close Dossier" : "Extract Artifacts"}
                    {expandedCrimeIds.has(crime._id) ? <XCircle size={18}/> : <Zap size={18} className="group-hover/exp:scale-125 transition-transform"/>}
                  </button>

                  {crime.status === "ForwardedToPolice" && (
                    <button 
                      onClick={() => updateStatus(crime._id, "UnderInvestigation")}
                      disabled={updatingId === crime._id}
                      className="flex-1 bg-blue-600 text-white px-10 py-6 rounded-[28px] ct-tactical-label hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-4 group/init"
                    >
                      {updatingId === crime._id ? "ENCRYPTING..." : "Initialize Op" }
                      <Activity size={20} className="animate-pulse" />
                    </button>
                  )}

                  {crime.status === "UnderInvestigation" && (
                    <>
                      <button 
                        onClick={() => updateStatus(crime._id, "Resolved")}
                        disabled={updatingId === crime._id}
                        className="flex-[1.5] bg-emerald-600 text-white px-10 py-6 rounded-[28px] ct-tactical-label hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-4"
                      >
                        Finalize Resolution <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => updateStatus(crime._id, "Rejected")}
                        disabled={updatingId === crime._id}
                        className="px-10 py-6 rounded-[28px] ct-tactical-label bg-rose-600/10 border-2 border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        Nullify
                      </button>
                    </>
                  )}
                </div>
                
                {expandedCrimeIds.has(crime._id) && (
                  <div className="mt-12 p-12 rounded-[56px] bg-slate-950 border border-white/5 space-y-12 shadow-inner animate-in slide-in-from-top-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-2">
                        <span className="ct-tactical-label text-slate-600">Registry ID</span>
                        <div className="text-blue-500 font-mono text-sm font-bold">{crime._id}</div>
                      </div>
                      <div className="space-y-2">
                        <span className="ct-tactical-label text-slate-600">Protocol Marker</span>
                        <div className="text-white text-sm font-black italic">UNIT_ALPHA_DISPATCH</div>
                      </div>
                      <div className="space-y-2">
                        <span className="ct-tactical-label text-slate-600">Sector Priority</span>
                        <div className={`text-sm font-black italic ${crime.priority === 'Critical' ? 'text-rose-600' : crime.priority === 'High' ? 'text-amber-600' : 'text-blue-600'}`}>
                          {crime.priority || 'STANDARD'} PROTOCOL
                        </div>
                      </div>
                    </div>
                    
                    {/* Tactical Map Location */}
                    {crime.location?.lat && crime.location?.lng && (
                      <div className="pt-12 border-t border-white/5">
                        <h4 className="ct-tactical-label text-slate-500 mb-8 flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-rose-600 animate-ping" /> Target Ground Zero Access
                        </h4>
                        <div className="rounded-[48px] overflow-hidden border-4 border-slate-900 h-96 relative group shadow-2xl">
                          <iframe
                            title="Tactical Location"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                            loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(crime.location.lng) - 0.005}%2C${Number(crime.location.lat) - 0.005}%2C${Number(crime.location.lng) + 0.005}%2C${Number(crime.location.lat) + 0.005}&layer=mapnik&marker=${Number(crime.location.lat)}%2C${Number(crime.location.lng)}`}
                          />
                          <div className="absolute bottom-8 right-8 ct-glass px-8 py-4 rounded-[24px] ct-tactical-label text-blue-400">
                            COORD: {Number(crime.location.lat).toFixed(6)} • {Number(crime.location.lng).toFixed(6)}
                          </div>
                        </div>
                      </div>
                    )}

                    {crime.evidence && crime.evidence.length > 0 && (
                      <div className="pt-12 border-t border-white/5">
                        <h4 className="ct-tactical-label text-slate-500 mb-8 flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-blue-600" /> Intelligence Artifact Repository ({crime.evidence.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {crime.evidence.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="aspect-[4/3] bg-slate-900 rounded-[32px] overflow-hidden border-2 border-white/5 block relative group/ev shadow-xl hover:scale-105 transition-all"
                            >
                              {file.resourceType === "video" ? (
                                <video src={file.url} className="w-full h-full object-cover opacity-60 group-hover/ev:opacity-100 transition-all" />
                              ) : (
                                <img src={file.url} className="w-full h-full object-cover opacity-60 group-hover/ev:opacity-100 transition-all group-hover/ev:scale-110" alt="Evidence" />
                              )}
                              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/ev:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                                <ExternalLink size={24} className="text-white" />
                              </div>
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

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="ct-glass p-12 rounded-[64px] flex flex-col md:flex-row items-center justify-between gap-12 mb-32">
            <div className="text-left">
              <div className="ct-tactical-label text-slate-500 mb-2">Dossier Navigation</div>
              <div className="text-2xl font-black text-white italic tracking-tighter">
                PAGE {currentPage} <span className="text-slate-700">/</span> {totalPages} <span className="text-slate-800 mx-4">|</span> {totalItems} TOTAL RECORDS
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="h-20 w-20 flex items-center justify-center bg-slate-900 rounded-[28px] text-white hover:bg-blue-600 transition-all disabled:opacity-20 active:scale-90"
              >
                <ChevronLeft size={32} />
              </button>
              
              <div className="flex items-center gap-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i-1] !== p - 1 && <span className="text-slate-800 font-black">•••</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`h-20 w-20 rounded-[28px] ct-tactical-label transition-all flex items-center justify-center ${
                          currentPage === p 
                            ? 'bg-blue-600 text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-110 border-4 border-white/20' 
                            : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
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
                className="h-20 w-20 flex items-center justify-center bg-slate-900 rounded-[28px] text-white hover:bg-blue-600 transition-all disabled:opacity-20 active:scale-90"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Policereport;