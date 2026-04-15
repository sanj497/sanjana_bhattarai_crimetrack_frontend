import { useMemo, useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
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
  RefreshCw
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
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all cursor-default"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</div>
                    <div className="text-3xl font-black mt-2 text-slate-900">{loading ? "..." : value}</div>
                    <div className="mt-2 text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock size={10}/> {sub}
                    </div>
                </div>
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${color}15`, color: color }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Executive Overview</h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">Real-time intelligence and community safety coordination.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                        Live Intelligence
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

                    {/* Integrated Map Callout & Forward Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            onClick={() => navigate("/admin/map")}
                            className="bg-slate-900 rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:-translate-y-1 transition-all shadow-xl"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MapIcon size={28}/>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-black uppercase tracking-tight">Operational Map</h3>
                                <p className="text-slate-400 text-xs font-bold mt-1">Visualize live incident locations across active zones.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate("/adReport")}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 flex items-center gap-6 cursor-pointer hover:-translate-y-1 transition-all shadow-xl"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                                <Send size={28}/>
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-black uppercase tracking-tight">Dispatcher Queue</h3>
                                <p className="text-white/70 text-xs font-bold mt-1">{stats.verified} reports verified and pending police assignment.</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-xl text-blue-600">
                                    <Activity size={18}/>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Intelligence Feed</h3>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
                            >
                                <RefreshCw size={14}/> Force Refresh
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {loading ? (
                                [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"/>)
                            ) : activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                <FileText size={18}/>
                                            </div>
                                            <div>
                                                <div className="font-black text-sm text-slate-900">{a.title}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">{a.meta}</div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                          a.badge === "Resolved" || a.badge === "Verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                          a.badge === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                          "bg-blue-50 text-blue-600 border-blue-100"
                                        }`}>
                                          {a.badge === "ForwardedToPolice" ? "Escalated" : a.badge}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-bold text-sm">
                                    No recent activity recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Emergency Hub & Actions */}
                <div className="flex flex-col gap-8">
                    
                    {/* EMERGENCY RESPONSE QUEUE (THE NEW SECTION) */}
                    <div className="bg-white border-2 border-rose-100 rounded-[32px] p-8 shadow-[0_20px_40px_-15px_rgba(225,29,72,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"/>
                        
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Emergency Hub</h3>
                            <p className="text-[9px] font-bold text-rose-500 uppercase mt-1">Pending Alerts</p>
                          </div>
                          {alertQueue.length > 0 && (
                            <span className="bg-rose-600 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-rose-600/30">
                              {alertQueue.length}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                            {alertQueue.length > 0 ? (
                              alertQueue.map((item, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => navigate(`/admin/verify/${item._id}`)}
                                  className="p-5 bg-rose-50 border border-rose-100 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all hover:bg-rose-100 group"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">{item.crimeType}</span>
                                  </div>
                                  <div className="text-xs font-black text-slate-900 leading-tight group-hover:text-rose-700 transition-colors uppercase">{item.title}</div>
                                  <div className="text-[9px] font-bold text-slate-400 mt-2 flex items-center gap-1 italic">
                                    <MapPin size={10} /> Local Alert Required
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <ShieldCheck size={20} className="text-slate-300" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zones Secured</p>
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Launch */}
                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Operations Desk</h3>
                        <div className="flex flex-col gap-3">
                            {menu.slice(2).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                                >
                                    <div className="text-blue-400 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Health Check */}
                    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">System Health</h3>
                        <div className="flex flex-col gap-6">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution Rate</span>
                                  <span className="text-xs font-black text-slate-900">
                                      {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                  </span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                                  />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Review Backlog</span>
                                  <span className="text-xs font-black text-amber-600">{stats.pending} Reports</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 transition-all duration-1000"
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