import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  AlertCircle, Shield, Phone, MapPin, FileText, Siren,
  Users, ChevronRight, Menu, X, LogOut, Lock, Clock, Bell, Activity, LayoutDashboard, Radio,
  ArrowRight, ShieldCheck, Globe, Zap, MousePointer2
} from "lucide-react";

export default function CrimeReportingHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const tickerRef = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    try {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/dashboard";
    if (user.role === "police") return "/police/dashboard";
    if (user.role === "user") return "/citizen";
    return "/dashboard";
  };

  useEffect(() => {
    checkAuth();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/community`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.reports?.length > 0) {
          setLiveAlerts(data.reports.slice(0, 8));
        }
      } catch (e) {}
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] font-['Inter',sans-serif] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">
      
      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? "py-4 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl" : "py-8 bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
             <div className="h-12 w-12 bg-blue-600 rounded-[16px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                <ShieldCheck size={28} />
             </div>
             <div>
                <span className="text-2xl font-black tracking-tighter uppercase italic leading-none block">CrimeTrack</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[4px] leading-none block mt-1">Operational</span>
             </div>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
             {["Features", "Tactical Map", "Emergency"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[11px] font-black uppercase tracking-[3px] text-slate-500 hover:text-blue-600 transition-colors">
                   {item}
                </a>
             ))}
          </div>

          <div className="flex items-center gap-6">
             {isLoggedIn ? (
               <div className="hidden md:flex items-center gap-4">
                  <Link to={getDashboardLink()} className="px-8 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[3px] hover:scale-105 active:scale-95 transition-all shadow-xl">
                     Terminal
                  </Link>
                  <Link to="/logout" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                     <LogOut size={20} />
                  </Link>
               </div>
             ) : (
               <div className="flex items-center gap-4">
                  <Link to="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[3px] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mr-4">
                     Sign In
                  </Link>
                  <Link to="/register" className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                     Join Force
                  </Link>
               </div>
             )}
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white dark:bg-[#020617] pt-32 p-8 animate-in fade-in slide-in-from-top-10 duration-500">
           <div className="flex flex-col gap-8 text-center">
              {["Features", "Tactical Map", "Emergency"].map((item) => (
                <a key={item} href="#" className="text-3xl font-black uppercase italic tracking-tighter">{item}</a>
              ))}
              <hr className="border-slate-100 dark:border-slate-800" />
              {isLoggedIn ? (
                <Link to={getDashboardLink()} className="py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[4px]">Open Terminal</Link>
              ) : (
                <Link to="/register" className="py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[4px]">Get Started</Link>
              )}
           </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section className="relative pt-48 pb-64 lg:pt-64 lg:pb-80 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[200px] -mr-96 -mt-96" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-rose-600/10 dark:bg-rose-600/5 rounded-full blur-[200px] -ml-96 -mb-96" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.1]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
             <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="h-2 w-12 bg-blue-600 rounded-full" />
                <span className="text-[12px] font-black uppercase tracking-[6px] italic">Global Security Grid 2.0</span>
             </div>
             
             <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic mb-12 animate-in fade-in slide-in-from-left-6 duration-1000">
                Neutralizing <br/> <span className="text-blue-600 underline decoration-blue-500/10 decoration-[20px] underline-offset-[20px]">Threats</span> <br/> In Realtime
             </h1>

             <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed italic mb-16 animate-in fade-in slide-in-from-left-8 duration-1000">
                Advanced encrypted infrastructure connecting citizens with elite tactical units. Deploy intelligence, track incidents, and secure your perimeter.
             </p>

             <div className="flex flex-col sm:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <Link to="/report" className="w-full sm:w-auto px-12 py-6 bg-rose-600 text-white rounded-[32px] text-lg font-black uppercase tracking-[4px] italic hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-rose-600/30 flex items-center justify-center gap-4">
                   <AlertCircle size={24} className="animate-pulse" /> Dispatch Intel
                </Link>
                <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[32px] text-lg font-black uppercase tracking-[4px] italic hover:border-blue-500 transition-all flex items-center justify-center gap-4 shadow-xl">
                   Join Infrastructure <ChevronRight size={24} />
                </Link>
             </div>
          </div>
        </div>

        {/* Live Ticker Floating */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
           <div className="bg-slate-950 border-t border-slate-800/50 py-6 overflow-hidden backdrop-blur-3xl">
              <div className="flex items-center">
                 <div className="shrink-0 flex items-center gap-3 px-10 border-r border-slate-800">
                    <div className="h-3 w-3 bg-rose-600 rounded-full animate-ping" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[5px] italic">Live Feed</span>
                 </div>
                 <div className="overflow-hidden relative flex-1">
                    <div 
                      className="flex gap-20 animate-marquee whitespace-nowrap px-10"
                      style={{ animation: "marquee 60s linear infinite" }}
                    >
                       {[...liveAlerts, ...liveAlerts].map((alert, i) => (
                         <div key={i} className="flex items-center gap-5">
                            <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-lg">[{alert.crimeType}]</span>
                            <span className="text-white text-xs font-black uppercase tracking-tight italic opacity-80">{alert.title}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                               <MapPin size={12} className="text-blue-500" /> {alert.location?.address?.split(',')[0]}
                            </span>
                         </div>
                       ))}
                       {liveAlerts.length === 0 && (
                         <span className="text-slate-600 text-[10px] font-black uppercase tracking-[10px] italic">Scanning Operational Grid... Datalink Secure... Standing By...</span>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── METRICS SECTION ── */}
      <section className="py-24 bg-white dark:bg-[#020617] transition-colors duration-500">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { label: "Alerts Dispatched", val: "12,482+", icon: <Zap /> },
              { label: "Verified Stations", val: "1,200+", icon: <Globe /> },
              { label: "Active Field Units", val: "84,000+", icon: <Shield /> },
              { label: "Avg Response Time", val: "1.4 Min", icon: <Clock /> },
            ].map((stat, i) => (
              <div key={i} className="p-10 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-[48px] text-center group hover:border-blue-500/30 transition-all shadow-sm">
                 <div className="h-20 w-20 bg-blue-600/10 dark:bg-blue-600/5 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                    {React.cloneElement(stat.icon, { size: 36 })}
                 </div>
                 <p className="text-4xl font-black tracking-tighter italic uppercase mb-2 group-hover:text-blue-600 transition-colors">{stat.val}</p>
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] italic">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-32 lg:py-48 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-500 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center mb-32">
              <h2 className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[10px] mb-8 italic">Grid Capabilities</h2>
              <h3 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">High-Octane <br/> <span className="text-blue-600">Surveillance</span></h3>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {[
                { title: "Ghost Reporting", desc: "Military-grade encryption ensures absolute anonymity while reporting critical incidents.", icon: <Lock />, color: "rose" },
                { title: "SOS Vectoring", desc: "One-tap emergency broadcast with real-time GPS telemetry for immediate dispatch.", icon: <Radio />, color: "blue" },
                { title: "Visual Intel", desc: "Deep-dive into verified incident hotspots with interactive tactical map overlays.", icon: <MapPin />, color: "emerald" },
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-950 p-12 lg:p-16 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-2xl relative group overflow-hidden">
                   <div className={`absolute top-0 right-0 h-48 w-48 bg-${feature.color}-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000`} />
                   
                   <div className={`h-24 w-24 bg-${feature.color}-500/10 dark:bg-${feature.color}-500/5 text-${feature.color}-600 rounded-[32px] flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform shadow-inner`}>
                      {React.cloneElement(feature.icon, { size: 48 })}
                   </div>
                   
                   <h4 className="text-3xl font-black tracking-tighter uppercase italic mb-8 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                   <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic mb-10">"{feature.desc}"</p>
                   
                   <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[4px] text-blue-600 group-hover:gap-6 transition-all italic">
                      Analyze Module <ArrowRight size={18} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-48 px-6 lg:px-12">
         <div className="max-w-7xl mx-auto rounded-[80px] bg-slate-950 relative overflow-hidden p-20 lg:p-40 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-rose-600/30 opacity-50" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[200px] -mr-96 -mt-96 animate-pulse" />
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
               <h2 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-12 group-hover:scale-110 transition-transform duration-1000">
                  Ready to <br/> <span className="text-blue-500">Secure</span> <br/> Your Sector?
               </h2>
               <p className="text-xl md:text-2xl text-slate-400 font-medium italic mb-20 leading-relaxed">
                  Join the most advanced community safety network in existence. Encrypted communication. Realtime response. Zero compromise.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                  <Link to="/register" className="w-full sm:w-auto px-16 py-8 bg-white text-slate-950 rounded-[40px] text-xl font-black uppercase tracking-[6px] italic hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95">
                     Initiate Protocol
                  </Link>
                  <Link to="/emergency" className="w-full sm:w-auto flex items-center gap-4 text-white text-[12px] font-black uppercase tracking-[6px] italic hover:text-rose-500 transition-colors">
                     <Phone size={24} /> Emergency Deck
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#020617] transition-colors duration-500">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
            <div className="md:col-span-1">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">CT</div>
                  <span className="text-xl font-black tracking-tighter uppercase italic">CrimeTrack</span>
               </div>
               <p className="text-xs text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest leading-loose italic">
                  Advanced operational infrastructure dedicated to civilian protection and rapid multi-agency dispatch.
               </p>
            </div>

            {[
              { title: "Platform", links: ["Features", "Tactical Map", "Awareness Hub", "Verified Units"] },
              { title: "Compliance", links: ["Privacy Shield", "Intel Ethics", "Protocol V2", "Security Status"] },
              { title: "Emergency", links: ["SOS Alpha", "Police Radio", "Medical Link", "Fire Dispatch"] },
            ].map((col, i) => (
              <div key={i}>
                 <h5 className="text-[12px] font-black uppercase tracking-[5px] mb-10 italic">{col.title}</h5>
                 <ul className="space-y-6">
                    {col.links.map(link => (
                      <li key={link}>
                         <a href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-500 transition-colors uppercase tracking-[4px] italic">{link}</a>
                      </li>
                    ))}
                 </ul>
              </div>
            ))}
         </div>
         <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-32 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-50 dark:border-slate-900 pt-16">
            <p className="text-[9px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[8px] italic">© {new Date().getFullYear()} CRIMETRACK INFRASTRUCTURE • ALL RIGHTS RESERVED • ENCRYPTED SESSION ACTIVE</p>
            <div className="flex items-center gap-8">
               <ShieldCheck className="text-slate-200 dark:text-slate-800" size={32} />
               <Radio className="text-slate-200 dark:text-slate-800" size={32} />
               <MousePointer2 className="text-slate-200 dark:text-slate-800" size={32} />
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { display: flex; animation: marquee 120s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}