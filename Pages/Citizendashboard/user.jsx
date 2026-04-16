import React, { useEffect, useState } from "react";
import axios from "axios";
import { Shield, ShieldAlert, User as UserIcon, CheckCircle2, XCircle, Search, MoreVertical, ShieldCheck } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // GET ALL USERS
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // MAKE POLICE
  const makePolice = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-role/${id}`,
        { role: "police" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  // REMOVE POLICE (BACK TO USER)
  const removePolice = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-role/${id}`,
        { role: "user" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  const verifyPoliceApplication = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-police/${id}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Verification failed");
    }
  };

  // REMOVE USER
  const removeUserAction = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to remove user");
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#f8fafc] font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">User Directory</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage system access, security roles, and verify officer credentials.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <ShieldCheck className="text-blue-500 h-5 w-5" />
            <span className="text-sm font-bold text-slate-700">{users.length} Active Accounts</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 hidden md:table-cell">Account ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Security Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 hidden lg:table-cell">Verification Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                      {/* User Profile Column */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {/* Professional Avatar Image Placeholder */}
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 ${user.role === 'police' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                            {user.role === 'police' ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.username || user.email.split("@")[0]}
                            </div>
                            <div className="text-xs font-medium text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account ID Column */}
                      <td className="px-6 py-5 hidden md:table-cell whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">
                          {user._id.substring(user._id.length - 8)}
                        </span>
                      </td>

                      {/* Role Column */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          user.role === 'police' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {user.role === 'police' && <ShieldCheck size={12} />}
                          {user.role}
                        </span>
                      </td>

                      {/* Verification Context */}
                      <td className="px-6 py-5 hidden lg:table-cell">
                        {user.policeVerification?.status === "pending" ? (
                           <div className="flex flex-col gap-1">
                             <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                               <ShieldAlert size={12} className="animate-pulse" /> Pending Review
                             </span>
                             <span className="text-[10px] font-bold text-slate-400">Badge: {user.policeVerification?.badgeNumber || "NA"}</span>
                           </div>
                        ) : user.role === "police" ? (
                           <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                               <CheckCircle2 size={12} /> Verified Officer
                           </span>
                        ) : (
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">-</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        {user.policeVerification?.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => verifyPoliceApplication(user._id, "approve")}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-100 hover:border-emerald-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => verifyPoliceApplication(user._id, "reject")}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 hover:border-rose-500"
                            >
                              Reject
                            </button>
                          </div>
                        ) : user.role === "police" ? (
                          <button
                            onClick={() => removePolice(user._id)}
                            className="px-4 py-2 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:border-rose-200 inline-flex items-center gap-1.5"
                          >
                            <XCircle size={14} /> Revoke Status
                          </button>
                        ) : (
                          <button
                            onClick={() => removeUserAction(user._id)}
                            className="px-4 py-2 bg-slate-50 text-slate-500 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:border-rose-600 inline-flex items-center gap-1.5"
                          >
                            <XCircle size={14} /> Remove User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                 <div className="p-12 text-center text-slate-500 font-bold text-sm">No accounts found in the system.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;