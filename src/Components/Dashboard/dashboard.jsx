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
  Bell
} from "lucide-react";

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, resolved: 0 });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/stats`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
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
        // Dynamic refresh every 2 minutes
        const interval = setInterval(fetchDashboardData, 120000);
        return () => clearInterval(interval);
    }, []);

    const menu = useMemo(
        () => [
            { name: "Dashboard", icon: <BarChart3 size={18}/>, path: "/dashboard" },
            { name: "Map",       icon: <MapIcon size={18}/>, path: "/Map"       },
            { name: "Reports",   icon: <FileText size={18}/>, path: "/adReport"  },
            { name: "Users",     icon: <UsersIcon size={18}/>, path: "/user"          },
            { name: "Verify",    icon: <ShieldCheck size={18}/>, path: "/forward-admin" },
            { name: "Complaints", icon: <AlertCircle size={18}/>, path: "/Comp"         },
            { name: "Feedback",  icon: <MessageSquare size={18}/>, path: "/admin/feedback" },
        ],
        []
    );

    const StatCard = ({ title, value, sub, icon, color }) => (
        <div
            style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease",
                cursor: "default"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#0f172a" }}>{loading ? "..." : value}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12}/> {sub}
                    </div>
                </div>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: 12,
                        display: "grid", placeItems: "center",
                        background: `${color}15`,
                        color: color,
                        fontSize: 20,
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div
            style={{
                minHeight: "calc(100vh - 80px)",
                background: "#f8fafc",
                color: "#1e293b",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                padding: "32px 40px"
            }}
        >
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 32,
            }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Executive Overview</h2>
                    <p style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>
                        Real-time intelligence and case management statistics.
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                        display: "flex", alignItems: "center", gap: 8, 
                        padding: "8px 16px", background: "#ecfdf5", 
                        border: "1px solid #d1fae5", borderRadius: 12,
                        fontSize: 13, fontWeight: 600, color: "#059669"
                    }}>
                        <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%" }}/>
                        Live System
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>
                
                {/* Left Side: Stats and Activity */}
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    
                    {/* Stat Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
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
                            sub="Unverified input" 
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <div
                            onClick={() => navigate("/Map")}
                            style={{
                                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                                borderRadius: 24, padding: 24,
                                display: "flex", alignItems: "center", gap: 20,
                                cursor: "pointer", transition: "all 0.3s ease",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: "rgba(59, 130, 246, 0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#3b82f6"
                            }}>
                                <MapIcon size={24}/>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>Operational Map</h3>
                                <p style={{ margin: "2px 0 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.4 }}>Visualize live incident locations across active zones.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate("/adReport")}
                            style={{
                                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                                borderRadius: 24, padding: 24,
                                display: "flex", alignItems: "center", gap: 20,
                                cursor: "pointer", transition: "all 0.3s ease",
                                boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.3)"
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: "rgba(255, 255, 255, 0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff"
                            }}>
                                <Send size={24}/>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, color: "#fff", fontSize: 16, fontWeight: 700 }}>Dispatcher Queue</h3>
                                <p style={{ margin: "2px 0 0 0", color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.4 }}>{stats.verified} reports verified and pending police assignment.</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 24, padding: 32,
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ padding: 8, background: "#f1f5f9", borderRadius: 8, color: "#3b82f6" }}>
                                    <Activity size={18}/>
                                </div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Recent Intelligence Feed</h3>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                style={{
                                    all: "unset", cursor: "pointer", fontSize: 13, 
                                    fontWeight: 600, color: "#3b82f6", display: "flex", 
                                    alignItems: "center", gap: 6
                                }}
                            >
                                <RefreshCw size={14}/> Refresh Feed
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {loading ? (
                                [1,2,3].map(i => <div key={i} style={{ height: 72, background: "#f8fafc", borderRadius: 16, animation: "pulse 1.5s infinite" }}/>)
                            ) : activities.length > 0 ? (
                                activities.map((a, i) => (
                                    <div key={i} style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center", padding: "16px 20px",
                                        background: "#f8fafc", border: "1px solid #f1f5f9",
                                        borderRadius: 16, transition: "background 0.2s"
                                    }}>
                                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                            <div style={{ 
                                                width: 40, height: 40, borderRadius: 10, 
                                                background: "#fff", border: "1px solid #e2e8f0",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#64748b"
                                            }}>
                                                <FileText size={18}/>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{a.title}</div>
                                                <div style={{ marginTop: 2, fontSize: 12, color: "#64748b" }}>{a.meta}</div>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: "6px 12px", borderRadius: 8,
                                            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            background: a.badge === "Resolved" || a.badge === "Verified" ? "#ecfdf5" : a.badge === "Pending" ? "#fffbeb" : a.badge === "ForwardedToPolice" ? "#eff6ff" : "#f1f5f9",
                                            color: a.badge === "Resolved" || a.badge === "Verified" ? "#059669" : a.badge === "Pending" ? "#d97706" : a.badge === "ForwardedToPolice" ? "#2563eb" : "#475569",
                                            border: `1px solid ${a.badge === "Resolved" || a.badge === "Verified" ? "#d1fae5" : a.badge === "Pending" ? "#fef3c7" : a.badge === "ForwardedToPolice" ? "#dbeafe" : "#e2e8f0"}`
                                        }}>{a.badge === "ForwardedToPolice" ? "Escalated" : a.badge}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                                    No recent activity recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Actions & Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    
                    {/* Quick Launch */}
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 24, padding: 32,
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                    }}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Operations Desk</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {menu.slice(2).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        all: "unset", cursor: "pointer",
                                        padding: "12px 16px", borderRadius: 12,
                                        display: "flex", alignItems: "center", gap: 12,
                                        transition: "all 0.2s",
                                        background: "#f8fafc", border: "1px solid #f1f5f9"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                                >
                                    <div style={{ color: "#3b82f6" }}>{item.icon}</div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Health Check */}
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 24, padding: 32,
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                    }}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Health Summary</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, color: "#64748b" }}>Resolved Efficiency</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                </span>
                            </div>
                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ 
                                    height: "100%", 
                                    width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%`, 
                                    background: "#10b981", borderRadius: 4 
                                }}/>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 14, color: "#64748b" }}>Backlog Depth</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{stats.pending} cases</span>
                            </div>
                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ 
                                    height: "100%", 
                                    width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`, 
                                    background: "#f59e0b", borderRadius: 4 
                                }}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

const RefreshCw = ({ size }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} height={size} 
        viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" 
        strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);