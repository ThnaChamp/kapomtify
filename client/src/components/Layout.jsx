import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   Global CSS injected once – resets & helpers
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; overflow: hidden; }

  .kap-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    text-align: left;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .kap-nav-item:hover { background: rgba(255,255,255,0.05); }
  .kap-nav-item.active { background: rgba(29,185,84,0.10); }

  /* Overlay – only on mobile */
  .kap-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 40;
    backdrop-filter: blur(2px);
  }

  /* Sidebar */
  .kap-sidebar {
    width: 248px;
    min-width: 248px;
    background: #121212;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #222;
    height: 100dvh;
    overflow-y: auto;
    flex-shrink: 0;
    z-index: 50;
  }

  /* Root layout */
  .kap-root {
    display: flex;
    flex-direction: row;
    width: 100dvw;
    height: 100dvh;
    background: #181818;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    overflow: hidden;
  }

  .kap-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100dvh;
  }

  .kap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 60px;
    background: #1e1e1e;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
    gap: 12px;
  }

  .kap-main {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
    background: #181818;
  }

  .kap-header-title {
    color: #f0f0f0;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Hamburger hidden on desktop */
  .kap-hamburger {
    display: none;
    background: none;
    border: none;
    color: #ccc;
    padding: 6px;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  .kap-hamburger:hover { background: rgba(255,255,255,0.08); }

  /* ── Mobile breakpoint ── */
  @media (max-width: 767px) {
    .kap-hamburger { display: flex; }

    .kap-overlay.visible { display: block; }

    .kap-sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      transform: translateX(-100%);
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    }
    .kap-sidebar.open { transform: translateX(0); }

    .kap-close-btn { display: flex !important; }

    .kap-main { padding: 16px; }
    .kap-header { padding: 0 14px; }
  }

  @media (max-width: 400px) {
    .kap-header-title { font-size: 15px; }
    .kap-admin-badge { display: none !important; }
  }

  /* Close button inside sidebar – hidden on desktop */
  .kap-close-btn {
    display: none;
    background: none;
    border: none;
    color: #888;
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }
`;

function injectGlobalStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("kapomtify-styles")) return;
  const tag = document.createElement("style");
  tag.id = "kapomtify-styles";
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const ArtistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const SubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const PlaylistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/* ── Nav Data ─────────────────────────────────────────────────────────────── */
const NAV = [
  { group: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> }] },
  {
    group: "CONTENT",
    items: [
      { id: "music", label: "Music & Album", icon: <MusicIcon /> },
      { id: "artist", label: "Artist", icon: <ArtistIcon /> },
      { id: "chart", label: "Chart", icon: <ChartIcon /> },
    ],
  },
  {
    group: "USERS",
    items: [
      { id: "users", label: "Users", icon: <UsersIcon /> },
      { id: "subscription", label: "Subscription Plans", icon: <SubIcon /> },
      { id: "playlists", label: "Playlists", icon: <PlaylistIcon /> },
    ],
  },
  { group: "REPORTS", items: [{ id: "analytics", label: "Analytics", icon: <AnalyticsIcon /> }] },
];

const PAGE_TITLES = {
  dashboard: "Dashboard", music: "Music & Album", artist: "Artist",
  chart: "Chart", users: "Users", subscription: "Subscription Plans",
  playlists: "Playlists", analytics: "Analytics",
};

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function Sidebar({ active, onSelect, isOpen, onClose }) {
  return (
    <>
      <div
        className={`kap-overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`kap-sidebar${isOpen ? " open" : ""}`} aria-label="Navigation">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 18px 20px", borderBottom: "1px solid #222", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#1DB954", display: "flex" }}><SpotifyIcon /></span>
            <span style={{ color: "#1DB954", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>Kapomtify</span>
          </div>
          <button className="kap-close-btn" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "14px 0", flex: 1 }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: "10px" }}>
              <p style={{ color: "#4a4a4a", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", padding: "0 20px", marginBottom: "4px" }}>
                {group}
              </p>
              {items.map(({ id, label, icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    className={`kap-nav-item${isActive ? " active" : ""}`}
                    onClick={() => { onSelect(id); onClose(); }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span style={{ color: isActive ? "#1DB954" : "#888", display: "flex", flexShrink: 0 }}>{icon}</span>
                    <span style={{ color: isActive ? "#fff" : "#a0a0a0", fontWeight: isActive ? 600 : 400, fontSize: "14px", letterSpacing: "0.01em" }}>
                      {label}
                    </span>
                    {isActive && (
                      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: "60%", background: "#1DB954", borderRadius: "0 2px 2px 0" }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

/* ── Header ───────────────────────────────────────────────────────────────── */
function Header({ title, onMenuClick }) {
  return (
    <header className="kap-header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <button className="kap-hamburger" onClick={onMenuClick} aria-label="Open menu">
          <HamburgerIcon />
        </button>
        <h1 className="kap-header-title">{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span
          className="kap-admin-badge"
          style={{ background: "#2a3a4a", color: "#7eb8e0", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "6px", letterSpacing: "0.04em" }}
        >
          Admin
        </span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3a4a5a", color: "#c0d8ee", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
          AD
        </div>
      </div>
    </header>
  );
}

/* ── Main content placeholder ─────────────────────────────────────────────── */
function MainContent({ page }) {
  return (
    <main className="kap-main">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200 }}>
        <p style={{ color: "#444", fontSize: "15px" }}>{PAGE_TITLES[page]} content goes here.</p>
      </div>
    </main>
  );
}

/* ── Root Layout ──────────────────────────────────────────────────────────── */
export default function KapomtifyLayout() {
  injectGlobalStyles();

  const [activePage, setActivePage] = useState("music");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close on Escape key
  const handleKey = useCallback((e) => {
    if (e.key === "Escape") setSidebarOpen(false);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Auto-close when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="kap-root">
      <Sidebar
        active={activePage}
        onSelect={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="kap-content">
        <Header title={PAGE_TITLES[activePage]} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <MainContent page={activePage} />
      </div>
    </div>
  );
}
