import { useState, useEffect } from "react";
import React from "react";
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  MapPin, 
  User, 
  Search, 
  Send, 
  ShieldAlert, 
  Plus, 
  X,
  History,
  Activity,
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;
const CATEGORIES = ["Theft", "Assault", "Vandalism", "Fraud", "Other"];

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { label: "Pending", color: "warning" },
    Verified: { label: "Verified", color: "info" },
    "In Progress": { label: "In Progress", color: "primary" },
    Solved: { label: "Solved", color: "success" },
  };
  
  const ctx = config[status] || { label: status, color: "secondary" };
  
  return (
    <div className={`px-4 py-1.5 bg-accent-gold/10 text-accent-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-gold/20 flex items-center gap-1.5`}>
      <div className="w-1.5 h-1.5 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
      {ctx.label}
    </div>
  );
};

const Timeline = ({ history }) => (
  <div className="space-y-6 mt-6">
    {history.map((h, i) => (
      <div key={i} className="flex gap-4 relative group">
        <div className="flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-gold z-10 shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
          {i < history.length - 1 && <div className="w-0.5 flex-1 bg-border-subtle my-1" />}
        </div>
        <div className="pb-4 -mt-1 flex-1">
          <div className="flex items-center justify-between mb-2">
            <StatusBadge status={h.status} />
            <span className="text-[10px] font-bold text-text-secondary uppercase">{new Date(h.changedAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm font-medium text-text-primary bg-primary-dark/50 p-4 rounded-xl border border-border-subtle group-hover:border-accent-gold/30 transition-all">
            {h.note}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Request failed");
  return data;
};

export default function UserApp() {
  const [complaints, setComplaints] = useState([]);
  const [trackData, setTrackData]   = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [submitForm, setSubmitForm] = useState({ title: "", description: "", category: "Theft", address: "" });

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const data = await authFetch("/complaints/my");
      setComplaints(data.complaints);
    } catch (e) { 
      setError(e.message); 
      toast.error(e.message);
    }
    setLoading(false);
  };

  const trackStatus = async (id) => {
    try {
      const data = await authFetch(`/complaints/${id}/track`);
      setTrackData(data.complaint);
    } catch (e) { 
      setError(e.message); 
      toast.error(e.message);
    }
  };

  const submitComplaint = async () => {
    if (!submitForm.title || !submitForm.description) { 
      toast.warning("Title and description are required."); 
      return; 
    }
    setLoading(true);
    try {
      await authFetch("/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: submitForm.title,
          description: submitForm.description,
          category: submitForm.category,
          location: { address: submitForm.address },
        }),
      });
      setShowSubmit(false);
      setSubmitForm({ title: "", description: "", category: "Theft", address: "" });
      fetchMyComplaints();
      toast.success("Complaint submitted successfully.");
    } catch (e) { 
      setError(e.message); 
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMyComplaints(); }, []);

  return (
    <div className="min-h-screen bg-primary-dark font-body text-text-primary px-8 py-10">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-accent-gold/10 text-accent-gold rounded-xl border border-accent-gold/20 shadow-lg">
                 <MessageSquare size={24} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight font-heading">Citizen <span className="text-accent-gold">Complaints</span></h1>
            </div>
            <p className="text-text-secondary font-medium ml-1">Official grievance and incident escalation portal.</p>
          </div>
          <button 
            onClick={() => setShowSubmit(true)}
            className="ct-btn-primary flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Submit New Formal Complaint
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {loading && !complaints.length ? (
          <div className="flex justify-center items-center py-20">
             <Activity className="h-10 w-10 text-accent-gold animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="ct-card p-20 text-center flex flex-col items-center border-dashed border-2 animate-fade-in">
             <div className="h-20 w-20 bg-secondary-dark rounded-3xl flex items-center justify-center mb-6 border border-border-subtle text-text-secondary opacity-30">
                <FileText size={40} />
             </div>
             <h3 className="text-xl font-bold font-heading mb-2">No Active Records</h3>
             <p className="text-text-secondary max-w-sm mb-8">You haven't filed any complaints yet. All reported grievances will appear here with tracking data.</p>
             <button onClick={() => setShowSubmit(true)} className="ct-btn-secondary">File First Complaint</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {complaints.map((c) => (
              <div key={c._id} className="ct-card border border-border-subtle hover:border-accent-gold/40 group transition-all">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest bg-accent-gold/10 px-2 py-1 rounded-lg">
                    {c.category}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <h4 className="text-lg font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-accent-gold transition-colors">{c.title}</h4>
                <div className="flex items-center gap-2 text-text-secondary text-xs font-medium mb-8">
                  <Clock size={12} />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => trackStatus(c._id)}
                  className="w-full py-3 bg-primary-dark border border-border-subtle rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:bg-accent-gold hover:text-primary-dark hover:border-accent-gold transition-all flex items-center justify-center gap-2"
                >
                  <Search size={14} /> 
                  Track Full Timeline
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRACK MODAL */}
      {trackData && (
        <div className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-secondary-dark w-full max-w-xl rounded-[32px] border border-border-subtle shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent-gold/10 text-accent-gold rounded-xl border border-accent-gold/20">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary font-heading">Complaint Terminal</h3>
                    <p className="text-xs text-text-secondary font-medium">Case ID: {trackData._id.slice(-8).toUpperCase()}</p>
                  </div>
               </div>
               <button onClick={() => setTrackData(null)} className="p-2 text-text-secondary hover:text-danger transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="mb-10 bg-primary-dark/50 p-6 rounded-2xl border border-border-subtle">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-text-primary">{trackData.title}</h4>
                  <StatusBadge status={trackData.status} />
               </div>
               <p className="text-sm text-text-secondary leading-relaxed mb-6 font-medium italic">"{trackData.description}"</p>
               
               {trackData.assignedOfficer && (
                 <div className="flex items-center gap-3 p-3 bg-accent-gold/5 rounded-xl border border-accent-gold/10">
                   <div className="h-8 w-8 bg-accent-gold text-primary-dark rounded-lg flex items-center justify-center font-bold">
                      <User size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest leading-none">Handling Operative</p>
                      <p className="text-sm font-bold text-text-primary mt-1">{trackData.assignedOfficer.name}</p>
                   </div>
                 </div>
               )}
            </div>

            <div className="flex items-center gap-2 mb-6 text-text-secondary/60 text-[10px] uppercase font-bold tracking-[3px]">
               <Plus className="rotate-45" size={12} /> Live Status Feed
            </div>
            <Timeline history={trackData.statusHistory || []} />

            <div className="mt-10 flex justify-end">
               <button onClick={() => setTrackData(null)} className="ct-btn-secondary px-8">Close Terminal</button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT MODAL */}
      {showSubmit && (
        <div className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-secondary-dark w-full max-w-xl rounded-[32px] border border-border-subtle shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-10">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent-gold/10 text-accent-gold rounded-xl border border-accent-gold/20">
                    <Send size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary font-heading">Lodge Complaint</h3>
               </div>
               <button onClick={() => setShowSubmit(false)} className="p-2 text-text-secondary hover:text-danger transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1 tracking-widest">Case Title</label>
                <input 
                  type="text" 
                  placeholder="Summarize the core grievance..." 
                  className="w-full px-5 py-3.5 bg-primary-dark border border-border-subtle rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all font-medium text-sm"
                  value={submitForm.title} onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })} 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1 tracking-widest">Incident Category</label>
                <select 
                  className="w-full px-5 py-3.5 bg-primary-dark border border-border-subtle rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                  value={submitForm.category} onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })}
                >
                  {CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1 tracking-widest">Incident Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-border-subtle" size={16} />
                  <input 
                    type="text" 
                    placeholder="Specific area or point of interest..." 
                    className="w-full pl-12 pr-5 py-3.5 bg-primary-dark border border-border-subtle rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all font-medium text-sm"
                    value={submitForm.address} onChange={e => setSubmitForm({ ...submitForm, address: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1 tracking-widest">Full Description</label>
                <textarea 
                  rows={4} 
                  placeholder="Provide comprehensive details about the incident for the handling officer..." 
                  className="w-full px-5 py-3.5 bg-primary-dark border border-border-subtle rounded-2xl text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all font-medium text-sm resize-none"
                  value={submitForm.description} onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })} 
                />
              </div>

              <div className="flex gap-4 items-center p-4 bg-primary-dark/50 rounded-2xl border border-border-subtle border-l-danger border-l-4">
                 <ShieldAlert className="text-danger flex-shrink-0" size={20} />
                 <p className="text-[10px] font-bold text-text-secondary leading-tight uppercase tracking-wider">Note: All complaints are legally binding reports. False claims are punishable under cyber law.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowSubmit(false)} className="ct-btn-secondary flex-1">Abort Submission</button>
                <button 
                  onClick={submitComplaint} 
                  disabled={loading}
                  className="ct-btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? <Activity className="animate-spin" size={18} /> : <span>Broadcast Formal Report</span>}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}