import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  User,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/report`;

export default function ForwardQueue() {
  const navigate = useNavigate();
  const [verifiedCrimes, setVerifiedCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [nearbyPolice, setNearbyPolice] = useState({});
  const [selectedOfficers, setSelectedOfficers] = useState({});
  const [forwardingId, setForwardingId] = useState(null);
  const [loadingPoliceFor, setLoadingPoliceFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVerifiedReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.crimes) {
        const verified = data.crimes.filter((c) => c.status === "Verified");
        setVerifiedCrimes(verified);
      }
    } catch (err) {
      console.error("Fetch verified reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedReports();

    const handler = () => fetchVerifiedReports();
    window.addEventListener("new-notification-received", handler);
    return () => window.removeEventListener("new-notification-received", handler);
  }, []);

  const fetchNearbyPolice = async (crimeId) => {
    if (nearbyPolice[crimeId]) return; // Already fetched
    setLoadingPoliceFor(crimeId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${crimeId}/nearby-police`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNearbyPolice((prev) => ({ ...prev, [crimeId]: data.policeOfficers }));
      }
    } catch (err) {
      console.error("Fetch nearby police error:", err);
    } finally {
      setLoadingPoliceFor(null);
    }
  };

  const handleExpand = (crimeId) => {
    if (expandedId === crimeId) {
      setExpandedId(null);
    } else {
      setExpandedId(crimeId);
      fetchNearbyPolice(crimeId);
    }
  };

  const handleForward = async (crimeId) => {
    const officerId = selectedOfficers[crimeId];
    if (!officerId) {
      alert("Please select a police officer to forward to.");
      return;
    }

    setForwardingId(crimeId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${crimeId}/forward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedOfficerId: officerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Forward failed");

      alert("✅ Case forwarded successfully!");
      // Remove from list
      setVerifiedCrimes((prev) => prev.filter((c) => c._id !== crimeId));
      setExpandedId(null);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setForwardingId(null);
    }
  };

  const filteredCrimes = verifiedCrimes.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#F7F9FC]">
        <div className="h-12 w-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
          Loading Verified Cases...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F7F9FC] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Send size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Forward to Police
              </h1>
              <p className="text-slate-500 text-xs font-medium">
                {verifiedCrimes.length} verified case{verifiedCrimes.length !== 1 ? "s" : ""} awaiting police assignment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 w-72"
            />
          </div>
          <button
            onClick={fetchVerifiedReports}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredCrimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-6">
          <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={48} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h4 className="text-xl font-black text-slate-900 mb-1">
              All Clear
            </h4>
            <p className="text-sm font-medium max-w-xs">
              No verified reports are pending police assignment. All cases have been processed.
            </p>
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-6">
        {filteredCrimes.map((crime) => {
          const isExpanded = expandedId === crime._id;
          const officers = nearbyPolice[crime._id] || [];
          const selectedId = selectedOfficers[crime._id];

          return (
            <div
              key={crime._id}
              className={`bg-white rounded-[28px] border transition-all shadow-sm overflow-hidden ${
                isExpanded
                  ? "border-blue-200 shadow-xl shadow-blue-100/40"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              {/* Case Summary Row */}
              <div
                className="flex items-center justify-between p-6 cursor-pointer"
                onClick={() => handleExpand(crime._id)}
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {crime.title || "Untitled Report"}
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-slate-400 text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {crime.crimeType}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {crime.location?.address || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(crime.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    Verified
                  </span>
                  <ChevronRight
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded: Officer Selection */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Case Details */}
                    <div className="lg:col-span-5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Case Details
                      </h4>
                      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {crime.description || "No description provided."}
                        </p>
                        {crime.evidence?.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            {crime.evidence.slice(0, 3).map((e, i) => (
                              <img
                                key={i}
                                src={e.url}
                                alt="Evidence"
                                className="h-16 w-16 object-cover rounded-xl border"
                              />
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/admin/verify/${crime._id}`)}
                          className="mt-2 text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <FileText size={12} /> View Full Report
                        </button>
                      </div>
                    </div>

                    {/* Officer Assignment */}
                    <div className="lg:col-span-7">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <User size={12} />
                        Select Nearest Police Officer
                      </h4>

                      {loadingPoliceFor === crime._id ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Scanning nearest stations...
                          </span>
                        </div>
                      ) : officers.length > 0 ? (
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                          {officers.map((officer, idx) => (
                            <button
                              key={officer._id}
                              onClick={() =>
                                setSelectedOfficers((prev) => ({
                                  ...prev,
                                  [crime._id]: officer._id,
                                }))
                              }
                              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border-2 ${
                                selectedId === officer._id
                                  ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-100/50"
                                  : "bg-white border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                                    selectedId === officer._id
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {idx + 1}
                                </div>
                                <div className="text-left">
                                  <div
                                    className={`text-sm font-bold ${
                                      selectedId === officer._id
                                        ? "text-blue-700"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {officer.name || officer.username}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2">
                                    <MapPin size={10} />
                                    {officer.stationDistrict || "Unassigned Sector"}
                                    {officer.email && (
                                      <span className="text-slate-300">
                                        • {officer.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {selectedId === officer._id && (
                                <CheckCircle2
                                  size={20}
                                  className="text-blue-600 shrink-0"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                          <AlertTriangle
                            size={24}
                            className="text-amber-500 mx-auto mb-2"
                          />
                          <p className="text-sm text-amber-700 font-medium">
                            No police officers found for this location. Please assign manually.
                          </p>
                        </div>
                      )}

                      {/* Forward Action Button */}
                      <button
                        onClick={() => handleForward(crime._id)}
                        disabled={!selectedId || forwardingId === crime._id}
                        className={`mt-4 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                          !selectedId
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : forwardingId === crime._id
                            ? "bg-slate-200 text-slate-500 cursor-wait"
                            : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                        }`}
                      >
                        {forwardingId === crime._id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Deploying Assignment...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Forward to Selected Officer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
