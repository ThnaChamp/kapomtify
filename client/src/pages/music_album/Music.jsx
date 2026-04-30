import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate} from "react-router-dom";
/* ── Icons ──────────────────────────────────────────────────────────────── */
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

export default function MusicPage() {
  const { id } =useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Music");
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // ✅ เก็บ ID เพลงที่เลือกดูรายละเอียด
  
  const [formData, setFormData] = useState({
    music_code: '',
    title: '',
    duration: '',
    release_date: '',
    artist_id: '',
    genres: [],
    is_explicit: false,
    file_url: ''
  });
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [allGenres, setAllGenres] = useState([]);

  // --- Fetch Data Functions ---
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
      const [albumRes, artistRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/albums`),
        fetch(`${import.meta.env.VITE_API_URL}/api/artists`)
      ]);
      setAlbums(await albumRes.json());
      setArtists(await artistRes.json());
    };
    loadOptions();
  }, []);

  const fetchMusic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music?page=${currentPage}`);
      const result = await response.json();
      setMusic(result.data);
      setTotalPages(result.pagination.totalPages || 1);
    } catch (error) {
      console.error("Error fetching music:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic();
  }, [currentPage]);

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = (name === 'album_id' || name === 'artist_id' || name === 'duration') 
                ? (value === "" ? "" : parseInt(value)) 
                : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ music_code: '', title: '', duration: '', release_date: '', artist_id: '', genres: [], is_explicit: false, file_url: '' });
        fetchMusic();
      }
    } catch (error) {
      console.error("Error creating music:", error);
    }
  };

  const handleGenreToggle = (genreId) => {
    setFormData(prev => {
      const isSelected = prev.genres.includes(genreId);
      const updatedGenres = isSelected
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId];
      return { ...prev, genres: updatedGenres };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณเเน่ใจหรือไม่ว่าต้องการลบเพลงนี้?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchMusic();
        alert("ลบข้อมูลสำเร็จ");
        navigate("/music")
      } else {
        const errorData = await response.json();
        alert(`ลบไม่สำเร็จ: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting music:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading music library...</div>;
  }

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0]">
        <>
          {/* ── Tabs ── */}
          <div className="flex gap-8 border-b border-[#333] pl-8 pt-3">
            {["Music", "Album"].map((tab) => (
              <button
                key={tab}
                onClick= {() => navigate(`/music/${m.music_id}`)}
                className={`pb-3 text-sm font-semibold transition-all ${
                  activeTab === tab ? "text-[#1DB954] border-b-2 border-[#1DB954]" : "text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="px-8 flex flex-col gap-5">
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-48 focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500">
                  <FilterIcon /> Filter
                </button>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95">
                <PlusIcon /> Create music
              </button>
            </div>

            {/* ── Data Table ── */}
            <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden mt-2 shadow-xl flex flex-col">
              <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#252525]">
                    <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                      <th className="px-6 py-4 w-12">#</th>
                      <th className="px-6 py-4">Music Code</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Artist</th>
                      <th className="px-6 py-4">Release Date</th>
                      <th className="px-6 py-4">Genre</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {music.map((m, i) => (
                      <tr key={m.music_id || i} className="hover:bg-[#2a2a2a] transition-colors group h-[64px]">
                        <td className="px-6 py-5 text-sm font-bold text-gray-300">{(currentPage - 1) * 20 + (i + 1)}</td>
                        <td className="px-6 py-5 text-sm font-bold text-gray-300">{m.music_code}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-300">{m.title}</td>
                        <td className="px-6 py-5 text-sm text-gray-400">{m.artist_names || "Unknown Artist"}</td>
                        <td className="px-6 py-5 text-sm text-gray-400">{m.release_date ? m.release_date.split('T')[0] : "-"}</td>
                        <td className="px-6 py-5 text-sm text-gray-400">{m.genre_names || "No Genre"}</td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => navigate(`/music/${m.music_id}`)} 
                              className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                            >
                              Detail
                            </button>
                            <button onClick={() => handleDelete(m.music_id)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Pagination ── */}
            <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2 ">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"
                }`}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                      currentPage === pageNum 
                        ? "bg-[#1DB954] border-[#1DB954] text-black scale-105"
                        : "bg-transparent border-[#444] text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${
                  currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"
                }`}
              >
                »
              </button>
            </div>
          </div>
        </>

      {/* ── Modal Create ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create new music</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Code</label>
                <input name="music_code" value={formData.music_code} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm " placeholder="MUS-XXX" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Duration (sec)</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Release date</label>
                <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm invert-[0.8] brightness-[0.8]" required />
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">File</label>
                <div className="flex bg-[#3e3e3e] border border-[#555] rounded-md overflow-hidden">
                  <input name="file_url" value={formData.file_url} onChange={handleChange} className="bg-transparent flex-1 p-2 outline-none text-white text-sm" placeholder="URL or path..." />
                  <button type="button" className="bg-[#444] px-4 py-1 text-sm font-bold border-l border-[#555] hover:bg-[#555]">Upload</button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Album</label>
                <select 
                  name="album_id" 
                  value={formData.album_id} 
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm cursor-pointer"
                  required
                >
                  <option value="">Select Album</option>
                  {albums.map(alb => (
                    <option key={alb.album_id} value={alb.album_id}>{alb.album_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Artist</label>
                <select 
                  name="artist_id" 
                  value={formData.artist_id} 
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm cursor-pointer"
                  required
                >
                  <option value="">Select Artist</option>
                  {artists.map(art => (
                    <option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Genre</label>
                <div className="flex flex-wrap gap-2">
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
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Explicit</label>
                <select name="is_explicit" value={formData.is_explicit} onChange={handleChange} className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm">
                  <option value={false}>No</option>
                  <option value={true}>Yes (Explicit content)</option>
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-6 border-t border-[#333] pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-[#666] font-bold text-white hover:bg-[#444] transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2 rounded-lg border border-[#1DB954] text-[#1DB954] font-bold hover:bg-[#1DB954] hover:text-black transition-all">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}