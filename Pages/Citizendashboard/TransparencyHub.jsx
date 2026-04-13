import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, Shield, AlertCircle, Info, UserCheck, Map, Activity } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function TransparencyHub() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#0f172a]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-8">Synthesizing Audit Data</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 bg-[#0f172a]">
      <AlertCircle className="text-red-500 mb-6" size={64} />
      <h3 className="text-2xl font-black text-white tracking-tight">Encryption Hub Offline</h3>
      <p className="text-slate-400 max-w-xs mt-3 font-medium">Unable to establish a secure connection with the transparency audit server.</p>
      <button onClick={fetchStats} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Re-Authenticate</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Segment */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} />
                Live Transparency Feed
              </span>
              <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Audit Status: Active
              </span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] lg:text-6xl">
              Public Safety <br/> Audit & Performance
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Real-time accountability metrics. Providing citizens with unfiltered access to department efficiency and case resolution statistics.
            </p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-3xl p-8 rounded-[40px] border border-slate-800 flex items-center gap-6 shadow-2xl relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[64px] group-hover:bg-blue-600/20 transition-all"></div>
             <div className="h-16 w-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                <TrendingUp size={32} />
             </div>
             <div>
                <div className="text-[12px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Global Resolution</div>
                <div className="text-4xl font-black text-white tracking-tighter">{stats.resolutionRate}%</div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Reports Audited", value: stats.totalReports, icon: BarChart3, color: "blue" },
            { label: "Solved Content", value: stats.statusBreakdown.find(s => s._id === 'Resolved')?.count || 0, icon: CheckCircle, color: "emerald" },
            { label: "Active Field Work", value: stats.statusBreakdown.find(s => s._id === 'UnderInvestigation')?.count || 0, icon: Clock, color: "amber" },
            { label: "Admin Verified", value: stats.statusBreakdown.find(s => s._id === 'Verified')?.count || 0, icon: UserCheck, color: "indigo" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 p-8 rounded-[40px] border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/60 transition-all group">
              <div className={`h-14 w-14 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-3xl flex items-center justify-center mb-8 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className="text-slate-500 text-[11px] font-black uppercase tracking-[0.1em] mb-2">{stat.label}</div>
              <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Officer Effectiveness */}
          <div className="lg:col-span-2 bg-slate-900/40 rounded-[48px] border border-slate-800/50 overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                 <UserCheck className="text-blue-500" size={32} />
                 Unit Accountability
              </h3>
              <div className="px-4 py-1.5 bg-slate-950 rounded-full border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Sort: Effectiveness
              </div>
            </div>
            <div className="p-10">
              <div className="grid gap-10">
                {stats.officerPerformance.map((officer, i) => (
                  <div key={i} className="group">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xl shadow-blue-600/10 group-hover:scale-105 transition-transform">
                            {(officer.name || "A").slice(0, 1)}
                          </div>
                          <div>
                             <div className="text-lg font-black text-white tracking-tight">{officer.name || "Authorized Personnel"}</div>
                             <div className="flex gap-4 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{officer.email || "Confidential Endpoint"}</span>
                                <span className="text-[11px] text-slate-400">|</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reports: {officer.assigned || 0}</span>
                             </div>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-3xl font-black text-white tracking-tighter">{officer.efficiency}%</div>
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Efficiency</div>
                        </div>
                     </div>
                     <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                          style={{ width: `${officer.efficiency}%` }}
                        ></div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Analysis */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-900/40 rounded-[48px] border border-slate-800/50 p-10">
               <h3 className="text-2xl font-black text-white tracking-tight mb-8 flex items-center gap-3">
                 <Map className="text-indigo-500" size={28} />
                 Common Incidents
               </h3>
               <div className="space-y-6">
                 {stats.crimeTrends?.map((trend, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-3xl border border-slate-800/30">
                      <span className="text-sm font-bold text-slate-300">{trend._id}</span>
                      <span className="h-8 w-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xs font-black text-indigo-400">
                        {trend.count}
                      </span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-blue-600 p-10 rounded-[48px] text-white shadow-2xl shadow-blue-600/10 relative overflow-hidden group">
               <Shield className="absolute -bottom-6 -right-6 opacity-10 h-48 w-48 group-hover:scale-110 transition-transform" />
               <h4 className="text-2xl font-black mb-4 tracking-tighter leading-none">Public Commitment</h4>
               <p className="text-blue-100/80 text-sm font-medium leading-relaxed mb-8">
                 We publish this data to bridge the trust gap. Every investigation is timestamped and cryptographically hashed for complete accountability.
               </p>
               <div className="flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-xl">
                  <span className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Verified Integrity</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Audit Message */}
        <div className="text-center pb-16">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Blockchain Audited Infrastructure • 2026 Public Release</p>
           <div className="h-px w-24 bg-slate-800 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
