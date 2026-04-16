import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, AlertTriangle, FileText, MapPin, Clock, 
  Siren, ChevronRight, CheckCircle2, Activity, Image, 
  ExternalLink, CheckSquare, ClipboardList, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function NewBoard() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrimes();
    const handler = () => fetchCrimes();
    window.addEventListener("new-notification-received", handler);
    return () => window.removeEventListener("new-notification-received", handler);
  }, []);

  const fetchCrimes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCrimes(data.crimes || []);
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const forwarded = crimes.filter(c => c.status === "ForwardedToPolice");
  const investigating = crimes.filter(c => c.status === "UnderInvestigation");
  const resolved = crimes.filter(c => c.status === "Resolved");

  const stats = [
    { label: 'Total Assigned', value: crimes.length, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'New Cases', value: forwarded.length, icon: FileText, color: 'bg-amber-500' },
    { label: 'Investigating', value: investigating.length, icon: Activity, color: 'bg-indigo-500' },
    { label: 'Resolved', value: resolved.length, icon: CheckSquare, color: 'bg-emerald-500' },
  ];

  // Cases to show on dashboard — new assignments first, then investigating
  const dashboardCases = [...forwarded, ...investigating].slice(0, 6);

  const statusConfig = {
    ForwardedToPolice: { label: "New Assignment", color: "amber", icon: <FileText size={12} /> },
    UnderInvestigation: { label: "Investigating", color: "indigo", icon: <Activity size={12} /> },
    Resolved: { label: "Resolved", color: "emerald", icon: <CheckCircle2 size={12} /> },
  };

  const chartData = [
    { name: 'New Cases', value: forwarded.length, color: '#f59e0b' },
    { name: 'Investigating', value: investigating.length, color: '#6366f1' },
    { name: 'Resolved', value: resolved.length, color: '#10b981' },
    { name: 'Total Assigned', value: crimes.length, color: '#3b82f6' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
          return (
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-xl">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white text-lg font-black">{payload[0].value} Cases</p>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="p-8 font-sans bg-slate-950 min-h-full">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">OPERATIONAL COMMAND</h2>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Real-time Precinct Oversight</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-4 shadow-xl">
              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                 <Shield size={20} className="animate-pulse" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Precinct Status</div>
                 <div className="text-sm font-black text-white uppercase tracking-tight">Active Duty</div>
              </div>
           </div>
           <div className="hidden lg:flex bg-slate-900 border border-slate-800 p-4 rounded-3xl items-center gap-4 shadow-xl">
              <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                 <Activity size={20} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Network Intel</div>
                 <div className="text-sm font-black text-white uppercase tracking-tight">Synchronized</div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative shadow-lg">
            <div className={`absolute top-0 right-0 h-24 w-24 ${stat.color} opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-white leading-none">{stat.value}</p>
              </div>
              <div className={`${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SOS Banner */}
      <div className="bg-gradient-to-r from-red-600/20 to-transparent rounded-[32px] border border-red-500/20 p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-red-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-red-600/20">
             <AlertTriangle className="text-white animate-pulse" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency SOS Broadcast</h3>
            <p className="text-red-200/60 text-sm font-medium">Coordinate immediately with all available active patrol units.</p>
          </div>
        </div>
        
        <Link
          to="/police/sos"
          className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest px-10 py-5 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          Trigger Dispatch
        </Link>
      </div>

      {/* Chart Analytics Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl mb-10 w-full hover:border-blue-500/20 transition-all group">
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                      <BarChart3 size={18}/>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Operational Workload Distribution</h3>
              </div>
          </div>
          <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#0f172a' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* Forwarded Cases — Card Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <Siren className="text-blue-500" size={24} />
          Priority Response Queue
        </h3>
        <Link to="/police/reports" className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">Full Case Log</Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Loading Intelligence...</span>
        </div>
      ) : dashboardCases.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-16 text-center">
          <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-slate-600" />
          </div>
          <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">All Clear</h4>
          <p className="text-slate-600 text-sm">No active case assignments. Awaiting new dispatches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {dashboardCases.map((crime) => {
            const cfg = statusConfig[crime.status] || statusConfig.ForwardedToPolice;
            return (
              <div key={crime._id} className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden hover:border-blue-500/20 transition-all group shadow-xl">
                
                {/* Card Header */}
                <div className="p-8 pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 border border-slate-700 group-hover:scale-110 transition-transform">
                        <Shield size={22} />
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mb-0.5">{crime.crimeType}</div>
                        <h4 className="text-lg font-black text-white tracking-tight uppercase leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">{crime.title}</h4>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {cfg.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">{crime.description}</p>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-4 text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <MapPin size={13} className="text-blue-500" /> {crime.location?.address || "Unknown"}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Clock size={13} /> {new Date(crime.createdAt).toLocaleDateString()}
                    </div>
                    {crime.priority && (
                      <>
                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          crime.priority === "Critical" ? "text-rose-400" :
                          crime.priority === "High" ? "text-orange-400" :
                          crime.priority === "Medium" ? "text-amber-400" : "text-blue-400"
                        }`}>{crime.priority} Priority</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Evidence Section - Tactical View */}
                {crime.evidence && crime.evidence.length > 0 && (
                  <div className="px-8 pb-6">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                       <div className="w-1 h-3 bg-blue-500 rounded-full" /> TACTICAL EVIDENCE ARTIFACTS ({crime.evidence.length})
                    </p>
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      {crime.evidence.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative shrink-0 w-32 h-24 rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all group/ev shadow-lg"
                        >
                          {file.resourceType === "video" ? (
                            <video src={file.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={file.url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/ev:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                            <ExternalLink size={20} className="text-white transform scale-90 group-hover/ev:scale-100 transition-transform" />
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[7px] font-black uppercase rounded shadow-lg">
                            {file.resourceType || "IMG"}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map Location - Tactical Grid */}
                {crime.location?.lat && crime.location?.lng && (
                  <div className="px-8 pb-6">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                       <div className="w-1 h-3 bg-rose-500 rounded-full" /> INCIDENT GROUND ZERO
                    </p>
                    <div className="rounded-[28px] overflow-hidden border border-slate-800 h-48 relative group/map shadow-inner">
                      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none z-10" />
                      <iframe
                        title={`Location - ${crime._id}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'contrast(1.1) brightness(0.9) saturate(1.2)' }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(crime.location.lng) - 0.005}%2C${Number(crime.location.lat) - 0.005}%2C${Number(crime.location.lng) + 0.005}%2C${Number(crime.location.lat) + 0.005}&layer=mapnik&marker=${Number(crime.location.lat)}%2C${Number(crime.location.lng)}`}
                      />
                      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[8px] font-bold text-slate-300">
                        GPS: {Number(crime.location.lat).toFixed(6)} N, {Number(crime.location.lng).toFixed(6)} E
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer - Intelligence Metadata */}
                <div className="px-8 py-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between bg-slate-900/30 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reporter Intel</div>
                      <div className="text-xs font-bold text-white uppercase">{crime.userId?.username || "Anonymous Source"}</div>
                    </div>
                  </div>
                  <Link
                    to="/police/reports"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20 shadow-lg"
                  >
                    Open Full Dossier <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}