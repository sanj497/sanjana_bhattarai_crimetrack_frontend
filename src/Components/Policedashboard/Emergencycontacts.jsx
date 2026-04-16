import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Activity, ShieldAlert, Search, ShieldCheck, Plus, Phone } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/emergency`;

const categoryConfig = {
  police: { icon: "🚔", color: "bg-blue-600", light: "bg-blue-50 border-blue-200 text-blue-700" },
  fire: { icon: "🔥", color: "bg-red-600", light: "bg-red-50 border-red-200 text-red-700" },
  medical: { icon: "🏥", color: "bg-green-600", light: "bg-green-50 border-green-200 text-green-700" },
  disaster: { icon: "⚠️", color: "bg-yellow-600", light: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  women: { icon: "👩", color: "bg-pink-600", light: "bg-pink-50 border-pink-200 text-pink-700" },
  child: { icon: "🧒", color: "bg-purple-600", light: "bg-purple-50 border-purple-200 text-purple-700" },
  other: { icon: "📞", color: "bg-gray-600", light: "bg-gray-50 border-gray-200 text-gray-700" },
};

// ─── Quick Call Buttons (Police / Ambulance / Fire) ───────────────────────────
function QuickCallButtons() {
  const quickContacts = [
    { label: "Police",    number: "100", emoji: "🚔", bg: "bg-blue-600",  ring: "ring-blue-300" },
    { label: "Ambulance", number: "102", emoji: "🚑", bg: "bg-green-600", ring: "ring-green-300" },
    { label: "Fire",      number: "101", emoji: "🚒", bg: "bg-orange-500",ring: "ring-orange-300" },
  ];

  const handleCall = (contact) => {
    if (window.confirm(`📞 Call ${contact.label} at ${contact.number}?`)) {
      window.location.href = `tel:${contact.number}`;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {quickContacts.map((c) => (
        <button
          key={c.number}
          onClick={() => handleCall(c)}
          className={`${c.bg} ${c.ring} text-white flex flex-col items-center justify-center gap-2 py-5 rounded-2xl shadow-lg ring-4 ring-opacity-30 active:scale-95 hover:brightness-110 transition-all`}
        >
          <span className="text-3xl">{c.emoji}</span>
          <span className="font-bold text-base tracking-wide">{c.label}</span>
          <span className="text-xl font-extrabold">{c.number}</span>
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
      const headers = { 
        "Content-Type": "application/json"
      };
      
      // Add authorization header only if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
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
      }, 10000); // Update every 10 seconds
    }
    return () => clearInterval(interval);
  }, [status, alertId, updateTracking]);

  const handleSOS = async () => {
    if (!window.confirm(" Send CRITICAL SOS alert? This will immediately notify all police units and emergency services with your live location.")) return;
    setStatus("locating");
    setMessage("Getting your precise location...");

    const sendAlert = async (lat, lng, accuracy) => {
      setStatus("sending");
      setMessage(" DISPATCHING EMERGENCY UNITS...");
      try {
        const token = localStorage.getItem("token");
        const headers = { 
          "Content-Type": "application/json"
        };
        
        // Add authorization header only if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}/sos`, {
          method: "POST",
          headers,
          body: JSON.stringify({ latitude: lat, longitude: lng, accuracy, timestamp: new Date().toISOString() }),
        });
        const data = await res.json();
        if (data.success) {
          setAlertId(data.alertId);
          setStatus("active");
          setMessage(` CRITICAL ALERT ACTIVE: ${data.message} Live tracking enabled.`);
          
          // Vibrate and sound if available
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 500]);
          }
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(` Failed: ${err.message || "Network Error"}`);
        setTimeout(() => setStatus("idle"), 5000);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendAlert(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => {
          console.warn("Geolocation denied, sending anonymous SOS");
          sendAlert(null, null, null);
        },
        { enableHighAccuracy: true }
      );
    } else {
      sendAlert(null, null, null);
    }
  };

  const buttonLabel = {
    idle:     { text: "SOS",                sub: "Initiate Primary Dispatch",  pulse: true,  color: "bg-red-600 hover:bg-red-700" },
    locating: { text: "Locating",         sub: "Establishing Telemetry...",   pulse: true,  color: "bg-amber-600" },
    sending:  { text: "Dispatch",      sub: "Alerting Command Center",     pulse: true,  color: "bg-orange-600 animate-pulse" },
    active:   { text: "CRITICAL",            sub: "Active Live Tracking",  pulse: true,  color: "bg-red-800 animate-pulse" },
    sent:     { text: "✅ Confirmed",            sub: "Signal Acknowledged",      pulse: false, color: "bg-emerald-600" },
    error:    { text: "Failed",              sub: "Interference - Retry",            pulse: true,  color: "bg-slate-700" },
  }[status];

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative flex items-center justify-center">
        {buttonLabel.pulse && (
          <>
            <div className={`absolute -inset-8 rounded-full opacity-20 animate-ping ${status === 'active' ? 'bg-orange-500' : 'bg-red-500'}`} />
            <div className={`absolute -inset-4 rounded-full opacity-30 animate-ping ${status === 'active' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ animationDelay: "0.3s" }} />
          </>
        )}
        
        {/* Shadow Ring */}
        <div className="absolute -inset-2 rounded-full bg-slate-900 border border-slate-800" />
        
        <button
          onClick={handleSOS}
          disabled={status === "locating" || status === "sending" || status === "active"}
          className={`relative w-40 h-40 rounded-full text-white font-black text-4xl shadow-2xl z-10 border-[6px] border-slate-950 active:scale-95 transition-all duration-300 disabled:cursor-not-allowed
            ${buttonLabel.color}`}
        >
          <div className="flex flex-col items-center justify-center">
             {status === "locating" || status === "sending" ? (
               <Activity className="h-10 w-10 animate-bounce mb-2" />
             ) : null}
             <span className="tracking-tighter uppercase">{buttonLabel.text}</span>
          </div>
        </button>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-1">{buttonLabel.sub}</p>
        <div className="h-0.5 w-12 bg-red-600/30 mx-auto rounded-full" />
      </div>

      {message && (
        <div className={`max-w-xs text-center text-[10px] font-bold py-3 px-6 rounded-2xl border transition-all duration-500 ${
          status === "active" ? "bg-red-950/20 text-red-500 border-red-500/20 shadow-[0_0_30px_rgba(225,29,72,0.1)]"
          : (status === "error" ? "bg-slate-900 text-slate-400 border-slate-800" : "bg-blue-950/20 text-blue-400 border-blue-500/20")
        }`}>
          <p className="leading-relaxed">{message}</p>
          {status === "active" && (
             <div className="mt-4 pt-4 border-t border-red-500/10 space-y-3">
               <button 
                 onClick={() => { setStatus("idle"); setAlertId(null); }}
                 className="px-4 py-2 bg-red-600/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all underline decoration-red-500/30"
               >
                 Terminate Tracking
               </button>
               <div className="flex items-center justify-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-red-500 animate-ping" />
                 <span className="text-[8px] italic text-red-400/70">Police units are moving to your position</span>
               </div>
             </div>
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
    if (confirm(`Call ${contact.name} at ${contact.number}?`)) {
      window.location.href = `tel:${contact.number}`;
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl ${cfg.color} text-white`}>
            {cfg.icon}
          </span>
          <div>
            <h3 className="font-bold text-gray-800 text-base leading-tight">{contact.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.light} capitalize`}>
              {contact.category}
            </span>
          </div>
        </div>
        {isResponder && (
          <button onClick={() => onDelete(contact._id)} className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none" title="Delete">×</button>
        )}
      </div>
      {contact.description && <p className="text-sm text-gray-500">{contact.description}</p>}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">📍 {contact.region}</span>
        <button onClick={handleCall} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm ${cfg.color} hover:opacity-90 active:scale-95 transition-all shadow`}>
          📞 {contact.number}
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
      const res = await fetch(API_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSaved(data.data);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Add Emergency Contact</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Create new emergency response entry</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-3xl leading-none hover:bg-slate-800 rounded-xl p-2 transition-all">×</button>
        </div>
        
        {error && <p className="text-rose-400 text-sm mb-4 bg-rose-900/20 border border-rose-800 p-3 rounded-xl">{error}</p>}
        
        <div className="space-y-4">
          {[["name","Contact Name","text"],["number","Phone Number","tel"],["region","Region","text"]].map(([key,label,type]) => (
            <div key={key}>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-slate-600" placeholder={label} />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Category</label>
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all">
              {Object.keys(categoryConfig).map(c => <option key={c} value={c} className="bg-slate-900">{categoryConfig[c].icon} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-slate-600 resize-none" rows={3} placeholder="Brief description (optional)" />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20">
            {loading ? "Saving..." : "Save Contact"}
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
      if (userStr) {
        return JSON.parse(userStr).role;
      }
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
  const [activeTab, setActiveTab] = useState(isResponder ? "contacts" : "sos"); // Default to contacts for police

  const fetchContacts = async (category) => {
    setLoading(true);
    try {
      const url = category && category !== "all" ? `${API_BASE}?category=${category}` : API_BASE;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setContacts(data.data);
    } catch { setError("Failed to load contacts. Is the server running?"); }
    finally { setLoading(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/seed`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to seed contacts");
      await fetchContacts(filterCategory);
    } catch {
      setError("Failed to load default emergency contacts.");
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete contact.");
    }
  };

  useEffect(() => {
    fetchContacts(filterCategory);
  }, [filterCategory]);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.number.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-primary-dark font-body text-text-primary">
      
      {/* Header */}
      <div className="p-8 md:p-10 animate-fade-in">
        <div className="p-8 md:p-12 rounded-[40px] bg-secondary-dark text-white relative overflow-hidden shadow-2xl border border-border-subtle">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-danger via-primary-dark to-primary-dark" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-danger text-white rounded-2xl flex items-center justify-center shadow-lg shadow-danger/20">
                    <ShieldAlert size={28} />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase font-heading">
                    Emergency <span className="text-danger">Helpline</span>
                  </h1>
                </div>
                <p className="text-text-secondary font-bold text-[10px] mt-2 uppercase tracking-[3px] flex items-center gap-2">
                   <Activity size={12} className="text-danger animate-pulse" /> Verified Rapid Response Protocols
                </p>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Response Latency</p>
                    <p className="text-2xl font-bold tabular-nums text-text-primary">Sub-2m Average</p>
                 </div>
                 <div className="h-16 w-px bg-border-subtle" />
                 <div className="h-16 w-16 bg-primary-dark/50 backdrop-blur-md rounded-2xl border border-border-subtle flex items-center justify-center text-danger">
                    <Activity size={28} className="animate-pulse" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-20 bg-primary-dark/80 backdrop-blur-xl border-b border-border-subtle">
        <div className="max-w-4xl mx-auto flex px-6">
          {!isResponder && (
            <button
              onClick={() => setActiveTab("sos")}
              className={`flex-1 py-5 text-sm font-bold transition-all border-b-2 tracking-widest uppercase font-heading ${
                activeTab === "sos" ? "border-danger text-danger" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              🆘 SOS Signal
            </button>
          )}
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 py-5 text-sm font-bold transition-all border-b-2 tracking-widest uppercase font-heading ${
              activeTab === "contacts" ? "border-accent-gold text-accent-gold" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            📋 Emergency Directory
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* ── SOS TAB ── */}
        {!isResponder && activeTab === "sos" && (
          <div className="space-y-10 animate-fade-in">
            {/* SOS Button Area */}
            <div className="bg-secondary-dark rounded-[48px] shadow-2xl border border-border-subtle p-12 flex flex-col items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-danger/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
               <p className="text-[11px] font-bold uppercase tracking-[5px] text-danger mb-2 animate-pulse flex items-center gap-2">
                  <Activity size={14} /> Critical SOS Terminal
               </p>
               <SOSButton />
            </div>

            {/* Quick Call Area */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[4px] text-text-secondary mb-6 ml-2 flex items-center gap-2">
                 <ShieldAlert size={12} /> Strategic Response Links
              </p>
              <QuickCallButtons />
            </div>

            {/* Intel Card */}
            <div className="bg-primary-dark border border-border-subtle border-l-[6px] border-l-danger rounded-[32px] p-8 shadow-inner group overflow-hidden relative">
              <div className="absolute bottom-0 right-0 p-8 opacity-5">
                 <ShieldAlert size={120} className="text-danger" />
              </div>
              <h4 className="text-sm font-bold font-heading text-text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={16} className="text-danger" /> Intelligence Briefing
              </h4>
              <ul className="space-y-4">
                {[
                  "Global SOS Broadcast notifies all certified active units",
                  "Verified Live GPS Telemetry establishes priority tracking",
                  "Protocol-4 override ensures immediate dispatcher attention",
                  "Encrypted telemetry syncs automatically with nearest local command"
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 group/tip">
                    <div className="h-5 w-5 rounded-full bg-danger/10 text-danger flex items-center justify-center text-[10px] font-bold mt-0.5 group-hover/tip:scale-110 transition-transform">{i+1}</div>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === "contacts" && (
          <div className="space-y-8 animate-fade-in">
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-secondary-dark border border-border-subtle rounded-2xl flex items-center px-6 py-4 gap-4 shadow-xl focus-within:border-accent-gold/50 transition-all">
                <Search className="text-text-secondary" size={20} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Query directory database..."
                  className="bg-transparent text-text-primary text-sm font-medium flex-1 outline-none placeholder:text-text-secondary/30"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {["all", ...Object.keys(categoryConfig)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`flex-shrink-0 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      filterCategory === cat
                        ? "bg-accent-gold text-primary-dark shadow-xl shadow-accent-gold/10"
                        : "bg-secondary-dark text-text-secondary border border-border-subtle hover:border-accent-gold/40"
                    }`}
                  >
                    {cat === "all" ? "All Logs" : `${categoryConfig[cat].icon} ${cat}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            {isResponder && (
              <div className="flex gap-4 p-4 bg-primary-dark/50 rounded-3xl border border-border-subtle">
                <button
                  onClick={() => setShowModal(true)}
                  className="ct-btn-primary flex-1 py-4 flex items-center justify-center gap-3"
                >
                  <Plus size={18} /> Register Authorized Entity
                </button>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="ct-btn-secondary flex-1 py-4 flex items-center justify-center gap-3"
                >
                   {seeding ? <Activity className="animate-spin" size={18} /> : <span>Sync Default Records</span>}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex justify-between items-center animate-shake">
                <div className="flex items-center gap-3">
                   <ShieldAlert size={18} />
                   <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                </div>
                <button onClick={() => setError("")} className="hover:text-text-primary transition-colors">×</button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                 <div className="h-16 w-16 bg-secondary-dark rounded-[24px] flex items-center justify-center border border-border-subtle shadow-xl">
                    <Activity className="h-8 w-8 text-accent-gold animate-bounce" />
                 </div>
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[4px]">Initializing Directory...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ct-card p-24 text-center border-dashed border-2 flex flex-col items-center">
                 <div className="h-20 w-20 bg-primary-dark rounded-[30px] flex items-center justify-center mb-6 text-text-secondary/20">
                    <ShieldCheck size={48} />
                 </div>
                 <h3 className="text-xl font-bold font-heading text-text-primary uppercase tracking-widest mb-2">No Verified Logs Found</h3>
                 <p className="text-sm text-text-secondary font-medium max-w-sm mb-3">The current query returned no matching intelligence assets.</p>
                 {isResponder && <button onClick={handleSeed} className="text-accent-gold text-[10px] font-bold uppercase tracking-widest hover:underline">Re-Sync Defaults</button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((contact) => (
                  <ContactCard 
                    key={contact._id} 
                    contact={contact} 
                    onDelete={handleDelete} 
                    isResponder={isResponder} 
                  />
                ))}
              </div>
            )}

            <div className="text-center text-[10px] font-bold text-text-secondary uppercase tracking-[3px] py-10 opacity-30">
              End of Official Record Set · {filtered.length} Validated Assets
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddContactModal onClose={() => setShowModal(false)} onSaved={(c) => setContacts((prev) => [c, ...prev])} />
      )}
    </div>
  );
}