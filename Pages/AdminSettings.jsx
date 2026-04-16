import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Save, Camera } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export default function AdminSettings() {
  const [profile, setProfile] = useState({ username: "", email: "", profilePicture: null });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingPicture, setUploadingPicture] = useState(false);

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
      if (res.ok && data.success) {
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
        toast.success("Profile updated successfully!");
        setProfile(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        toast.error(data.msg || "Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

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

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Administrator Profile</h1>
        <p className="text-slate-500 mt-2 font-medium underline decoration-blue-500/30">Manage your account information and profile picture.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg bg-slate-100 flex items-center justify-center">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Shield className="h-16 w-16 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                <Camera size={18} className="text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePictureUpload}
                  className="hidden"
                  disabled={uploadingPicture}
                />
              </label>
              {uploadingPicture && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="h-8 w-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Click camera to upload</p>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-semibold"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-semibold"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full bg-[#0B1F3B] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
