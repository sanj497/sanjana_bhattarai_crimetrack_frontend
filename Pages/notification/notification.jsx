import React, { useEffect, useState, useCallback } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please log in to view notifications.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        setError("You do not have permission to view notifications.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      // Handle both array response and { notifications: [...] } shaped response
      setNotifications(Array.isArray(data) ? data : (Array.isArray(data.notifications) ? data.notifications : []));
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(err.message || "Failed to fetch notifications.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .notif-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'Syne', sans-serif;
          color: #e8e6f0;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
        }

        .notif-root::before {
          content: '';
          position: fixed;
          top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .notif-root::after {
          content: '';
          position: fixed;
          bottom: -200px; left: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .notif-container {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .notif-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .notif-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: #8b5cf6;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .notif-title {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
          color: #f0eeff;
        }

        .notif-badge {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 100px;
          margin-top: 4px;
          display: inline-block;
          box-shadow: 0 4px 20px rgba(139,92,246,0.35);
        }

        .notif-filters {
          display: flex;
          gap: 4px;
          margin-bottom: 28px;
          background: rgba(255,255,255,0.04);
          padding: 4px;
          border-radius: 12px;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .filter-btn {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #6b7280;
          letter-spacing: 0.02em;
        }

        .filter-btn.active {
          background: rgba(139,92,246,0.2);
          color: #c4b5fd;
          border: 1px solid rgba(139,92,246,0.3);
        }

        .filter-btn:hover:not(.active) {
          color: #9ca3af;
          background: rgba(255,255,255,0.04);
        }

        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notif-item {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: start;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          animation: slideIn 0.3s ease both;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-item:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(139,92,246,0.2);
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .notif-item.unread::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #8b5cf6, #14b8a6);
          border-radius: 3px 0 0 3px;
        }

        .notif-item.unread {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.15);
        }

        .notif-message {
          font-size: 15px;
          font-weight: 600;
          color: #e8e6f0;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        .notif-item.read .notif-message {
          color: #9ca3af;
          font-weight: 400;
        }

        .notif-date {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #4b5563;
          margin-top: 6px;
          letter-spacing: 0.04em;
        }

        .notif-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .status-chip {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .status-chip.unread {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.25);
        }

        .status-chip.read {
          background: rgba(255,255,255,0.05);
          color: #4b5563;
          border: 1px solid rgba(255,255,255,0.06);
        }

        /* Empty / Loading / Error */
        .notif-center {
          text-align: center;
          padding: 80px 24px;
        }

        .notif-center-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.4;
          display: block;
        }

        .notif-center-title {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .notif-center-sub {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: #374151;
        }

        /* Error state */
        .notif-error-box {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 14px;
          animation: slideIn 0.3s ease both;
        }

        .notif-error-icon {
          font-size: 22px;
          flex-shrink: 0;
        }

        .notif-error-msg {
          font-size: 14px;
          color: #fca5a5;
          line-height: 1.5;
          flex: 1;
        }

        .retry-btn {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 7px 16px;
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .retry-btn:hover {
          background: rgba(239,68,68,0.18);
          border-color: rgba(239,68,68,0.45);
        }

        /* Loading dots */
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .loading-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
          animation: pulse 1.2s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin-bottom: 28px;
        }
      `}</style>

      <div className="notif-root">
        <div className="notif-container">

          {/* Header */}
          <div className="notif-header">
            <div>
              <div className="notif-eyebrow">— Inbox</div>
              <div className="notif-title">Notifications</div>
            </div>
            {!loading && !error && unreadCount > 0 && (
              <div className="notif-badge">{unreadCount} new</div>
            )}
          </div>

          <div className="divider" />

          {/* Loading */}
          {loading && (
            <div className="notif-center">
              <div className="loading-dots">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
              <div className="notif-center-sub">fetching notifications…</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="notif-error-box">
              <span className="notif-error-icon">⚠️</span>
              <div className="notif-error-msg">{error}</div>
              <button className="retry-btn" onClick={fetchNotifications}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && notifications.length === 0 && (
            <div className="notif-center">
              <span className="notif-center-icon">◎</span>
              <div className="notif-center-title">All clear</div>
              <div className="notif-center-sub">No notifications to show</div>
            </div>
          )}

          {/* List */}
          {!loading && !error && notifications.length > 0 && (
            <>
              <div className="notif-filters">
                {["all", "unread", "read"].map((f) => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="notif-list">
                {filtered.length === 0 ? (
                  <div className="notif-center">
                    <div className="notif-center-title">Nothing here</div>
                    <div className="notif-center-sub">No {filter} notifications</div>
                  </div>
                ) : (
                  filtered.map((n, i) => (
                    <div
                      key={n._id || i}
                      className={`notif-item ${n.isRead ? "read" : "unread"}`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-date">
                          {new Date(n.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="notif-meta">
                        <span className={`status-chip ${n.isRead ? "read" : "unread"}`}>
                          {n.isRead ? "Read" : "New"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default Notifications;