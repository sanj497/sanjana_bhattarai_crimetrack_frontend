import React, { useEffect, useState } from "react";
import axios from "axios";
import { Shield, ShieldAlert, User as UserIcon, CheckCircle2, XCircle, Search, MoreVertical, ShieldCheck, Trash2 } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/users?page=${currentPage}&limit=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Actions...
  const makePolice = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-role/${id}`, { role: "police" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.msg || "Error"); }
  };

  const removePolice = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-role/${id}`, { role: "user" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.msg || "Error"); }
  };

  const verifyPoliceApplication = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-police/${id}`, { action }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.msg || "Verification failed"); }
  };

  const removeUserAction = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/remove/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.msg || "Failed to remove user"); }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#020617] font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">User Directory</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Manage system access, security roles, and verify officer credentials.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
            <ShieldCheck className="text-blue-500 h-5 w-5" />
            <span className="text-sm font-bold text-slate-300">{totalItems} Total Accounts</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-[24px] border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 hidden md:table-cell">Account ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50">Security Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 hidden lg:table-cell">Verification Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 ${user.role === 'police' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-blue-900/30 border-blue-800 text-blue-400'}`}>
                            {user.role === 'police' ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.username || user.email.split("@")[0]}</div>
                            <div className="text-xs font-medium text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded-md">{user._id.substring(user._id.length - 8)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'police' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : user.role === 'admin' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {user.role === 'police' && <ShieldCheck size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        {user.policeVerification?.status === "pending" ? (
                           <div className="flex flex-col gap-1">
                             <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-widest"><ShieldAlert size={12} className="animate-pulse" /> Pending Review</span>
                             <span className="text-[10px] font-bold text-slate-500">Badge: {user.policeVerification?.badgeNumber || "NA"}</span>
                           </div>
                        ) : user.role === "police" ? (
                           <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest"><CheckCircle2 size={12} /> Verified Officer</span>
                        ) : <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">-</span>}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.policeVerification?.status === "pending" && (
                            <>
                              <button onClick={() => verifyPoliceApplication(user._id, "approve")} className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-800 hover:border-emerald-600">Approve</button>
                              <button onClick={() => verifyPoliceApplication(user._id, "reject")} className="px-3 py-1.5 bg-rose-900/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-800 hover:border-rose-600">Reject</button>
                            </>
                          )}
                          {user.role === "police" && (
                            <button onClick={() => removePolice(user._id)} className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:bg-rose-900/50 hover:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-800 inline-flex items-center gap-1.5"><XCircle size={14} /> Revoke</button>
                          )}
                          <button onClick={() => removeUserAction(user._id)} className="px-3 py-1.5 bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-600 inline-flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-12 text-center text-slate-400 font-bold text-sm">No accounts found.</div>}
              
              {/* Server-Side Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages} ({totalItems} Users)</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Prev</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;