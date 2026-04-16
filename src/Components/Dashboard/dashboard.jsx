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
            className="bg-slate-900/40 border border-slate-800/50 rounded-[40px] p-8 shadow-2xl hover:border-blue-500/20 transition-all cursor-default relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-2">{title}</div>
                    <div className="text-4xl font-black text-white tracking-tighter">{loading ? "..." : value}</div>
                    <div className="mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-blue-500"/> {sub}
                    </div>
                </div>
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
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
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-white text-lg font-black">{payload[0].value} Cases</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Executive Command Center</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Verified Operational Intelligence</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"/>
                        System Synchronized
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                
                {/* Left Side: Stats and Activity */}
                <div className="flex flex-col gap-8">
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Cases" 
                            value={stats.total} 
                            sub="Database volume" 
                            icon={<FileText size={20}/>} 
                            color="#3b82f6"
                        />
                        <StatCard 
                            title="Pending Review" 
                            value={stats.pending} 
                            sub="Action required" 
                            icon={<Clock size={20}/>} 
                            color="#f59e0b"
                        />
                        <StatCard 
                            title="Verified Alerts" 
                            value={stats.verified} 
                            sub="Ready for Dispatch" 
                            icon={<ShieldCheck size={20}/>} 
                            color="#8b5cf6"
                        />
                        <StatCard 
                            title="Resolution" 
                            value={stats.resolved} 
                            sub="Cases closed" 
                            icon={<CheckCircle size={20}/>} 
                            color="#10b981"
                        />
                    </div>

                    {/* Live Intelligence Map & Dispatcher Queue */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {/* Live Tactical Map Preview */}
                        <div className="bg-slate-900 rounded-[32px] overflow-hidden flex flex-col relative h-[250px] shadow-xl group border border-slate-800">
                          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Overview</span>
                          </div>
                          
                          <div className="absolute inset-0 z-10 w-full h-full" style={{ filter: 'invert(90%) hue-rotate(180deg)' }}>
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
                          <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent flex flex-col justify-end p-6 hover:from-slate-950 transition-all cursor-pointer" onClick={() => navigate("/admin/map")}>
                             <div className="transform translate-y-2 group-hover:translate-y-0 transition-all">
                               <h3 className="text-white text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                 <MapIcon size={18} className="text-blue-500" /> Operational Map Grid
                               </h3>
                               <p className="text-slate-400 text-xs font-bold mt-1">Visualize full reports & critical incident intel in the interactive map.</p>
                             </div>
                             <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                               <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                 <Send size={16} />
                               </div>
                             </div>
                          </div>
                        </div>

                        {/* Dispatch Queue Card */}
                        <div
                            onClick={() => navigate("/forward-admin")}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:-translate-y-1 transition-all shadow-xl h-[250px]"
                        >
                            <div className="w-16 h-16 rounded-3xl bg-white/20 flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
                                <Send size={24}/>
                            </div>
                            <div>
                                <h3 className="text-white text-2xl font-black uppercase tracking-tight">Dispatcher Queue</h3>
                                <p className="text-indigo-100 text-sm font-medium mt-2 leading-relaxed">{stats.verified} reports have been verified by intelligence officers and are pending immediate police assignment.</p>
                                
                                <button className="mt-6 px-6 py-2.5 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                  Assign Units Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart Analytics Section */}
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-[48px] p-10 shadow-2xl backdrop-blur-md w-full relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <BarChart3 size={20}/>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight italic underline decoration-blue-500/20 underline-offset-8">Intelligence Distribution</h3>
                            </div>
                        </div>
                        <div className="h-[350px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '800', fill: '#64748b' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-[48px] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <Activity size={20}/>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Intelligence Stream</h3>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="text-[10px] font-black text-blue-500 uppercase tracking-[2px] flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <RefreshCw size={14}/> Force Re-Sync
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {loading ? (
                                [1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse"/>)
                            ) : activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <div key={i} className="flex justify-between items-center p-6 bg-slate-950/50 border border-slate-800/50 rounded-3xl hover:border-slate-600 transition-all group">
                                        <div className="flex gap-5 items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                                                <FileText size={20}/>
                                            </div>
                                            <div>
                                                <div className="font-black text-base text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">{a.title}</div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{a.meta}</div>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                          a.badge === "Resolved" || a.badge === "Verified" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                          a.badge === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                          "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                        }`}>
                                          {a.badge === "ForwardedToPolice" ? "Escalated" : a.badge}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-600 font-black uppercase tracking-widest text-xs">
                                    Archive Signal Lost — No Active Logs
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Emergency Hub & Actions */}
                <div className="flex flex-col gap-8">
                    
                    {/* EMERGENCY RESPONSE QUEUE */}
                    <div className="bg-slate-900/60 border-2 border-rose-500/20 rounded-[48px] p-10 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-full bg-rose-600 opacity-50"/>
                        
                        <div className="flex justify-between items-center mb-8 relative z-10">
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-[3px]">Emergency Hub</h3>
                            <p className="text-[9px] font-black text-rose-500 uppercase mt-1">Critical Dispatch Queue</p>
                          </div>
                          {alertQueue.length > 0 && (
                            <span className="bg-rose-600 h-10 w-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-2xl shadow-rose-600/50 animate-bounce">
                              {alertQueue.length}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                            {alertQueue.length > 0 ? (
                              alertQueue.map((item, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => navigate(`/admin/verify/${item._id}`)}
                                  className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl cursor-pointer hover:bg-rose-500/10 transition-all group/item shadow-inner"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{item.crimeType}</span>
                                  </div>
                                  <div className="text-sm font-black text-white leading-tight group-hover/item:text-rose-400 transition-colors uppercase tracking-tight">{item.title}</div>
                                  <div className="text-[9px] font-black text-slate-600 mt-4 flex items-center gap-2 italic uppercase tracking-widest">
                                    <MapPin size={12} /> Proximity Alert Required
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-16">
                                <div className="h-16 w-16 bg-slate-950 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                                  <ShieldCheck size={28} className="text-slate-800" />
                                </div>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[4px]">Sector Cleared</p>
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Launch */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-8">Operations Desk</h3>
                        <div className="flex flex-col gap-4">
                            {menu.slice(2).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    className="w-full p-5 bg-slate-950/50 border border-slate-800 rounded-3xl flex items-center gap-5 hover:bg-blue-600 hover:border-blue-500 transition-all text-slate-300 hover:text-white group shadow-inner"
                                >
                                    <div className="text-blue-500 group-hover:text-white transition-colors">{item.icon}</div>
                                    <span className="text-[11px] font-black uppercase tracking-[2px]">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Health Check */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-8">System Telemetry</h3>
                        <div className="flex flex-col gap-8">
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Resolution</span>
                                  <span className="text-xs font-black text-emerald-500 font-mono">
                                      {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                  </span>
                              </div>
                              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
                                  <div 
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                                  />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Backlog</span>
                                  <span className="text-xs font-black text-amber-500 font-mono">{stats.pending} Units</span>
                              </div>
                              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
                                  <div 
                                    className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000"
                                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                                  />
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}