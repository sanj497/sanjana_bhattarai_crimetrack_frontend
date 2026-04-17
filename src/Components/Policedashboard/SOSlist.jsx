import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import React from "react";
import { useSocket } from "../../hooks/useSocket.js";
import { AlertTriangle, MapPin, Clock, User, Phone, CheckCircle, XCircle, Shield, Navigation, Activity, Bell, Siren } from "lucide-react";

const SOSList = () => {
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(new Set());
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [totalPages, setTotalPages] = useState(1);

  // Socket for real-time updates
  const socket = useSocket();
  
  const fetchSOS = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data.data;
      setSosData(data);
      
      // Update stats
      const activeCount = data.filter(alert => alert.status === 'active').length;
      const resolvedCount = data.filter(alert => alert.status === 'resolved').length;
      setStats({ active: activeCount, resolved: resolvedCount, total: data.length });
      
      // Calculate pagination
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos/${alertId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSosData(prev => prev.map(alert => 
        alert._id === alertId ? { ...alert, status: newStatus } : alert
      ));
      
      if (newStatus === "resolved") {
        setCriticalAlerts(prev => {
          const updated = new Set(prev);
          updated.delete(alertId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to update SOS status:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    const handleCriticalSOSAlert = (alert) => {
      console.log(" CRITICAL SOS ALERT RECEIVED:", alert);
      setCriticalAlerts(prev => new Set(prev).add(alert.id));
      
      // Auto-refresh to show new alert
      fetchSOS();
      
      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(" CRITICAL SOS ALERT", {
          body: `${alert.user?.name || 'Anonymous'} needs immediate help! Location: ${alert.location?.latitude?.toFixed(4) || 'Unknown'}, ${alert.location?.longitude?.toFixed(4) || 'Unknown'}`,
          icon: "/favicon.ico",
          requireInteraction: true
        });
      }
    };
    
    const handleSOSLocationUpdate = (update) => {
      console.log("SOS location update:", update);
      setSosData(prev => prev.map(alert => 
        alert._id === update.id 
          ? { ...alert, latitude: update.location.latitude, longitude: update.location.longitude, accuracy: update.location.accuracy }
          : alert
      ));
    };
    
    socket.on("new_sos_alert", handleCriticalSOSAlert);
    socket.on("sos_location_update", handleSOSLocationUpdate);
    
    return () => {
      socket.off("new_sos_alert", handleCriticalSOSAlert);
      socket.off("sos_location_update", handleSOSLocationUpdate);
    };
  }, [socket, fetchSOS]);

  useEffect(() => {
    fetchSOS();
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [fetchSOS]);

  const getPriorityColor = (alert) => {
    if (criticalAlerts.has(alert._id)) return "border-red-500 bg-red-50";
    if (alert.status === "active") return "border-orange-500 bg-orange-50";
    if (alert.status === "acknowledged") return "border-blue-500 bg-blue-50";
    if (alert.status === "resolved") return "border-green-500 bg-green-50";
    return "border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "acknowledged": return <Clock className="h-4 w-4 text-blue-600" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (alert) => {
    if (criticalAlerts.has(alert._id)) {
      return (
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
          <Shield className="h-3 w-3" /> CRITICAL
        </span>
      );
    }
    return null;
  };

  const getCoordinates = (alert) => {
    const latitude = alert?.latitude ?? alert?.location?.latitude;
    const longitude = alert?.longitude ?? alert?.location?.longitude;
    const hasValidCoordinates =
      Number.isFinite(latitude) && Number.isFinite(longitude);

    return {
      latitude,
      longitude,
      hasValidCoordinates,
    };
  };

  // Get paginated data
  const paginatedData = sosData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-500 font-medium">Loading SOS Alerts...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase italic">
            <Siren className="h-10 w-10 text-red-500 animate-pulse" />
            Live SOS Feed
            {criticalAlerts.size > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce tracking-widest shadow-lg shadow-red-600/30">
                {criticalAlerts.size} ACTIVE THREATS
              </span>
            )}
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-14">Central Dispatch Control Unit</p>
        </div>
        <button 
          onClick={fetchSOS}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
        >
          <Activity className="h-4 w-4" />
          Synchronize Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Responses", val: stats.active, color: "rose", icon: AlertTriangle },
          { label: "Resolved Incidents", val: stats.resolved, color: "emerald", icon: CheckCircle },
          { label: "Cumulative Alerts", val: stats.total, color: "blue", icon: Bell },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-[32px] p-8 border border-slate-800/50 flex items-center justify-between group hover:border-slate-700 transition-all shadow-xl">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-4xl font-black text-${stat.color}-500 tracking-tighter`}>{stat.val}</p>
            </div>
            <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      {sosData.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/30 rounded-[40px] border border-slate-800/50 backdrop-blur-sm">
          <div className="p-8 bg-slate-800 text-slate-600 rounded-full w-fit mx-auto mb-6">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <h3 className="text-2xl font-black text-slate-400 mb-2 uppercase tracking-tighter">No Active Signals</h3>
          <p className="text-slate-500 font-medium">All clear. No emergency transmissions detected on current frequencies.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-8">
            {paginatedData.map((item) => {
            const isCritical = criticalAlerts.has(item._id);
            const statusColors = {
              active: "rose",
              acknowledged: "blue",
              resolved: "emerald"
            }[item.status] || "slate";
            const { latitude, longitude, hasValidCoordinates } = getCoordinates(item);
            const mapsUrl = hasValidCoordinates
              ? `https://maps.google.com/?q=${latitude},${longitude}`
              : null;

            return (
              <div 
                key={item._id} 
                className={`group relative overflow-hidden bg-slate-900 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  isCritical ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isCritical && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
                
                <div className="p-5 md:p-6 relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 bg-${statusColors}-500/10 rounded-xl shrink-0`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
                          {item.userId?.name || 'Unknown Operator'}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 truncate">{item.userId?.email || 'Secure Channel'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`px-3 py-1 rounded-full bg-${statusColors}-500/10 text-${statusColors}-500 text-[10px] font-bold uppercase tracking-wide border border-${statusColors}-500/20`}>
                        {item.status}
                      </div>
                      {isCritical && (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1.5">
                          <Activity className="h-3 w-3 animate-spin" /> Critical
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1.5">
                        <MapPin size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Location</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {hasValidCoordinates
                          ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                          : "Unavailable"
                        }
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1.5">
                        <Clock size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Time</span>
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {item.message && (
                    <div className="p-3 bg-slate-950/30 rounded-lg border border-slate-800/30 mb-4">
                      <p className="text-xs font-medium text-slate-400 line-clamp-2 italic">{item.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/50">
                    {item.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(item._id, 'acknowledged')}
                          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Navigation className="h-3.5 w-3.5" /> Acknowledge
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item._id, 'resolved')}
                          className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Resolve
                        </button>
                      </>
                    )}
                    {item.status === 'acknowledged' && (
                      <button
                        onClick={() => handleStatusUpdate(item._id, 'resolved')}
                        className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
                      </button>
                    )}
                    
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Map
                      </a>
                    )}
                    
                    {item.userId?.phone && (
                      <a
                        href={`tel:${item.userId.phone}`}
                        className="px-4 py-2.5 bg-slate-800 text-blue-400 rounded-lg hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-2"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <div className="text-xs font-semibold text-slate-400">
                Page {currentPage} of {totalPages} ({sosData.length} total alerts)
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wide hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i-1] !== p - 1 && <span className="text-slate-600 font-bold px-1">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                            currentPage === p
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-blue-500 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wide hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SOSList;