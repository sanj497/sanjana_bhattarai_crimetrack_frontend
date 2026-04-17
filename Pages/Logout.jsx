import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Shield, LogOut, ArrowLeft, CheckCircle, AlertCircle, Activity } from "lucide-react";

const Logout = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle"); // idle | loggingOut | done
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    setStatus("loggingOut");

    setTimeout(() => {
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔥 Tell navbar to update instantly
      window.dispatchEvent(new Event("authChange"));

      setStatus("done");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    }, 800);
  };

  const handleCancel = () => {
    const role = user?.role;
    if (role === "admin") navigate("/dashboard");
    else if (role === "police") navigate("/police/dashboard");
    else if (role === "user") navigate("/citizen");
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9FC] font-sans text-[#111827]">
      {/* Left pane - branding */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0B1F3B] p-12 lg:p-24 relative overflow-hidden text-white justify-between">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1E5EFF] via-[#0B1F3B] to-[#0B1F3B]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-[#1E5EFF]">
              <img src="https://res.cloudinary.com/dvziqqu1j/image/upload/v1776324979/crimetrack_logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white uppercase italic" style={{ fontFamily: "Poppins, sans-serif" }}>CrimeTrack</span>
          </div>

          <div className="max-w-md mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white/10 text-[#00B8D9] font-medium text-xs mb-6 border border-white/5 backdrop-blur-sm">
              <Activity className="h-4 w-4" /> Secure Session Management
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Ending Your <br /><span className="text-[#00B8D9]">Secure Session.</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Your session will be terminated. All active connections will be securely closed for your protection.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          © {new Date().getFullYear()} Crime Track. All communications are E2E encrypted.
        </div>
      </div>

      {/* Right pane - logout confirmation */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <button 
          onClick={handleCancel}
          className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#0B1F3B] transition z-10"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
        
        <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 my-12 md:my-0">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center space-x-2 mb-10 justify-center">
             <Shield className="h-8 w-8 text-[#1E5EFF]" />
             <span className="text-2xl font-bold text-[#0B1F3B]" style={{ fontFamily: "Poppins, sans-serif" }}>CrimeTrack</span>
          </div>

          {/* IDLE STATE - Confirmation */}
          {status === "idle" && (
            <>
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 mb-6 shadow-inner">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <LogOut className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Confirm Logout</h2>
                <p className="text-[#6B7280] text-sm mb-2">
                  You are currently signed in as
                </p>
                {user?.name && (
                  <p className="text-[#0B1F3B] font-semibold text-base mb-4">
                    {user.name}
                  </p>
                )}
                {user?.email && (
                  <p className="text-[#6B7280] text-sm">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 text-sm font-semibold mb-1">Session Termination</p>
                    <p className="text-amber-700 text-xs">
                      You will need to sign in again to access your dashboard and features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-[12px] font-bold hover:from-red-600 hover:to-red-700 transition shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] active:scale-[0.98]"
                >
                  <LogOut className="h-5 w-5" /> Yes, Sign Out
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 bg-[#F7F9FC] text-[#0B1F3B] py-4 rounded-[12px] font-bold hover:bg-gray-100 transition border border-gray-200 active:scale-[0.98]"
                >
                  <ArrowLeft className="h-5 w-5" /> Cancel, Stay Logged In
                </button>
              </div>
            </>
          )}

          {/* LOGGING OUT STATE */}
          {status === "loggingOut" && (
            <>
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-6 shadow-inner">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#1E5EFF]/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E5EFF] animate-spin"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Signing Out</h2>
                <p className="text-[#6B7280] text-sm">
                  Securely terminating your session...
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-[#1E5EFF] rounded-full animate-pulse"></div>
                    <p className="text-blue-700 text-sm font-medium">Clearing authentication tokens</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-[#1E5EFF] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <p className="text-blue-700 text-sm font-medium">Closing secure connections</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* DONE STATE */}
          {status === "done" && (
            <>
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 mb-6 shadow-inner">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Successfully Signed Out</h2>
                <p className="text-[#6B7280] text-sm">
                  Your session has been securely terminated.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-800 text-sm font-semibold mb-1">Session Closed</p>
                    <p className="text-emerald-700 text-xs">
                      All authentication tokens have been cleared. Redirecting to home page...
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[#6B7280] text-sm">
                <div className="h-1.5 w-1.5 bg-[#1E5EFF] rounded-full animate-pulse"></div>
                <span>Redirecting in a moment...</span>
              </div>
            </>
          )}

          {/* Message Banner */}
          {message && (
            <div className={`mt-6 p-4 rounded-[12px] flex items-start gap-3 border ${error ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}>
              {error ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logout;