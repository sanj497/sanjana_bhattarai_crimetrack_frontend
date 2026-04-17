import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, FileText, Activity, CheckSquare,
  AlertTriangle, BarChart3
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
    { label: 'Total Cases', value: crimes.length, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'New Cases', value: forwarded.length, icon: FileText, color: 'bg-amber-500' },
    { label: 'In Progress', value: investigating.length, icon: Activity, color: 'bg-indigo-500' },
    { label: 'Resolved', value: resolved.length, icon: CheckSquare, color: 'bg-emerald-500' },
  ];

  const chartData = [
    { name: 'New', value: forwarded.length, color: '#f59e0b' },
    { name: 'In Progress', value: investigating.length, color: '#6366f1' },
    { name: 'Resolved', value: resolved.length, color: '#10b981' },
    { name: 'Total', value: crimes.length, color: '#3b82f6' },
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
          <h2 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor and manage all assigned cases</p>
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
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency SOS Alerts</h3>
            <p className="text-red-200/60 text-sm font-medium">Respond to emergency alerts from citizens in your area.</p>
          </div>
        </div>
        
        <Link
          to="/police/sos"
          className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wide px-10 py-5 rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          View SOS Alerts
        </Link>
      </div>

      {/* Chart Analytics Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl mb-10 w-full hover:border-blue-500/20 transition-all group">
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                      <BarChart3 size={18}/>
                  </div>
                  <h3 className="text-lg font-bold text-white">Case Status Overview</h3>
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}