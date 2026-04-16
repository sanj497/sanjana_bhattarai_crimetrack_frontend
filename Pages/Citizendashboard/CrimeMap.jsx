import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, ShieldAlert, Globe, Crosshair, AlertTriangle, ShieldCheck, Navigation2, Search, Zap } from "lucide-react";

const API = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

const SEVERITY_COLOR = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "#facc15",
  Low:      "#22c55e",
};

export default function CrimeMap() {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup  = useRef(null);
  const markersRef  = useRef({});
  const tileLayerRef = useRef(null);
  const navigate    = useNavigate();

  const [reports, setReports]   = useState([]);
  const [nearby, setNearby]     = useState([]);
  const [filter, setFilter]     = useState("All");
  const [activeTab, setActiveTab] = useState("nearby"); // "nearby" | "global"
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  // ── Theme Watcher ──────────────────────────────────────────────
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // ── Tile Layer Switcher ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current) return;
    
    if (tileLayerRef.current) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19
    }).addTo(mapInstance.current);
  }, [isDark]);

  // ── Init Map ───────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      zoomSnap: 0.5,
    }).setView([27.7172, 85.324], 13);

    const initialIsDark = document.documentElement.classList.contains("dark");
    const tileUrl = initialIsDark 
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    layerGroup.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        map.flyTo(coords, 14);
        
        // Add User Marker
        L.circleMarker(coords, {
          radius: 10,
          fillColor: "#3b82f6",
          color: "#fff",
          weight: 4,
          fillOpacity: 1,
          className: 'user-marker-pulse'
        }).addTo(map).bindPopup("<b class='font-black uppercase tracking-widest text-[10px]'>Your Identification Node</b>");

        // Add Safety Pulse
        L.circle(coords, {
          radius: 5000,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.03,
          weight: 1,
          dashArray: '10, 20'
        }).addTo(map);
      });
    }

    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Use the dedicated map endpoint
      const reportEndpoint = `${API}/map`;

      // Fetch Reports
      const gRes = await fetch(reportEndpoint, { headers });
      const gJson = await gRes.json();
      
      // Fetch SOS
      const sRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos`, { headers });
      const sJson = await sRes.json();

      if (gJson.success) {
        const reportsData = gJson.reports || gJson.crimes || [];
        const sosData = sJson.success ? sJson.data.map(s => ({...s, _isSOS: true, crimeType: "🚨 EMERGENCY SOS", severity: "Critical"})) : [];
        const combined = [...reportsData, ...sosData];
        setReports(combined);
        plotMarkers(combined);
      }

      // Fetch Nearby if location available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const nRes = await fetch(`${API}/nearby?lat=${latitude}&lng=${longitude}&radius=5000`, { headers });
          const nJson = await nRes.json();
          if (nJson.success) setNearby(nJson.reports);
        });
      }
    } catch (err) {
      console.error("Map fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const plotMarkers = (data) => {
    const group = layerGroup.current;
    if (!group) return;
    group.clearLayers();
    
    data.forEach((r) => {
      const lat = r._isSOS ? r.latitude : r.location?.lat;
      const lng = r._isSOS ? r.longitude : r.location?.lng;
      if (!lat || !lng) return;

      const color = r._isSOS ? "#ef4444" : (SEVERITY_COLOR[r.severity] || "#888");
      const marker = L.circleMarker([lat, lng], {
        radius: r._isSOS ? 16 : (r.severity === "Critical" ? 12 : 10),
        fillColor: color,
        color: "#fff",
        weight: r._isSOS ? 5 : 2,
        fillOpacity: r._isSOS ? 1 : 0.9,
        className: r._isSOS ? "sos-marker-pulse" : "standard-marker"
      });

      marker.bindPopup(`
        <div class="p-4 min-w-[200px] font-sans">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2 h-2 rounded-full animate-pulse" style="background:${color}"></span>
            <b class="text-[10px] font-black uppercase tracking-[3px] italic" style="color:${color}">${r._isSOS ? "URGENT DISPATCH" : r.crimeType}</b>
          </div>
          <p class="text-[12px] font-black uppercase tracking-tighter text-slate-800 mb-2 truncate">${r.title || "Unknown Incident"}</p>
          <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl">
             <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">${r._isSOS ? "Live GPS Coordinates" : r.location?.address || "Address Encrypted"}</p>
          </div>
          <div class="mt-4 flex gap-2">
            <span class="text-[9px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 uppercase tracking-widest">
              <Zap size={10} /> ${r.severity}
            </span>
            <span class="text-[9px] font-black border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg uppercase tracking-widest">
              ${r.status || 'Active'}
            </span>
          </div>
        </div>
      `, { className: 'custom-popup-portal' });
      
      marker.on("click", () => setSelected(r._id));
      group.addLayer(marker);
      markersRef.current[r._id] = marker;
    });
  };

  const focusReport = (r) => {
    setSelected(r._id);
    const lat = r._isSOS ? r.latitude : r.location.lat;
    const lng = r._isSOS ? r.longitude : r.location.lng;
    mapInstance.current.flyTo([lat, lng], 16);
    setTimeout(() => markersRef.current[r._id]?.openPopup(), 600);
  };

  const activeReports = activeTab === "nearby" ? nearby : reports;
  const filtered = filter === "All" ? activeReports : activeReports.filter(r => r.severity === filter);

  const calculateSafetyScore = () => {
    if (nearby.length === 0) return 100;
    const score = 100 - (nearby.length * 5);
    return Math.max(score, 15);
  };

  const isCitizen = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).role === "citizen";

  return (
    <div className="flex h-[calc(100vh-96px)] bg-white dark:bg-[#020617] overflow-hidden font-sans transition-colors duration-300">
      {/* Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full z-0" />
        
        {/* Float Controls */}
        <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-slate-200/50 dark:border-white/10 flex items-center gap-6 animate-in slide-in-from-left-10 duration-700">
             <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl ${calculateSafetyScore() > 70 ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/20'}`}>
                <ShieldCheck size={28} />
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[4px] leading-none mb-2 italic">Sector Integrity</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1 italic tracking-tighter">
                  {calculateSafetyScore()}<span className="text-[10px] text-slate-400 uppercase tracking-widest">% STABLE</span>
                </div>
             </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-2 rounded-[24px] shadow-2xl border border-slate-200/50 dark:border-white/10 flex gap-2 w-fit animate-in slide-in-from-left-10 duration-1000">
             <button 
               onClick={() => setActiveTab("nearby")}
               className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[3px] transition-all italic ${activeTab === 'nearby' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-95' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600'}`}
             >
               <Crosshair size={18} /> Near Me
             </button>
             <button 
               onClick={() => setActiveTab("global")}
               className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[3px] transition-all italic ${activeTab === 'global' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-95' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600'}`}
             >
               <Globe size={18} /> 
               {isCitizen ? "Community Feed" : "Global Intel"}
             </button>
          </div>
        </div>

        {/* Tactical Search Overlays */}
        <div className="absolute bottom-10 left-10 z-10 hidden lg:block">
           <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-white">
              <Navigation2 size={16} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[5px] italic">Active Uplink Established</span>
           </div>
        </div>
      </div>

      {/* INTELLIGENCE SIDEBAR */}
      <aside className="w-[450px] bg-white dark:bg-[#020617] border-l border-slate-100 dark:border-slate-800 flex flex-col shadow-2xl z-20 transition-colors duration-300">
        <div className="p-10 border-b border-slate-50 dark:border-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-blue-600/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10 text-left">
            <div>
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500 mb-3">
                 <ShieldAlert size={20} className="animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[4px]">Verified Threat Intel</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                {activeTab === 'nearby' ? 'Sector Alerts' : 'Global Feed'}
              </h2>
            </div>
            <div className="h-14 w-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xl font-black italic tracking-tighter shadow-inner">
               {filtered.length}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar relative z-10">
            {["All", "Critical", "High", "Medium"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all italic whitespace-nowrap border-2 ${filter === f ? 'bg-slate-950 dark:bg-blue-600 text-white border-slate-950 dark:border-blue-500 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-500/40'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar custom-scrollbar bg-slate-50/30 dark:bg-transparent">
          {filtered.map((r) => (
            <div 
              key={r._id} 
              onClick={() => focusReport(r)}
              className={`p-8 rounded-[40px] border-2 transition-all cursor-pointer group relative overflow-hidden ${selected === r._id ? 'bg-slate-950 dark:bg-slate-900 border-slate-950 dark:border-blue-500/50 shadow-2xl scale-[1.02]' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-blue-500/30 shadow-sm'}`}
            >
               {selected === r._id && (
                 <div className="absolute top-0 right-0 h-24 w-24 bg-blue-600/10 rounded-full blur-2xl -mr-12 -mt-12" />
               )}
               
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`text-[9px] font-black uppercase tracking-[3px] px-4 py-2 rounded-xl italic ${selected === r._id ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-800'}`}>
                    {r.crimeType}
                  </span>
                  <div className={`h-3 w-3 rounded-full shadow-lg ${selected === r._id ? 'animate-ping' : ''}`} style={{ background: SEVERITY_COLOR[r.severity] || '#888' }} />
               </div>
               
               <h4 className={`text-xl font-black tracking-tighter uppercase leading-none italic mb-4 transition-colors ${selected === r._id ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-blue-500'} text-left`}>
                 {r.title || "Unknown Incident Vector"}
               </h4>
               
               <div className={`p-5 rounded-[24px] border transition-colors flex items-start gap-4 ${selected === r._id ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                  <Navigation2 size={16} className="shrink-0 mt-1 dark:text-blue-500" />
                  <p className="text-[11px] font-bold leading-relaxed uppercase tracking-widest text-left italic">
                    {r._isSOS ? "LIVE GPS DISPATCH COORDINATES" : (r.location?.address || "GEOSPATIAL DATA ANALYZING...")}
                  </p>
               </div>
               
               <div className="mt-8 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                       <div className="h-8 w-8 rounded-xl border-2 border-white dark:border-slate-900 bg-blue-500 shadow-lg flex items-center justify-center text-[10px] font-black text-white italic">P</div>
                       <div className="h-8 w-8 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-800 shadow-lg flex items-center justify-center text-[10px] font-black text-white italic">C</div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[3px] ${selected === r._id ? 'text-slate-500' : 'text-slate-300 dark:text-slate-700'}`}>
                      Verified Nodes
                    </span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg ${selected === r._id ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
               </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-24 text-center group">
               <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-[48px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-700">
                  <ShieldCheck className="text-slate-100 dark:text-slate-800 group-hover:text-emerald-500/20 transition-colors" size={56} />
               </div>
               <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[5px] italic mb-4">Zero Active Feed in Sector</p>
               <p className="text-[9px] text-slate-300 dark:text-slate-700 mt-2 font-black uppercase tracking-[4px] leading-relaxed max-w-[250px] mx-auto opacity-70">Sector status baseline stable. Monitoring for potential anomaly detection.</p>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        
        .sos-marker-pulse {
          animation: sos-pulse 1.5s infinite;
        }
        
        @keyframes sos-pulse {
          0% { stroke-width: 2; opacity: 1; }
          100% { stroke-width: 30; opacity: 0; }
        }

        .user-marker-pulse { stroke-dasharray: 4; animation: dash 5s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -20; } }

        .leaflet-container { font-family: 'Inter', sans-serif !important; }
        .custom-popup-portal .leaflet-popup-content-wrapper { 
           border-radius: 28px !important; 
           padding: 0 !important;
           border: 1px solid rgba(226, 232, 240, 0.8) !important;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2) !important;
        }
        .dark .custom-popup-portal .leaflet-popup-content-wrapper {
           background: #0f172a !important;
           border: 1px solid rgba(51, 65, 85, 0.5) !important;
        }
        .custom-popup-portal .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .custom-popup-portal .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  );
}