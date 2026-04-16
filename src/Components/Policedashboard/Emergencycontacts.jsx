import { useState, useEffect, useCallback } from "react";
import React from "react";
import { 
  Activity, 
  Phone, 
  ShieldAlert, 
  Plus, 
  Search, 
  Navigation, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle, 
  X,
  ChevronRight,
  Radio,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/emergency`;

const categoryConfig = {
  police: { icon: "🚔", color: "blue", label: "Police Force" },
  fire: { icon: "🔥", color: "rose", label: "Fire Ops" },
  medical: { icon: "🏥", color: "emerald", label: "Medical Unit" },
  disaster: { icon: "⚠️", color: "amber", label: "Disaster" },
  women: { icon: "👩", color: "rose", label: "Women Safety" },
  child: { icon: "🧒", color: "indigo", label: "Child Prot" },
  other: { icon: "📞", color: "slate", label: "Helpline" },
};

// ─── Quick Call Buttons (Police / Ambulance / Fire) ───────────────────────────
function QuickCallButtons() {
  const quickContacts = [
    { label: "Police",    number: "100", emoji: "🚔", color: "blue" },
    { label: "Ambulance", number: "102", emoji: "🚑", color: "emerald" },
    { label: "Fire",      number: "101", emoji: "rose", color: "rose" },
  ];

  const handleCall = (contact) => {
    if (window.confirm(`📞 Initiate tactical call to ${contact.label} at ${contact.number}?`)) {
      window.location.href = `tel:${contact.number}`;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {quickContacts.map((c) => (
        <button
          key={c.number}
          onClick={() => handleCall(c)}
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-${c.color}-500 group shadow-sm`}
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">{c.emoji}</div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{c.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{c.number}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── SOS Button ───────────────────────────────────────────────────────────────
function SOSButton() {
  const [status, setStatus] = useState("idle"); // idle | locating | sending | active | sent | error
  const [message, setMessage] = useState("");
  const [alertId, setAlertId] = useState(null);

  const updateTracking = useCallback(async (lat, lng, accuracy) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      
      await fetch(`${API_BASE}/sos/${alertId}/track`, {
        method: "POST",
        headers,
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy }),
      });
    } catch (err) {
      console.error("Failed to update SOS location:", err);
    }
  }, [alertId]);

  useEffect(() => {
    let interval;
    if (status === "active" && alertId) {
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => updateTracking(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
          (error) => console.error("Tracking error:", error)
        );
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [status, alertId, updateTracking]);

  const handleSOS = async () => {
    if (!window.confirm("🚨 CONFIRM CRITICAL SOS? This will immediately alert the Command Center with your live telemetry.")) return;
    setStatus("locating");
    setMessage("GETTING PRECISE COORDINATES...");

    const sendAlert = async (lat, lng, accuracy) => {
      setStatus("sending");
      setMessage("DISPATCHING TACTICAL REQUEST...");
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;
        
        const res = await fetch(`${API_BASE}/sos`, {
          method: "POST",
          headers,
          body: JSON.stringify({ latitude: lat, longitude: lng, accuracy, timestamp: new Date().toISOString() }),
        });
        const data = await res.json();
        if (data.success) {
          setAlertId(data.alertId);
          setStatus("active");
          setMessage(`CRITICAL ACTIVE: UNITS RESPONDING. LIVE TELEMETRY STREAMING.`);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(`FAILURE: ${err.message || "Network Leak"}`);
        setTimeout(() => setStatus("idle"), 5000);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendAlert(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => sendAlert(null, null, null),
        { enableHighAccuracy: true }
      );
    } else {
      sendAlert(null, null, null);
    }
  };

  const statusMap = {
    idle:     { text: "TRIGGER", sub: "Priority Alpha SOS", color: "bg-rose-600", pulse: true },
    locating: { text: "LOCATING", sub: "Telemetry Locked", color: "bg-amber-600", pulse: true },
    sending:  { text: "SENDING", sub: "Dispatch Syncing", color: "bg-orange-600", pulse: true },
    active:   { text: "ACTIVE", sub: "Units Moving", color: "bg-rose-800", pulse: true },
    sent:     { text: "CONFIRMED", sub: "Recv Locked", color: "bg-emerald-600", pulse: false },
    error:    { text: "RETRY", sub: "Link Cleared", color: "bg-slate-700", pulse: true },
  };

  const current = statusMap[status];

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative">
        {current.pulse && (
          <div className="absolute inset-0 scale-150">
             <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
             <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping" style={{animationDelay: "0.5s"}} />
          </div>
        )}
        <button
          onClick={handleSOS}
          disabled={status !== "idle" && status !== "error"}
          className={`relative h-64 w-64 rounded-full border-[12px] border-white dark:border-slate-950 shadow-[0_30px_100px_rgba(225,29,72,0.4)] flex flex-col items-center justify-center transition-all duration-500 z-10 hover:scale-105 active:scale-90 ${current.color} text-white`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent rounded-full" />
          <div className="relative z-20 flex flex-col items-center">
            <Radio className={`h-12 w-12 mb-3 ${current.pulse ? "animate-pulse" : ""}`} />
            <span className="text-4xl font-black tracking-tighter italic uppercase">{current.text}</span>
            <span className="text-[10px] font-black uppercase tracking-[4px] mt-2 opacity-60 italic">{current.sub}</span>
          </div>
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-[32px] border text-center max-w-sm transition-all duration-500 shadow-xl ${
          status === "active" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
        }`}>
          <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
            {message}
          </p>
          {status === "active" && (
            <button 
              onClick={() => { setStatus("idle"); setAlertId(null); setMessage(""); }}
              className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"
            >
              Terminate Dispatch
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Contact Card ─────────────────────────────────────────────────────────────
function ContactCard({ contact, onDelete, isResponder }) {
  const cfg = categoryConfig[contact.category] || categoryConfig.other;
  const handleCall = () => {
    if (confirm(`📞 Initiate tactical call to ${contact.name}?`)) {
      window.location.href = `tel:${contact.number}`;
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className={`h-16 w-16 rounded-[24px] bg-${cfg.color}-500 flex items-center justify-center text-3xl text-white shadow-xl shadow-${cfg.color}-500/20 group-hover:rotate-6 transition-transform`}>
            {cfg.icon}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{contact.name}</h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-lg bg-${cfg.color}-500/10 text-${cfg.color}-600 dark:text-${cfg.color}-500 text-[9px] font-black uppercase tracking-widest border border-${cfg.color}-500/20`}>
              {cfg.label}
            </span>
          </div>
        </div>
        {isResponder && (
          <button 
            onClick={() => onDelete(contact._id)} 
            className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {contact.description && (
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/50 relative z-10 italic">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">"{contact.description}"</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <MapPin size={12} className="text-blue-500" /> {contact.region}
        </div>
        <button 
          onClick={handleCall} 
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-[24px] text-[11px] font-black hover:bg-blue-600 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
        >
          <Phone size={14} /> {contact.number}
        </button>
      </div>
    </div>
  );
}

// ─── Add Contact Modal ────────────────────────────────────────────────────────
function AddContactModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", number: "", category: "other", description: "", region: "National" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.number) { setError("Name and number are required."); return; }
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form) 
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSaved(data.data);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Phone size={160} />
        </div>
        
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Register Response Unit</h2>
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[4px] mt-1">Datalink Authorization Required</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Unit Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="Ex: District Command" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Primary Frequency</label>
              <input 
                type="tel" 
                value={form.number} 
                onChange={e => setForm({...form, number: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="Ex: 100" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Sector Region</label>
              <input 
                type="text" 
                value={form.region} 
                onChange={e => setForm({...form, region: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="Ex: National" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Asset Category</label>
              <div className="relative">
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{categoryConfig[c].icon} {categoryConfig[c].label}</option>)}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Tactical Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[24px] px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 h-24 resize-none"
              placeholder="Operational details (optional)" 
            />
          </div>
        </div>

        <div className="flex gap-4 mt-12 relative z-10">
          <button 
            onClick={onClose} 
            className="flex-1 py-5 rounded-[24px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[3px] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            Abort
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-[2] py-5 rounded-[24px] bg-blue-600 text-white text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? "Syncing..." : <>Finalize Encryption <ExternalLink size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function EmergencyContactsApp() {
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr).role;
    } catch {}
    return "guest";
  };
  
  const role = getUserRole();
  const isResponder = role === "police" || role === "admin";

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(isResponder ? "contacts" : "sos");

  const fetchContacts = async (category) => {
    setLoading(true);
    try {
      const url = category && category !== "all" ? `${API_BASE}?category=${category}` : API_BASE;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setContacts(data.data);
    } catch { 
      setError("Operational link failure. Accessing local cache..."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/seed`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Seed failure");
      await fetchContacts(filterCategory);
    } catch {
      setError("Default registry injection failed.");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge unit from registry?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failure");
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Purge operation failed.");
    }
  };

  useEffect(() => {
    fetchContacts(filterCategory);
  }, [filterCategory]);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.number.includes(searchTerm)
  );

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-300 transition-colors duration-300 p-6 md:p-12">
      
      {/* ── HEADER ── */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500 mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl shadow-inner">
                 <ShieldAlert size={28} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[5px] block">Critical Operations</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] block mt-1">Status: High Intensity Dispatch</span>
              </div>
           </div>
           <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none animate-in fade-in slide-in-from-left-6 duration-700">
             Helpline <br className="hidden md:block"/> <span className="text-rose-600 underline decoration-rose-600/20 decoration-8 underline-offset-8">Unit</span>
           </h1>
        </div>

        <div className="flex bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-3xl animate-in fade-in slide-in-from-right-4 duration-500">
          {!isResponder && (
            <button
              onClick={() => setActiveTab("sos")}
              className={`px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-[3px] transition-all flex items-center gap-3 ${
                activeTab === "sos" ? "bg-rose-600 text-white shadow-xl shadow-rose-600/30 scale-105" : "text-slate-400 hover:text-rose-500"
              }`}
            >
              <Radio size={18} /> SOS Protocol
            </button>
          )}
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-[3px] transition-all flex items-center gap-3 ${
              activeTab === "contacts" ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-105" : "text-slate-400 hover:text-blue-500"
            }`}
          >
            <Shield size={18} /> Directory
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* ── SOS INTERFACE ── */}
        {!isResponder && activeTab === "sos" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-4 flex items-center justify-center p-12 bg-slate-950 dark:bg-slate-900/40 border border-slate-800 dark:border-slate-800/50 rounded-[64px] shadow-2xl relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 via-transparent to-transparent opacity-40" />
               <SOSButton />
            </div>

            <div className="xl:col-span-8 space-y-10">
               <div>
                  <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[6px] mb-8 italic">Rapid Response Directives</h2>
                  <QuickCallButtons />
               </div>

               <div className="p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[48px] border border-slate-100 dark:border-slate-800/50 relative group">
                  <div className="absolute -top-4 -right-4 h-16 w-16 bg-rose-600 text-white rounded-3xl flex items-center justify-center shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
                     <Clock size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8">Mission Critical Briefing</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                     {[
                       { label: "Absolute Priority", val: "SOS triggers bypass normal verification protocols for 0ms delay response.", icon: <AlertTriangle size={18} className="text-rose-500"/> },
                       { label: "Telemetry Lock", val: "Your live GPS telemetry is streamed at 10s intervals to all active patrols.", icon: <Navigation size={18} className="text-blue-500"/> },
                       { label: "Infrastructure", val: "Critical link established through prioritized satellite and GSM channels.", icon: <Activity size={18} className="text-emerald-500"/> },
                       { label: "Unit Deployment", val: "Automated dispatch of Police, Fire, and Medical when SOS is triggered.", icon: <ShieldCheck size={18} className="text-amber-500"/> },
                     ].map((item, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                             {item.icon} {item.label}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed uppercase tracking-tight opacity-70">
                            "{item.val}"
                          </p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ── DIRECTORY INTERFACE ── */}
        {activeTab === "contacts" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
               <div className="lg:col-span-4 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-blue-500" size={20} />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Unit Registry..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-xs font-black uppercase tracking-widest outline-none shadow-inner focus:border-blue-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
               </div>

               <div className="lg:col-span-8 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {["all", ...Object.keys(categoryConfig)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[3px] transition-all whitespace-nowrap border-2 ${
                        filterCategory === cat
                          ? "bg-slate-950 dark:bg-blue-600 border-slate-950 dark:border-blue-600 text-white shadow-xl scale-105"
                          : "bg-white dark:bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-blue-500/20"
                      }`}
                    >
                      {cat === "all" ? "Live Feed" : categoryConfig[cat].label}
                    </button>
                  ))}
               </div>
            </div>

            {isResponder && (
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-8 rounded-[48px] border border-slate-100 dark:border-slate-800/50">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-center gap-4 py-6 bg-blue-600 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[4px] hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-600/30"
                >
                  <Plus size={20} /> Requisition Unit
                </button>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex items-center justify-center gap-4 py-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-[24px] text-[11px] font-black uppercase tracking-[4px] hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-xl disabled:opacity-30"
                >
                  {seeding ? "Establishing Link..." : <>Inject Master Registry <Activity size={20} className="animate-pulse" /></>}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[4px] p-6 rounded-[32px] flex justify-between items-center italic">
                {error}
                <button onClick={() => setError("")} className="h-8 w-8 bg-white dark:bg-slate-950 rounded-xl shadow-sm">×</button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-32 space-y-8 opacity-40">
                <div className="h-16 w-16 border-4 border-slate-100 dark:border-slate-800 border-t-red-500 rounded-full animate-spin mx-auto shadow-xl" />
                <p className="text-[10px] font-black uppercase tracking-[5px] animate-pulse italic">Syncing Crisis Resources Archive</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[64px] border border-slate-100 dark:border-slate-800/50 group transition-all hover:border-blue-500/20 shadow-inner">
                <ShieldAlert className="mx-auto text-slate-200 dark:text-slate-800 mb-8 opacity-20 group-hover:scale-110 transition-transform" size={120} />
                <p className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter italic">Registry Null</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[4px] mt-4 italic">No matching units located in the active sector cache.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((contact) => (
                  <ContactCard key={contact._id} contact={contact} onDelete={handleDelete} isResponder={isResponder} />
                ))}
              </div>
            )}
           </div>
        )}
      </div>

      {showModal && (
        <AddContactModal onClose={() => setShowModal(false)} onSaved={(c) => setContacts((prev) => [c, ...prev])} />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}