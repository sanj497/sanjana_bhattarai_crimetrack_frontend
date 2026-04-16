import { useEffect, useState } from "react";
import React from "react";
import {
  Camera,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Lock,
  AlertCircle,
  Hammer,
  CreditCard,
  Home,
  Pill,
  FileText,
  Inbox,
  Send,
  Bell,
  RefreshCw,
  Eye,
  User,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/report`;
const SOCKET_URL = `${import.meta.env.VITE_BACKEND_URL}`;

import { io } from "socket.io-client";

export default function AdminReport() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  
  // Server-Side Pagination & Stats
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}&limit=${itemsPerPage}&status=${filter}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Unauthorized or failed request");
      const data = await res.json();
      setCrimes(Array.isArray(data.crimes) ? data.crimes : []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const handleNotification = () => fetchReports();
    window.addEventListener("new-notification-received", handleNotification);
    return () => window.removeEventListener("new-notification-received", handleNotification);
  }, [currentPage, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleAction = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { alert(`Report ${status} successfully`); fetchReports(); }
      else { const data = await res.json(); alert(data.error || "Action failed"); }
    } catch (err) { alert("Server error"); }
  };

  const statusColor = (status) => {
    if (status === "Pending") return "#ca8a04";
    if (status === "Verified" || status === "Accepted") return "#059669";
    if (status === "Rejected") return "#b91c1c";
    if (status === "ForwardedToPolice") return "#2563eb";
    if (status === "Resolved") return "#10b981";
    return "#475569";
  };

  const getCrimeIcon = (type) => {
    const icons = { Theft: Lock, Assault: AlertTriangle, Vandalism: Hammer, Fraud: CreditCard, Burglary: Home, "Drug-related": Pill };
    return icons[type] || FileText;
  };

  if (loading && crimes.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-50">
        <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Case Files</p>
      </div>
    );

  return (
    <div className="p-8 bg-slate-950 min-h-screen font-sans text-slate-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Administrative Clearing House</h2>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">HQ Operations Center</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
               {["All", "Pending", "Verified", "ForwardedToPolice", "Rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "bg-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    {f === "ForwardedToPolice" ? "Escalated" : f}
                  </button>
                ))}
          </div>
          <button onClick={fetchReports} className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Ledger
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {crimes.map((crime, i) => {
          const CrimeIcon = getCrimeIcon(crime.crimeType);
          return (
            <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-[48px] overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col shadow-2xl relative">
              <div className="relative h-60 group">
                <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-2xl z-20 backdrop-blur-md bg-opacity-80" style={{ backgroundColor: statusColor(crime.status) }}>{crime.status}</div>
                {crime.evidence?.[0]?.url ? (
                   <img src={crime.evidence[0].url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                ) : (
                   <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-700 gap-4 border-b border-slate-800">
                     <Camera size={48} className="opacity-20 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-[4px] opacity-40">Artifact Unvailable</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/10 flex items-center gap-2">
                    <CrimeIcon size={12} /> {crime.crimeType}
                  </span>
                  {crime.priority === "High" && (
                    <span className="bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/10 flex items-center gap-2">
                      <ShieldAlert size={12} /> Critical
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white leading-tight mb-4 tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{crime.title || "Unclassified Incident"}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium line-clamp-2">"{crime.description || "Intelligence pending."}"</p>
                
                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-slate-950/50 rounded-[24px] border border-slate-800/50 transition-colors group-hover:border-slate-700">
                       <MapPin size={18} className="text-blue-600 shrink-0" />
                       <span className="text-xs font-black text-slate-400 uppercase tracking-tight line-clamp-1">{crime.location?.address || "Grid Coordinates Only"}</span>
                    </div>

                    {crime.status === "ForwardedToPolice" && crime.workflow?.assignedToOfficer && (
                       <div className="flex items-center gap-4 p-5 bg-blue-500/5 rounded-[24px] border border-blue-500/10">
                          <User size={18} className="text-blue-500 shrink-0" />
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest leading-none mb-1">Assigned Agent</span>
                             <span className="text-xs font-black text-white uppercase">{crime.workflow.assignedToOfficer.username}</span>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-6">
                        {crime.status === "Pending" && (
                            <>
                               <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95">
                                  <CheckCircle size={16} /> Authorize Verification
                               </button>
                               <button onClick={() => handleAction(crime._id, "Rejected")} className="py-4 border border-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-all">
                                  <XCircle size={14} /> Nullify
                               </button>
                            </>
                        )}
                        {crime.status === "Verified" && (
                           <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                              <Send size={16} /> Deploy Forces
                           </button>
                        )}
                        {crime.status !== "Pending" && crime.status !== "Verified" && (
                           <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-5 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-700 transition-all border border-slate-700">
                              <Eye size={16} /> Open Dossier
                           </button>
                        )}
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-slate-900/40 border border-slate-800/50 rounded-[40px] shadow-2xl backdrop-blur-md mb-10 gap-6">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Administrative Index</span>
             <span className="text-xs font-bold text-white uppercase">Archive {currentPage} <span className="text-slate-600">/</span> {totalPages} <span className="text-slate-600">—</span> {totalItems} Total Records</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 hover:border-blue-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 mx-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="text-slate-700 font-bold">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`h-10 w-10 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === p 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/20' 
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
              className="w-12 h-12 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:bg-slate-700 hover:border-blue-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {crimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-6">
          <Inbox size={80} className="opacity-20" />
          <div className="text-center"><h4 className="text-xl font-black text-slate-900 mb-1">Archive Entry Empty</h4><p className="text-sm font-medium">No case files match the current parameters.</p></div>
        </div>
      )}
    </div>
  );
}