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
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Unauthorized or failed request");
      const data = await res.json();
      setCrimes(Array.isArray(data.crimes) ? data.crimes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Listen for socket events
    const handleNotification = () => {
        console.log("Admin reports refreshing...");
        fetchReports();
    };
    window.addEventListener("new-notification-received", handleNotification);
    return () => window.removeEventListener("new-notification-received", handleNotification);
  }, []);

  const handleAction = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Report ${status} successfully`);
        fetchReports();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch (err) {
      alert("Server error");
    }
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
    const icons = {
      Theft: Lock,
      Assault: AlertTriangle,
      Vandalism: Hammer,
      Fraud: CreditCard,
      Burglary: Home,
      "Drug-related": Pill
    };
    return icons[type] || FileText;
  };

  const filteredCrimes =
    filter === "All" ? crimes : crimes.filter((c) => c.status === filter);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-50">
        <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Case Files</p>
      </div>
    );

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
             {["All", "Pending", "Verified", "ForwardedToPolice", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === f 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {f === "ForwardedToPolice" ? "Escalated" : f}
                </button>
              ))}
        </div>
        
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Database
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCrimes.map((crime, i) => {
          const CrimeIcon = getCrimeIcon(crime.crimeType);
          return (
            <div key={i} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col hover:translate-y-[-4px] transition-transform duration-300">
              
              {/* Media Section */}
              <div className="relative h-56 group">
                <div 
                  className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg z-10"
                  style={{ backgroundColor: statusColor(crime.status) }}
                >
                  {crime.status}
                </div>
                
                {crime.evidence?.[0]?.url ? (
                  <img src={crime.evidence[0].url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Camera size={40} className="opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Visual Artifacts</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content Section */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CrimeIcon size={12} />
                    {crime.crimeType}
                  </span>
                  {crime.priority === "High" && (
                    <span className="bg-red-600/10 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={12} />
                      Priority
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
                  {crime.title || "Unclassified Incident"}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                  {crime.description || "No descriptive intelligence provided for this case."}
                </p>

                <div className="mt-auto space-y-4">
                    {/* Location Badge */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <MapPin size={16} className="text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-600 line-clamp-1">{crime.location?.address || "Coordinate Data Only"}</span>
                    </div>

                    {/* Assigned Officer (if forwarded) */}
                    {crime.status === "ForwardedToPolice" && crime.workflow?.assignedToOfficer && (
                       <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <User size={16} className="text-blue-600 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Assigned Agent</span>
                            <span className="text-xs font-black text-slate-900">{crime.workflow.assignedToOfficer.username || "Authorized Personnel"}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        {crime.status === "Pending" && (
                            <>
                                <button 
                                    onClick={() => navigate(`/admin/verify/${crime._id}`)}
                                    className="col-span-2 px-4 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle size={14} /> Review & Verify
                                </button>
                                <button 
                                    onClick={() => handleAction(crime._id, "Rejected")}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-300 transition-all"
                                >
                                    <XCircle size={14} /> Quick Reject
                                </button>
                            </>
                        )}
                        {crime.status === "Verified" && (
                            <button 
                                onClick={() => navigate(`/admin/verify/${crime._id}`)}
                                className="col-span-2 px-4 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                             >
                                <Send size={14} /> Deploy to Police
                            </button>
                        )}
                        {crime.status !== "Pending" && crime.status !== "Verified" && (
                            <button 
                                onClick={() => navigate(`/admin/verify/${crime._id}`)}
                                className="col-span-2 px-4 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                            >
                                <Eye size={14} /> View Details
                            </button>
                        )}
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCrimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-6">
          <Inbox size={80} className="opacity-20" />
          <div className="text-center">
            <h4 className="text-xl font-black text-slate-900 mb-1">Archive Entry Empty</h4>
            <p className="text-sm font-medium">No case files match the selected filter criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
}