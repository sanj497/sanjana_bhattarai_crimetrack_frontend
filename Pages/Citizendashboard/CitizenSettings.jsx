import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Plus, Trash2, Save, CheckCircle, AlertCircle, Camera, Upload } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export default function CitizenSettings() {
  const [profile, setProfile] = useState({ username: "", email: "", guardians: [], profilePicture: null });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  
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
        toast.success("Profile updated successfully!");
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setMessage({ text: data.msg || "Update failed", type: "error" });
        toast.error(data.msg || "Update failed");
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${API_BASE}/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile picture updated successfully!");
        setProfile(prev => ({ ...prev, profilePicture: data.user.profilePicture }));
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.profilePicture = data.user.profilePicture;
        localStorage.setItem("user", JSON.stringify(storedUser));
      } else {
        toast.error(data.msg || "Failed to upload picture");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload picture");
    } finally {
      setUploadingPicture(false);
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto font-body bg-primary-dark text-text-primary min-h-full">
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight font-heading">Account & Security</h1>
        <p className="text-text-secondary mt-2 font-medium">Manage your profile and emergency guardian network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* PROFILE SECTION */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-6 text-accent-gold font-bold uppercase tracking-widest text-[10px]">
            <User size={14} />
            Personal Identification
          </div>
          <form onSubmit={handleUpdateProfile} className="ct-card">
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-border-subtle shadow-xl bg-primary-dark flex items-center justify-center transition-all group-hover:border-accent-gold">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-text-secondary" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 h-10 w-10 bg-accent-gold rounded-full flex items-center justify-center cursor-pointer hover:bg-soft-gold transition-colors shadow-lg border-4 border-secondary-dark group-hover:scale-110">
                    <Camera size={18} className="text-primary-dark" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePictureUpload}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </label>
                  {uploadingPicture && (
                    <div className="absolute inset-0 bg-primary-dark/70 rounded-full flex items-center justify-center">
                      <div className="h-8 w-8 border-3 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-3">Click camera to upload</p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-border-subtle" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3 bg-primary-dark border border-border-subtle rounded-xl focus:bg-primary-dark focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold transition-all outline-none text-sm font-medium text-text-primary"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase text-text-secondary mb-2 block ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-border-subtle" size={18} />
                  <input 
                    type="email" 
                    className="w-full pl-12 pr-4 py-3 bg-primary-dark border border-border-subtle rounded-xl focus:bg-primary-dark focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold transition-all outline-none text-sm font-medium text-text-primary"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="ct-btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* GUARDIANS SECTION */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-6 text-accent-gold font-bold uppercase tracking-widest text-[10px]">
            <Shield size={14} />
            Emergency Guardians
          </div>
          <div className="space-y-4">
            {/* Guardian List */}
            {profile.guardians?.map((g, i) => (
              <div key={i} className="bg-secondary-dark p-5 rounded-card border border-border-subtle flex items-center justify-between group hover:border-accent-gold/30 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-accent-gold/10 text-accent-gold rounded-xl flex items-center justify-center font-bold">
                       {g.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary">{g.name}</div>
                      <div className="text-[10px] text-text-secondary font-medium">{g.email}</div>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleRemoveGuardian(i)}
                   className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            ))}

            {/* Empty State */}
            {(!profile.guardians || profile.guardians.length === 0) && (
              <div className="p-8 text-center border-2 border-dashed border-border-subtle rounded-card bg-secondary-dark/30">
                 <p className="text-text-secondary text-xs font-bold">No guardians added yet.</p>
                 <p className="text-[10px] text-text-secondary/60 mt-1">Add trusted contacts to be notified during SOS alerts.</p>
              </div>
            )}

            {/* Add Guardian Form */}
            <div className="bg-secondary-dark p-6 rounded-card border border-border-subtle mt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 ml-1">Add New Guardian</h4>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Full Name" 
                  className="w-full px-4 py-3 bg-primary-dark border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all"
                  value={newGuardian.name}
                  onChange={e => setNewGuardian({...newGuardian, name: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email Address" 
                  className="w-full px-4 py-3 bg-primary-dark border border-border-subtle rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all"
                  value={newGuardian.email}
                  onChange={e => setNewGuardian({...newGuardian, email: e.target.value})}
                />
                <button 
                  onClick={handleAddGuardian}
                  className="w-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent-gold hover:text-primary-dark transition-all"
                >
                  <Plus size={16} />
                  Add Guardian
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Status Message */}
      {message.text && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-bounce z-50 ${message.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
           {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
           {message.text}
        </div>
      )}
    </div>
  );
}
