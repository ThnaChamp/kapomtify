import { useState, useEffect, useCallback } from "react";

/* ── Icons (เหมือนเดิม) ────────────────────────────────────────────────────────────── */
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px]">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
    <line x1="3" y1="6" x2="21" y2="6" /> <line x1="3" y1="12" x2="21" y2="12" /> <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
    <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ... (Icons อื่นๆ ยังคงเดิม แค่เปลี่ยน width/height เป็น class แทนถ้าต้องการ)
const DashboardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
const MusicIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const ArtistIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const ChartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const UsersIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SubIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
const PlaylistIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>;
const AnalyticsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;

const NAV = [
  { group: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> }] },
  { group: "CONTENT", items: [{ id: "music", label: "Music & Album", icon: <MusicIcon /> }, { id: "artist", label: "Artist", icon: <ArtistIcon /> }, { id: "chart", label: "Chart", icon: <ChartIcon /> }] },
  { group: "USERS", items: [{ id: "users", label: "Users", icon: <UsersIcon /> }, { id: "subscription", label: "Subscription Plans", icon: <SubIcon /> }, { id: "playlists", label: "Playlists", icon: <PlaylistIcon /> }] },
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 w-62 bg-[#121212] flex flex-col border-r border-[#222] h-screen overflow-y-auto z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between p-5 border-b border-[#222] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[#1DB954] flex"><SpotifyIcon /></span>
            <span className="text-[#1DB954] text-lg font-bold tracking-tight">Kapomtify</span>
          </div>
          <button className="md:hidden text-gray-500 hover:bg-white/5 p-1 rounded-md transition" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4 flex-1">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-4">
              <p className="text-[#4a4a4a] text-[10px] font-bold tracking-widest px-5 mb-1">{group}</p>
              {items.map(({ id, label, icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onSelect(id); onClose(); }}
                    className={`flex items-center gap-3 w-full px-5 py-2.5 relative transition-colors hover:bg-white/5 ${isActive ? "bg-[#1DB954]/10" : ""}`}
                  >
                    <span className={isActive ? "text-[#1DB954]" : "text-gray-500"}>{icon}</span>
                    <span className={`text-sm tracking-wide ${isActive ? "text-white font-semibold" : "text-[#a0a0a0]"}`}>
                      {label}
                    </span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-[#1DB954] rounded-r-sm" />}
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
    <header className="flex items-center justify-between px-6 h-15 bg-[#1e1e1e] border-b border-[#2a2a2a] shrink-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <button className="md:hidden text-gray-400 p-1.5 rounded-md hover:bg-white/10 transition" onClick={onMenuClick}>
          <HamburgerIcon />
        </button>
        <h1 className="text-[#f0f0f0] text-lg font-semibold truncate tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="hidden sm:inline-block bg-[#2a3a4a] text-[#7eb8e0] text-[11px] font-bold px-3 py-1 rounded-md tracking-wider">
          Admin
        </span>
        <div className="w-9 h-9 rounded-full bg-[#3a4a5a] text-[#c0d8ee] text-sm font-bold flex items-center justify-center cursor-pointer">
          AD
        </div>
      </div>
    </header>
  );
}

/* ── Root Layout ──────────────────────────────────────────────────────────── */
export default function KapomtifyLayout() {
  const [activePage, setActivePage] = useState("music");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Screen resize handler
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex w-full h-screen bg-[#181818] font-sans overflow-hidden">
      <Sidebar active={activePage} onSelect={setActivePage} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <Header title={PAGE_TITLES[activePage]} onMenuClick={() => setSidebarOpen(o => !o)} />
        
        <main className="flex-1 overflow-y-auto p-7">
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-[#444] text-sm">{PAGE_TITLES[activePage]} content goes here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}