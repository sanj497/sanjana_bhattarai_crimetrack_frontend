import { useMemo, useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  BarChart3, 
  Map as MapIcon, 
  FileText, 
  Users as UsersIcon, 
  Send, 
  Settings, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ShieldCheck,
  Bell,
  AlertTriangle,
  RefreshCw,
  MapPin
} from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, resolved: 0 });
    const [activities, setActivities] = useState([]);
    const [alertQueue, setAlertQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.status === 401) {
                localStorage.clear();
                window.location.href = "/login";
                return;
            }
            
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setActivities(data.activities);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlertQueue = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/alert-queue`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAlertQueue(data.queue || []);
            }
        } catch (err) {
            console.error("Alert Queue fetch error:", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchAlertQueue();
        
        const handleNotification = () => {
            fetchDashboardData();
            fetchAlertQueue();
        };
        
        window.addEventListener("new-notification-received", handleNotification);
        const interval = setInterval(() => {
            fetchDashboardData();
            fetchAlertQueue();
        }, 120000);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener("new-notification-received", handleNotification);
        };
    }, []);

    const menu = useMemo(
        () => [
            { name: "Dashboard", icon: <BarChart3 size={18}/>, path: "/dashboard" },
            { name: "Map",       icon: <MapIcon size={18}/>, path: "/admin/map"       },
            { name: "Reports",   icon: <FileText size={18}/>, path: "/adReport"  },
            { name: "Users",     icon: <UsersIcon size={18}/>, path: "/user"          },
            { name: "Verify",    icon: <ShieldCheck size={18}/>, path: "/forward-admin" },
            { name: "Complaints", icon: <AlertCircle size={18}/>, path: "/admin/complaints" },
            { name: "Feedback",  icon: <MessageSquare size={18}/>, path: "/admin/feedback" },
        ],
        []
    );

    const StatCard = ({ title, value, sub, icon, color }) => (
        <div
            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:border-blue-500/20 transition-all cursor-default relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/[0.03] dark:bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] mb-2">{title}</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{loading ? "..." : value}</div>
                    <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-blue-500"/> {sub}
                    </div>
                </div>
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                    style={{ background: `${color}15`, color: color }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );

    const chartData = [
        { name: 'Pending', value: stats.pending || 0, color: '#f59e0b' },
        { name: 'Verified', value: stats.verified || 0, color: '#8b5cf6' },
        { name: 'Resolved', value: stats.resolved || 0, color: '#10b981' },
        { name: 'Total', value: stats.total || 0, color: '#3b82f6' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-slate-900 dark:text-white text-2xl font-black">{payload[0].value} <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">Incidents</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] p-8 lg:p-12 text-slate-800 dark:text-slate-300 font-sans transition-colors duration-300">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <div>
                   <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-2">
                      <BarChart3 size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[4px]">HQ Operational Node</span>
                   </div>
                   <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Executive Command</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[2px] shadow-xl group cursor-help">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)] group-hover:scale-125 transition-transform"/>
                        Real-time Link Active
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                
                {/* Left Side: Stats and Activity */}
                <div className="flex flex-col gap-12">
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Dossier" 
                            value={stats.total} 
                            sub="Registry Volume" 
                            icon={<FileText size={20}/>} 
                            color="#3b82f6"
                        />
                        <StatCard 
                            title="Pending Audit" 
                            value={stats.pending} 
                            sub="Active Review" 
                            icon={<Clock size={20}/>} 
                            color="#f59e0b"
                        />
                        <StatCard 
                            title="Validated Intel" 
                            value={stats.verified} 
                            sub="Field Ready" 
                            icon={<ShieldCheck size={20}/>} 
                            color="#8b5cf6"
                        />
                        <StatCard 
                            title="Operational Success" 
                            value={stats.resolved} 
                            sub="Closed Nodes" 
                            icon={<CheckCircle size={20}/>} 
                            color="#10b981"
                        />
                    </div>

                    {/* Live Intelligence Map & Dispatcher Queue */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Live Tactical Map Preview */}
                        <div className="bg-white dark:bg-slate-900/60 rounded-[56px] overflow-hidden flex flex-col relative h-[320px] shadow-sm hover:shadow-2xl group border border-slate-100 dark:border-slate-800/50 transition-all duration-500">
                          <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-full border border-slate-100 dark:border-slate-700/50 shadow-xl">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[3px]">Sector Overview</span>
                          </div>
                          
                          <div className="absolute inset-0 z-10 w-full h-full dark:invert-[90%] dark:hue-rotate-[180deg] opacity-80 group-hover:opacity-100 transition-opacity">
                            <iframe
                              title="Live Tactical Overview"
                              width="100%"
                              height="100%"
                              style={{ border: 0, pointerEvents: 'none' }}
                              loading="lazy"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=85.314%2C27.7072%2C85.334%2C27.7272&layer=mapnik`}
                            />
                          </div>
                          
                          {/* Map Overlay content */}
                          <div className="absolute inset-0 z-20 bg-gradient-to-t from-white dark:from-[#020617] via-transparent to-transparent flex flex-col justify-end p-10 hover:via-white/20 dark:hover:via-blue-900/5 transition-all cursor-pointer" onClick={() => navigate("/admin/map")}>
                             <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                               <h3 className="text-slate-900 dark:text-white text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3 mb-2 underline decoration-blue-500 decoration-4 underline-offset-8">
                                 Operational Map Grid
                               </h3>
                               <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[5px] leading-none opacity-0 group-hover:opacity-100 transition-opacity delay-100">Deep Datalink Access</p>
                             </div>
                          </div>
                        </div>

                        {/* Dispatch Queue Card */}
                        <div
                            onClick={() => navigate("/forward-admin")}
                            className="bg-slate-950 dark:bg-blue-600 rounded-[56px] p-12 flex flex-col justify-between cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)] transition-all duration-500 h-[320px] relative overflow-hidden group border border-slate-800 dark:border-blue-500/30"
                        >
                            <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-700"/>
                            
                            <div className="w-20 h-20 rounded-[32px] bg-white/10 dark:bg-white/20 flex flex-col items-center justify-center text-white shrink-0 shadow-inner backdrop-blur-xl group-hover:rotate-12 transition-transform">
                                <Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className="text-white text-4xl font-black uppercase tracking-tighter italic leading-[0.85] mb-4 text-left">Deploy Force <br/> Vectors</h3>
                                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[5px] text-left opacity-60">Tactical Dispatch Hub</p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Analytics Section */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[64px] p-12 shadow-sm hover:shadow-2xl transition-all backdrop-blur-md w-full relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
                                    <BarChart3 size={24}/>
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Intelligence Distribution</h3>
                                   <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px]">Trend Analytics Engine</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[380px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                                    <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[64px] p-12 shadow-sm border-t-4 border-t-emerald-500/20">
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <Activity size={24}/>
                                </div>
                                <div>
                                   <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Live Intelligence Stream</h3>
                                   <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px]">Datalink Archive</span>
                                </div>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[2px] flex items-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group"
                            >
                                <RefreshCw size={16} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}/> Sync Matrix
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {loading ? (
                                [1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] animate-pulse"/>)
                            ) : activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <div key={i} className="flex justify-between items-center p-8 bg-white dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/50 rounded-[32px] hover:border-blue-500/40 transition-all group shadow-sm hover:shadow-xl">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-inner">
                                                <FileText size={24}/>
                                            </div>
                                            <div>
                                                <div className="font-black text-xl text-slate-900 dark:text-white tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-none mb-2 italic underline decoration-blue-500/10 underline-offset-4">{a.title}</div>
                                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[3px] leading-none italic">{a.meta}</div>
                                            </div>
                                        </div>
                                        <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[3px] border-2 shadow-sm italic ${
                                          a.badge === "Resolved" || a.badge === "Verified" ? "bg-emerald-50 transition-all dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20" : 
                                          a.badge === "Pending" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20" : 
                                          "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20"
                                        }`}>
                                          {a.badge === "ForwardedToPolice" ? "Escalated" : a.badge}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-24 bg-slate-50 dark:bg-slate-950/50 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
                                    <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm border dark:border-slate-800">
                                       <Activity size={32} className="text-slate-200 dark:text-slate-800" />
                                    </div>
                                    <h4 className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[8px] text-lg mb-2">Archive Silent</h4>
                                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Initial System Link Search Failed</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Emergency Hub & Actions */}
                <div className="flex flex-col gap-12">
                    
                    {/* EMERGENCY RESPONSE QUEUE */}
                    <div className="bg-slate-950 dark:bg-slate-900/60 border-t-8 border-rose-600 rounded-[64px] p-12 shadow-2xl relative overflow-hidden group min-h-[500px] flex flex-col">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/10 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-rose-600/20 duration-1000" />
                        
                        <div className="flex justify-between items-center mb-12 relative z-10">
                          <div>
                            <div className="flex items-center gap-3 text-rose-500 mb-2">
                               <AlertTriangle size={24} className="animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-[5px] italic leading-none">Emergency Hub</span>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Critical Queue</h3>
                          </div>
                          {alertQueue.length > 0 && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-rose-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
                                <span className="relative bg-rose-600 h-16 w-16 rounded-[24px] flex items-center justify-center text-white text-2xl font-black shadow-2xl border-4 border-white/5">
                                  {alertQueue.length}
                                </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 no-scrollbar">
                            {alertQueue.length > 0 ? (
                              alertQueue.map((item, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => navigate(`/admin/verify/${item._id}`)}
                                  className="p-8 bg-white/5 border border-white/10 rounded-[40px] cursor-pointer hover:bg-white/10 hover:border-rose-500/30 transition-all group/item shadow-xl active:scale-95"
                                >
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-rose-600/20 rounded-2xl text-rose-500 group-hover/item:scale-110 transition-transform">
                                       <AlertCircle size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[4px]">{item.crimeType}</span>
                                  </div>
                                  <div className="text-xl font-black text-white leading-none group-hover/item:text-rose-400 transition-colors uppercase tracking-tight italic line-clamp-2 underline decoration-white/10 underline-offset-8 mb-6">{item.title}</div>
                                  <div className="text-[10px] font-black text-slate-400 group-hover/item:text-slate-200 transition-colors flex items-center gap-3 italic uppercase tracking-[3px]">
                                    <MapPin size={16} /> Vector Analysis Req
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-30">
                                <div className="h-24 w-24 bg-white/5 rounded-[40px] flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
                                  <ShieldCheck size={48} className="text-emerald-500" />
                                </div>
                                <h4 className="text-lg font-black text-slate-400 uppercase tracking-[8px] mb-2 italic">Sector Secured</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Zero Active Priority Intercepts</p>
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Launch */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 rounded-[64px] p-12 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[6px] mb-10 italic">Tactical Console</h3>
                        <div className="flex flex-col gap-5">
                            {menu.slice(2).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[32px] flex items-center justify-between hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 transition-all text-slate-500 dark:text-slate-400 hover:text-white group shadow-sm active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-5">
                                      <div className="text-blue-500 group-hover:text-white transition-colors">{item.icon}</div>
                                      <span className="text-[11px] font-black uppercase tracking-[3px] italic">{item.name}</span>
                                    </div>
                                    <Send size={14} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Health Check */}
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 rounded-[64px] p-12 shadow-sm border-b-4 border-b-blue-600/30">
                        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[6px] mb-10 italic">Link Integrity</h3>
                        <div className="flex flex-col gap-10">
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                     <Activity size={12} className="text-emerald-500" />
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Success Rate</span>
                                  </div>
                                  <span className="text-sm font-black text-emerald-500 font-mono tracking-tighter italic">
                                      {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                  </span>
                              </div>
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-inner">
                                  <div 
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                                  />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                     <FileText size={12} className="text-amber-500" />
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Net Backlog</span>
                                  </div>
                                  <span className="text-sm font-black text-amber-500 font-mono tracking-tighter italic">{stats.pending} Units</span>
                              </div>
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-inner">
                                  <div 
                                    className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)] transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                                  />
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}