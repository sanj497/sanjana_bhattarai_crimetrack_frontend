import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, User, ChevronDown, CheckCircle, Info } from "lucide-react";
import React from "react";

const Forwardtopolice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [fetchingOfficers, setFetchingOfficers] = useState(true);
  const [crime, setCrime] = useState(null);
  const [fetchingCrime, setFetchingCrime] = useState(true);

  useEffect(() => {
    fetchOfficers();
    fetchCrimeDetails();
  }, [id]);

  const fetchCrimeDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrime(data.crime);
      }
    } catch (err) {
      console.error("Fetch crime error:", err);
    } finally {
      setFetchingCrime(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) {
        // Filter only police officers
        const policeOnly = data.users.filter(u => u.role === 'police');
        setOfficers(policeOnly);
      }
    } catch (err) {
      console.error("Fetch officers error:", err);
    } finally {
      setFetchingOfficers(false);
    }
  };

  const handleForward = async () => {
    if (!selectedOfficer) {
      alert("⚠️ Please select a responsible officer for this case.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Authentication required.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/${id}/forward`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            adminNotes,
            assignedOfficerId: selectedOfficer 
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Escalation failed");

      alert("✅ Case successfully assigned and forwarded.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Forward error:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8 font-sans">
      <div className="max-w-xl mx-auto">
        
        {/* Breadcrumb/Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Escalate to Police HQ</h1>
            <p className="text-slate-400 text-sm font-medium">Professional Case Assignment Workflow</p>
          </div>
        </div>

        {/* Warning Card */}
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-2xl mb-8 flex gap-4 items-start">
          <Info className="text-amber-500 shrink-0" size={24} />
          <p className="text-amber-200/80 text-sm leading-relaxed font-medium">
            This action will move the case from <span className="text-amber-500 font-bold">Verified</span> status to <span className="text-amber-500 font-bold">Forwarded</span>. Ensure all evidence has been audited before assignment.
          </p>
        </div>

        {/* Crime Intelligence Preview */}
        {!fetchingCrime && crime && (
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 mb-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <Shield size={48} />
            </div>
            
            <div className="relative z-10">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-2">{crime.crimeType}</div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-4 uppercase">{crime.title}</h2>
              <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50 mb-6 font-medium text-slate-400 text-sm leading-relaxed">
                "{crime.description}"
              </div>

              {/* Tactical Evidence */}
              {crime.evidence && crime.evidence.length > 0 && (
                <div className="mb-6">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Audited Evidence Artifacts</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {crime.evidence.map((file, idx) => (
                      <div key={idx} className="shrink-0 w-24 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <img src={file.url} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Evidence" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ground Zero Map */}
              {crime.location?.lat && crime.location?.lng && (
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[2px] mb-3">Incident Ground Zero</p>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 h-40 group shadow-inner">
                    <iframe
                      title="Incident Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(1) invert(0.9) brightness(0.8)' }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(crime.location.lng) - 0.005}%2C${Number(crime.location.lat) - 0.005}%2C${Number(crime.location.lng) + 0.005}%2C${Number(crime.location.lat) + 0.005}&layer=mapnik&marker=${Number(crime.location.lat)}%2C${Number(crime.location.lng)}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 shadow-2xl">
          <div className="space-y-8">
            
            {/* Officer Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <User size={14} />
                Select Assignee Officer
              </label>
              <div className="relative">
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  disabled={fetchingOfficers}
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-12 font-bold"
                >
                  <option value="">{fetchingOfficers ? "Synchronizing Officer Database..." : "Choose Investigation Officer"}</option>
                  {officers.map(off => (
                    <option key={off._id} value={off._id}>
                      👮 {off.username} ({off.email})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                Escalation Notes & Instructions
              </label>
              <textarea
                placeholder="Detail high-priority evidence, witness contacts, or specific investigative directives here..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all min-h-[160px] resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleForward}
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-white font-black tracking-widest text-sm uppercase flex items-center justify-center gap-3 shadow-xl transition-all ${
                loading ? "bg-slate-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  Authorize Field Assignment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
          End-to-End Cryptographic Audit Trail Active
        </p>
      </div>
    </div>
  );
};

export default Forwardtopolice;