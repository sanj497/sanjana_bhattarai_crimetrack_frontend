import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Shield, 
  MapPin, 
  Clock, 
  Search, 
  Send, 
  UserCircle2, 
  AlertCircle, 
  Share2, 
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function CommunityBoard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPublicReports();
  }, []);

  const fetchPublicReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/community`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReports(data.reports);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${reportId}/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResponses(data.interactions);
    } catch (err) {
      console.error("Fetch responses error:", err);
    }
  };

  const handlePostResponse = async (e) => {
    e.preventDefault();
    if (!newResponse.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${selectedReport._id}/responses`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newResponse, type: "observation" })
      });
      if (res.ok) {
        setNewResponse("");
        fetchResponses(selectedReport._id);
      }
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openReport = (report) => {
    setSelectedReport(report);
    fetchResponses(report._id);
  };

  const filtered = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.crimeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityStyles = (sev) => {
    switch(sev) {
      case 'Critical': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20';
      case 'High': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20';
      case 'Medium': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20';
      default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 border-slate-100 dark:border-slate-500/20';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-slate-950">
      <div className="w-14 h-14 border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin mb-6 shadow-sm"></div>
      <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[4px] text-[10px] animate-pulse italic">Synchronizing Operational Awareness Registry</p>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto font-sans bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-16 px-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 rotate-3">
               <Users size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[5px] text-blue-600 dark:text-blue-500 italic">Sector Awareness Matrix</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-6 uppercase italic">Community Watch <span className="text-blue-600 underline decoration-blue-500/20 decoration-[12px] underline-offset-8">Datalink</span></h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium max-w-2xl text-lg italic leading-relaxed">
            "Transparency fosters accountability." Explore verified incident reports and collaborate with your neighborhood safety units in real-time.
          </p>
        </div>

        <div className="relative group w-full xl:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-all duration-300" size={24} />
          <input 
            type="text" 
            placeholder="Examine area or vector..." 
            className="pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] w-full shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-black uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
      {/* Main Feed */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
          {filtered.length === 0 ? (
            <div className="p-24 text-center bg-white dark:bg-slate-900/40 rounded-[64px] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner group transition-all hover:border-blue-500/20">
               <div className="h-32 w-32 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-slate-100 dark:border-slate-900 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="text-blue-200 dark:text-blue-900" size={64} />
               </div>
               <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[6px] text-lg italic mb-2">Vault Status: Secure</p>
               <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">No active safety broadcasts archived for this sector.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div 
                key={r._id} 
                className={`p-10 lg:p-12 rounded-[56px] border transition-all cursor-pointer group relative overflow-hidden bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-2xl ${selectedReport?._id === r._id ? 'border-blue-500 ring-[12px] ring-blue-500/5 dark:ring-blue-500/10' : 'border-slate-100 dark:border-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/30'}`}
                onClick={() => openReport(r)}
              >
                {selectedReport?._id === r._id && (
                  <div className="absolute top-0 right-0 p-8">
                    <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 animate-[bounce_2s_infinite]">
                       <ChevronRight size={24} />
                    </div>
                  </div>
                )}
                
                <div className="absolute top-0 left-0 px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[4px] rounded-br-[32px] italic shadow-lg">
                   Security Protocol {r.severity}
                </div>
                
                <div className="mt-10 flex flex-wrap items-center gap-4 mb-8">
                  <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-2 shadow-sm ${getSeverityStyles(r.severity)}`}>
                    {r.severity} Priority
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-200" />
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[3px] flex items-center gap-2 italic">
                    <ShieldCheck size={16} className="text-blue-500" /> Administrative Validation: PASS
                  </span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-blue-600 transition-colors leading-[0.95] tracking-tighter uppercase italic line-clamp-2">
                  {r.title}
                </h3>
                <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-blue-200 transition-colors italic mb-10">
                   <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed italic border-l-4 border-blue-500 pl-8">
                      "SECURITY ADVISORY: {r.description}"
                   </p>
                </div>

                <div className="flex flex-wrap items-center gap-10 pt-8 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest italic group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <MapPin size={18} className="text-blue-600 dark:text-blue-500" />
                    </div>
                    {r.location.address}
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest italic">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <Clock size={18} className="text-blue-500" />
                    </div>
                    Logged: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Intelligence / Context Panel */}
        <div className="lg:col-span-12 xl:col-span-5 relative">
          {selectedReport ? (
            <div className="sticky top-10 bg-white dark:bg-slate-900/60 rounded-[64px] border border-slate-100 dark:border-slate-800/50 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] transition-all">
              <div className="p-12 bg-slate-950 text-white relative group/header">
                 <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                 <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="bg-blue-600 text-white h-14 w-14 rounded-3xl flex items-center justify-center font-black text-xl shadow-2xl shadow-blue-600/30">
                       CT
                    </div>
                    <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                       <Share2 size={24} />
                    </button>
                 </div>
                 <h2 className="text-4xl font-black mb-4 leading-[0.9] uppercase tracking-tighter italic relative z-10">{selectedReport.title || "Subject Datalink"}</h2>
                 <p className="text-blue-500 text-[10px] font-black uppercase tracking-[5px] relative z-10">REGISTRY ID: {(selectedReport._id || "XXXXXXXX").slice(-8).toUpperCase()}</p>
                 
                 <div className="mt-8 flex gap-3 relative z-10">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 italic">Encrypted Secure Session Active</span>
                 </div>
              </div>
              
              <div className="p-12 overflow-y-auto flex-1 bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-950 no-scrollbar">
                 {/* Narrative Block */}
                 <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[4px] text-[10px] italic">
                       <Info size={16} className="text-blue-500" /> Official Objective Summary
                    </div>
                    <div className="bg-white dark:bg-slate-950/80 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm relative italic group font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic">
                       <div className="absolute top-6 left-6 text-blue-500 opacity-5">
                          <Activity size={80} />
                       </div>
                       <p className="relative z-10 border-l-4 border-blue-500/20 pl-6 group-hover:border-blue-500 transition-colors duration-500 leading-loose">"{selectedReport.description}"</p>
                    </div>
                 </div>

                 {/* Responses Feed */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[4px] flex items-center gap-3 italic">
                         <MessageSquare className="text-blue-600 h-5 w-5" />
                         Awareness Hub
                       </h4>
                       <span className="text-[10px] font-black bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-[12px] shadow-lg italic">{responses.length} Collaborative Inputs</span>
                    </div>

                    <div className="space-y-6 mb-12">
                      {responses.map((resp, i) => (
                        <div key={i} className="flex gap-6 group/resp">
                          <div className="shrink-0 h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-[24px] flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold group-hover/resp:scale-110 group-hover/resp:rotate-6 transition-all shadow-inner">
                             <UserCircle2 size={32} />
                          </div>
                          <div className="bg-white dark:bg-slate-950 px-8 py-6 rounded-[32px] border border-slate-100 dark:border-slate-800/50 shadow-sm flex-1 group-hover/resp:shadow-xl transition-all">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-black text-slate-900 dark:text-blue-400 uppercase tracking-widest">{resp.userId?.username || "Neighbor Registry"}</span>
                                <span className="text-[9px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest">{new Date(resp.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic uppercase tracking-tight">"{resp.content}"</p>
                          </div>
                        </div>
                      ))}
                      {responses.length === 0 && (
                        <div className="p-16 text-center bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] shadow-inner mt-4">
                           <TrendingUp className="mx-auto text-slate-200 dark:text-slate-800 mb-6 animate-pulse" size={48} />
                           <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[5px] italic">Awaiting Neighbor Registry Inputs</p>
                        </div>
                      )}
                    </div>

                    {/* Post Interface */}
                    <form onSubmit={handlePostResponse} className="relative sticky bottom-0 mt-12 group/form">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur opacity-20 group-focus-within/form:opacity-40 transition-opacity" />
                      <div className="bg-white dark:bg-slate-900 rounded-[35px] border-2 border-slate-100 dark:border-slate-800 shadow-2xl p-4 flex items-center gap-4 focus-within:border-blue-500 transition-all relative z-10">
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-4 bg-transparent text-sm font-black uppercase tracking-widest outline-none text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                          placeholder="Inject perspective or update..."
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                        />
                        <button 
                          disabled={submitting}
                          className="h-14 w-24 bg-slate-950 dark:bg-blue-600 text-white flex items-center justify-center rounded-[24px] hover:bg-blue-600 transition-all disabled:opacity-30 shadow-xl active:scale-95 group/send"
                        >
                          {submitting ? <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={24} className="group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-300 dark:text-slate-600 font-black text-center mt-6 uppercase tracking-[5px] italic">Digital Integrity Policy: ACTIVE FORCE</p>
                    </form>
                 </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-10 h-[600px] flex flex-col items-center justify-center bg-white dark:bg-slate-900/40 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-inner px-16 text-center group">
               <div className="h-28 w-28 bg-slate-50 dark:bg-slate-950 rounded-[40px] flex items-center justify-center mb-10 border border-slate-100 dark:border-slate-800/50 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                  <Activity className="text-slate-200 dark:text-slate-800" size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4 uppercase italic">Intelligence Selection Required</h3>
               <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed italic border-x-4 border-slate-100 dark:border-slate-800 px-6">
                 Select an incident report from the verified community awareness datalink to analyze the deep intelligence, examine neighborhood perspectives, and inject your localized observations.
               </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
