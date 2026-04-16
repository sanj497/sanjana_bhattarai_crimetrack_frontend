import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, AlertTriangle, FileText, MapPin, Clock, 
  Siren, ChevronRight, CheckCircle2, Activity, Image, 
  ExternalLink, CheckSquare, ClipboardList, BarChart3,
  Zap, Radio, Send, ShieldAlert, Navigation2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function NewBoard() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  // Theme Detection
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

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
    { label: 'Tactical Load', value: crimes.length, icon: ClipboardList, color: 'bg-blue-600', textColor: 'text-blue-600' },
    { label: 'New Nodes', value: forwarded.length, icon: Zap, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { label: 'Active Ops', value: investigating.length, icon: Activity, color: 'bg-indigo-600', textColor: 'text-indigo-600' },
    { label: 'Completed', value: resolved.length, icon: ShieldCheck, color: 'bg-emerald-600', textColor: 'text-emerald-600' },
  ];

  const dashboardCases = [...forwarded, ...investigating].slice(0, 6);

  const statusConfig = {
    ForwardedToPolice: { label: "NEW DEPLOYMENT", color: "amber", icon: <Send size={12} /> },
    UnderInvestigation: { label: "IN PROGRESS", color: "indigo", icon: <Activity size={12} /> },
    Resolved: { label: "RESOLVED", color: "emerald", icon: <CheckCircle2 size={12} /> },
  };

  const chartData = [
    { name: 'NEW', value: forwarded.length, color: '#f59e0b' },
    { name: 'ACTIVE', value: investigating.length, color: '#6366f1' },
    { name: 'RESOLVED', value: resolved.length, color: '#10b981' },
    { name: 'TOTAL', value: crimes.length, color: '#3b82f6' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
          return (
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2 italic">Sector Intelligence</p>
                  <div className="flex items-center gap-3">
                     <p className="text-white text-3xl font-black italic">{payload[0].value}</p>
                     <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest pt-2">Units / {label}</p>
                  </div>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="p-8 lg:p-14 bg-white dark:bg-[#020617] min-h-screen font-sans text-slate-800 dark:text-slate-300 transition-colors duration-300 pb-32">
      
      {/* Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-16 relative">
        <div className="absolute -top-10 -left-10 h-64 w-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-6">
             <Radio size={20} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[5px] italic">Operational Tactical Network [ON]</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-[0.8] mb-6">
            Command <span className="text-blue-600 dark:text-blue-500 underline decoration-blue-500/10 decoration-8 underline-offset-8">Central</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[4px] indent-1 italic opacity-70">Sector Management & Response Dispatch</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 relative z-10">
           <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 p-6 rounded-[32px] flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 translate-y-20 group-hover:translate-y-0 transition-transform duration-700" />
              <div className="h-20 w-16 bg-emerald-500/10 text-emerald-500 rounded-[24px] flex items-center justify-center relative z-10">
                 <ShieldAlert size={28} className="animate-bounce" />
              </div>
              <div className="relative z-10 pr-6">
                 <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 italic">Precinct 01</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Status: <span className="text-emerald-500">Green</span></div>
              </div>
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 p-6 rounded-[32px] flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 translate-y-20 group-hover:translate-y-0 transition-transform duration-700" />
              <div className="h-20 w-16 bg-blue-600/10 text-blue-600 rounded-[24px] flex items-center justify-center relative z-10">
                 <Navigation2 size={28} />
              </div>
              <div className="relative z-10 pr-6">
                 <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 italic">Sat-Intel</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">GRID: <span className="text-blue-600">SYNC</span></div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[48px] p-10 hover:border-blue-500/40 transition-all group overflow-hidden relative shadow-sm hover:shadow-2xl duration-700">
            <div className={`absolute -top-12 -right-12 h-40 w-40 ${stat.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[4px] mb-4 italic flex items-center gap-2">
                   <div className="w-1 h-3 bg-blue-500 rounded-full" />
                   {stat.label}
                </p>
                <p className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">{stat.value}</p>
              </div>
              <div className={`${stat.color} h-16 w-16 rounded-[24px] flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500`}>
                <stat.icon className="text-white" size={32} />
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic group-hover:text-blue-500 transition-colors">
               Real-time Telemetry <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* High-Alert Emergency Banner */}
      <div className="bg-rose-600 rounded-[48px] p-10 lg:p-14 mb-16 flex flex-col xl:flex-row items-center justify-between gap-12 shadow-[0_40px_100px_-20px_rgba(225,29,72,0.4)] dark:shadow-[0_40px_100px_-20px_rgba(225,29,72,0.2)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"/>
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-black/10 rounded-full blur-[80px] -ml-24 -mb-24"/>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
          <div className="h-24 w-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl text-rose-600 rotate-12 group-hover:rotate-0 transition-transform duration-500">
             <Siren className="animate-pulse" size={48} />
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">Emergency Signal Override</h3>
            <p className="text-rose-100 text-[10px] font-black uppercase tracking-[5px] flex items-center gap-3 justify-center md:justify-start">
               <div className="h-2 w-2 bg-white rounded-full animate-ping" />
               Critical Priority SOS Deployment Active
            </p>
          </div>
        </div>
        
        <Link
          to="/police/sos"
          className="bg-white text-rose-600 font-black uppercase text-xs tracking-[5px] px-16 py-7 rounded-[28px] transition-all shadow-2xl hover:bg-slate-950 hover:text-white active:scale-95 relative z-10 flex items-center gap-4 group/sos"
        >
          Initialize Dispatch <Send size={20} className="group-hover/sos:translate-x-3 group-hover/sos:-translate-y-3 transition-transform" />
        </Link>
      </div>

      {/* Analytics & Priority Queue Wrap */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-16">
         
         {/* CHART PANEL */}
         <div className="2xl:col-span-12">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[64px] p-12 lg:p-16 shadow-sm hover:shadow-2xl transition-all duration-700 w-full group">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-blue-600 text-white rounded-[20px] shadow-xl shadow-blue-500/20">
                            <BarChart3 size={24}/>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Sector Workload Visualizer</h3>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[4px] ml-16 italic">Distribution of force by node state</p>
                  </div>
                  <div className="flex gap-4">
                     {chartData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800 shadow-inner">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 italic">{d.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="h-[450px] w-full mt-10">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <defs>
                             {chartData.map((d, i) => (
                                <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                                   <stop offset="100%" stopColor={d.color} stopOpacity={0.6} />
                                </linearGradient>
                             ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(226, 232, 240, 0.5)"} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: '900', fill: isDark ? '#475569' : '#94a3b8', letterSpacing: '4px' }} 
                            dy={20} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: '900', fill: isDark ? '#475569' : '#94a3b8' }} 
                          />
                          <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.5)', radius: [24, 24, 0, 0] }} 
                          />
                          <Bar dataKey="value" radius={[24, 24, 0, 0]} maxBarSize={120}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* QUEUE WRAPPER */}
         <div className="2xl:col-span-12 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-8">
              <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-6 uppercase italic leading-none">
                  <div className="h-16 w-16 bg-blue-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl rotate-6 group-hover:rotate-0 transition-all">
                     <Siren size={32} />
                  </div>
                  Priority Response Queue
                </h3>
                <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[5px] mt-6 italic ml-24">Tactical Assignments from Headquarters Central</p>
              </div>
              <Link to="/police/reports" className="px-12 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-[4px] rounded-[24px] transition-all shadow-xl hover:scale-105 active:scale-95 italic">
                 Full Sector Registry
              </Link>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-900/40 rounded-[56px] border border-slate-100 dark:border-slate-800 p-32 text-center">
                <div className="flex flex-col items-center justify-center gap-8">
                  <div className="h-16 w-16 border-4 border-slate-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin shadow-2xl" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[6px] italic animate-pulse">Synchronizing Grid Records...</span>
                </div>
              </div>
            ) : dashboardCases.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-[64px] p-24 text-center shadow-inner group">
                <div className="h-24 w-24 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck size={48} className="text-slate-200 dark:text-slate-700" />
                </div>
                <h4 className="text-2xl font-black text-slate-400 dark:text-slate-800 uppercase tracking-[4px] mb-2 italic">Sector Normalized</h4>
                <p className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-[6px] opacity-40">Awaiting Signal Inflow</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {dashboardCases.map((crime) => {
                  const cfg = statusConfig[crime.status] || statusConfig.ForwardedToPolice;
                  const themeColors = {
                    amber: "border-amber-500/20 text-amber-500 bg-amber-500/5",
                    indigo: "border-indigo-500/20 text-indigo-500 bg-indigo-500/5",
                    emerald: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
                  };

                  return (
                    <div key={crime._id} className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-[64px] overflow-hidden hover:border-blue-500/40 transition-all group shadow-sm hover:shadow-2xl duration-700 relative">
                      
                      <div className="absolute top-0 right-0 h-48 w-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

                      {/* Card Content */}
                      <div className="p-12 pb-6 relative z-10">
                        <div className="flex flex-col sm:flex-row items-start justify-between mb-10 gap-6">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 rounded-[28px] flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform shadow-inner duration-500">
                              <Shield size={32} />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[4px] mb-2 italic flex items-center gap-2">
                                 <Zap size={12} /> {crime.crimeType}
                              </div>
                              <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic group-hover:text-blue-600 transition-colors line-clamp-1 duration-500">{crime.title}</h4>
                            </div>
                          </div>
                          <span className={`px-6 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-[3px] flex items-center gap-3 shrink-0 shadow-sm italic ${themeColors[cfg.color]}`}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" /> {cfg.label}
                          </span>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-slate-950/40 p-10 rounded-[40px] border border-slate-50 dark:border-slate-800/40 mb-10 shadow-inner">
                           <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed line-clamp-2 font-bold italic">
                              "{crime.description}"
                           </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 text-slate-400 dark:text-slate-600 mb-10 border-t border-slate-50 dark:border-slate-800/50 pt-10">
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[3px] italic">
                            <MapPin size={16} className="text-blue-500" /> {crime.location?.address || "Grid Coordinate Node"}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[3px] italic">
                            <Clock size={16} /> {new Date(crime.createdAt).toLocaleDateString()} node_{crime._id.slice(-6).toUpperCase()}
                          </div>
                        </div>

                        {/* Visual Assets Preview */}
                        {crime.evidence && crime.evidence.length > 0 && (
                          <div className="mb-10">
                            <div className="flex items-center justify-between mb-6">
                               <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[4px] flex items-center gap-2 italic">
                                  <div className="w-1.5 h-3 bg-blue-500 rounded-full" /> Evidence Repository
                               </p>
                               <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-500">{crime.evidence.length} ARTIFACTS</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar custom-scrollbar">
                              {crime.evidence.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative shrink-0 w-44 h-32 rounded-[32px] overflow-hidden border-2 border-slate-50 dark:border-slate-950 hover:border-blue-500 transition-all group/ev shadow-lg"
                                >
                                  {file.resourceType === "video" ? (
                                    <video src={file.url} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={file.url} alt={`Artifact ${idx + 1}`} className="w-full h-full object-cover grayscale group-hover/ev:grayscale-0 transition-all duration-700" />
                                  )}
                                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/ev:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                    <ExternalLink size={24} className="text-white scale-50 group-hover/ev:scale-100 transition-transform" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tactical Execution Bar */}
                      <div className="px-12 py-10 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 dark:bg-slate-950/40 gap-8">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <Users size={28} />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 italic">Reporting Node</div>
                            <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{crime.userId?.username || "Verified Citizen"}</div>
                          </div>
                        </div>
                        <Link
                          to="/police/reports"
                          className="w-full sm:w-auto flex items-center justify-center gap-4 bg-slate-950 dark:bg-blue-600 text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[3px] transition-all shadow-2xl hover:bg-blue-600 active:scale-95 italic group/btn"
                        >
                          Access Case Log <ChevronRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
}