import { useEffect, useState } from "react";
import React from "react";
import { 
  Camera, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Lock,
  AlertCircle,
  Hammer,
  CreditCard,
  Home,
  Pill,
  FileText,
  Inbox
} from "lucide-react";

const API_URL = "http://localhost:5000/api/report";

export default function AdminReport() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchReports() {
      try {
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error("Unauthorized or failed request");
        const data = await res.json();
        setCrimes(Array.isArray(data.crimes) ? data.crimes : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const statusColor = (status) => {
    if (status === "Pending") return "#f59e0b";
    if (status === "Approved" || status === "Accepted") return "#10b981";
    if (status === "Rejected") return "#ef4444";
    return "#64748b";
  };

  const getCrimeIcon = (type) => {
    const icons = {
      Theft: Lock,
      Assault: AlertTriangle,
      Vandalism: Hammer,
      Fraud: CreditCard,
      Burglary: Home,
      "Drug-related": Pill
    };
    return icons[type] || FileText;
  };

  const filteredCrimes =
    filter === "All" ? crimes : crimes.filter((c) => c.status === filter);

  const stats = {
    total: crimes.length,
    pending: crimes.filter((c) => c.status === "Pending").length,
    approved: crimes.filter(
      (c) => c.status === "Approved" || c.status === "Accepted"
    ).length,
    rejected: crimes.filter((c) => c.status === "Rejected").length,
  };

  if (loading)
    return (
      <div style={s.center}>
        <div style={s.spinner}></div>
        <div style={s.loadText}>Loading...</div>
      </div>
    );

  if (error)
    return (
      <div style={s.center}>
        <AlertTriangle size={48} color="#ef4444" />
        <div style={s.loadText}>{error}</div>
      </div>
    );

  return (
    <div style={s.container}>
      <h1 style={s.title}>Admin Dashboard</h1>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.stat}>
          <BarChart3 size={32} color="#3b82f6" />
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Total</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {stats.total}
            </div>
          </div>
        </div>
        <div style={s.stat}>
          <Clock size={32} color="#f59e0b" />
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Pending</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {stats.pending}
            </div>
          </div>
        </div>
        <div style={s.stat}>
          <CheckCircle size={32} color="#10b981" />
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Approved</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {stats.approved}
            </div>
          </div>
        </div>
        <div style={s.stat}>
          <XCircle size={32} color="#ef4444" />
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Rejected</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {stats.rejected}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        {["All", "Pending", "Approved", "Rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...s.filterBtn,
              ...(filter === f ? s.filterActive : {}),
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div style={s.grid}>
        {filteredCrimes.map((crime, i) => {
          const CrimeIcon = getCrimeIcon(crime.crimeType);
          return (
            <div key={i} style={s.card}>
              {/* Status Badge */}
              <div
                style={{
                  ...s.badge,
                  backgroundColor: statusColor(crime.status),
                }}
              >
                {crime.status}
              </div>

              {/* Evidence */}
              {crime.evidence?.[0]?.url ? (
                <img
                  src={crime.evidence[0].url}
                  alt="Evidence"
                  style={s.img}
                />
              ) : (
                <div style={s.noImg}>
                  <Camera size={48} color="#64748b" />
                  <div style={{ marginTop: "8px" }}>No evidence</div>
                </div>
              )}

              {/* Content */}
              <div style={s.content}>
                <div style={s.typeTag}>
                  <CrimeIcon size={14} />
                  {crime.crimeType}
                </div>
                <h3 style={s.cardTitle}>{crime.title || "Untitled"}</h3>
                <p style={s.desc}>
                  {crime.description?.substring(0, 100)}
                  {crime.description?.length > 100 ? "..." : ""}
                </p>
                <div style={s.location}>
                  <MapPin size={16} color="#3b82f6" />
                  <div>
                    <div>{crime.location?.address || "Unknown"}</div>
                    {crime.location?.lat && (
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {crime.location.lat.toFixed(4)},{" "}
                        {crime.location.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCrimes.length === 0 && (
        <div style={s.empty}>
          <Inbox size={64} color="#64748b" />
          <div style={{ marginTop: "16px", fontSize: "18px" }}>
            No reports found
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    padding: "24px",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0f172a",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #1e293b",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadText: {
    marginTop: "20px",
    color: "#94a3b8",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "30px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  stat: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "10px 20px",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  filterActive: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderColor: "#3b82f6",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #334155",
    position: "relative",
    transition: "transform 0.2s",
  },
  badge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    zIndex: 10,
  },
  img: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  noImg: {
    height: "200px",
    backgroundColor: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  content: {
    padding: "16px",
  },
  typeTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#3b82f620",
    color: "#3b82f6",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
  desc: {
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  location: {
    display: "flex",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    fontSize: "13px",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    color: "#94a3b8",
  },
};

// Add animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);