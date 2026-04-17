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
  Radio,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronsRight
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
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);

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

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Select first report on the new page
    const pageStartIndex = (pageNumber - 1) * reportsPerPage;
    if (reports.length > pageStartIndex) {
      setSelectedReport(reports[pageStartIndex]);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
    if (reports.length > 0) setSelectedReport(reports[0]);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
    const lastIndex = Math.min(totalPages * reportsPerPage, reports.length) - 1;
    if (lastIndex >= 0) setSelectedReport(reports[lastIndex]);
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
    <div className="min-h-screen bg-primary-dark font-body text-text-primary">
      
      {/* ── PREMIUM WELCOME HEADER ── */}
      <div className="p-8 md:p-10 animate-fade-in">
        <div className="p-8 md:p-12 rounded-[40px] bg-secondary-dark text-white relative overflow-hidden shadow-2xl border border-border-subtle">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-gold via-primary-dark to-primary-dark" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <button 
                  onClick={() => navigate('/citizen')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-dark/50 text-text-secondary font-bold text-[10px] mb-8 uppercase tracking-[3px] border border-border-subtle hover:border-accent-gold hover:text-accent-gold transition-all active:scale-95"
                >
                  <ArrowLeft size={14} /> Return to Dashboard
                </button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-accent-gold text-primary-dark rounded-2xl flex items-center justify-center shadow-xl">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-none font-heading">
                      Live Report  <span className="text-accent-gold">Tracking</span>
                    </h1>
                    <p className="text-text-secondary font-bold text-[10px] mt-2 uppercase tracking-[3px] flex items-center gap-2">
                       <ShieldCheck size={12} className="text-accent-gold" /> Track Your Reports
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Authenticated Records</p>
                    <p className="text-2xl font-bold tabular-nums text-text-primary">{reports.length} Case Logs</p>
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
               <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[4px]">Reported History</h2>
               <Archive size={16} className="text-text-secondary" />
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary-dark rounded-[32px] animate-pulse border border-border-subtle" />)
              ) : reports.length === 0 ? (
                 <div className="ct-card p-16 text-center">
                    <div className="h-16 w-16 bg-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="h-8 w-8 text-text-secondary" />
                    </div>
                    <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">No Active Logs</p>
                 </div>
              ) : (
                <>
                  {currentReports.map(report => (
                    <button 
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full p-8 rounded-[36px] transition-all text-left relative overflow-hidden group border ${
                        selectedReport?._id === report._id 
                        ? "bg-secondary-dark text-text-primary shadow-2xl border-l-8 border-l-accent-gold border-accent-gold/20" 
                        : "bg-secondary-dark/40 text-text-primary border-border-subtle hover:border-accent-gold/50 hover:bg-secondary-dark/60"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                         <span className={`text-[9px] font-bold uppercase tracking-[2px] ${selectedReport?._id === report._id ? 'text-accent-gold' : 'text-text-secondary'}`}>
                           {report.crimeType}
                         </span>
                         <div className={selectedReport?._id === report._id ? "opacity-100 text-accent-gold" : "opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary"}>
                            <ChevronRightIcon size={18} />
                         </div>
                      </div>
                      
                      <h3 className={`text-lg font-bold uppercase leading-tight mb-4 tracking-tight font-heading ${selectedReport?._id === report._id ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                        {report.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-text-secondary">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <MapPin size={12} className={selectedReport?._id === report._id ? "text-accent-gold" : "text-border-subtle"} /> 
                            {report.location?.address?.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <Clock size={12} /> {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 px-2">
                      <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-all ${
                          currentPage === 1 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-secondary-dark text-text-secondary hover:text-accent-gold'
                        }`}
                        title="First Page"
                      >
                        <ChevronsLeft size={16} />
                      </button>
                      
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-all ${
                          currentPage === 1 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-secondary-dark text-text-secondary hover:text-accent-gold'
                        }`}
                        title="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              currentPage === page
                                ? 'bg-accent-gold text-primary-dark'
                                : 'text-text-secondary hover:bg-secondary-dark hover:text-accent-gold'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-all ${
                          currentPage === totalPages 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-secondary-dark text-text-secondary hover:text-accent-gold'
                        }`}
                        title="Next Page"
                      >
                        <ChevronRightIcon size={16} />
                      </button>
                      
                      <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-all ${
                          currentPage === totalPages 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-secondary-dark text-text-secondary hover:text-accent-gold'
                        }`}
                        title="Last Page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── INTELLIGENCE DATA TERMINAL ── */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <div className="space-y-8 animate-fade-in">
                
                {/* STATUS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-6 px-10 py-6 bg-secondary-dark border border-border-subtle rounded-[32px] shadow-lg">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary-dark rounded-xl flex items-center justify-center text-accent-gold shadow-lg border border-border-subtle">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Dispatcher Status</p>
                        <p className="text-xs font-bold text-text-primary mt-1 uppercase">Unit Tracking Active</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Case State:</span>
                      <StatusBadge status={selectedReport.status} />
                   </div>
                </div>

                {/* TRACKING CORE */}
                <div className="bg-secondary-dark rounded-[48px] border border-border-subtle shadow-2xl relative overflow-hidden group">
                   {/* Background Gradient Accent */}
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-gold/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                   
                   <div className="p-12 relative z-10">
                      <h3 className="text-sm font-bold text-text-primary uppercase tracking-[4px] mb-12 flex items-center gap-3 font-heading">
                        <Radio size={18} className="text-accent-gold animate-pulse" /> Timeline of {selectedReport.title}
                      </h3>
                      
                      <div className="space-y-16 pl-4">
                        {getTimeline(selectedReport).map((step, i) => (
                          <div key={i} className="flex gap-10 relative group/step">
                             {/* Connector Line */}
                             {i !== getTimeline(selectedReport).length - 1 && (
                               <div className="absolute top-10 left-[15px] bottom-[-64px] w-[2px] bg-border-subtle group-hover/step:bg-accent-gold/30 transition-colors" />
                             )}
                             
                             {/* Tactical Node */}
                             <div className={`h-8 w-8 rounded-2xl border-4 border-secondary-dark shadow-2xl flex-shrink-0 z-10 transition-all duration-500 group-hover/step:scale-125 ${
                               step.completed ? "bg-accent-gold rotate-45" : "bg-border-subtle"
                             }`} />
                             
                             <div className="flex-1 -mt-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                   <h4 className={`text-lg font-bold uppercase tracking-tighter font-heading ${step.completed ? "text-text-primary" : "text-text-secondary"}`}>
                                     {step.status}
                                   </h4>
                                   <div className="flex items-center gap-2 px-3 py-1 bg-primary-dark/50 border border-border-subtle rounded-lg text-[10px] font-bold text-text-secondary uppercase">
                                     <Calendar size={12} />
                                     {new Date(step.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                     <span className="mx-1 opacity-30">•</span>
                                     {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                   </div>
                                </div>
                                <div className="text-sm text-text-secondary leading-relaxed font-medium bg-primary-dark/30 p-5 rounded-2xl border border-border-subtle group-hover/step:border-accent-gold/30 transition-all">
                                  {step.msg}
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary-dark/20 rounded-[48px] border border-dashed border-border-subtle h-full flex flex-col items-center justify-center p-20 text-center">
                 <div className="h-24 w-24 bg-secondary-dark rounded-full flex items-center justify-center mb-8 border border-border-subtle shadow-xl">
                    <ShieldAlert size={48} className="text-text-secondary/20" />
                 </div>
                 <h3 className="text-xl font-bold text-text-primary uppercase tracking-[2px] mb-2 font-heading">Terminal Ready</h3>
                 <p className="text-sm font-medium text-text-secondary max-w-xs leading-relaxed">
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
