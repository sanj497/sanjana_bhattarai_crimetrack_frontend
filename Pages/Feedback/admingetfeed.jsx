import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
const API = "http://localhost:5000/api/feedback";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(data.feedbacks);
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
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm tracking-wide animate-pulse">Loading feedbacks...</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          📋 All Feedback
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {feedbacks.length} response{feedbacks.length !== 1 ? "s" : ""} collected
        </p>
      </div>

      {/* Empty State */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm">No feedback yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800 text-sm">
                  {f.name || f.userId?.email || "Anonymous"}
                </span>
                <span className="text-amber-400 text-sm font-medium">
                  {"⭐".repeat(f.rating || 0)}{" "}
                  <span className="text-gray-400">
                    {f.rating ? `(${f.rating}/5)` : "No rating"}
                  </span>
                </span>
              </div>

              {/* Message */}
              <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-100 pl-3 italic">
                {f.message}
              </p>

              {/* Card Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <small className="text-xs text-gray-400">
                  {new Date(f.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </small>
                <button
                  onClick={() => handleDelete(f._id)}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border border-red-100 hover:border-red-500"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}