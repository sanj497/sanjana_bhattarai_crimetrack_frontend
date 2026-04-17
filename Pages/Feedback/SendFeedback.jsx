import { useState } from "react";
import axios from "axios";
import React from "react";
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Star,
  Shield,
  Clock,
  User
} from "lucide-react";
const API = `${import.meta.env.VITE_BACKEND_URL}/api/feedback/auth`;

export default function SendFeedback() {
  const [form, setForm] = useState({ message: "", rating: "" });
  const [status, setStatus] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

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

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                Send Feedback
              </h1>
              <p className="text-sm text-slate-400">
                Help us improve our services with your valuable feedback
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Response within 24-48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Secure & Confidential</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* No Token Warning */}
            {!token && (
              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-1">Authentication Required</p>
                    <p className="text-xs text-red-400">Please log in to submit feedback</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4">
                How would you rate your experience? <span className="text-red-400">*</span>
              </label>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-200 transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-all duration-200 ${
                          (hoveredRating || Number(form.rating)) >= star
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoveredRating || Number(form.rating)) > 0 && (
                  <p className="text-center text-sm font-medium text-slate-300">
                    {ratingLabels[hoveredRating || Number(form.rating)]}
                  </p>
                )}
              </div>
            </div>

            {/* Message Section */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Your Feedback <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-white placeholder-slate-500 transition-all duration-200 bg-slate-900/50 hover:bg-slate-900"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {form.message.length} characters
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!token || status === "sending"}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                !token || status === "sending"
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {status === "sending" ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>

            {/* Success Message */}
            {status === "success" && (
              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-green-300 mb-1">Feedback Submitted Successfully!</p>
                    <p className="text-xs text-green-400">Thank you for your valuable input. We'll review it shortly.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {status === "error" && (
              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-1">Submission Failed</p>
                    <p className="text-xs text-red-400">Please try again. If the problem persists, contact support.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Your feedback helps us improve our crime tracking system for everyone.
          </p>
        </div>

      </div>
    </div>
  );
}