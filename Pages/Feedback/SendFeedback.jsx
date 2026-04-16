import { useState } from "react";
import axios from "axios";
import React from "react";
import { Activity, ShieldAlert, Send, CheckCircle } from "lucide-react";
const API = `${import.meta.env.VITE_BACKEND_URL}/api/feedback/auth`;

export default function SendFeedback() {
  const [form, setForm] = useState({ message: "", rating: "" });
  const [status, setStatus] = useState("");
  const [caseId] = useState(() => "CASE-" + Math.random().toString(36).slice(2, 8).toUpperCase());

  const token = localStorage.getItem("token");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setStatus("noauth"); return; }
    setStatus("sending");
    try {
      await axios.post(API, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("success");
      setForm({ message: "", rating: "" });
    } catch (err) {
      setStatus(err.response?.status === 401 ? "noauth" : "error");
    }
  };

  const threatLabels = ["", "LOW", "MODERATE", "ELEVATED", "HIGH", "CRITICAL"];
  const threatColors = ["", "text-green-400", "text-lime-400", "text-yellow-400", "text-orange-400", "text-red-500"];

  return (
    <div className="min-h-screen bg-primary-dark font-body text-text-primary px-4 py-12">
      
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto animate-fade-in">

        {/* ── HEADER ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger/10 text-danger border border-danger/20 text-[10px] font-bold tracking-widest uppercase mb-6 rounded-lg">
            <ShieldAlert size={14} /> Classified Intelligence
          </div>
          <h1 className="font-heading text-5xl font-bold text-text-primary uppercase leading-tight tracking-tighter">
            Witness<br />
            <span className="text-accent-gold">Report</span>
          </h1>
          <p className="font-mono text-text-secondary text-[10px] tracking-[4px] mt-4 opacity-50">{caseId} // STATUS: PRIORITY-1</p>
          <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent mt-6" />
        </div>

        {/* ── TACTICAL BAR ── */}
        <div className="bg-accent-gold text-primary-dark font-bold text-[10px] tracking-[3px] py-2 px-4 rounded-xl text-center uppercase shadow-lg shadow-accent-gold/20 mb-10">
          Official Evidence Submission Profile
        </div>

        {/* ── NO TOKEN WARNING ── */}
        {!token && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-4 text-danger animate-pulse">
            <ShieldAlert size={20} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Unauthorized Access: Verified Login Required</p>
          </div>
        )}

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Statement */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold tracking-widest text-accent-gold uppercase ml-1 flex items-center gap-2">
              <Activity size={12} /> Eyewitness Statement
            </label>
            <textarea
              name="message"
              rows={5}
              placeholder="Provide a comprehensive chronological log of the situation as witnessed..."
              value={form.message}
              onChange={handleChange}
              required
              className="w-full bg-secondary-dark border border-border-subtle border-l-accent-gold border-l-4
                text-text-primary placeholder-text-secondary/30 font-medium text-sm px-5 py-4
                outline-none resize-none rounded-r-2xl focus:border-accent-gold transition-all"
            />
          </div>

          {/* Threat Level */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold tracking-widest text-accent-gold uppercase ml-1">
              Urgency Assessment
            </label>
            <div className="flex items-center gap-4 bg-secondary-dark p-6 rounded-2xl border border-border-subtle">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, rating: r })}
                    className={`text-2xl transition-all duration-300 transform ${
                      Number(form.rating) >= r
                        ? "text-accent-gold scale-125 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                        : "text-border-subtle hover:text-text-secondary"
                    }`}
                  >
                    ◆
                  </button>
                ))}
              </div>
              <div className="h-8 w-px bg-border-subtle mx-2" />
              <span className={`text-[10px] font-bold tracking-[2px] uppercase ${threatColors[form.rating] || "text-text-secondary"}`}>
                {threatLabels[form.rating] || "Unrated"}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!token || status === "sending"}
            className={`w-full py-4 rounded-2xl font-bold text-xs tracking-[4px] uppercase transition-all flex items-center justify-center gap-3
              ${!token || status === "sending"
                ? "bg-secondary-dark text-text-secondary cursor-not-allowed opacity-50"
                : "bg-accent-gold text-primary-dark hover:bg-soft-gold active:scale-[0.98] shadow-xl shadow-accent-gold/20"
              }`}
          >
            {status === "sending" ? (
              <Activity className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {status === "sending" ? "Transmitting Log..." : "File Official Report"}
          </button>

          {/* ── STATUS TOASTS ── */}
          {status === "success" && (
            <div className="p-4 bg-success/10 border border-success/30 text-success rounded-2xl flex items-center justify-center gap-3 animate-fade-in shadow-lg">
              <CheckCircle size={18} />
              <p className="text-[10px] font-bold tracking-widest uppercase">Report Filed // Intelligence Synced</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="p-4 bg-danger/10 border border-danger/30 text-danger rounded-2xl flex items-center justify-center gap-3 animate-fade-in">
              <ShieldAlert size={18} />
              <p className="text-[10px] font-bold tracking-widest uppercase">Transmission Error // Retry Encryption</p>
            </div>
          )}
        </form>

        {/* ── FOOTER ── */}
        <div className="mt-16 pt-8 border-t border-border-subtle/30 text-[9px]
          text-text-secondary/40 text-center tracking-[4px] uppercase font-bold">
          Confidential · Intelligence Bureau · Automated Recording Active
        </div>

      </div>
    </div>
  );
}