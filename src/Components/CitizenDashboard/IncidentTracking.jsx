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
  MoreHorizontal,
  ArrowLeft,
  Calendar,
  User,
  ShieldAlert,
  Archive,
  MessageSquare
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
    <div className={`px-3 py-1 bg-${ctx.color}-50 text-${ctx.color}-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-${ctx.color}-100 flex items-center gap-1.5`}>
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
        setReports(data.crimes);
        if (data.crimes.length > 0) setSelectedReport(data.crimes[0]);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeline = (report) => {
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
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Tactical Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Incident Intelligence Log</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tactical Tracking Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
               Total Records: {reports.length}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* List Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Incident History</h2>
               <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Archive size={14}/></div>
            </div>

            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)
            ) : reports.length === 0 ? (
               <div className="bg-white rounded-[32px] p-10 text-center border border-slate-100">
                  <p className="text-slate-400 text-sm font-medium">No incident logs found.</p>
               </div>
            ) : (
              reports.map(report => (
                <button 
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full p-6 bg-white rounded-[32px] border transition-all text-left group relative overflow-hidden ${
                    selectedReport?._id === report._id 
                    ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500" 
                    : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  {selectedReport?._id === report._id && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[9px] font-black text-blue-500 uppercase tracking-[2px]">{report.crimeType}</span>
                     <StatusBadge status={report.status} />
                  </div>
                  
                  <h3 className="text-base font-black text-slate-900 uppercase leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <MapPin size={12} /> {report.location?.address?.split(',')[0]}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Details Section */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                {/* Tactical Card */}
                <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Shield size={200} />
                   </div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 w-12 bg-blue-500 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-[4px] text-blue-400">Tactical Summary</span>
                      </div>
                      
                      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                        {selectedReport.title}
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-8 mt-10">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Reference ID</p>
                            <p className="text-xs font-mono font-bold text-slate-300">#{selectedReport._id.slice(-8).toUpperCase()}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Priority Level</p>
                            <p className={`text-xs font-black uppercase ${
                              selectedReport.priority === 'High' ? 'text-rose-500' : 'text-blue-400'
                            }`}>{selectedReport.priority}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-[2px] mb-10 flex items-center gap-3">
                     <Activity size={18} className="text-blue-500" /> Event Timeline
                   </h3>
                   
                   <div className="space-y-12">
                     {getTimeline(selectedReport).map((step, i) => (
                       <div key={i} className="flex gap-6 relative group">
                          {/* Line */}
                          {i !== getTimeline(selectedReport).length - 1 && (
                            <div className="absolute top-8 left-[11px] bottom-[-48px] w-0.5 bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                          )}
                          
                          <div className={`h-6 w-6 rounded-full border-4 border-white shadow-md flex-shrink-0 z-10 transition-transform group-hover:scale-110 ${
                            step.completed ? "bg-blue-500" : "bg-slate-200"
                          }`} />
                          
                          <div className="flex-1 -mt-1">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className={`text-sm font-black uppercase tracking-tight ${step.completed ? "text-slate-900" : "text-slate-400"}`}>
                                  {step.status}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(step.date).toLocaleDateString()} • {new Date(step.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                             <p className="text-xs text-slate-500 leading-relaxed font-medium">
                               {step.msg}
                             </p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Incident Action File */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><User size={16}/></div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Assigned Personnel</h4>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black">
                            {selectedReport.workflow?.assignedToOfficer?.username?.[0] || 'D'}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">{selectedReport.workflow?.assignedToOfficer?.username || "Dispatching Officer"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field Operative</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><MessageSquare size={16}/></div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Case Discussion</h4>
                      </div>
                      
                      <button className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                        Open Support Channel
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-50">
                 <ShieldAlert size={64} className="text-slate-200 mb-6" />
                 <p className="text-sm font-medium text-slate-400 italic">Select an incident log from the history to view tactical telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
