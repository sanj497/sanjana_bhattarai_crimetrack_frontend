import { useState, useEffect } from "react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: "▦", label: "Overview", id: "overview" },
  { icon: "◫", label: "My Documents", id: "documents" },
  { icon: "◎", label: "Track Request", id: "track" },
  { icon: "◈", label: "Settings", id: "settings" },
];

export default function CitizenDashboard() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const pageTitle = {
    overview: "Overview",
    documents: "My Documents",
    settings: "Settings",
  }[active] || active;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --navy: #0f1f3d;
          --navy-light: #1a3260;
          --gold: #c9a84c;
          --gold-light: #e8c96d;
          --cream: #faf8f4;
          --cream-dark: #f0ece3;
          --text-primary: #0f1f3d;
          --text-secondary: #5a6a8a;
          --text-muted: #9aa3b5;
          --border: #e4ddd0;
          --white: #ffffff;
          --success: #2d7a5f;
          --success-bg: #eaf5f0;
          --warning: #b5620a;
          --warning-bg: #fdf3e7;
          --info: #1a5fa8;
          --info-bg: #e8f1fc;
        }

        .dash-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .dash-root { font-family: 'DM Sans', sans-serif; }

        /* SIDEBAR */
        .sidebar {
          background: var(--navy);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .sidebar::after {
          content: '';
          position: absolute;
          bottom: 40px; left: -60px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; color: var(--navy);
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(201,168,76,0.4);
        }
        .logo-text { flex: 1; min-width: 0; }
        .logo-title {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 600;
          color: #f0ece3; letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .logo-sub { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .toggle-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          width: 26px; height: 26px; border-radius: 7px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 10px; flex-shrink: 0;
          transition: all 0.2s;
        }
        .toggle-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }

        .sidebar-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; }

        .nav-section-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
          padding: 8px 10px 4px;
        }

        .nav-btn {
          width: 100%; display: flex; align-items: center; gap: 11px;
          padding: 10px 12px; border-radius: 10px;
          border: 1px solid transparent;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          transition: all 0.18s ease; text-align: left;
          white-space: nowrap; overflow: hidden;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.75); }
        .nav-btn.active {
          background: rgba(201,168,76,0.15);
          border-color: rgba(201,168,76,0.3);
          color: var(--gold-light);
        }
        .nav-btn.active .nav-icon { color: var(--gold); }
        .nav-icon { font-size: 15px; flex-shrink: 0; width: 18px; text-align: center; }
        .nav-label { flex: 1; }

        .nav-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 10px 0; }

        .nav-btn.crime {
          color: rgba(255,120,100,0.6);
          border-color: transparent;
        }
        .nav-btn.crime:hover {
          background: rgba(255,80,60,0.1);
          color: rgba(255,130,110,0.9);
          border-color: rgba(255,80,60,0.2);
        }

        .sidebar-user {
          padding: 14px 14px 18px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #4f7de0, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .user-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); }
        .user-email { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        /* MAIN */
        .main-area { flex: 1; overflow-y: auto; background: var(--cream); display: flex; flex-direction: column; }

        .topbar {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 0 28px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 10;
          box-shadow: 0 1px 0 var(--border), 0 4px 16px rgba(15,31,61,0.04);
        }
        .topbar-left {}
        .topbar-breadcrumb {
          font-size: 11px; color: var(--text-muted); font-weight: 500;
          letter-spacing: 0.04em; margin-bottom: 2px;
        }
        .topbar-title {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 600;
          color: var(--text-primary); letter-spacing: -0.02em;
        }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .topbar-date {
          font-size: 12px; color: var(--text-muted);
          padding: 6px 12px; background: var(--cream);
          border-radius: 8px; border: 1px solid var(--border);
        }
        .btn-primary {
          background: var(--navy);
          color: #fff; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 9px 18px; border-radius: 9px;
          transition: all 0.2s; letter-spacing: 0.01em;
          box-shadow: 0 2px 8px rgba(15,31,61,0.2);
        }
        .btn-primary:hover { background: var(--navy-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(15,31,61,0.25); }

        /* CONTENT */
        .content-area { padding: 28px; flex: 1; }

        /* EMPTY STATE */
        .empty-state {
          background: var(--white);
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 80px 40px;
          text-align: center;
          box-shadow: 0 2px 16px rgba(15,31,61,0.05);
        }
        .empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: var(--cream-dark); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; margin: 0 auto 20px;
        }
        .empty-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
        .empty-sub { font-size: 14px; color: var(--text-muted); line-height: 1.6; max-width: 300px; margin: 0 auto; }

        /* OVERVIEW PLACEHOLDER */
        .welcome-banner {
          background: var(--navy);
          border-radius: 20px; padding: 28px 32px;
          margin-bottom: 20px;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden;
          animation: fadeUp 0.3s ease both;
        }
        .welcome-banner::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px;
          background: radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%);
        }
        .welcome-banner::after {
          content: '';
          position: absolute; bottom: -60px; left: 20%;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
        }
        .welcome-text { position: relative; z-index: 1; }
        .welcome-greeting { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
        .welcome-name { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; color: #fff; letter-spacing: -0.02em; }
        .welcome-id { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .welcome-emblem {
          font-size: 56px; opacity: 0.08; position: relative; z-index: 1;
          font-family: serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="dash-root" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--cream)" }}>

        {/* SIDEBAR */}
        <aside className="sidebar" style={{ width: sidebarOpen ? "230px" : "62px" }}>
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-mark">C</div>
            {sidebarOpen && (
              <div className="logo-text">
                <div className="logo-title">CivicPortal</div>
                <div className="logo-sub">Citizen Services</div>
              </div>
            )}
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            {sidebarOpen && <div className="nav-section-label">Main Menu</div>}

            {navItems.map((item, idx) => {
              // "Track Request" navigates to /notifications
              if (item.id === "track") {
                return (
                  <Link
                    key={item.id}
                    to="/notifications"
                    className={`nav-btn ${location.pathname === "/notifications" ? "active" : ""}`}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                  </Link>
                );
              }

              // All other nav items toggle local tab state
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`nav-btn ${active === item.id ? "active" : ""}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </button>
              );
            })}

            <div className="nav-divider" />

            {/* New Request Button */}
            {sidebarOpen ? (
              <button className="btn-primary" style={{ margin: "4px 0", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", fontSize: "13px" }}>
                + New Request
              </button>
            ) : (
              <button className="btn-primary" style={{ margin: "4px 0", width: "100%", padding: "10px 0", borderRadius: "10px", fontSize: "15px", textAlign: "center" }} title="New Request">
                +
              </button>
            )}

            <div className="nav-divider" />

            {sidebarOpen && <div className="nav-section-label">Actions</div>}
            <Link
              to="/Report"
              className={`nav-btn crime ${location.pathname === "/Report" ? "active" : ""}`}
              title={!sidebarOpen ? "Report Crime" : ""}
              style={{ textDecoration: "none", display: "flex" }}
            >
              <span className="nav-icon">🚨</span>
              {sidebarOpen && <span className="nav-label">Report Crime</span>}
            </Link>
            <Link
              to="/Feedback"
              className={`nav-btn crime ${location.pathname === "/Report" ? "active" : ""}`}
              title={!sidebarOpen ? "Report Crime" : ""}
              style={{ textDecoration: "none", display: "flex" }}
            >
              <span className="nav-icon">🚨</span>
              {sidebarOpen && <span className="nav-label">feedback</span>}
            </Link>
          </nav>

          {/* User */}
          <div className="sidebar-user">
            <div className="user-card">
              <div className="user-avatar">U</div>
              {sidebarOpen && (
                <div style={{ minWidth: 0 }}>
                  <div className="user-name">User Name</div>
                  <div className="user-email">user@email.com</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-area">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">CivicPortal / {pageTitle}</div>
              <div className="topbar-title">{pageTitle}</div>
            </div>
            <div className="topbar-right">
              <div className="topbar-date">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content-area">

            {/* OVERVIEW */}
            {active === "overview" && (
              <div className="welcome-banner">
                <div className="welcome-text">
                  <div className="welcome-greeting">Good day,</div>
                  <div className="welcome-name">Welcome back</div>
                  <div className="welcome-id">Citizen Services Portal</div>
                </div>
                <div className="welcome-emblem">🏛</div>
              </div>
            )}

            {/* OTHER SECTIONS */}
            {active !== "overview" && (
              <div className="empty-state">
                <div className="empty-icon">
                  {active === "documents" ? "📄" : active === "settings" ? "⚙️" : "📄"}
                </div>
                <div className="empty-title">No Data Available</div>
                <div className="empty-sub">This section will display your information once available.</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}