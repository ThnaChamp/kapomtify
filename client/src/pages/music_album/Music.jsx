import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";
import DeleteModal from "../../components/DeleteModal";
export default function MusicPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Music");
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    music_code: "",
    title: "",
    duration: "",
    release_date: "",
    artist_id: "",
    genres: [],
    is_explicit: false,
    file_url: "",
  });
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const ITEMS_PER_PAGE = 20;

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/genres`);
      const data = await res.json();
      setAllGenres(data);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [albumRes, artistRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/albums`),
          fetch(`${import.meta.env.VITE_API_URL}/api/artists`),
        ]);
        const albumData = await albumRes.json();
        const artistData = await artistRes.json();
        setAlbums(albumData.data || albumData);
        setArtists(artistData.data || artistData);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    };
    loadOptions();
  }, []);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/music?page=${currentPage}&search=${searchQuery}&genreId=${selectedGenre}`,
      );
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const result = await response.json();
      setMusic(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Fetch Error:", error);
      setMusic([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMusic();
    }, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery, selectedGenre]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = (name === "album_id" || name === "artist_id" || name === "duration")
        ? (value === "" ? "" : parseInt(value))
        : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ music_code: "", title: "", duration: "", release_date: "", artist_id: "", genres: [], is_explicit: false, file_url: "" });
        fetchMusic();
      }
    } catch (error) {
      console.error("Error creating music:", error);
    }
  };

  const handleGenreToggle = (genreId) => {
    setFormData((prev) => {
      const isSelected = prev.genres.includes(genreId);
      const updatedGenres = isSelected
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId];
      return { ...prev, genres: updatedGenres };
    });
  };

  const handleDelete = async () => {
  if (!deleteTarget) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${deleteTarget.music_id}`, { 
      method: "DELETE",
    });

    if (response.ok) {
      fetchMusic();
    } else {
      const errorData = await response.json();
      alert(`ลบไม่สำเร็จ: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error deleting music:", error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  } finally {
    setDeleteTarget(null); 
  }
};

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0]">
      {/* ── Tabs ── */}
      <div className="flex gap-8 border-b border-[#333] pl-8 pt-3">
        <button onClick={() => navigate("/music")} className="pb-3 text-sm font-semibold text-[#1DB954] border-b-2 border-[#1DB954]">Music</button>
        <button onClick={() => navigate("/album")} className="pb-3 text-sm font-semibold text-gray-400">Album</button>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-8 flex flex-col gap-5">
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-3 items-center">
            <SearchBox
              placeholder="Search music..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="relative">
              <Filter onClick={() => setIsFilterOpen(!isFilterOpen)} active={!!selectedGenre} />
              {isFilterOpen && (
                <div className="absolute top-10 left-0 z-20 w-48 bg-[#282828] border border-[#333] rounded-lg shadow-xl p-2">
                  <button onClick={() => { setSelectedGenre(""); setIsFilterOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-[#333] rounded-md">All Genres</button>
                  <div className="h-[1px] bg-[#333] my-1" />
                  {allGenres.map((genre) => (
                    <button key={genre.genre_id} onClick={() => { setSelectedGenre(genre.genre_id); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedGenre == genre.genre_id ? "text-[#1DB954] bg-[#1DB954]/10" : "text-gray-300 hover:bg-[#333]"}`}>{genre.genre_name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Create text="Music" onClick={() => setIsModalOpen(true)} />
        </div>

        {/* ── Data Table ── */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2 flex flex-col">
          <div className="overflow-x-auto max-h-[496px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Artist</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4">Genre</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {loading ? (
                  [...Array(7)].map((_, index) => (
                    <tr key={index} className="animate-pulse h-[64px]">
                      <td colSpan="7" className="px-6 py-5"><div className="h-4 bg-[#333] rounded w-full"></div></td>
                    </tr>
                  ))
                ) : music.length > 0 ? (
                  music.map((m, i) => (
                    <tr key={m.music_id || i} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                      <td className="px-6 py-5 text-sm font-bold text-gray-300 text-center">{(currentPage - 1) * ITEMS_PER_PAGE + (i + 1)}</td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-300 truncate max-w-[120px]">{m.music_code}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-300 truncate max-w-[200px]">{m.title}</td>
                      <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[150px]">{m.artist_names || "Unknown"}</td>
                      <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[120px]">{m.release_date?.split("T")[0]}</td>
                      <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[150px]">{m.genre_names || "-"}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => navigate(`/music/${m.music_id}`)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]">Detail</button>
                          {userRole === 'super_admin' && (
                            <button onClick={() => setDeleteTarget(m)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]">Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-500">No music found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2 ">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] hover:bg-[#333] disabled:opacity-30`}> ‹ </button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${currentPage === index + 1 ? "bg-[#1DB954] text-black" : "bg-transparent border-[#444] text-gray-400 hover:border-gray-200"}`}>{index + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] hover:bg-[#333] disabled:opacity-30`}> » </button>
        </div>
      </div>

      {/* ── Modal Create ── */}
      {/* ── Modal Create ── */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create New Music</h2>
        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
        {/* Music Code */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Code</label>
          <input name="music_code" value={formData.music_code} readOnly className="bg-[#222] border border-[#444] rounded-md p-2 text-sm text-gray-500 outline-none cursor-not-allowed pointer-events-none" placeholder="Auto-generating..."/>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
          <input name="title" value={formData.title} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none" required />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Duration (sec)</label>
          <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none" required />
        </div>

        {/* Release Date */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Release date</label>
          <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none invert-[0.8] brightness-[0.8]" required />
        </div>

        {/* Album Select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Album</label>
          <select name="album_id" value={formData.album_id} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none cursor-pointer" required>
            <option value="">Select Album</option>
            {albums.map((alb) => (<option key={alb.album_id} value={alb.album_id}>{alb.album_name}</option>))}
          </select>
        </div>

        {/* Artist Select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Artist</label>
          <select name="artist_id" value={formData.artist_id} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none cursor-pointer" required>
            <option value="">Select Artist</option>
            {artists.map((art) => (<option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>))}
          </select>
        </div>

        {/* ✅ เพิ่มส่วน Genre (ปุ่มกดเลือกหลายอัน) */}
        <div className="col-span-2 flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Genre</label>
          <div className="flex flex-wrap gap-2 bg-[#222] p-3 rounded-md border border-[#444]">
            {allGenres.map((g) => {
              const isSelected = formData.genres.includes(g.genre_id);
              return (
                <button
                  key={g.genre_id}
                  type="button"
                  onClick={() => handleGenreToggle(g.genre_id)}
                  className={`px-4 py-1 rounded-full border text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-[#1DB954] border-[#1DB954] text-black"
                      : "border-[#555] text-white hover:border-white"
                  }`}
                >
                  {g.genre_name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ เพิ่มส่วน Explicit */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Explicit Content</label>
          <select 
            name="is_explicit" 
            value={formData.is_explicit} 
            onChange={(e) => setFormData(prev => ({ ...prev, is_explicit: e.target.value === 'true' }))} 
            className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none"
          >
            <option value={false}>No</option>
            <option value={true}>Yes (Explicit)</option>
          </select>
        </div>

        {/* File URL */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">File URL</label>
          <input name="file_url" value={formData.file_url} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white focus:border-[#1DB954] outline-none" placeholder="https://..." />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5 col-span-2">
          <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-colors">Cancel</button>
          <button type="submit" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-2 rounded-md transition-all active:scale-95">Create Music</button>
        </div>
      </form>
    </div>
  </div>
)}
<DeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Music?"
        targetName={deleteTarget?.title}
      />
    </div>
  );
}
