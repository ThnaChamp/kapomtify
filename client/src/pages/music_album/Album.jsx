import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";

export default function AlbumPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Album");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    album_code: '',
    album_name: '',
    artist_id: '',
    album_type: 'single', 
    cover_image_url: '',
    release_date: ''
  });
  const [artists, setArtists] = useState([]);

  const ITEMS_PER_PAGE = 20;

  // --- Fetch Data Functions ---
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/albums?page=${currentPage}&search=${searchQuery}`
      );
      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      
      const result = await response.json();
      setAlbums(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Fetch Error:", error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchArtists = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists`);
      const data = await res.json();
      setArtists(data.data || data);
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAlbums();
    }, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ album_code: '', album_name: '', release_date: '', artist_id: '', cover_image_url: '', album_type: 'single' });
        fetchAlbums();
      }
    } catch (error) {
      console.error("Error creating album:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบอัลบั้มนี้? ข้อมูลจะหายไปถาวร")) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok) {
            alert("ลบอัลบั้มสำเร็จ");
            fetchAlbums(); 
        } else {
            alert(`ลบไม่สำเร็จ: ${result.error}`);
        }
    } catch (error) {
        console.error("Error deleting album:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
};

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0]">
      {/* ── Tabs ── */}
      <div className="flex gap-8 border-b border-[#333] pl-8 pt-3">
        <button onClick={() => navigate("/music")} className="pb-3 text-sm font-semibold text-gray-400">Music</button>
        <button className="pb-3 text-sm font-semibold text-[#1DB954] border-b-2 border-[#1DB954]">Album</button>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-8 flex flex-col gap-5">
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-3 items-center">
            <SearchBox
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Filter />
          </div>
          <Create text="Album" onClick={() => setIsModalOpen(true)} />
        </div>

        {/* ── Data Table ── */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2 flex flex-col">
          <div className="overflow-x-auto max-h-[496px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4 text-center">Cover</th>
                  <th className="px-6 py-4">Album Name</th>
                  <th className="px-6 py-4">Artist</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4 text-center">Tracks</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {loading ? (
                [...Array(7)].map((_, index) => (
                  <tr key={index} className="animate-pulse h-[64px]">
                    <td colSpan="8" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : albums.length > 0 ? (
                albums.map((alb, i) => (
                  <tr key={alb.album_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-3 text-sm font-bold text-gray-300 text-center">
                      {(currentPage - 1) * ITEMS_PER_PAGE + (i + 1)}
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-300 truncate max-w-[100px]">{alb.album_code}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-center">
                        <img 
                          src={alb.cover_image_url || 'https://via.placeholder.com/150'} 
                          alt="cover" 
                          className="w-8 h-8 rounded object-cover bg-[#333]" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-300 truncate max-w-[200px]">{alb.album_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-400 truncate max-w-[150px]">{alb.artist_names || "Unknown"}</td>
                    <td className="px-6 py-3 text-sm text-gray-400 truncate max-w-[120px]">{alb.release_date?.split('T')[0]}</td>
                    <td className="px-6 py-3 text-sm text-gray-400 text-center font-bold">{alb.total_music || 0}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => navigate(`/album/${alb.album_id}`)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]">Detail</button>
                        {userRole === 'super_admin' && (
                        <button onClick={() => handleDelete(alb.album_id)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]">Delete</button>
                        )}
                        </div>
                    </td>
                  </tr>
                ))
              ) : (<tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No albums found
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
          > ‹ </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${currentPage === pageNum ? "bg-[#1DB954] border-[#1DB954] text-black scale-105" : "bg-transparent border-[#444] text-gray-400 hover:border-gray-200"}`}
              > {pageNum} </button>
            );
          })}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
          > » </button>
        </div>
      </div>

      {/* ── Modal Create ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create New Album</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Album Code</label>
                  <input 
                    name="album_code" 
                    value={formData.album_code} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
                    placeholder="ALB-XXX" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Album Name</label>
                  <input 
                    name="album_name" 
                    value={formData.album_name} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Artist</label>
                  <select 
                    name="artist_id" 
                    value={formData.artist_id} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                    required
                  >
                    <option value="">Select Artist</option>
                    {artists.map(art => (
                      <option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Album Type</label>
                  <select 
                    name="album_type" 
                    value={formData.album_type} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Cover Image URL</label>
                <input 
                  name="cover_image_url" 
                  value={formData.cover_image_url} 
                  onChange={handleChange} 
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
                  placeholder="https://..." 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Release Date</label>
                <input 
                  type="date" 
                  name="release_date" 
                  onChange={handleChange} 
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[1.2]" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-2 rounded-md transition-all active:scale-95"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
