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
  ShieldCheck
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
    <div className={`px-4 py-1.5 bg-${ctx.color}-500/10 text-${ctx.color}-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-${ctx.color}-500/20 backdrop-blur-sm flex items-center gap-1.5`}>
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
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* ── PREMIUM WELCOME HEADER (MATCHING OVERVIEW) ── */}
      <div className="p-8 md:p-10">
        <div className="p-8 md:p-12 rounded-[40px] bg-[#020617] text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-800">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-[#020617] to-[#020617]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <button 
                  onClick={() => navigate('/citizen')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/60 font-bold text-[10px] mb-8 uppercase tracking-[3px] border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                >
                  <ArrowLeft size={14} /> Return to Dashboard
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                      Incident <span className="text-blue-500">Tracker</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-[3px] flex items-center gap-2">
                       <ShieldCheck size={12} className="text-blue-500" /> Professional Intelligence Monitoring
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Records</p>
                    <p className="text-2xl font-black tabular-nums">{reports.length} Case Logs</p>
                 </div>
                 <div className="h-16 w-px bg-slate-800" />
                 <div className="h-16 w-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-blue-500">
                    <Shield size={28} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ── INCIDENT HISTORY LOG ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2 px-4">
               <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Audit History</h2>
               <Archive size={16} className="text-slate-300" />
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse border border-slate-100" />)
              ) : reports.length === 0 ? (
                 <div className="bg-white rounded-[40px] p-16 text-center border border-slate-100 shadow-sm">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">No Active Logs</p>
                 </div>
              ) : (
                reports.map(report => (
                  <button 
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-8 rounded-[36px] transition-all text-left relative overflow-hidden group ${
                      selectedReport?._id === report._id 
                      ? "bg-[#020617] text-white shadow-2xl shadow-blue-900/20 border-l-8 border-l-blue-600" 
                      : "bg-white text-slate-900 border border-slate-100 hover:border-blue-500/30 hover:shadow-lg shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                       <span className={`text-[9px] font-black uppercase tracking-[2px] ${selectedReport?._id === report._id ? 'text-blue-400' : 'text-blue-600'}`}>
                         {report.crimeType}
                       </span>
                       <div className={selectedReport?._id === report._id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}>
                          <ChevronRight size={18} />
                       </div>
                    </div>
                    
                    <h3 className={`text-lg font-black uppercase leading-tight mb-4 tracking-tight ${selectedReport?._id === report._id ? 'text-white' : 'text-slate-900'}`}>
                      {report.title}
                    </h3>
                    
                    <div className={`flex items-center gap-4 ${selectedReport?._id === report._id ? 'text-slate-400' : 'text-slate-400'}`}>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <MapPin size={12} className={selectedReport?._id === report._id ? "text-blue-500" : "text-slate-300"} /> 
                          {report.location?.address?.split(',')[0]}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <Clock size={12} /> {new Date(report.createdAt).toLocaleDateString()}
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
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                
                {/* STATUS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-6 px-10 py-6 bg-white border border-slate-200 rounded-[32px] shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Dispatcher Status</p>
                        <p className="text-xs font-black text-slate-900 mt-1 uppercase">Unit Tracking Active</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case State:</span>
                      <StatusBadge status={selectedReport.status} />
                   </div>
                </div>

                {/* TRACKING CORE */}
                <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                   {/* Background Gradient Accent */}
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-1000" />
                   
                   <div className="p-12 relative z-10">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[4px] mb-12 flex items-center gap-3">
                        <Radio size={18} className="text-blue-600 animate-pulse" /> Live Telemetry Timeline
                      </h3>
                      
                      <div className="space-y-16 pl-4">
                        {getTimeline(selectedReport).map((step, i) => (
                          <div key={i} className="flex gap-10 relative group/step">
                             {/* Connector Line */}
                             {i !== getTimeline(selectedReport).length - 1 && (
                               <div className="absolute top-10 left-[15px] bottom-[-64px] w-[2px] bg-slate-100 group-hover/step:bg-blue-100 transition-colors" />
                             )}
                             
                             {/* Tactical Node */}
                             <div className={`h-8 w-8 rounded-2xl border-4 border-white shadow-2xl flex-shrink-0 z-10 transition-all duration-500 group-hover/step:scale-125 ${
                               step.completed ? "bg-blue-600 rotate-45 shadow-blue-500/40" : "bg-slate-200"
                             }`} />
                             
                             <div className="flex-1 -mt-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                   <h4 className={`text-lg font-black uppercase tracking-tighter ${step.completed ? "text-slate-900" : "text-slate-400"}`}>
                                     {step.status}
                                   </h4>
                                   <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                                     <Calendar size={12} />
                                     {new Date(step.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                     <span className="mx-1 opacity-30">•</span>
                                     {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                   </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-semibold bg-slate-50/50 p-5 rounded-2xl border border-slate-50 group-hover/step:bg-blue-50/30 group-hover/step:border-blue-100 transition-all">
                                  {step.msg}
                                </p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* ADDITIONAL ASSETS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                           <User size={22} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Investigation Staff</p>
                           <h4 className="text-base font-black text-slate-900 mt-1 uppercase tracking-tight">Assigned Personnel</h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-[28px] border border-slate-100">
                         <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                            {selectedReport.workflow?.assignedToOfficer?.username?.[0] || 'D'}
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-900 leading-none">
                              {selectedReport.workflow?.assignedToOfficer?.username || "Dispatch Queue"}
                            </p>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] mt-2">Certified Operative</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-[#020617] rounded-[40px] p-10 border border-slate-800 shadow-xl text-white group overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-12 w-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-blue-500">
                             <MessageSquare size={22} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Operational Support</p>
                             <h4 className="text-base font-black text-white mt-1 uppercase tracking-tight">Direct Comms</h4>
                          </div>
                        </div>
                        
                        <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">
                          Secure end-to-end encrypted channel with your investigating officer. Authorized use only.
                        </p>
                        
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                          <Shield size={14}/> Initiate Feedback
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[48px] border border-dashed border-slate-300 h-full flex flex-col items-center justify-center p-20 text-center">
                 <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                    <ShieldAlert size={48} className="text-slate-200" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-[2px] mb-2">Terminal Ready</h3>
                 <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                    Select an active intelligence log from the history panel to initialize the tracking sequence.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
