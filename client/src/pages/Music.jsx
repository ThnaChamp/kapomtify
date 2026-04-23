import { useState, useMemo } from "react";

/* ── Sample Data ────────────────────────────────────────────────────────── */
const INITIAL_MUSIC = [
  { id: "M001", title: "กระเป๋าแบบแฟนยิ้ม", artist: "The Richman Toy", releaseDate: "03/06/2009", genre: "Thai Rock" },
  { id: "M002", title: "เศษใจเหลือเหลือ", artist: "Dr. Fuu", releaseDate: "01/01/2008", genre: "Thai Pop" },
  { id: "M003", title: "รักรักรักรักรักรักรัก (Talk Less)", artist: "D Gerrard", releaseDate: "29/09/2022", genre: "Thai HipHop" },
  { id: "M004", title: "จดหมาย", artist: "The Toy", releaseDate: "10/07/2016", genre: "Thai Pop" },
  { id: "M005", title: "APRIL", artist: "Sirimongkol", releaseDate: "11/04/2020", genre: "Thai Indie" },
  { id: "M006", title: "เปิดตัวเขา", artist: "Three Man Down", releaseDate: "29/06/2023", genre: "Thai Rock" },
  { id: "M007", title: "ทางผ่าน", artist: "Bedroom Audio", releaseDate: "14/02/2019", genre: "Thai Indie" },
  { id: "M008", title: "คนเดียว", artist: "Slot Machine", releaseDate: "05/11/2015", genre: "Thai Rock" },
  { id: "M009", title: "ใกล้กัน", artist: "Palaphol", releaseDate: "22/08/2021", genre: "Thai Pop" },
  { id: "M010", title: "ล้านเหตุผล", artist: "Mild", releaseDate: "17/03/2010", genre: "Thai Pop" },
  { id: "M011", title: "เธอยังโสดไหม", artist: "Lipta", releaseDate: "09/07/2018", genre: "Thai Pop" },
  { id: "M012", title: "ไม่โอเค", artist: "Milli", releaseDate: "30/04/2022", genre: "Thai HipHop" },
];

const GENRES = ["All", "Thai Rock", "Thai Pop", "Thai HipHop", "Thai Indie"];
const PAGE_SIZE = 6;

/* ── Icons ──────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronsRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MusicNoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);

/* ── Genre badge colours ─────────────────────────────────────────────────── */
const GENRE_COLOR = {
  "Thai Rock":   { bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
  "Thai Pop":    { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  "Thai HipHop": { bg: "rgba(168,85,247,0.12)", color: "#c084fc" },
  "Thai Indie":  { bg: "rgba(34,197,94,0.12)",  color: "#4ade80" },
};
const genreStyle = (g) => GENRE_COLOR[g] || { bg: "rgba(255,255,255,0.08)", color: "#aaa" };

/* ── Modal ───────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, onSave, initial }) {
  const empty = { id: "", title: "", artist: "", releaseDate: "", genre: "Thai Pop" };
  const [form, setForm] = useState(initial || empty);

  // sync when initial changes (edit mode)
  useMemo(() => { setForm(initial || empty); }, [initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.id && form.title && form.artist && form.releaseDate && form.genre;

  return (
    <div style={ms.backdrop} onClick={onClose}>
      <div style={ms.box} onClick={(e) => e.stopPropagation()}>
        <div style={ms.head}>
          <span style={ms.headTitle}>{initial ? "Edit Music" : "Create Music"}</span>
          <button onClick={onClose} style={ms.closeBtn}><CloseIcon /></button>
        </div>
        <div style={ms.body}>
          {[
            { label: "Music ID", key: "id", placeholder: "e.g. M013", disabled: !!initial },
            { label: "Title", key: "title", placeholder: "Song title" },
            { label: "Artist", key: "artist", placeholder: "Artist name" },
            { label: "Release Date", key: "releaseDate", placeholder: "DD/MM/YYYY" },
          ].map(({ label, key, placeholder, disabled }) => (
            <label key={key} style={ms.label}>
              <span style={ms.labelText}>{label}</span>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                disabled={disabled}
                style={{ ...ms.input, ...(disabled ? ms.inputDisabled : {}) }}
              />
            </label>
          ))}
          <label style={ms.label}>
            <span style={ms.labelText}>Genre</span>
            <select value={form.genre} onChange={set("genre")} style={ms.input}>
              {GENRES.filter((g) => g !== "All").map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>
        <div style={ms.foot}>
          <button onClick={onClose} style={ms.cancelBtn}>Cancel</button>
          <button
            onClick={() => valid && onSave(form)}
            style={{ ...ms.saveBtn, opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}
          >
            {initial ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ms = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  box: { background: "#1e1e1e", borderRadius: "12px", border: "1px solid #2e2e2e", width: "100%", maxWidth: "440px", overflow: "hidden" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #2a2a2a" },
  headTitle: { color: "#f0f0f0", fontSize: "16px", fontWeight: 600 },
  closeBtn: { background: "none", border: "none", color: "#777", cursor: "pointer", padding: "2px", display: "flex" },
  body: { padding: "20px", display: "flex", flexDirection: "column", gap: "14px" },
  label: { display: "flex", flexDirection: "column", gap: "6px" },
  labelText: { color: "#999", fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em" },
  input: { background: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "#f0f0f0", fontSize: "14px", padding: "9px 12px", outline: "none", width: "100%" },
  inputDisabled: { opacity: 0.5, cursor: "not-allowed" },
  foot: { display: "flex", gap: "10px", padding: "16px 20px", borderTop: "1px solid #2a2a2a", justifyContent: "flex-end" },
  cancelBtn: { background: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "#aaa", fontSize: "13px", fontWeight: 500, padding: "8px 18px", cursor: "pointer" },
  saveBtn: { background: "#1DB954", border: "none", borderRadius: "8px", color: "#000", fontSize: "13px", fontWeight: 700, padding: "8px 20px" },
};

/* ── Delete confirm dialog ───────────────────────────────────────────────── */
function DeleteDialog({ open, onClose, onConfirm, title }) {
  if (!open) return null;
  return (
    <div style={ms.backdrop} onClick={onClose}>
      <div style={{ ...ms.box, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div style={ms.head}>
          <span style={{ ...ms.headTitle, color: "#f87171" }}>Delete Music</span>
          <button onClick={onClose} style={ms.closeBtn}><CloseIcon /></button>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ color: "#bbb", fontSize: "14px", lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: "#f0f0f0" }}>{title}</strong>? This action cannot be undone.
          </p>
        </div>
        <div style={ms.foot}>
          <button onClick={onClose} style={ms.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={{ ...ms.saveBtn, background: "#ef4444" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Filter Dropdown ─────────────────────────────────────────────────────── */
function FilterDropdown({ open, onClose, genre, setGenre }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#232323", border: "1px solid #333", borderRadius: "10px", padding: "8px", zIndex: 20, minWidth: "160px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      {GENRES.map((g) => (
        <button
          key={g}
          onClick={() => { setGenre(g); onClose(); }}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: genre === g ? "rgba(29,185,84,0.12)" : "none", border: "none", borderRadius: "6px", color: genre === g ? "#1DB954" : "#bbb", fontSize: "13px", cursor: "pointer", fontWeight: genre === g ? 600 : 400 }}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

/* ── MusicPage ───────────────────────────────────────────────────────────── */
export default function MusicPage() {
  const [tab, setTab] = useState("music");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [page, setPage] = useState(1);
  const [music, setMusic] = useState(INITIAL_MUSIC);
  const [filterOpen, setFilterOpen] = useState(false);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  /* Filtered + searched list */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return music.filter((m) => {
      const matchSearch = !q || m.title.toLowerCase().includes(q) || m.artist.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      const matchGenre = genre === "All" || m.genre === genre;
      return matchSearch && matchGenre;
    });
  }, [music, search, genre]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Handlers */
  const handleCreate = (form) => {
    setMusic((prev) => [...prev, form]);
    setCreateOpen(false);
    setPage(1);
  };
  const handleEdit = (form) => {
    setMusic((prev) => prev.map((m) => (m.id === form.id ? form : m)));
    setEditItem(null);
  };
  const handleDelete = () => {
    setMusic((prev) => prev.filter((m) => m.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── Tabs ── */}
      <div style={{ borderBottom: "1px solid #2a2a2a", paddingLeft: "24px", display: "flex", gap: "0", flexShrink: 0 }}>
        {["music", "album"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "14px 20px", fontSize: "14px", fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "#1DB954" : "#777",
              borderBottom: tab === t ? "2px solid #1DB954" : "2px solid transparent",
              letterSpacing: "0.01em", transition: "color 0.15s",
              textTransform: "capitalize",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 24px", flexShrink: 0, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: "160px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#555", display: "flex" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search music, artist..."
            style={{ width: "100%", background: "#232323", border: "1px solid #2e2e2e", borderRadius: "8px", color: "#e0e0e0", fontSize: "13px", padding: "9px 12px 9px 32px", outline: "none" }}
          />
        </div>

        {/* Filter */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#232323", border: `1px solid ${filterOpen || genre !== "All" ? "#1DB954" : "#2e2e2e"}`, borderRadius: "8px", color: genre !== "All" ? "#1DB954" : "#bbb", fontSize: "13px", fontWeight: 500, padding: "9px 14px", cursor: "pointer" }}
          >
            <FilterIcon /> Filter{genre !== "All" ? `: ${genre}` : ""}
          </button>
          <FilterDropdown open={filterOpen} onClose={() => setFilterOpen(false)} genre={genre} setGenre={(g) => { setGenre(g); setPage(1); }} />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Create button */}
        <button
          onClick={() => setCreateOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "7px", background: "#1DB954", border: "none", borderRadius: "8px", color: "#000", fontSize: "13px", fontWeight: 700, padding: "9px 16px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          <PlusIcon /> Create music
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: "#1e1e1e", borderRadius: "12px", border: "1px solid #2a2a2a", overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "44px 90px 1fr 140px 120px 120px 160px", gap: "0", borderBottom: "1px solid #2a2a2a", padding: "0 16px" }}>
            {["#", "Music ID", "Title", "Artist", "Release Date", "Genre", ""].map((h, i) => (
              <div key={i} style={{ padding: "12px 8px", color: "#555", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
              <span style={{ color: "#333" }}><MusicNoteIcon /></span>
              <p style={{ color: "#444", fontSize: "14px" }}>No music found</p>
            </div>
          ) : rows.map((m, idx) => {
            const rowNum = (safePage - 1) * PAGE_SIZE + idx + 1;
            const gs = genreStyle(m.genre);
            return (
              <div
                key={m.id}
                style={{ display: "grid", gridTemplateColumns: "44px 90px 1fr 140px 120px 120px 160px", gap: "0", borderBottom: "1px solid #242424", padding: "0 16px", transition: "background 0.12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={cell}>{rowNum}</div>
                <div style={{ ...cell, color: "#1DB954", fontWeight: 600, fontSize: "13px" }}>{m.id}</div>
                <div style={{ ...cell, color: "#e8e8e8", fontWeight: 500 }}>{m.title}</div>
                <div style={{ ...cell, color: "#bbb" }}>{m.artist}</div>
                <div style={{ ...cell, color: "#888" }}>{m.releaseDate}</div>
                <div style={cell}>
                  <span style={{ background: gs.bg, color: gs.color, fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.03em" }}>
                    {m.genre}
                  </span>
                </div>
                <div style={{ ...cell, gap: "6px" }}>
                  <button
                    onClick={() => setEditItem(m)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid #333", borderRadius: "6px", color: "#ccc", fontSize: "11.5px", fontWeight: 500, padding: "5px 10px", cursor: "pointer" }}
                  >
                    <EditIcon /> Detail
                  </button>
                  <button
                    onClick={() => setDeleteItem(m)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", color: "#f87171", fontSize: "11.5px", fontWeight: 500, padding: "5px 10px", cursor: "pointer" }}
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", paddingTop: "16px", flexWrap: "wrap" }}>
            <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}><ChevronLeft /></PagBtn>
            {pageNums.map((n) => (
              <PagBtn key={n} onClick={() => setPage(n)} active={n === safePage}>{n}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><ChevronRight /></PagBtn>
            <PagBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages}><ChevronsRight /></PagBtn>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} initial={null} />
      <Modal open={!!editItem} onClose={() => setEditItem(null)} onSave={handleEdit} initial={editItem} />
      <DeleteDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title={deleteItem?.title} />
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const cell = { display: "flex", alignItems: "center", padding: "14px 8px", color: "#999", fontSize: "13px" };

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: "32px", height: "32px", padding: "0 8px",
        background: active ? "#1DB954" : "rgba(255,255,255,0.05)",
        border: `1px solid ${active ? "#1DB954" : "#2e2e2e"}`,
        borderRadius: "6px", color: active ? "#000" : disabled ? "#333" : "#bbb",
        fontSize: "12px", fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.12s",
      }}
    >
      {children}
    </button>
  );
}
