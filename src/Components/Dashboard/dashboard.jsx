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
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, resolved: 0 });
    const [activities, setActivities] = useState([]);
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


    useEffect(() => {
        fetchDashboardData();
        
        const handleNotification = () => {
            fetchDashboardData();
        };
        
        window.addEventListener("new-notification-received", handleNotification);
        const interval = setInterval(() => {
            fetchDashboardData();
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
        <div className="ct-card group">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-xs text-text-secondary mb-1 font-medium">{title}</div>
                    <div className="text-3xl font-bold text-text-primary">{loading ? "..." : value}</div>
                    <div className="mt-3 text-xs text-text-secondary font-medium flex items-center gap-1">
                        <Clock size={12} className="text-accent-gold"/> {sub}
                    </div>
                </div>
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${color}20`, color: color }}
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
        <div className="min-h-screen bg-primary-dark p-section text-text-secondary font-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-section">
                <div>
                    <h1 className="text-text-primary mb-1">Welcome to the CrimeTrack Admin </h1>
                   
                </div>


            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-section">
                
                {/* Left Side: Stats and Activity */}
                <div className="flex flex-col gap-section">
                    
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-default">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-default w-full">
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
                                 <MapIcon size={18} className="text-blue-500" /> Live Response Map
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
                            className="bg-gradient-to-br from-accent-gold to-soft-gold rounded-card p-section flex items-center gap-6 cursor-pointer hover:-translate-y-1 transition-all shadow-xl h-[250px]"
                        >
                            <div className="w-14 h-14 rounded-lg bg-primary-dark/20 flex flex-col items-center justify-center text-primary-dark shrink-0 shadow-inner">
                                <Send size={24}/>
                            </div>
                            <div>
                                <h3 className="text-primary-dark text-xl font-bold">Dispatcher Queue</h3>
                                <p className="text-primary-dark/80 text-sm mt-2 leading-relaxed">{stats.verified} reports have been verified and are pending police assignment.</p>
                                
                                <button className="mt-4 px-6 py-2.5 bg-primary-dark text-accent-gold rounded-button text-xs font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                  Assign Units Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart Analytics Section */}
                    <div className="ct-card w-full">
                        <div className="flex justify-between items-center mb-section">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-accent-gold/10 rounded-lg text-accent-gold">
                                    <BarChart3 size={20}/>
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary">Crime Statistics</h3>
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
                </div>

                {/* Right Side: Emergency Hub & Actions */}
                <div className="flex flex-col gap-section">
                    

                    {/* Quick Launch */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[48px] p-10 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-8">Quick Actions</h3>
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
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-8">System Status</h3>
                        <div className="flex flex-col gap-8">
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solved Cases</span>
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
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Cases</span>
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