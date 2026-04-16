import { useEffect, useRef, useState } from "react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

const crimeTypes = [
  "Theft", "Assault", "Burglary", "Fraud", "Vandalism",
  "Drug Offense", "Cybercrime", "Domestic Violence", "Robbery", "Other"
];

const ReportCrime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "", description: "", crimeType: "",
    address: "", lat: "", lng: "", isAnonymous: false,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(1);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onFilesChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).slice(0, 5);
    setFiles(dropped);
  };

  const removeFile = (i) => setFiles(f => f.filter((_, idx) => idx !== i));

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data?.display_name) {
        setForm((p) => ({ ...p, address: data.display_name }));
      }
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
    }
  };

  const placeMarkerAndSetCoords = (lat, lng, zoom = 16) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.setView([lat, lng], zoom);
    setForm((p) => ({
      ...p,
      lat: Number(lat).toFixed(6),
      lng: Number(lng).toFixed(6),
    }));
  };

  const geocodeAddress = async () => {
    if (!form.address?.trim()) {
      setError("Please enter an address first.");
      return;
    }

    try {
      setError("");
      const q = encodeURIComponent(form.address.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=1`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError("Could not find this address on map. Try a more specific location.");
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      placeMarkerAndSetCoords(lat, lng);
    } catch (err) {
      console.error("Address geocoding failed:", err);
      setError("Failed to locate this address right now. Please pick location on map.");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setError("");
        placeMarkerAndSetCoords(latitude, longitude);
        await reverseGeocode(latitude, longitude);
      },
      () => setError("Could not access your location. Please allow location access."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (step !== 2 || mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([27.7172, 85.3240], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      setError("");
      placeMarkerAndSetCoords(lat, lng);
      await reverseGeocode(lat, lng);
    });

    mapInstanceRef.current = map;

    if (form.lat && form.lng) {
      placeMarkerAndSetCoords(parseFloat(form.lat), parseFloat(form.lng));
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login first.");
      
      // Validate required fields
      if (!form.title || !form.description || !form.crimeType) {
        throw new Error("Please fill in all required fields (Title, Description, Crime Type)");
      }
      
      if (!form.address || form.address.trim() === "") {
        throw new Error("Please provide the location address");
      }
      
      // Validate coordinates
      const lat = parseFloat(form.lat);
      const lng = parseFloat(form.lng);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid location coordinates. Please use the map to select a location or enter valid coordinates.");
      }
      
      console.log("📝 Submitting crime report...", {
        title: form.title,
        crimeType: form.crimeType,
        hasAddress: !!form.address,
        lat: lat,
        lng: lng,
        filesCount: files.length
      });
      
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      files.forEach((f) => fd.append("evidence", f));
      
      console.log("🌐 Sending request to:", `${import.meta.env.VITE_BACKEND_URL}/api/report/report`);
      
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/report/report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      
      console.log("📡 Response status:", res.status);
      
      const data = await res.json();
      console.log("📦 Response data:", data);
      
      if (!res.ok) {
        console.error("❌ Server error:", data);
        throw new Error(data?.error || data?.msg || data?.details || `Request failed with status ${res.status}`);
      }
      
      const successMessage = data.msg || "Reported successfully!";
      setMsg(successMessage);
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
      });
      setForm({ title: "", description: "", crimeType: "", address: "", lat: "", lng: "", isAnonymous: false });
      setFiles([]);
      setStep(1);
    } catch (err) {
      console.error("❌ Submission error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to submit report", {
        position: "top-right",
        autoClose: 4500,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  const fileIcon = (name) => {
    if (name.match(/\.(jpg|jpeg|png)$/i)) return "🖼️";
    if (name.match(/\.(mp4|mov|mkv|webm)$/i)) return "🎥";
    if (name.match(/\.pdf$/i)) return "📄";
    return "📎";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

        .rc-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .rc-root {
          min-height: 100vh;
          background: #0B1E2D;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 16px 60px;
          color: #F5F7FA;
        }

        .rc-wrap {
          width: 100%; max-width: 680px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* PAGE HEADER */
        .rc-page-header {
          background: #132F4C;
          border-radius: 20px;
          padding: 28px 32px;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between;
          border: 1px solid #2C4A6B;
          box-shadow: 0 4px 25px rgba(0,0,0,0.3);
        }
        .rc-page-header::before {
          content: '';
          position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%);
        }
        .rc-header-left { position: relative; z-index: 1; }
        .rc-header-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #D4AF37;
          margin-bottom: 8px;
        }
        .rc-header-title {
          font-family: 'Poppins', sans-serif;
          font-size: 28px; font-weight: 700;
          color: #fff; letter-spacing: -0.01em; line-height: 1.1;
        }
        .rc-header-sub {
          font-size: 13px; color: #A9B4C2;
          margin-top: 8px; line-height: 1.5;
        }
        .rc-header-icon {
          font-size: 52px; opacity: 0.2;
          position: relative; z-index: 1;
          color: #D4AF37;
        }
        .rc-emergency {
          background: rgba(229, 57, 51, 0.1);
          border: 1px solid rgba(229, 57, 51, 0.3);
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 12px;
          color: #ff8a80;
          display: flex; align-items: center; gap: 8px;
          margin-top: 14px; position: relative; z-index: 1;
        }

        /* STEP INDICATOR */
        .rc-steps {
          display: flex; align-items: center; gap: 0;
          background: #132F4C; border: 1px solid #2C4A6B;
          border-radius: 14px; padding: 14px 20px;
        }
        .rc-step {
          flex: 1; display: flex; align-items: center; gap: 10px;
          position: relative;
        }
        .rc-step:not(:last-child)::after {
          content: '';
          position: absolute; right: 0; top: 50%;
          transform: translateY(-50%);
          width: 1px; height: 28px;
          background: #2C4A6B;
        }
        .rc-step-num {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          transition: all 0.2s;
        }
        .rc-step-num.done { background: #E53935; color: #fff; }
        .rc-step-num.active { background: #D4AF37; color: #0B1E2D; box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1); }
        .rc-step-num.pending { background: #1C3A5A; color: #5a6a8a; }
        .rc-step-info { min-width: 0; }
        .rc-step-label { font-size: 10px; font-weight: 700; color: #5a6a8a; text-transform: uppercase; letter-spacing: 0.1em; }
        .rc-step-label.active { color: #D4AF37; }
        .rc-step-name { font-size: 13px; font-weight: 600; color: #F5F7FA; }

        /* CARD */
        .rc-card {
          background: #132F4C;
          border: 1px solid #2C4A6B;
          border-radius: 20px;
          padding: 28px 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .rc-card-title {
          font-family: 'Poppins', sans-serif;
          font-size: 18px; font-weight: 600;
          color: #D4AF37; margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #2C4A6B;
          display: flex; align-items: center; gap: 10px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .rc-card-title-icon { font-size: 20px; color: #D4AF37; }

        /* FORM ELEMENTS */
        .rc-field { display: flex; flex-direction: column; gap: 6px; }
        .rc-label {
          font-size: 11px; font-weight: 700;
          color: #A9B4C2; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .rc-label span { color: #E53935; margin-left: 2px; }
        .rc-input, .rc-textarea, .rc-select {
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 400;
          color: #F5F7FA;
          background: #0B1E2D;
          border: 1.5px solid #2C4A6B;
          border-radius: 11px;
          padding: 12px 14px;
          transition: all 0.2s; outline: none;
          appearance: none;
        }
        .rc-input:focus, .rc-textarea:focus, .rc-select:focus {
          border-color: #D4AF37;
          background: #0c2436;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        .rc-input::placeholder, .rc-textarea::placeholder { color: #5a6a8a; }
        .rc-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
        .rc-select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4AF37' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

        .rc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rc-grid-2-sm { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rc-form-group { display: flex; flex-direction: column; gap: 20px; }

        .rc-map {
          width: 100%;
          height: 280px;
          border-radius: 14px;
          border: 1.5px solid #2C4A6B;
          overflow: hidden;
          background: #0B1E2D;
        }
        .rc-map-tools {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .rc-map-btn {
          border: 1.5px solid #2C4A6B;
          background: #1C3A5A;
          color: #F5F7FA;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rc-map-btn:hover { background: #2C4A6B; border-color: #D4AF37; color: #D4AF37; }

        /* COORD ROW */
        .rc-coord-wrap { position: relative; }
        .rc-coord-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 13px; pointer-events: none; color: #D4AF37;
        }
        .rc-coord-input {
          padding-left: 32px !important;
          background: #1C3A5A !important;
          border-color: #2C4A6B !important;
        }

        /* FILE DROP */
        .rc-dropzone {
          border: 2px dashed #2C4A6B;
          border-radius: 14px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(11, 30, 45, 0.5);
          position: relative;
        }
        .rc-dropzone.over {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.05);
        }
        .rc-dropzone-icon { font-size: 32px; margin-bottom: 12px; }
        .rc-dropzone-title { font-size: 14px; font-weight: 700; color: #F5F7FA; margin-bottom: 6px; }
        .rc-dropzone-sub { font-size: 11px; color: #A9B4C2; }
        .rc-dropzone input[type="file"] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer;
        }

        .rc-file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .rc-file-item {
          display: flex; align-items: center; gap: 12px;
          background: #1C3A5A; border: 1px solid #2C4A6B;
          border-radius: 10px; padding: 10px 14px;
        }
        .rc-file-icon { font-size: 18px; flex-shrink: 0; }
        .rc-file-name { flex: 1; font-size: 13px; font-weight: 600; color: #F5F7FA; truncate; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rc-file-size { font-size: 11px; color: #A9B4C2; flex-shrink: 0; }
        .rc-file-remove {
          background: none; border: none; cursor: pointer;
          color: #5a6a8a; font-size: 18px; line-height: 1;
          padding: 0 2px; transition: color 0.15s; flex-shrink: 0;
        }
        .rc-file-remove:hover { color: #E53935; }

        /* ANONYMOUS TOGGLE */
        .rc-anon-row {
          display: flex; align-items: center; justify-content: space-between;
          background: #1C3A5A; border: 1.5px solid #2C4A6B;
          border-radius: 12px; padding: 16px 20px;
          cursor: pointer; transition: all 0.2s;
        }
        .rc-anon-row:hover { border-color: #D4AF37; }
        .rc-anon-left { display: flex; align-items: center; gap: 14px; }
        .rc-anon-icon { font-size: 24px; }
        .rc-anon-title { font-size: 14px; font-weight: 700; color: #fff; }
        .rc-anon-sub { font-size: 11px; color: #A9B4C2; margin-top: 2px; }
        .rc-toggle {
          width: 44px; height: 24px; border-radius: 12px;
          position: relative; flex-shrink: 0;
          transition: background 0.2s;
          border: none; cursor: pointer;
        }
        .rc-toggle.on { background: #D4AF37; }
        .rc-toggle.off { background: #0B1E2D; border: 1px solid #2C4A6B; }
        .rc-toggle-knob {
          position: absolute; top: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          transition: left 0.2s;
        }
        .rc-toggle.on .rc-toggle-knob { left: 23px; }
        .rc-toggle.off .rc-toggle-knob { left: 3px; }

        /* ALERTS */
        .rc-alert {
          border-radius: 12px; padding: 14px 18px;
          font-size: 13px; font-weight: 600; display: flex; align-items: flex-start; gap: 12px;
          animation: fadeUp 0.3s ease both;
        }
        .rc-alert.success { background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); color: #2ECC71; }
        .rc-alert.error { background: rgba(229, 57, 53, 0.1); border: 1px solid rgba(229, 57, 53, 0.3); color: #ff8a80; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        /* NAV BUTTONS */
        .rc-nav-row {
          display: flex; gap: 12px;
          margin-top: 10px;
        }
        .rc-btn-back {
          flex: 1;
          background: #1C3A5A; border: 1.5px solid #2C4A6B;
          color: #A9B4C2; border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 14px; cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .rc-btn-back:hover { background: #2C4A6B; color: #fff; border-color: #D4AF37; }
        .rc-btn-next {
          flex: 2;
          background: #D4AF37; color: #0B1E2D;
          border: none; border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 800;
          padding: 14px; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .rc-btn-next:hover:not(:disabled) { background: #E6C766; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3); }
        .rc-btn-next:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; filter: grayscale(1); }
        .rc-btn-submit {
          flex: 2;
          background: linear-gradient(135deg, #D4AF37, #E6C766);
          color: #0B1E2D; border: none; border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 800;
          padding: 16px; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          text-transform: uppercase; letter-spacing: 0.15em;
        }
        .rc-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4); }
        .rc-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .rc-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 3px solid rgba(11, 30, 45, 0.2);
          border-top-color: #0B1E2D;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .rc-grid-2, .rc-grid-2-sm { grid-template-columns: 1fr; }
          .rc-page-header { padding: 22px 20px; }
          .rc-card { padding: 20px 18px; }
        }
      `}</style>

      <div className="rc-root">
        <div className="rc-wrap">

          {/* PAGE HEADER */}
          <div className="rc-page-header">
            <div className="rc-header-left">
              <div className="rc-header-eyebrow">CivicPortal · Crime Unit</div>
              <div className="rc-header-title">Report a Crime</div>
              <div className="rc-header-sub">Help us keep your community safe.<br/>All reports are handled with strict confidentiality.</div>
              <div className="rc-emergency">
                🚨 <span><strong>Emergency?</strong> Call 112 immediately — this form is for non-emergency reports only.</span>
              </div>
            </div>
            <div className="rc-header-icon">🏛</div>
          </div>

          {/* STEP INDICATOR */}
          <div className="rc-steps">
            {[
              { n: 1, label: "Step 1", name: "Incident Details" },
              { n: 2, label: "Step 2", name: "Location & Evidence" },
              { n: 3, label: "Step 3", name: "Review & Submit" },
            ].map((s) => (
              <div className="rc-step" key={s.n}>
                <div className={`rc-step-num ${step > s.n ? "done" : step === s.n ? "active" : "pending"}`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <div className="rc-step-info">
                  <div className={`rc-step-label ${step === s.n ? "active" : ""}`}>{s.label}</div>
                  <div className="rc-step-name">{s.name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ALERTS */}
          {msg && <div className="rc-alert success">✅ <span>{msg}</span></div>}
          {error && <div className="rc-alert error">⚠️ <span>{error}</span></div>}

          {/* STEP 1: INCIDENT DETAILS */}
          {step === 1 && (
            <div className="rc-card">
              <div className="rc-card-title"><span className="rc-card-title-icon">📋</span> Incident Details</div>
              <div className="rc-form-group">
                <div className="rc-field">
                  <label className="rc-label">Title <span>*</span></label>
                  <input className="rc-input" name="title" value={form.title} onChange={onChange} placeholder="Brief title of the incident" required />
                </div>
                <div className="rc-field">
                  <label className="rc-label">Crime Type <span>*</span></label>
                  <select className="rc-select" name="crimeType" value={form.crimeType} onChange={onChange} required>
                    <option value="">Select a crime type…</option>
                    {crimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="rc-field">
                  <label className="rc-label">Description <span>*</span></label>
                  <textarea className="rc-textarea" name="description" value={form.description} onChange={onChange} placeholder="Describe what happened in as much detail as possible…" required />
                </div>
              </div>
              <div className="rc-nav-row">
                <button
                  className="rc-btn-next"
                  onClick={() => setStep(2)}
                  disabled={!form.title || !form.crimeType || !form.description}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & EVIDENCE */}
          {step === 2 && (
            <div className="rc-card">
              <div className="rc-card-title"><span className="rc-card-title-icon">📍</span> Location & Evidence</div>
              <div className="rc-form-group">
                <div className="rc-field">
                  <label className="rc-label">Address <span>*</span></label>
                  <input className="rc-input" name="address" value={form.address} onChange={onChange} placeholder="Street address, landmark, or area" required />
                </div>
                <div className="rc-map-tools">
                  <button type="button" className="rc-map-btn" onClick={geocodeAddress}>📌 Find Address on Map</button>
                  <button type="button" className="rc-map-btn" onClick={useCurrentLocation}>🛰 Use Current Location</button>
                </div>
                <div className="rc-field">
                  <label className="rc-label">Location Picker Map</label>
                  <div ref={mapRef} className="rc-map" />
                  <div style={{ fontSize: "11px", color: "#9aa3b5", marginTop: "6px" }}>
                    Click anywhere on map to auto-fill latitude and longitude.
                  </div>
                </div>
                <div className="rc-grid-2-sm">
                  <div className="rc-field">
                    <label className="rc-label">Latitude</label>
                    <div className="rc-coord-wrap">
                      <span className="rc-coord-icon">🌐</span>
                      <input className="rc-input rc-coord-input" name="lat" value={form.lat} onChange={onChange} placeholder="e.g. 28.6139" readOnly />
                    </div>
                  </div>
                  <div className="rc-field">
                    <label className="rc-label">Longitude</label>
                    <div className="rc-coord-wrap">
                      <span className="rc-coord-icon">🌐</span>
                      <input className="rc-input rc-coord-input" name="lng" value={form.lng} onChange={onChange} placeholder="e.g. 77.2090" readOnly />
                    </div>
                  </div>
                </div>
                <div className="rc-field">
                  <label className="rc-label">Evidence Files <span style={{color:"#9aa3b5",fontSize:"11px",textTransform:"none",letterSpacing:0}}>— up to 5 files (jpg, png, pdf, mp4, mov)</span></label>
                  <div
                    className={`rc-dropzone ${dragOver ? "over" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                  >
                    <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4,.mov,.mkv,.webm" onChange={onFilesChange} />
                    <div className="rc-dropzone-icon">📁</div>
                    <div className="rc-dropzone-title">Drag & drop files here</div>
                    <div className="rc-dropzone-sub">or click to browse · max 5 files (up to 50MB each)</div>
                  </div>
                  {files.length > 0 && (
                    <div className="rc-file-list">
                      {files.map((f, i) => (
                        <div className="rc-file-item" key={i}>
                          <span className="rc-file-icon">{fileIcon(f.name)}</span>
                          <span className="rc-file-name">{f.name}</span>
                          <span className="rc-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                          <button className="rc-file-remove" onClick={() => removeFile(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="rc-nav-row">
                <button className="rc-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="rc-btn-next" onClick={() => setStep(3)} disabled={!form.address || !form.lat || !form.lng}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <div className="rc-card">
              <div className="rc-card-title"><span className="rc-card-title-icon">✅</span> Review & Submit</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {[
                  { label: "Title", val: form.title },
                  { label: "Crime Type", val: form.crimeType },
                  { label: "Description", val: form.description },
                  { label: "Address", val: form.address },
                  { label: "Coordinates", val: form.lat && form.lng ? `${form.lat}, ${form.lng}` : "Not provided" },
                  { label: "Evidence Files", val: files.length > 0 ? `${files.length} file(s) attached` : "None" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: "12px", padding: "12px 14px", background: "#faf8f4", borderRadius: "10px", border: "1px solid #e4ddd0" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#9aa3b5", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "100px", paddingTop: "1px" }}>{row.label}</div>
                    <div style={{ fontSize: "13px", color: "#0f1f3d", flex: 1, lineHeight: 1.5 }}>{row.val}</div>
                  </div>
                ))}
              </div>

              <div className="rc-anon-row" onClick={() => setForm(p => ({ ...p, isAnonymous: !p.isAnonymous }))}>
                <div className="rc-anon-left">
                  <span className="rc-anon-icon">🕵️</span>
                  <div>
                    <div className="rc-anon-title">Report Anonymously</div>
                    <div className="rc-anon-sub">Your identity will be kept confidential</div>
                  </div>
                </div>
                <button className={`rc-toggle ${form.isAnonymous ? "on" : "off"}`} onClick={e => e.stopPropagation()}>
                  <div className="rc-toggle-knob" />
                </button>
              </div>

              <div className="rc-nav-row" style={{ marginTop: "20px" }}>
                <button className="rc-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="rc-btn-submit"
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="rc-spinner" /> Submitting…</>
                  ) : (
                    <>Submit Report 🚨</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ReportCrime;
