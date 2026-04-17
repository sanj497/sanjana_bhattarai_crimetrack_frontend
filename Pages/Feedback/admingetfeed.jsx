import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import { ChevronLeft, ChevronRight, Star, Trash2, MessageSquare, Calendar } from "lucide-react";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/feedback`;

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  const fetchFeedbacks = async (page = currentPage) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}?page=${page}&limit=${itemsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(data.feedbacks);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      console.error("Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh current page after deletion
      fetchFeedbacks(currentPage);
    } catch (err) {
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [currentPage]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-semibold">Gathering community insights...</p>
        </div>
      </div>
    );

  return (
    <div className="p-8 md:p-10 min-h-screen bg-[#020617] font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center">
              <MessageSquare className="text-blue-500" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">User Feedback</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                {totalItems} response{totalItems !== 1 ? "s" : ""} collected from citizens
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-[32px] border border-slate-800">
            <MessageSquare size={64} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-semibold text-lg">No feedback records found.</p>
            <p className="text-slate-500 text-sm mt-2">Citizen feedback will appear here once submitted.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {feedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-slate-900/70 backdrop-blur-xl rounded-[24px] p-8 border border-slate-800 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <span className="font-bold text-lg text-white">
                      {f.name || f.userId?.email?.split("@")[0] || "Anonymous User"}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">{f.userId?.email || "No email provided"}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        className={i < (f.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-700"} 
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-2 font-semibold">({f.rating || 0}/5)</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                   <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{f.message}"
                  </p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                    <Calendar size={14} />
                    {new Date(f.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() => handleDelete(f._id)}
                    className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                    DELETE
                  </button>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-5 bg-slate-900/50 rounded-[24px] border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages} ({totalItems} Feedback{totalItems !== 1 ? "s" : ""})
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-blue-600 hover:text-white"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}