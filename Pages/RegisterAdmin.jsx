import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import React from "react";
import { Mail, Lock, ArrowRight, Shield, Activity, ChevronLeft, User, Key, Eye, EyeOff } from "lucide-react";

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [showSecret, setShowSecret] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (!form.username || !form.email || !form.password || !form.confirmPassword || !form.secretKey) {
      setMessage("Please fill all fields including the authorization key.");
      setError(true);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: "admin",
          secretKey: form.secretKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent to your email. Please verify.");
        setError(false);
        setStep("otp");
      } else {
        setMessage(data.msg || "Registration failed.");
        setError(true);
      }
    } catch {
      setMessage("Server connection failed. Try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);
    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP.");
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Admin account verified! Redirecting to login...");
        setError(false);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.msg || "OTP verification failed.");
        setError(true);
      }
    } catch {
      setMessage("Server error. Try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9FC] font-sans text-[#111827]">
      {/* Left Pane */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0B1F3B] p-12 lg:p-24 relative overflow-hidden text-white justify-between">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7C3AED] via-[#0B1F3B] to-[#0B1F3B]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-[#7C3AED]">
              <img src="/crimetrack.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white uppercase italic" style={{ fontFamily: "Poppins, sans-serif" }}>CrimeTrack</span>
          </div>
          <div className="max-w-md mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white/10 text-[#A78BFA] font-medium text-xs mb-6 border border-white/10">
              <Key className="h-4 w-4" /> Admin Only Portal
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Administer. <br /><span className="text-[#7C3AED]">Control. Protect.</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Create your administrator account to manage reports, verify cases, dispatch police units, and oversee the entire CrimeTrack platform.
            </p>
            <div className="space-y-4">
              {["Full report verification access","User & officer management","Real-time notification control","Case forwarding & dispatch"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-5 w-5 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                    <Activity className="h-3 w-3 text-[#7C3AED]" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-500">
          © {new Date().getFullYear()} CrimeTrack. Authorized Personnel Only.
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <Link to="/login" className="absolute top-6 left-6 md:top-10 md:right-10 md:left-auto flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#0B1F3B] transition z-10">
          <ChevronLeft className="h-4 w-4 md:hidden" /> Back to login
        </Link>

        <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 my-12 md:my-0">
          <div className="md:hidden flex items-center space-x-2 mb-10 justify-center">
            <Shield className="h-8 w-8 text-[#7C3AED]" />
            <span className="text-2xl font-bold text-[#0B1F3B]" style={{ fontFamily: "Poppins, sans-serif" }}>CrimeTrack</span>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100">
              <Key className="h-3.5 w-3.5" /> ADMIN REGISTRATION
            </span>
          </div>

          {step === "register" && (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#0B1F3B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Create Admin Account</h2>
                <p className="text-[#6B7280] text-sm">Requires a valid admin authorization key.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#0B1F3B]">Full Name / Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="username" placeholder="Admin username" value={form.username} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F7F9FC] border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition text-[#111827]" required />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#0B1F3B]">Official Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" name="email" placeholder="admin@crimetrack.gov" value={form.email} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F7F9FC] border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition text-[#111827]" required />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#0B1F3B]">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-[#F7F9FC] border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition text-[#111827]" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-[#0B1F3B]">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 bg-[#F7F9FC] border rounded-[12px] focus:outline-none focus:ring-2 transition text-[#111827] ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-300 focus:ring-red-400/50" : "border-gray-200 focus:ring-purple-400/50 focus:bg-white"}`} required />
                    </div>
                  </div>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 font-semibold -mt-2">Passwords do not match.</p>
                )}

                {/* Authorization Key */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#0B1F3B]">Admin Authorization Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <input type={showSecret ? "text" : "password"} name="secretKey" placeholder="Enter admin secret key"
                      value={form.secretKey} onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3.5 bg-purple-50 border border-purple-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition text-[#111827] font-mono" required />
                    <button type="button" onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Contact the system owner to obtain the admin key.</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-[12px] font-bold hover:bg-purple-700 transition shadow-[0_4px_14px_0_rgba(124,58,237,0.35)] mt-4 disabled:opacity-70">
                  {loading ? "Processing registration..." : "Register Admin Account"} <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-[#6B7280] text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700 transition">Sign In</Link>
                </p>
                <p className="text-[#6B7280] text-xs mt-2">
                  Registering as a police officer?{" "}
                  <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition">Use standard registration and select Police Officer</Link>
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-6">
                  <Shield className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-[#0B1F3B] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Email Verification</h2>
                <p className="text-[#6B7280] text-sm">
                  Enter the 6-digit OTP sent to{" "}
                  <span className="font-semibold text-[#0B1F3B]">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input type="text" placeholder="000000" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6}
                  className="w-full py-4 px-6 bg-[#F7F9FC] border border-gray-200 rounded-[12px] text-center text-4xl tracking-[0.5em] font-mono font-bold text-[#0B1F3B] focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition" />

                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-[12px] font-bold hover:bg-purple-700 transition shadow-[0_4px_14px_0_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Verifying..." : "Verify & Activate"} <Lock className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 text-center">
                <button type="button" onClick={() => { setStep("register"); setOtp(""); setMessage(""); }}
                  className="text-sm font-semibold text-[#6B7280] hover:text-[#0B1F3B] transition inline-flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" /> Wrong email? Go back
                </button>
              </div>
            </>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-[12px] flex items-start gap-3 border ${error ? "bg-red-50 border-red-100 text-red-600" : "bg-purple-50 border-purple-100 text-purple-700"}`}>
              {error ? <Activity className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
