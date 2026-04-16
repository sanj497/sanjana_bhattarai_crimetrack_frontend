import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Plus, Trash2, Save, CheckCircle, AlertCircle, RefreshCw, Smartphone } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export default function CitizenSettings() {
  const [profile, setProfile] = useState({ username: "", email: "", guardians: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // New Guardian Form State
  const [newGuardian, setNewGuardian] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: profile.username, email: profile.email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setMessage({ text: data.msg || "Update failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuardian = async (e) => {
    e.preventDefault();
    if (!newGuardian.name || !newGuardian.email) return;
    
    const updatedGuardians = [...profile.guardians, newGuardian];
    await updateGuardians(updatedGuardians);
    setNewGuardian({ name: "", email: "", phone: "" });
  };

  const handleRemoveGuardian = async (index) => {
    const updatedGuardians = profile.guardians.filter((_, i) => i !== index);
    await updateGuardians(updatedGuardians);
  };

  const updateGuardians = async (guardiansList) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...profile, guardians: guardiansList })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage({ text: "Guardians updated!", type: "success" });
      }
    } catch (err) {
      setMessage({ text: "Failed to update guardians", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 bg-white dark:bg-[#020617] font-sans">
      <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin shadow-xl shadow-blue-500/10"></div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] animate-pulse">Initializing Profiles...</span>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto font-sans bg-white dark:bg-[#020617] min-h-screen transition-colors duration-300">
      <div className="mb-16">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-4">
           <Shield size={20} />
           <span className="text-[10px] font-black uppercase tracking-[4px]">Dossier Management Control</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Security <span className="text-blue-600 dark:text-blue-500 underline decoration-blue-500/10 decoration-8 underline-offset-8">Environment</span></h1>
        <p className="text-slate-500 dark:text-slate-400 mt-6 font-bold text-sm uppercase tracking-widest opacity-80">Interface for profile credentials and emergency liaison vectors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* PROFILE SECTION */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 font-black uppercase tracking-[4px] text-[10px] italic">
              <User size={16} />
              Identity Protocol
            </div>
            <div className="h-0.5 flex-1 bg-slate-50 dark:bg-slate-900 mx-6 opacity-50" />
          </div>

          <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900/60 p-10 lg:p-12 rounded-[56px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[3px] ml-4 italic leading-none">Command Name</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                     <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-[28px] focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-base font-black uppercase tracking-tight text-slate-900 dark:text-white"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[3px] ml-4 italic leading-none">Authentication Email</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                     <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-[28px] focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-base font-black uppercase tracking-tight text-slate-900 dark:text-white"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-blue-600 text-white py-6 rounded-[28px] font-black text-[11px] uppercase tracking-[5px] hover:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic group/btn"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                Synchronize Profile
              </button>
            </div>
          </form>
        </section>

        {/* GUARDIANS SECTION */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 font-black uppercase tracking-[4px] text-[10px] italic">
              <Shield size={16} />
              Emergency Liaison Network
            </div>
            <div className="h-0.5 flex-1 bg-slate-50 dark:bg-slate-900 mx-6 opacity-50" />
          </div>

          <div className="space-y-6">
            {/* Guardian List */}
            <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-3 no-scrollbar custom-scrollbar">
              {profile.guardians?.map((g, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/40 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all duration-500">
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-500 rounded-[22px] flex items-center justify-center font-black text-xl italic shadow-inner">
                         {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none italic">{g.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest mt-2">{g.email}</div>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleRemoveGuardian(i)}
                     className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              ))}

              {/* Empty State */}
              {(!profile.guardians || profile.guardians.length === 0) && (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-[48px] bg-slate-50/20 dark:bg-transparent">
                   <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50 dark:border-slate-800">
                      <Shield size={32} className="text-slate-200 dark:text-slate-800" />
                   </div>
                   <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[4px] italic">Network Grid Silent</p>
                   <p className="text-[9px] text-slate-300 dark:text-slate-700 mt-2 font-black uppercase tracking-widest">Bind guardians for SOS vector notification.</p>
                </div>
              )}
            </div>

            {/* Add Guardian Form */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-10 rounded-[56px] border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
              
              <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 dark:text-slate-600 mb-8 ml-2 italic">Register Liaison</h4>
              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                    <input 
                      type="text" placeholder="FULL NAME" 
                      className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 outline-none transition-all dark:text-white"
                      value={newGuardian.name}
                      onChange={e => setNewGuardian({...newGuardian, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                    <input 
                      type="text" placeholder="CONTACT PHONE" 
                      className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 outline-none transition-all dark:text-white"
                      value={newGuardian.phone}
                      onChange={e => setNewGuardian({...newGuardian, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="relative">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                   <input 
                    type="email" placeholder="EMAIL ADDRESS PROTOCOL" 
                    className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-blue-500/5 outline-none transition-all dark:text-white"
                    value={newGuardian.email}
                    onChange={e => setNewGuardian({...newGuardian, email: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleAddGuardian}
                  className="w-full bg-blue-600/10 dark:bg-blue-600/5 text-blue-600 dark:text-blue-500 border border-blue-500/20 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[4px] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 italic italic group/add"
                >
                  <Plus size={18} className="group-hover/add:rotate-90 transition-transform" />
                  Bind New Liaison
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Status Message */}
      {message.text && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-6 rounded-[32px] shadow-2xl flex items-center gap-5 font-black text-[11px] uppercase tracking-[3px] animate-in slide-in-from-bottom-10 fade-in duration-500 z-50 italic backdrop-blur-xl border ${message.type === 'success' ? 'bg-emerald-600/90 text-white border-emerald-400/20' : 'bg-rose-600/90 text-white border-rose-400/20'}`}>
           {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
           {message.text}
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
