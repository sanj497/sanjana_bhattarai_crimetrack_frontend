import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Activity } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Add Emergency Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
        <div className="space-y-3">
          {[["name","Contact Name","text"],["number","Phone Number","tel"],["region","Region","text"]].map(([key,label,type]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" placeholder={label} />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
              {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{categoryConfig[c].icon} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" rows={2} placeholder="Brief description (optional)" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition">
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 pt-10 pb-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🚨</span>
            <h1 className="text-2xl font-extrabold tracking-tight">Emergency Helpline</h1>
          </div>
          <p className="text-red-100 text-sm ml-12">Call directly in one tap · Immediate help</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto flex">
          {!isResponder && (
            <button
              onClick={() => setActiveTab("sos")}
              className={`flex-1 py-3.5 text-sm font-bold transition-all border-b-2 ${
                activeTab === "sos" ? "border-red-600 text-red-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              🆘 SOS Signal
            </button>
          )}
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 py-3.5 text-sm font-bold transition-all border-b-2 ${
              activeTab === "contacts" ? "border-red-600 text-red-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            📋 Emergency Directory
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* ── SOS TAB ── */}
        {!isResponder && activeTab === "sos" && (
          <>
            {/* SOS Button */}
            <div className="bg-white rounded-3xl shadow-lg border border-red-100 p-8 flex flex-col items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 animate-pulse">🚨 CRITICAL EMERGENCY</p>
              <SOSButton />
            </div>

            {/* Quick Call Buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">Quick Call</p>
              <QuickCallButtons />
            </div>

            {/* Tip */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
              <p className="font-semibold mb-1">CRITICAL SOS INFORMATION</p>
              <ul className="list-disc list-inside space-y-1 text-red-700">
                <li>Tap <strong>SOS</strong> to dispatch ALL police units immediately</li>
                <li>Your <strong>live GPS location</strong> is shared with emergency services</li>
                <li><strong>No internet needed</strong> for emergency calls - SIM only</li>
                <li>This alert <strong>bypasses normal verification</strong> for immediate response</li>
              </ul>
            </div>
          </>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === "contacts" && (
          <>
            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center px-4 py-2.5 gap-2 shadow-sm">
              <span className="text-gray-400">🔍</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts or numbers..."
                className="bg-transparent text-gray-700 text-sm flex-1 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["all", ...Object.keys(categoryConfig)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"
                  }`}
                >
                  {cat === "all" ? "🔴 All" : `${categoryConfig[cat].icon} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                </button>
              ))}
            </div>

            {/* Actions */}
            {isResponder && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-700 active:scale-95 transition-all shadow"
                >
                  + Add Contact
                </button>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                >
                  {seeding ? "Seeding..." : "🌱 Load Defaults"}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex justify-between">
                {error}
                <button onClick={() => setError("")} className="font-bold">
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3 animate-pulse">📡</div>
                <p>Loading contacts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-medium">No contacts found</p>
                <p className="text-sm mt-1">Click "Load Defaults" to seed Nepal emergency numbers</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((contact) => (
                  <ContactCard key={contact._id} contact={contact} onDelete={handleDelete} isResponder={isResponder} />
                ))}
              </div>
            )}

            <p className="text-center text-xs text-gray-400 pb-4">
              {filtered.length} contact{filtered.length !== 1 ? "s" : ""} available
            </p>
          </>
        )}
      </div>

      {showModal && (
        <AddContactModal onClose={() => setShowModal(false)} onSaved={(c) => setContacts((prev) => [c, ...prev])} />
      )}
    </div>
  );
}