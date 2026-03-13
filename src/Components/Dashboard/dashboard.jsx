import { useMemo, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();

    const menu = useMemo(
        () => [
            { name: "Dashboard", icon: "📊" },
            { name: "Reports", icon: "📝" },
            { name: "Users", icon: "👤" },
            { name: "Evidence", icon: "🖼️" },
            { name: "Settings", icon: "⚙️" },
            { name: "Feedback", icon: "💬" },
        ],
        []
    );

    const StatCard = ({ title, value, sub, icon }) => (
        <div
            style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.70)" }}>{title}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.70)" }}>{sub}</div>
                </div>
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontSize: 18,
                    }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );

    const Pill = ({ children }) => (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 12,
                color: "rgba(255,255,255,0.80)",
            }}
        >
            {children}
        </span>
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "radial-gradient(1200px 600px at 20% 10%, #1d4ed8 0%, rgba(29,78,216,0.12) 55%, transparent 70%), linear-gradient(135deg, #0b1220, #111b33)",
                color: "#e5e7eb",
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            }}
        >
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>
                {/* Sidebar */}
                <aside
                    style={{
                        height: "100vh",
                        position: "sticky",
                        top: 0,
                        padding: 18,
                        borderRight: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(0,0,0,0.20)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 16px" }}>
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                display: "grid",
                                placeItems: "center",
                                background: "rgba(255,255,255,0.10)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                fontWeight: 800,
                            }}
                        >
                            CT
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>CrimeTrack</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Admin Dashboard</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                        {menu.map((m) => {
                            const isActive = active === m.name;

                            return (
                                <button
                                    key={m.name}
                                    onClick={() => {
                                        setActive(m.name);

                                        if (m.name === "Reports") {
                                            navigate("/adReport");
                                        }

                                        if (m.name === "Dashboard") {
                                            navigate("/");

                                        }
                                         if (m.name === "Feedback") navigate("/admin/feedback");
                                    }}
                                    style={{
                                        all: "unset",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                        border:
                                            "1px solid " +
                                            (isActive ? "rgba(255,255,255,0.18)" : "transparent"),
                                        color: isActive ? "#fff" : "rgba(255,255,255,0.78)",
                                    }}
                                >
                                    <span style={{ width: 22, textAlign: "center" }}>{m.icon}</span>
                                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                                </button>
                            );
                        })}
                    </div>


                    <div style={{ marginTop: 18, padding: 12, borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>Quick Tip</div>
                        <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,0.85)" }}>
                            Keep reports consistent by verifying location + evidence before approving.
                        </div>
                    </div>

                    <div style={{ marginTop: 16, padding: "0 8px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                        © {new Date().getFullYear()} CrimeTrack
                    </div>
                </aside>

                {/* Main */}
                <main style={{ padding: 22 }}>
                    {/* Topbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            marginBottom: 18,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900 }}>{active}</div>
                            <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.70)" }}>
                                Overview of activity and actions you can take today.
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <Pill>🟢 System Online</Pill>
                            <Pill>🔔 3 Notifications</Pill>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "8px 10px",
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 999,
                                        display: "grid",
                                        placeItems: "center",
                                        background: "rgba(255,255,255,0.10)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        fontSize: 12,
                                        fontWeight: 800,
                                    }}
                                >
                                    A
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Admin</div>
                            </div>
                        </div>
                    </div>

                    {/* Content grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 16 }}>
                        {/* Left column */}
                        <div style={{ display: "grid", gap: 16 }}>
                            {/* Stat cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                                <StatCard title="Total Reports" value="128" sub="Last 30 days" icon="🧾" />
                                <StatCard title="Pending Review" value="14" sub="Needs action" icon="⏳" />
                                <StatCard title="Resolved" value="79" sub="Approved/closed" icon="✅" />
                            </div>

                            {/* Activity panel */}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    borderRadius: 16,
                                    padding: 16,
                                    boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                    <div style={{ fontWeight: 800 }}>Recent Activity</div>
                                    <button
                                        style={{
                                            all: "unset",
                                            cursor: "pointer",
                                            padding: "8px 10px",
                                            borderRadius: 10,
                                            background: "rgba(255,255,255,0.08)",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        View all
                                    </button>
                                </div>

                                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                                    {[
                                        { title: "New report submitted", meta: "Robbery • Dharan • 10m ago", badge: "Pending" },
                                        { title: "Evidence uploaded", meta: "Fight • Itahari • 1h ago", badge: "Pending" },
                                        { title: "Report approved", meta: "Theft • Biratnagar • 4h ago", badge: "Approved" },
                                        { title: "User flagged", meta: "Suspicious activity • 1d ago", badge: "Review" },
                                    ].map((a, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 10,
                                                padding: 12,
                                                borderRadius: 14,
                                                background: "rgba(0,0,0,0.18)",
                                                border: "1px solid rgba(255,255,255,0.10)",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 750 }}>{a.title}</div>
                                                <div style={{ marginTop: 3, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>{a.meta}</div>
                                            </div>

                                            <span
                                                style={{
                                                    padding: "6px 10px",
                                                    borderRadius: 999,
                                                    fontSize: 12,
                                                    fontWeight: 800,
                                                    background:
                                                        a.badge === "Approved"
                                                            ? "rgba(34,197,94,0.18)"
                                                            : a.badge === "Pending"
                                                                ? "rgba(245,158,11,0.18)"
                                                                : "rgba(99,102,241,0.18)",
                                                    border:
                                                        a.badge === "Approved"
                                                            ? "1px solid rgba(34,197,94,0.25)"
                                                            : a.badge === "Pending"
                                                                ? "1px solid rgba(245,158,11,0.25)"
                                                                : "1px solid rgba(99,102,241,0.25)",
                                                    color: "#fff",
                                                }}
                                            >
                                                {a.badge}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div style={{ display: "grid", gap: 16 }}>
                            {/* Quick actions */}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    borderRadius: 16,
                                    padding: 16,
                                    boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
                                }}
                            >
                                <div style={{ fontWeight: 800, marginBottom: 10 }}>Quick Actions</div>

                                <div style={{ display: "grid", gap: 10 }}>
                                    {[
                                        { title: "Review Pending Reports", desc: "Open all pending items for review", icon: "⏳" },
                                        { title: "Manage Users", desc: "Search, block, or change roles", icon: "👤" },
                                        { title: "Evidence Gallery", desc: "View recent uploads quickly", icon: "🖼️" },
                                    ].map((x, i) => (
                                        <button
                                            key={i}
                                            style={{
                                                all: "unset",
                                                cursor: "pointer",
                                                padding: 12,
                                                borderRadius: 14,
                                                background: "rgba(0,0,0,0.18)",
                                                border: "1px solid rgba(255,255,255,0.10)",
                                            }}
                                        >
                                            <div style={{ display: "flex", gap: 10 }}>
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 12,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        background: "rgba(255,255,255,0.10)",
                                                        border: "1px solid rgba(255,255,255,0.12)",
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    {x.icon}
                                                </div>

                                                <div style={{ textAlign: "left" }}>
                                                    <div style={{ fontWeight: 800 }}>{x.title}</div>
                                                    <div style={{ marginTop: 3, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>{x.desc}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status summary */}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    borderRadius: 16,
                                    padding: 16,
                                    boxShadow: "0 14px 30px rgba(0,0,0,0.30)",
                                }}
                            >
                                <div style={{ fontWeight: 800, marginBottom: 10 }}>Status Summary</div>

                                {[
                                    { label: "Pending", value: 14 },
                                    { label: "Approved", value: 79 },
                                    { label: "Rejected", value: 9 },
                                ].map((s, i) => (
                                    <div key={i} style={{ marginBottom: 10 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                            <span style={{ color: "rgba(255,255,255,0.75)" }}>{s.label}</span>
                                            <span style={{ fontWeight: 800 }}>{s.value}</span>
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 6,
                                                height: 10,
                                                borderRadius: 999,
                                                background: "rgba(255,255,255,0.10)",
                                                border: "1px solid rgba(255,255,255,0.10)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${Math.min(100, (s.value / 128) * 100)}%`,
                                                    background: "rgba(99,102,241,0.55)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                                    Tip: Replace numbers with real API data when you’re ready.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
