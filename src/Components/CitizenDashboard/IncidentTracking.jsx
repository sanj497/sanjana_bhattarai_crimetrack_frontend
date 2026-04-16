import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Search, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  User,
  ShieldAlert,
  Archive,
  MessageSquare,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { label: "In Review", color: "amber", icon: <Clock size={12} /> },
    Verified: { label: "Verified", color: "emerald", icon: <CheckCircle2 size={12} /> },
    ForwardedToPolice: { label: "Dispatched", color: "blue", icon: <Activity size={12} /> },
    UnderInvestigation: { label: "Investigation", color: "indigo", icon: <Search size={12} /> },
    Resolved: { label: "Resolved", color: "cyan", icon: <CheckCircle2 size={12} /> },
    Rejected: { label: "Rejected", color: "rose", icon: <AlertCircle size={12} /> }
  };
  
  const ctx = config[status] || config.Pending;
  
  return (
    <div className={`px-4 py-1.5 bg-${ctx.color}-500/10 text-${ctx.color}-600 dark:text-${ctx.color}-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-${ctx.color}-500/20 backdrop-blur-sm flex items-center gap-1.5`}>
      {ctx.icon}
      {ctx.label}
    </div>
  );
};

export default function IncidentTracking() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.crimes || []);
        if (data.crimes?.length > 0) setSelectedReport(data.crimes[0]);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeline = (report) => {
    if (!report) return [];
    const timeline = [
      { 
        status: "Reported", 
        date: report.createdAt, 
        msg: "Your intelligence report was successfully received by the command center.",
        completed: true 
      }
    ];

    if (report.workflow?.verifiedAt) {
      timeline.push({
        status: "Verified",
        date: report.workflow.verifiedAt,
        msg: "Incident data validated. Tactical units notified.",
        completed: true
      });
    }

    if (report.workflow?.forwardedAt) {
      timeline.push({
        status: "Dispatched",
        date: report.workflow.forwardedAt,
        msg: "Case intelligence forwarded to the regional police headquarters.",
        completed: true
      });
    }

    if (report.workflow?.assignedAt) {
      timeline.push({
        status: "Investigating",
        date: report.workflow.assignedAt,
        msg: `Assigned to Detective ${report.workflow.assignedToOfficer?.username || "ID#742"}. Investigation active.`,
        completed: true
      });
    }

    if (report.workflow?.resolvedAt) {
      timeline.push({
        status: "Resolved",
        date: report.workflow.resolvedAt,
        msg: "Case investigation concluded with positive resolution outcome.",
        completed: true
      });
    }

    return timeline.reverse();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] font-sans transition-colors duration-300">
      
      {/* ── PREMIUM WELCOME HEADER ── */}
      <div className="p-8 lg:p-12">
        <div className="p-10 lg:p-14 rounded-[56px] bg-slate-900 dark:bg-slate-900/60 text-white relative overflow-hidden shadow-2xl border border-slate-800 transition-all duration-500">
          <div className="absolute inset-0 z-0 opacity-40">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="flex-1">
                <button 
                  onClick={() => navigate('/citizen')}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 text-white/70 font-black text-[10px] mb-10 uppercase tracking-[4px] border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95 group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Command Area
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-4">
                  <div className="h-20 w-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] group hover:scale-105 transition-transform duration-500">
                    <Activity size={40} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.85] italic mb-4">
                      Incident <br className="hidden lg:block"/> <span className="text-blue-500 underline decoration-blue-500/30 decoration-8 underline-offset-8">Tracker</span>
                    </h1>
                    <p className="text-slate-400 font-black text-[10px] mt-4 uppercase tracking-[5px] flex items-center gap-3">
                       <ShieldCheck size={14} className="text-blue-500" /> Operational Log Monitoring Grid
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 self-end lg:self-center">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mb-2 font-mono">Archive Volume</p>
                    <p className="text-5xl font-black tabular-nums tracking-tighter italic">{reports.length}<span className="text-xs text-slate-600 ml-2">Units</span></p>
                 </div>
                 <div className="h-24 w-px bg-slate-800/50" />
                 <div className="h-20 w-20 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 flex items-center justify-center text-blue-500 shadow-inner group transition-all">
                    <Shield size={40} className="group-hover:scale-110 transition-transform" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-8 lg:px-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── INCIDENT HISTORY LOG ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between mb-2 px-6">
               <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[6px] italic">Datalink Archive</h2>
               <Archive size={18} className="text-slate-300 dark:text-slate-800" />
            </div>

            <div className="space-y-6 max-h-[900px] overflow-y-auto pr-3 no-scrollbar custom-scrollbar">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-36 bg-slate-50 dark:bg-slate-900/40 rounded-[48px] animate-pulse border border-slate-100 dark:border-slate-800/50" />)
              ) : reports.length === 0 ? (
                 <div className="bg-slate-50 dark:bg-slate-900/20 rounded-[56px] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                    <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Clock className="h-10 w-10 text-slate-200 dark:text-slate-800" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 text-xs font-black uppercase tracking-[5px] italic">Zero Active Feed</p>
                 </div>
              ) : (
                reports.map(report => (
                  <button 
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-10 rounded-[48px] transition-all text-left relative overflow-hidden group ${
                      selectedReport?._id === report._id 
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-2xl shadow-blue-900/20 border-l-8 border-l-blue-500" 
                      : "bg-white dark:bg-slate-900/40 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 hover:shadow-2xl shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-8 relative z-10">
                       <span className={`text-[9px] font-black uppercase tracking-[3px] px-3 py-1 rounded-full ${selectedReport?._id === report._id ? 'bg-white/10 text-blue-300' : 'bg-blue-500/5 text-blue-600 dark:text-blue-500'}`}>
                         {report.crimeType}
                       </span>
                       <div className={`${selectedReport?._id === report._id ? "opacity-40" : "opacity-0 group-hover:opacity-100"} transition-all duration-500 group-hover:translate-x-1`}>
                          <ChevronRight size={24} />
                       </div>
                    </div>
                    
                    <h3 className={`text-2xl font-black uppercase leading-none mb-6 tracking-tighter italic ${selectedReport?._id === report._id ? 'text-white' : 'text-slate-900 dark:text-white dark:group-hover:text-blue-500 transition-colors'}`}>
                      {report.title}
                    </h3>
                    
                    <div className={`flex items-center gap-6 relative z-10 ${selectedReport?._id === report._id ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <MapPin size={14} className={selectedReport?._id === report._id ? "text-blue-400" : "text-slate-300 dark:text-slate-700"} /> 
                          {report.location?.address?.split(',')[0]}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <Clock size={14} className={selectedReport?._id === report._id ? "text-blue-400" : "text-slate-300 dark:text-slate-700"} /> {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── INTELLIGENCE DATA TERMINAL ── */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* STATUS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-8 px-12 py-8 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-[48px] shadow-sm backdrop-blur-md">
                   <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl group cursor-help transition-transform hover:scale-110">
                        <Navigation size={24} className="group-hover:animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px] leading-none mb-2">Dispatcher Status</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none italic">Unit Grid Tracking Active</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] italic">Lifecycle state:</span>
                      <StatusBadge status={selectedReport.status} />
                   </div>
                </div>

                {/* TRACKING CORE */}
                <div className="bg-white dark:bg-slate-900/40 rounded-[72px] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden group">
                   {/* Background Gradient Accent */}
                   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.03] dark:bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000" />
                   
                   <div className="p-16 lg:p-20 relative z-10">
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-[6px] mb-16 flex items-center gap-4 italic underline decoration-blue-500 decoration-4 underline-offset-8">
                        <Radio size={24} className="text-blue-600 animate-pulse" /> Telemetry Timeline
                      </h3>
                      
                      <div className="space-y-20 pl-6 border-l-2 border-slate-50 dark:border-slate-800/50">
                        {getTimeline(selectedReport).map((step, i) => (
                          <div key={i} className="flex gap-12 relative group/step">
                             {/* Tactical Node */}
                             <div className={`absolute -left-[35px] h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 shadow-2xl flex-shrink-0 z-10 transition-all duration-700 group-hover/step:scale-150 ${
                               step.completed ? "bg-blue-600 shadow-blue-500/50" : "bg-slate-200 dark:bg-slate-800"
                             }`} />
                             
                             <div className="flex-1 -mt-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                   <h4 className={`text-2xl font-black uppercase tracking-tighter italic ${step.completed ? "text-slate-900 dark:text-white group-hover/step:text-blue-500 transition-colors" : "text-slate-300 dark:text-slate-700"}`}>
                                     {step.status}
                                   </h4>
                                   <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest shadow-inner">
                                     <Calendar size={14} className="text-blue-500" />
                                     {new Date(step.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                     <span className="mx-2 opacity-20">|</span>
                                     {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', hour12: true })}
                                   </div>
                                </div>
                                <div className="p-8 bg-slate-50 dark:bg-slate-950/40 rounded-[32px] border border-slate-50 dark:border-slate-800/30 group-hover/step:bg-white dark:group-hover/step:bg-slate-900 group-hover/step:border-blue-500/20 shadow-sm transition-all duration-500">
                                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                                    "{step.msg}"
                                  </p>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* ADDITIONAL ASSETS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-white dark:bg-slate-900/60 rounded-[56px] p-12 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                           <User size={32} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] leading-none mb-2 font-mono italic text-left">Internal Staffing</p>
                           <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-left">Assigned Liaison</h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 p-6 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-inner group-hover:border-blue-500/30 transition-all duration-500">
                         <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] flex items-center justify-center text-3xl font-black shadow-2xl italic group-hover:rotate-6 transition-transform">
                            {selectedReport.workflow?.assignedToOfficer?.username?.[0] || 'D'}
                         </div>
                         <div className="text-left">
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic mb-2">
                              {selectedReport.workflow?.assignedToOfficer?.username || "Central Dispatch"}
                            </p>
                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[3px] opacity-70">Certified Field Investigator</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-950 dark:bg-slate-900/60 rounded-[56px] p-12 border border-slate-800 shadow-2xl text-white group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-10">
                          <div className="h-16 w-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-blue-500 shadow-xl group-hover:rotate-12 transition-transform">
                             <MessageSquare size={32} />
                          </div>
                          <div className="text-left">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] leading-none mb-2 font-mono italic">Operational Feed</p>
                             <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Intelligence Comms</h4>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-400 font-bold mb-10 leading-relaxed uppercase tracking-widest opacity-80 text-left">
                          Authorized end-to-end encrypted channel for operational updates.
                        </p>
                        
                        <button className="w-full py-6 bg-blue-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[5px] hover:bg-white hover:text-blue-600 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-3 italic">
                          <Shield size={16}/> Initial Tactical Feedback
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-[72px] border-[4px] border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-24 text-center group">
                 <div className="h-32 w-32 bg-white dark:bg-slate-900 rounded-[48px] flex items-center justify-center mb-10 shadow-2xl border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-all duration-700">
                    <ShieldAlert size={64} className="text-slate-100 dark:text-slate-800 group-hover:text-blue-500/20 transition-colors" />
                 </div>
                 <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4 leading-none underline decoration-blue-500/10 decoration-8 underline-offset-8">Terminal Idle</h3>
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[6px] max-w-sm leading-relaxed italic mt-6">
                    Select an active intelligence node from the archive to synchronize status data.
                 </p>
              </div>
            )}
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
