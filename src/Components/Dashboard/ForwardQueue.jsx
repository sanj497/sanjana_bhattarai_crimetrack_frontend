import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  User,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Search,
  RefreshCw,
  Zap,
  Activity,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function ForwardQueue() {
  const navigate = useNavigate();
  const [verifiedCrimes, setVerifiedCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [nearbyPolice, setNearbyPolice] = useState({});
  const [selectedOfficers, setSelectedOfficers] = useState({});
  const [forwardingId, setForwardingId] = useState(null);
  const [loadingPoliceFor, setLoadingPoliceFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  const fetchVerifiedReports = async (page = currentPage) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?status=Verified&page=${page}&limit=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.crimes) {
        setVerifiedCrimes(data.crimes);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      }
    } catch (err) {
      console.error("Fetch verified reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedReports(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchVerifiedReports(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handler = () => fetchVerifiedReports();
    window.addEventListener("new-notification-received", handler);
    return () => window.removeEventListener("new-notification-received", handler);
  }, []);

  const fetchNearbyPolice = async (crimeId) => {
    if (nearbyPolice[crimeId]) return; 
    setLoadingPoliceFor(crimeId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${crimeId}/nearby-police`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNearbyPolice((prev) => ({ ...prev, [crimeId]: data.policeOfficers }));
      }
    } catch (err) {
      console.error("Fetch nearby police error:", err);
    } finally {
      setLoadingPoliceFor(null);
    }
  };

  const handleExpand = (crimeId) => {
    if (expandedId === crimeId) {
      setExpandedId(null);
    } else {
      setExpandedId(crimeId);
      fetchNearbyPolice(crimeId);
    }
  };

  const handleForward = async (crimeId) => {
    const officerId = selectedOfficers[crimeId];
    if (!officerId) {
      alert("Please select a police officer to forward to.");
      return;
    }

    setForwardingId(crimeId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${crimeId}/forward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedOfficerId: officerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Forward failed");

      alert("✅ Case forwarded successfully!");
      setVerifiedCrimes((prev) => prev.filter((c) => c._id !== crimeId));
      setExpandedId(null);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setForwardingId(null);
    }
  };

  if (loading && verifiedCrimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white dark:bg-[#020617] transition-colors">
        <div className="h-16 w-16 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin mb-6 shadow-xl" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[5px] text-[10px] animate-pulse">
          Synchronizing verified records...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 bg-white dark:bg-[#020617] min-h-screen font-sans transition-colors duration-300">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16 px-4">
        <div>
           <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-4">
              <Zap size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[4px]">Verified Intelligence Pipeline</span>
           </div>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Dispatcher <span className="text-blue-600 dark:text-blue-500 underline decoration-blue-500/10 decoration-8 underline-offset-8">Forwarding</span> Queue</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-6 font-bold text-sm uppercase tracking-widest opacity-80">
             Authorize deployment for {verifiedCrimes.length} verified tactical nodes.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="FILTER COMMANDS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[28px] text-[11px] font-black uppercase tracking-widest focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none w-full sm:w-80 shadow-inner dark:text-white"
            />
          </div>
          <button
            onClick={() => fetchVerifiedReports()}
            className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] text-[10px] font-black uppercase tracking-[3px] text-slate-700 dark:text-slate-300 hover:shadow-xl transition-all italic active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Sync Grid
          </button>
        </div>
      </div>

      {/* Empty State */}
      {verifiedCrimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-10 animate-in fade-in duration-1000">
          <div className="h-32 w-32 rounded-[48px] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden group">
            <ShieldCheck size={64} className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors duration-700" />
          </div>
          <div className="text-center">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">
              Queue Baseline Normalized
            </h4>
            <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 dark:text-slate-600 opacity-70">
              No pending verified records detected in sector.
            </p>
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="grid grid-cols-1 gap-8 mb-16">
        {verifiedCrimes.map((crime) => {
          const isExpanded = expandedId === crime._id;
          const officers = nearbyPolice[crime._id] || [];
          const selectedId = selectedOfficers[crime._id];

          return (
            <div
              key={crime._id}
              className={`bg-white dark:bg-slate-900/40 rounded-[56px] border transition-all duration-500 overflow-hidden relative group ${
                isExpanded
                  ? "border-blue-500/50 dark:border-blue-500 shadow-2xl scale-[1.01]"
                  : "border-slate-100 dark:border-slate-800/80 hover:border-blue-500/30 shadow-sm"
              }`}
            >
              <div className="absolute top-0 right-0 h-48 w-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-blue-600/10 transition-colors" />

              {/* Case Summary Row */}
              <div
                className="flex flex-col lg:flex-row lg:items-center justify-between p-10 lg:p-12 cursor-pointer relative z-10"
                onClick={() => handleExpand(crime._id)}
              >
                <div className="flex items-center gap-8">
                  <div className={`h-16 w-16 rounded-[28px] flex items-center justify-center shrink-0 shadow-lg transition-transform duration-500 ${isExpanded ? 'bg-blue-600 text-white shadow-blue-500/30 rotate-0' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rotate-6 group-hover:rotate-0'}`}>
                    <ShieldCheck size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className={`text-2xl font-black tracking-tighter uppercase italic leading-none mb-3 transition-colors ${isExpanded ? 'text-blue-600 dark:text-blue-500' : 'text-slate-900 dark:text-white'}`}>
                      {crime.title || "Unknown Intelligence Vector"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[3px] italic">
                      <span className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-blue-500" />
                        {crime.crimeType}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} />
                        {crime.location?.address || "Coordinate Data Only"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(crime.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-8 lg:mt-0 ml-auto lg:ml-0">
                  <span className="px-6 py-2 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-[4px] rounded-xl border border-emerald-500/20 italic">
                    Verified Node
                  </span>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isExpanded ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700'}`}>
                    <ChevronRight
                      size={24}
                      className={`transition-transform duration-500 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded: Officer Selection */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent p-10 lg:p-14 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Case Details */}
                    <div className="xl:col-span-5 space-y-8">
                       <div className="flex items-center gap-3">
                          <Activity size={16} className="text-blue-500" />
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] italic">
                            Intel Payload
                          </h4>
                       </div>
                      <div className="bg-white dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner group/details">
                        <p className="text-base text-slate-700 dark:text-slate-300 font-bold leading-relaxed italic mb-8">
                          "{crime.description || "No descriptive payload synchronized."}"
                        </p>
                        {crime.evidence?.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            {crime.evidence.slice(0, 4).map((e, i) => (
                              <div key={i} className="relative group/evidence overflow-hidden rounded-[24px] border-2 border-slate-50 dark:border-slate-800">
                                <img
                                  src={e.url}
                                  alt="Evidence"
                                  className="h-24 w-full object-cover grayscale group-hover/evidence:grayscale-0 transition-all duration-500"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/admin/verify/${crime._id}`)}
                          className="w-full py-5 bg-slate-950 dark:bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-3 italic hover:bg-blue-600 transition-all shadow-xl"
                        >
                          <FileText size={16} /> Open Full Briefing
                        </button>
                      </div>
                    </div>

                    {/* Officer Assignment */}
                    <div className="xl:col-span-7 space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <User size={16} className="text-blue-500" />
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[5px] italic">
                              Interception Deployment Units
                            </h4>
                         </div>
                         {loadingPoliceFor !== crime._id && (
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">{officers.length} UNITS IDENTIFIED</span>
                         )}
                      </div>

                      <div className="relative">
                        {loadingPoliceFor === crime._id ? (
                          <div className="flex flex-col items-center justify-center py-24 gap-6 text-slate-400">
                            <div className="h-12 w-12 border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin shadow-xl" />
                            <span className="text-[10px] font-black uppercase tracking-[5px] italic animate-pulse">
                              Scanning Jurisdiction Grid...
                            </span>
                          </div>
                        ) : officers.length > 0 ? (
                          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 no-scrollbar custom-scrollbar">
                            {officers.map((officer, idx) => (
                              <button
                                key={officer._id}
                                onClick={() =>
                                  setSelectedOfficers((prev) => ({
                                    ...prev,
                                    [crime._id]: officer._id,
                                  }))
                                }
                                className={`w-full p-8 rounded-[40px] flex items-center justify-between transition-all border-4 text-left group/unit ${
                                  selectedId === officer._id
                                    ? "bg-blue-600 border-blue-500 dark:border-blue-400 shadow-2xl scale-[1.02]"
                                    : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-blue-500/20"
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  <div
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black italic tracking-tighter text-lg shadow-inner ${
                                      selectedId === officer._id
                                        ? "bg-white text-blue-600"
                                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                                    }`}
                                  >
                                    {String(idx + 1).padStart(2, '0')}
                                  </div>
                                  <div>
                                    <div
                                      className={`text-xl font-black uppercase tracking-tighter italic leading-none mb-3 ${
                                        selectedId === officer._id
                                          ? "text-white"
                                          : "text-slate-900 dark:text-white"
                                      }`}
                                    >
                                      {officer.name || officer.username}
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-[3px] flex items-center gap-4 italic ${
                                      selectedId === officer._id ? "text-blue-100" : "text-slate-400 dark:text-slate-600"
                                    }`}>
                                      <span className="flex items-center gap-2"><MapPin size={12} /> {officer.stationDistrict || "Independent Unit"}</span>
                                      <span className="flex items-center gap-2"><Activity size={12} /> {officer.distanceText || "Vector Unknown"}</span>
                                    </div>
                                  </div>
                                </div>
                                {selectedId === officer._id && (
                                  <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md animate-in zoom-in-75">
                                     <CheckCircle2 size={24} />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-rose-500/5 border-2 border-dashed border-rose-500/20 rounded-[40px] p-16 text-center group/empty">
                            <ShieldAlert
                              size={48}
                              className="text-rose-500 mx-auto mb-6 opacity-20 group-hover/empty:opacity-100 group-hover/empty:scale-110 transition-all duration-700"
                            />
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-rose-500/60 italic leading-relaxed max-w-[250px] mx-auto">
                              No intercept units identified within tactical response range.
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleForward(crime._id)}
                          disabled={!selectedId || forwardingId === crime._id}
                          className={`mt-10 w-full py-7 rounded-[40px] text-[11px] font-black uppercase tracking-[6px] flex items-center justify-center gap-4 transition-all italic active:scale-95 ${
                            !selectedId
                              ? "bg-slate-50 dark:bg-slate-950 text-slate-300 dark:text-slate-800 border-2 border-slate-100 dark:border-slate-800"
                              : forwardingId === crime._id
                              ? "bg-blue-600/30 text-white cursor-wait italic"
                              : "bg-blue-600 text-white hover:bg-white hover:text-blue-600 border-4 border-blue-600 shadow-2xl shadow-blue-600/30 font-black group/fwd"
                          }`}
                        >
                          {forwardingId === crime._id ? (
                            <>
                              <Loader2 size={24} className="animate-spin" />
                              Forwarding Node...
                            </>
                          ) : (
                            <>
                              <Send size={24} className="group-hover/fwd:translate-x-3 group-hover/fwd:-translate-y-3 transition-transform duration-500" />
                              Initialize Forward Protocol
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] text-slate-700 dark:text-slate-300 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-[4px] transition-all italic"
          >
            Previous
          </button>
          
          <div className="flex gap-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xs font-black italic transition-all shadow-sm border-2 ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30 scale-110"
                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 hover:border-blue-500/40"
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] text-slate-700 dark:text-slate-300 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-[4px] transition-all italic"
          >
            Next Vector
          </button>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
