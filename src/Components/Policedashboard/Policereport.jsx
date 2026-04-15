import { useEffect, useState } from "react";
import React from "react";
import { 
  Shield, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Activity,
  CheckSquare,
  ClipboardList
} from "lucide-react";

const Policereport = () => {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedCrimeIds, setExpandedCrimeIds] = useState(new Set());

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

  const fetchCrimes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please re-authenticate.");
        setLoading(false);
        return;
      }

      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Data bridge failure");
      
      setCrimes(Array.isArray(data.crimes) ? data.crimes : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrimes();
  }, []);

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

  const filteredCrimes = crimes
    .filter(c => filter === "All" || c.status === filter)
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Accessing Field Intelligence...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-12 font-sans text-slate-300">
      {/* Header section */}
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

      {/* Stats row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Reports", value: crimes.length, icon: <ClipboardList />, color: "blue" },
          { label: "Assigned Cases", value: crimes.filter(c => c.status === "ForwardedToPolice").length, icon: <Shield />, color: "amber" },
          { label: "Investigations", value: crimes.filter(c => c.status === "UnderInvestigation").length, icon: <Activity />, color: "indigo" },
          { label: "Case Resolved", value: crimes.filter(c => c.status === "Resolved").length, icon: <CheckSquare />, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-[32px] group hover:border-blue-500/30 transition-all">
            <div className={`p-3 rounded-2xl w-fit mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {["All", "ForwardedToPolice", "UnderInvestigation", "Resolved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filter === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700'}`}
          >
            {s === "ForwardedToPolice" ? "New Assignments" : s}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
        {error ? (
          <div className="col-span-full py-20 text-center bg-rose-500/5 border border-rose-500/10 rounded-[48px]">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h3 className="text-white font-black uppercase tracking-widest mb-2">Access Denied</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{error}</p>
          </div>
        ) : filteredCrimes.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/40 border border-slate-800/50 rounded-[48px]">
             <ClipboardList size={48} className="text-slate-700 mx-auto mb-4" />
             <h3 className="text-slate-500 font-black uppercase tracking-widest">No Intelligence Available</h3>
             <p className="text-slate-600 text-xs">Awaiting new case assignments for your district.</p>
          </div>
        ) : (
          filteredCrimes.map((crime) => (
            <div key={crime._id} className="bg-slate-900/40 border border-slate-800/50 rounded-[48px] p-10 hover:border-blue-500/20 transition-all group relative overflow-hidden">
              {/* Status Ribbon */}
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

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800/50">
                {crime.status === "ForwardedToPolice" && (
                  <>
                    <button
                      onClick={() => toggleDetails(crime._id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
                    >
                      {expandedCrimeIds.has(crime._id) ? "Hide Details" : "View Details"}
                    </button>
                    <button 
                      onClick={() => updateStatus(crime._id, "UnderInvestigation")}
                      disabled={updatingId === crime._id}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
                    >
                      {updatingId === crime._id ? "Processing..." : "Accept & Investigate"}
                      <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {crime.status === "UnderInvestigation" && (
                   <>
                     <button 
                      onClick={() => updateStatus(crime._id, "Resolved")}
                      disabled={updatingId === crime._id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        Confirm Resolution
                        <CheckCircle2 size={14} />
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

              {crime.status === "ForwardedToPolice" && expandedCrimeIds.has(crime._id) && (
                <div className="mt-4 p-5 rounded-3xl bg-slate-950/60 border border-slate-800/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">Case ID</p>
                      <p className="text-slate-200 font-semibold break-all">{crime._id}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">Reported By</p>
                      <p className="text-slate-200 font-semibold">{crime.userId?.username || crime.userId?.email || "Unknown Reporter"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">Priority</p>
                      <p className="text-slate-200 font-semibold">{crime.priority || "Medium"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">Evidence Files</p>
                      <p className="text-slate-200 font-semibold">{crime.evidence?.length || 0}</p>
                    </div>
                  </div>
                  {crime.adminNotes && (
                    <div className="mt-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-1">Admin Notes</p>
                      <p className="text-slate-300 text-sm">{crime.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Policereport;