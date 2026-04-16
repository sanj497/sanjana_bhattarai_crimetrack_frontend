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
  ShieldAlert,
  ChevronLeft,
  ChevronRight
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
    if (status === "Pending") return "bg-amber-600 shadow-amber-600/20";
    if (status === "Verified" || status === "Accepted") return "bg-emerald-600 shadow-emerald-600/20";
    if (status === "Rejected") return "bg-rose-600 shadow-rose-600/20";
    if (status === "ForwardedToPolice") return "bg-blue-600 shadow-blue-600/20";
    if (status === "Resolved") return "bg-cyan-600 shadow-cyan-600/20";
    return "bg-slate-600 shadow-slate-600/20";
  };

  const getCrimeIcon = (type) => {
    const icons = { Theft: Lock, Assault: AlertTriangle, Vandalism: Hammer, Fraud: CreditCard, Burglary: Home, "Drug-related": Pill };
    return icons[type] || FileText;
  };

  if (loading && crimes.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-slate-950">
        <div className="h-14 w-14 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[4px] text-[10px] animate-pulse">Synchronizing Advanced Datalink</p>
      </div>
    );

  return (
    <div className="p-8 lg:p-12 bg-white dark:bg-[#020617] min-h-screen font-sans text-slate-800 dark:text-slate-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-16">
        <div>
           <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                 <ShieldAlert size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[4px]">HQ Operations Center</span>
           </div>
           <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1 italic leading-none">Command Clearing House</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 p-2 rounded-[24px] shadow-sm backdrop-blur-xl">
               {["All", "Pending", "Verified", "ForwardedToPolice", "Rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-[2px] transition-all whitespace-nowrap ${
                      filter === f 
                        ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xl scale-105" 
                        : "bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    }`}
                  >
                    {f === "ForwardedToPolice" ? "Deployed" : f}
                  </button>
                ))}
          </div>
          <button onClick={fetchReports} className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[10px] font-black uppercase tracking-[3px] text-slate-500 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
            <RefreshCw size={16} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            Sync Ledger
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {crimes.map((crime, i) => {
          const CrimeIcon = getCrimeIcon(crime.crimeType);
          return (
            <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/50 rounded-[56px] overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col shadow-sm hover:shadow-2xl relative">
              <div className="relative h-72 overflow-hidden">
                <div className={`absolute top-8 right-8 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[3px] text-white shadow-2xl z-20 backdrop-blur-md ${statusColor(crime.status)}`}>
                  <span className="relative flex h-2 w-2 mr-2 inline-block">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  {crime.status.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                {crime.evidence?.[0]?.url ? (
                   <img src={crime.evidence[0].url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" />
                ) : (
                   <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 gap-6 border-b border-slate-100 dark:border-slate-800">
                     <Camera size={64} className="opacity-20 stroke-[1.5]" />
                     <span className="text-[10px] font-black uppercase tracking-[5px] opacity-40">Null Artifact</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#020617] via-transparent to-transparent opacity-40" />
              </div>
              
              <div className="p-10 lg:p-12 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border border-blue-100 dark:border-blue-500/10 flex items-center gap-2 shadow-inner">
                    <CrimeIcon size={14} /> {crime.crimeType}
                  </span>
                  {crime.priority === "High" && (
                    <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border border-rose-100 dark:border-rose-500/10 flex items-center gap-2">
                      <ShieldAlert size={14} className="animate-pulse" /> Critical
                    </span>
                  )}
                </div>

                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-[0.9] mb-6 tracking-tighter uppercase italic group-hover:text-blue-600 transition-colors line-clamp-2">{crime.title || "Unclassified Intelligence"}</h3>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/30 mb-8 shadow-inner">
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-2 italic">"{crime.description || "Incomplete dossier. Intelligence flow pending."}"</p>
                </div>
                
                <div className="mt-auto space-y-6">
                    <div className="flex items-center gap-5 p-6 bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 transition-all group-hover:border-blue-500/30 shadow-sm rounded-[32px]">
                       <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-600">
                         <MapPin size={20} />
                       </div>
                       <div className="flex flex-col overflow-hidden">
                         <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] leading-none mb-1">Vector Field</span>
                         <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight line-clamp-1">{crime.location?.address || "Grid Coordinates Locked"}</span>
                       </div>
                    </div>

                    {crime.status === "ForwardedToPolice" && crime.workflow?.assignedToOfficer && (
                       <div className="flex items-center gap-5 p-6 bg-blue-50 dark:bg-blue-500/5 rounded-[32px] border border-blue-100 dark:border-blue-500/20 shadow-inner">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-blue-500 shadow-sm">
                            <User size={20} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-blue-600 dark:text-blue-500/50 uppercase tracking-[3px] leading-none mb-1">Deployed Agent</span>
                             <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{crime.workflow.assignedToOfficer.username}</span>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {crime.status === "Pending" && (
                            <>
                               <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-5 bg-emerald-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[3px] flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95">
                                  <CheckCircle size={18} /> Authorize Dossier
                               </button>
                               <button onClick={() => handleAction(crime._id, "Rejected")} className="py-5 border-2 border-slate-100 dark:border-rose-500/20 text-slate-400 dark:text-rose-500 rounded-[24px] text-[10px] font-black uppercase tracking-[3px] flex items-center justify-center gap-3 hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                                  <XCircle size={16} /> Purge
                               </button>
                            </>
                        )}
                        {crime.status === "Verified" && (
                           <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-6 bg-blue-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 scale-105">
                              <Send size={20} /> Deploy Field Forces
                           </button>
                        )}
                        {crime.status !== "Pending" && crime.status !== "Verified" && (
                           <button onClick={() => navigate(`/admin/verify/${crime._id}`)} className="col-span-2 py-5 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-[4px] rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95">
                              <Eye size={18} /> Deep Examine
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-10 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[64px] shadow-2xl backdrop-blur-md mb-20 gap-8">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px] mb-2">Clearing House Directory</span>
             <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[2px]">
               Archive {currentPage} <span className="text-slate-200 dark:text-slate-700 mx-2">/</span> {totalPages} <span className="text-slate-200 dark:text-slate-700 mx-4">|</span> {totalItems} Intelligent Nodes
             </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-3xl text-slate-400 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 hover:border-slate-900 disabled:opacity-20 transition-all active:scale-90 shadow-xl"
            >
              <ChevronLeft size={28} />
            </button>
            
            <div className="flex items-center gap-3 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span className="text-slate-200 dark:text-slate-700 font-black">···</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`h-16 w-16 rounded-3xl text-[10px] font-black uppercase transition-all flex items-center justify-center ${
                        currentPage === p 
                          ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xl scale-110 rotate-3' 
                          : 'bg-white dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-50 dark:border-transparent'
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
              className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-3xl text-slate-400 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 hover:border-slate-900 disabled:opacity-20 transition-all active:scale-90 shadow-xl"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      )}

      {crimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-64 text-slate-200 dark:text-slate-800 gap-10">
          <div className="relative">
            <Inbox size={120} className="opacity-10 stroke-[1]" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping" />
            </div>
          </div>
          <div className="text-center group">
            <h4 className="text-2xl font-black text-slate-300 dark:text-slate-700 mb-2 uppercase tracking-[5px] italic group-hover:tracking-[8px] transition-all duration-700">Vault Entry Empty</h4>
            <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Zero Case Files Match Operational Parameters</p>
          </div>
        </div>
      )}
    </div>
  );
}