import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

/* ── Icons ──────────────────────────────────────────────────────────────── */
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

const DashboardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
const MusicIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const ArtistIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const ChartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const UsersIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SubIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
const PlaylistIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" /></svg>;
const TransactionIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M7 15h.01M11 15h.01" /></svg>;
const OverviewIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const ContentReportIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>;
const RecommendIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>;

/* ── Logout Icon ──────────────────────────────────────────────────────────── */
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[16px] h-[16px]">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[16px] h-[16px]">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

/* ── Navigation Data ───────────────────────────────────────────────────────── */
const NAV = [
  { group: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/" }] },
  { 
    group: "CONTENT", 
    items: [
      { id: "music", label: "Music & Album", icon: <MusicIcon />, path: "/music" }, 
      { id: "artist", label: "Artist", icon: <ArtistIcon />, path: "/artist" }, 
      { id: "chart", label: "Chart", icon: <ChartIcon />, path: "/chart" }
    ] 
  },
  { 
    group: "USERS", 
    items: [
      { id: "users", label: "Users", icon: <UsersIcon />, path: "/user" }, 
      { id: "subscription", label: "Subscription Plans", icon: <SubIcon />, path: "/subscription-plan" }, 
      { id: "playlists", label: "Playlists", icon: <PlaylistIcon />, path: "/playlist" },
      { id: "transactions", label: "Transactions", icon: <TransactionIcon />, path: "/transaction" }
    ] 
  },
  { 
    group: "REPORTS", 
    items: [
      { id: "report-overview", label: "Overview", icon: <OverviewIcon />, path: "/report/overview" },
      { id: "report-content", label: "Content", icon: <ContentReportIcon />, path: "/report/content" },
      { id: "recommendation", label: "Recommendation", icon: <RecommendIcon />, path: "/report/recommendation" }
    ] 
  },
];

/* ── Sidebar Component ────────────────────────────────────────────────────── */
function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside className={`fixed md:static inset-y-0 left-0 w-62 bg-[#121212] flex flex-col border-r border-[#222] h-screen overflow-y-auto z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex items-center justify-between p-5 border-b border-[#222] shrink-0">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="text-[#1DB954] flex"><SpotifyIcon /></span>
            <span className="text-[#1DB954] text-lg font-bold tracking-tight">Kapomtify</span>
          </Link>
          <button className="md:hidden text-gray-500 hover:bg-white/5 p-1 rounded-md transition" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className="py-4 flex-1">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-6">
              <p className="text-[#8e8e8e] text-[11px] font-bold tracking-[0.1em] px-6 mb-3 uppercase">{group}</p>
              {items.map(({ id, label, icon, path }) => (
                <NavLink
                  key={id}
                  to={path}
                  end={path === "/"}
                  onClick={onClose}
                  className={({ isActive }) => {
                    const isMusicTabActive = isActive || (id === "music" && location.pathname.startsWith("/album"));
                    return `flex items-center gap-3 w-full px-5 py-2 transition-all duration-200 group relative
                    ${isMusicTabActive ? "bg-white/[0.07] text-[#1DB954]" : "text-[#b3b3b3] hover:text-white hover:bg-white/5"}`
                  }}
                >
                  {({ isActive }) => {
                    const isMusicTabActive = isActive || (id === "music" && location.pathname.startsWith("/album"));
                    return (
                      <>
                        {isMusicTabActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-[4px] bg-[#1DB954] rounded-r-full" />
                        )}
                        <span className={`transition-colors ${isMusicTabActive ? "text-[#1DB954]" : "text-[#b3b3b3] group-hover:text-white"}`}>
                          {icon}
                        </span>
                        <span className={`text-[14px] tracking-wide transition-colors ${
                          isMusicTabActive 
                            ? "text-white font-bold" 
                            : "text-[#b3b3b3] font-medium group-hover:text-white"
                        }`}>
                          {label}
                        </span>
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

/* ── Profile Dropdown Component ───────────────────────────────────────────── */
function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userRole = localStorage.getItem("userRole") || "admin";
  const isSuperAdmin = userRole === "super_admin";
  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-9 h-9 rounded-full bg-[#3a4a5a] text-[#c0d8ee] text-sm font-bold flex items-center justify-center transition-all duration-200 ring-2 ${
          isSuperAdmin ? "bg-[#f15e5e]" : "bg-[#3a4a5a]"
        } ${
          isOpen ? "ring-[#1DB954] ring-offset-2 ring-offset-[#1e1e1e]" : "ring-transparent hover:ring-[#1DB954]/50 hover:ring-offset-2 hover:ring-offset-[#1e1e1e]"
        }`}
      >
       {isSuperAdmin ? "SA" : "AD"}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-56 bg-[#282828] border border-[#3a3a3a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in">
          
          {/* Profile Info Section */}
          <div className="px-4 py-3.5 border-b border-[#3a3a3a]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 ${isSuperAdmin ? "bg-[#f15e5e]" : "bg-[#3a4a5a]"}`}>
                {isSuperAdmin ? "SA" : "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </p>
                <p className="text-[#8e8e8e] text-[12px] truncate">admin@kapomtify.com</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                // navigate("/profile") — เปลี่ยนเป็น navigate ถ้ามี
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-[#b3b3b3] hover:text-white hover:bg-white/5 transition-colors duration-150 text-[13px]"
            >
              <ProfileIcon />
              <span>My Profile</span>
            </button>
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-[#3a3a3a] py-1.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-[#f15e5e] hover:text-white hover:bg-[#f15e5e]/10 transition-colors duration-150 text-[13px] group"
            >
              <span className="text-[#f15e5e] group-hover:text-white transition-colors">
                <LogoutIcon />
              </span>
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Header Component ─────────────────────────────────────────────────────── */
function Header({ title, onMenuClick }) {
  const userRole = localStorage.getItem("userRole") || "admin";
  const isSuperAdmin = userRole === "super_admin";

  return (
    <header className="flex items-center justify-between px-6 h-17.25 bg-[#1e1e1e] border-b border-[#2a2a2a] shrink-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <button className="md:hidden text-gray-400 p-1.5 rounded-md hover:bg-white/10 transition" onClick={onMenuClick}>
          <HamburgerIcon />
        </button>
        <h1 className="text-[#f0f0f0] text-lg font-semibold truncate tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
       
        <span className={`hidden sm:inline-block text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider transition-colors duration-300 ${
          isSuperAdmin 
            ? "bg-[#f15e5e]" 
            : "bg-[#2a3a4a] text-[#7eb8e0]" 
        }`}>
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </span>
        
        <ProfileDropdown />
      </div>
    </header>
  );
}

/* ── Root Layout ──────────────────────────────────────────────────────────── */
export default function KapomtifyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", handleKey);
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => {
      window.removeEventListener("keydown", handleKey);
      mq.removeEventListener("change", handler);
    };
  }, []);

  const allItems = NAV.flatMap(group => group.items);
  const activeItem = allItems.find(item => {
    if (location.pathname.startsWith("/album")) {
      return item.id === "music";
    }
    return item.path === location.pathname;
  });
  const displayTitle = activeItem ? activeItem.label : "Kapomtify";

  return (
    <div className="flex w-full h-screen bg-[#181818] font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <Header title={displayTitle} onMenuClick={() => setSidebarOpen(o => !o)} />
        
        <main className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}