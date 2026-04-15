import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import React from "react";
import { useSocket } from "../../hooks/useSocket.js";
import { AlertTriangle, MapPin, Clock, User, Phone, CheckCircle, XCircle, Shield, Navigation, Activity, Bell } from "lucide-react";

const SOSList = () => {
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(new Set());
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });

  // Socket for real-time updates
  const socket = useSocket();
  
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

  const fetchSOS = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/emergency/sos`
      );

      const data = res.data.data;
      setSosData(data);
      
      // Update stats
      const activeCount = data.filter(alert => alert.status === 'active').length;
      const resolvedCount = data.filter(alert => alert.status === 'resolved').length;
      setStats({ active: activeCount, resolved: resolvedCount, total: data.length });
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSOS();
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [fetchSOS]);

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
        <div className="grid grid-cols-1 gap-8 pb-12">
          {sosData.map((item) => {
            const isCritical = criticalAlerts.has(item._id);
            const statusColors = {
              active: "rose",
              acknowledged: "blue",
              resolved: "emerald"
            }[item.status] || "slate";

            return (
              <div 
                key={item._id} 
                className={`group relative overflow-hidden bg-slate-900 rounded-[40px] border-2 transition-all duration-500 ${
                  isCritical ? 'border-red-600 shadow-[0_0_50px_rgba(225,29,72,0.15)]' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isCritical && <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />}
                
                <div className="p-8 md:p-12 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 bg-${statusColors}-500/10 rounded-3xl`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Authenticated Citizen</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {item.userId?.name || 'Unknown Operator'}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{item.userId?.email || 'Secure Channel'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-5 py-2 rounded-full bg-${statusColors}-500/10 text-${statusColors}-500 text-[10px] font-black uppercase tracking-widest border border-${statusColors}-500/20`}>
                        {item.status}
                      </div>
                      {isCritical && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter flex items-center gap-2 shadow-lg shadow-red-600/40">
                          <Activity className="h-4 w-4 animate-spin" /> PRIORITY ZERO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                      <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <MapPin size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Geolocation</span>
                      </div>
                      <p className="text-lg font-black text-white italic tracking-tighter">
                        {item.latitude && item.longitude ? 
                          `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}` : 
                          'COORDS REDACTED'
                        }
                      </p>
                      {item.accuracy && (
                        <p className="text-[10px] text-slate-500 font-bold mt-1">Margin of Error: ±{item.accuracy}m</p>
                      )}
                    </div>

                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                      <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Clock size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Timestamp</span>
                      </div>
                      <p className="text-lg font-black text-white italic tracking-tighter">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>

                    <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                      <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <User size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Incident Note</span>
                      </div>
                      <p className="text-sm font-bold text-slate-300 line-clamp-2 italic">{item.message || "No immediate message provided."}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/50">
                    {item.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(item._id, 'acknowledged')}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
                        >
                          <Navigation className="h-4 w-4" /> Acknowledge Dispatch
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item._id, 'resolved')}
                          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95"
                        >
                          <CheckCircle className="h-4 w-4" /> Secure Incident
                        </button>
                      </>
                    )}
                    {item.status === 'acknowledged' && (
                      <button
                        onClick={() => handleStatusUpdate(item._id, 'resolved')}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95"
                      >
                        <CheckCircle className="h-4 w-4" /> Finalize Resolution
                      </button>
                    )}
                    
                    <a
                      href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic"
                    >
                      <MapPin className="h-4 w-4" /> Intel Map View
                    </a>
                    
                    {item.userId?.phone && (
                      <a
                        href={`tel:${item.userId.phone}`}
                        className="px-8 py-4 bg-slate-800 text-blue-500 rounded-2xl hover:bg-slate-700 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic"
                      >
                        <Phone className="h-4 w-4" /> Established Comms
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SOSList;