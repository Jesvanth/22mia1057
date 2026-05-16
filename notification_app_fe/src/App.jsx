import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const TYPE_CONFIG = {
  Placement: { color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
  Result:    { color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)"  },
  Event:     { color: "#6366F1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)"  },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationCard({ notif, isNew, index }) {
  const cfg = TYPE_CONFIG[notif.Type] || TYPE_CONFIG.Event;
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: "10px",
        padding: "14px 18px",
        marginBottom: "8px",
        transition: "all 0.2s ease",
        transform: hov ? "translateX(3px)" : "none",
        animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
      }}
    >
      {/* Top row: badge + UNREAD + time */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        <span style={{
          fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
          textTransform: "uppercase", color: cfg.color,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          padding: "3px 10px", borderRadius: "4px", flexShrink: 0,
        }}>{notif.Type}</span>

        {isNew && (
          <span style={{
            fontSize: "9px", fontWeight: "800", letterSpacing: "1.2px",
            color: "#fff", background: "#EF4444",
            padding: "2px 8px", borderRadius: "4px", flexShrink: 0,
          }}>UNREAD</span>
        )}

        <span style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>
          {timeAgo(notif.Timestamp)}
        </span>
      </div>

      {/* Message */}
      <div style={{
        fontSize: "14px", fontWeight: "600", color: isNew ? "#F9FAFB" : "#D1D5DB",
        lineHeight: "1.5", marginBottom: "6px",
      }}>{notif.Message}</div>

      {/* Timestamp */}
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
        {notif.Timestamp}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "10px",
      padding: "14px 16px",
      flex: "1 1 0",
      minWidth: 0,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "26px", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [all, setAll] = useState([]);
  const [priority, setPriority] = useState([]);
  const [seen, setSeen] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(10);
  const [filterType, setFilterType] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      const notifs = res.data.notifications;
      setAll(notifs);
      setSeen(s => s.size === 0 ? new Set(notifs.map(x => x.ID)) : s);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
  };

  const fetchPriority = async () => {
    try {
      const res = await axios.get(`${API}/priority-inbox?n=${n}`);
      setPriority(res.data.notifications);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAll(), fetchPriority()]);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [n]);

  const filtered = filterType === "All" ? all : all.filter(x => x.Type === filterType);
  const newCount = all.filter(x => !seen.has(x.ID)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#090C14", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#E5E7EB" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e2130; border-radius: 4px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.55;} }

        .tab-btn:hover { color: rgba(255,255,255,0.8) !important; }
        .filter-btn:hover { border-color: rgba(255,255,255,0.25) !important; color: rgba(255,255,255,0.8) !important; }
        .n-btn:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .page-pad  { padding: 16px 14px 40px !important; }
          .hdr-inner { padding: 12px 14px !important; }
          .hdr-sub   { display: none !important; }
          .stats-row { gap: 6px !important; }
          .stat-card { padding: 10px 8px !important; }
          .stat-val  { font-size: 20px !important; }
          .stat-lbl  { font-size: 9px !important; }
          .tabs-wrap { width: 100% !important; }
          .tab-btn   { flex: 1 !important; padding: 8px 6px !important; font-size: 12px !important; }
          .legend    { display: none !important; }
          .n-label   { display: none !important; }
          .res-count { display: none !important; }
          .card-pad  { padding: 12px 14px !important; }
          .card-msg  { font-size: 13px !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(9,12,20,0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(20px)",
      }}>
        <div className="hdr-inner" style={{
          maxWidth: "820px", margin: "0 auto", padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "800", letterSpacing: "-0.4px" }}>
              Campus&nbsp;<span style={{ color: "#6366F1" }}>Notifications</span>
            </div>
            <div className="hdr-sub" style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", marginTop: "2px", letterSpacing: "1px", textTransform: "uppercase" }}>
              Real-time Platform
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {lastUpdated && (
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)" }}>
                Updated {timeAgo(lastUpdated)}
              </span>
            )}
            {newCount > 0 && (
              <span style={{
                background: "#EF4444", color: "#fff",
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px",
                padding: "4px 11px", borderRadius: "20px",
                animation: "blink 2.5s infinite",
              }}>{newCount} unread</span>
            )}
          </div>
        </div>
      </header>

      {/* ── PAGE ── */}
      <main className="page-pad" style={{ maxWidth: "820px", margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* Stats */}
        <div className="stats-row" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total",      value: all.length,                                      color: "#9CA3AF" },
            { label: "Placements", value: all.filter(x=>x.Type==="Placement").length,      color: "#10B981" },
            { label: "Results",    value: all.filter(x=>x.Type==="Result").length,         color: "#F59E0B" },
            { label: "Events",     value: all.filter(x=>x.Type==="Event").length,          color: "#6366F1" },
            { label: "Unread",     value: newCount,                                        color: "#EF4444" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px", padding: "14px 16px",
              flex: "1 1 0", minWidth: 0, textAlign: "center",
            }}>
              <div className="stat-val" style={{ fontSize: "24px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div className="stat-lbl" style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.7px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-wrap" style={{
          display: "flex", gap: "3px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px", padding: "3px",
          width: "fit-content", marginBottom: "20px",
        }}>
          {["All Notifications", "Priority Inbox"].map((t, i) => (
            <button key={i} className="tab-btn" onClick={() => setTab(i)} style={{
              padding: "8px 20px", borderRadius: "6px", border: "none",
              fontSize: "13px", fontWeight: "600", transition: "all 0.2s",
              background: tab === i ? "#6366F1" : "transparent",
              color: tab === i ? "#fff" : "rgba(255,255,255,0.36)",
              boxShadow: tab === i ? "0 2px 12px rgba(99,102,241,0.35)" : "none",
            }}>{t}</button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "18px" }} />

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "28px", height: "28px",
              border: "2px solid rgba(255,255,255,0.08)",
              borderTop: "2px solid #6366F1",
              borderRadius: "50%", margin: "0 auto 12px",
              animation: "spin 0.7s linear infinite",
            }} />
            <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "13px" }}>Loading…</div>
          </div>
        ) : (
          <>
            {/* ALL NOTIFICATIONS */}
            {tab === 0 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                {/* Filters */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                  {["All", "Placement", "Result", "Event"].map(t => {
                    const cfg = TYPE_CONFIG[t];
                    const active = filterType === t;
                    return (
                      <button key={t} className="filter-btn" onClick={() => setFilterType(t)} style={{
                        padding: "6px 14px", borderRadius: "6px",
                        border: `1px solid ${active && cfg ? cfg.border : "rgba(255,255,255,0.09)"}`,
                        fontSize: "12px", fontWeight: "600", transition: "all 0.18s",
                        background: active && cfg ? cfg.bg : "transparent",
                        color: active && cfg ? cfg.color : active ? "#fff" : "rgba(255,255,255,0.36)",
                      }}>{t}</button>
                    );
                  })}
                  <span className="res-count" style={{ marginLeft: "auto", fontSize: "12px", color: "rgba(255,255,255,0.22)" }}>
                    {filtered.length} results
                  </span>
                </div>

                {filtered.length === 0
                  ? <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.18)", fontSize: "13px" }}>No notifications found</div>
                  : filtered.map((x, i) => <NotificationCard key={x.ID} notif={x} isNew={!seen.has(x.ID)} index={i} />)
                }
              </div>
            )}

            {/* PRIORITY INBOX */}
            {tab === 1 && (
              <div style={{ animation: "fadeUp 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                  <span className="n-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Show top
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[5, 10, 15, 20].map(val => (
                      <button key={val} className="n-btn" onClick={() => setN(val)} style={{
                        width: "36px", height: "32px", borderRadius: "6px",
                        border: `1px solid ${n === val ? "#6366F1" : "rgba(255,255,255,0.09)"}`,
                        fontSize: "13px", fontWeight: "700", transition: "all 0.15s",
                        background: n === val ? "rgba(99,102,241,0.15)" : "transparent",
                        color: n === val ? "#6366F1" : "rgba(255,255,255,0.36)",
                      }}>{val}</button>
                    ))}
                  </div>
                  <span className="n-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>notifications</span>

                  {/* Legend — hidden on mobile */}
                  <div className="legend" style={{ marginLeft: "auto", display: "flex", gap: "14px" }}>
                    {[["Placement","#10B981","×3"],["Result","#F59E0B","×2"],["Event","#6366F1","×1"]].map(([l,c,w])=>(
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c }} />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.26)" }}>{l}</span>
                        <span style={{ fontSize: "11px", color: c, fontWeight: "700" }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "14px" }} />

                {priority.length === 0
                  ? <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.18)", fontSize: "13px" }}>No notifications</div>
                  : priority.map((x, i) => <NotificationCard key={x.ID} notif={x} isNew={!seen.has(x.ID)} index={i} />)
                }
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}