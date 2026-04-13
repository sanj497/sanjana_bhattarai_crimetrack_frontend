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

  useEffect(() => {
    fetchOfficers();
  }, []);

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