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
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Emergency SOS Alerts
            {criticalAlerts.size > 0 && (
              <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                {criticalAlerts.size} CRITICAL
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">Real-time emergency response system</p>
        </div>
        <button 
          onClick={fetchSOS}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {sosData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <AlertTriangle className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No SOS Alerts</h3>
          <p className="text-gray-500">No emergency alerts have been received at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sosData.map((item) => (
            <div 
              key={item._id} 
              className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getPriorityColor(item)} ${
                criticalAlerts.has(item._id) ? 'animate-pulse shadow-xl' : 'shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-bold text-lg">
                      {item.userId?.name || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.userId?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    item.status === 'active' ? 'bg-red-600 text-white' :
                    item.status === 'acknowledged' ? 'bg-blue-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {item.status}
                  </span>
                  {getSeverityBadge(item)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {item.latitude && item.longitude ? 
                      `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : 
                      'Location unknown'
                    }
                  </span>
                  {item.accuracy && (
                    <span className="text-xs text-gray-500">
                      (±{item.accuracy}m)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                <p className="text-sm text-gray-600">{item.message}</p>
              </div>
              
              {item.trackingHistory && item.trackingHistory.length > 1 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Location Updates: {item.trackingHistory.length} points
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                {item.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'acknowledged')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Resolved
                    </button>
                  </>
                )}
                {item.status === 'acknowledged' && (
                  <button
                    onClick={() => handleStatusUpdate(item._id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Resolved
                  </button>
                )}
                <a
                  href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  View on Map
                </a>
                {item.userId?.phone && (
                  <a
                    href={`tel:${item.userId.phone}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call User
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SOSList;