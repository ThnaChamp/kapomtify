import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from '../../components/searchBox';
import Filter from '../../components/filterBtn';
import Create from '../../components/createBtn';
import Cancel from '../../components/cancelBtn';
import CreateM from "../../components/createMBtn";

export default function AlbumPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Album");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State สำหรับสร้าง Album ใหม่
 const [formData, setFormData] = useState({
    album_code: '',
    album_name: '',
    artist_id: '',
    album_type: 'single', 
    cover_image_url: '',
    release_date: ''
});
  const [artists, setArtists] = useState([]);

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
    // โหลดรายชื่อ Artist สำหรับใช้ใน Modal Select
    const fetchArtists = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists`);
      const data = await res.json();
      setArtists(data);
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
        setFormData({ album_code: '', album_name: '', release_date: '', artist_id: '', cover_image_url: '' });
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
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden mt-2 shadow-xl flex flex-col">
          <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Cover</th>
                  <th className="px-6 py-4">Album name</th>
                  <th className="px-6 py-4">Artist</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4 text-center">Total music</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {loading ? (
                // ✅ แสดง Skeleton แทนคำว่า Loading
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse h-[64px]">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : albums.length > 0 ? (
                albums.map((alb, i) => (
                  <tr key={alb.album_id} className="hover:bg-[#2a2a2a] transition-colors group h-[80px]">
                    <td className="px-6 py-3 text-sm font-bold text-gray-300 text-center">{(currentPage - 1) * 20 + (i + 1)}</td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-300">{alb.album_code}</td>
                    <td className="px-6 py-3">
                      <img 
                        src={alb.cover_image_url || 'https://via.placeholder.com/150'} 
                        alt="cover" 
                        className="w-12 h-12 rounded object-cover border border-[#444]" 
                      />
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-300">{alb.album_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{alb.artist_names || "Unknown"}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{alb.release_date?.split('T')[0]}</td>
                    <td className="px-6 py-3 text-sm text-gray-400 text-center">{alb.total_music || 0}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => navigate(`/album/${alb.album_id}`)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]">Detail</button>
                        <button onClick={() => handleDelete(alb.album_id)} className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (<tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No album found
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
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] ${currentPage === 1 ? "opacity-30" : "hover:bg-[#333]"}`}
          > ‹ </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-10 h-10 rounded-lg border text-sm font-bold ${currentPage === index + 1 ? "bg-[#1DB954] text-black" : "text-gray-400"}`}
            > {index + 1} </button>
          ))}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] ${currentPage === totalPages ? "opacity-30" : "hover:bg-[#333]"}`}
          > » </button>
        </div>
      </div>

      {/* ── Modal Create Album ── */}
      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-[#282828] p-8 rounded-2xl border border-[#3c3c3c] w-full max-w-2xl shadow-2xl relative">
      
      {/* ส่วนหัว Modal */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create new album</h2>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="text-gray-400 hover:text-white transition-colors text-xl font-light"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Code & Album name */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Code</label>
            <input 
              name="album_code" 
              value={formData.album_code} 
              onChange={handleChange} 
              className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all" 
              placeholder="e.g. AB001R" 
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Album name</label>
            <input 
              name="album_name" 
              value={formData.album_name} 
              onChange={handleChange} 
              className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all" 
              required 
            />
          </div>
        </div>

        {/* Row 2: Artist & Album Type */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Artist</label>
            <select 
              name="artist_id" 
              value={formData.artist_id} 
              onChange={handleChange} 
              className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all cursor-pointer"
              required
            >
              <option value="">Select Artist</option>
              {artists.map(art => (
                <option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Album Type</label>
            <select 
              name="album_type" 
              value={formData.album_type} 
              onChange={handleChange} 
              className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all cursor-pointer"
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
          </div>
        </div>

        {/* Row 3: Cover Image (Full Width with Upload Button) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-300">Cover Image</label>
          <div className="flex bg-[#2a2a2a] border border-[#404040] rounded-xl overflow-hidden focus-within:border-[#1DB954] transition-all">
            <input 
              name="cover_image_url" 
              value={formData.cover_image_url} 
              onChange={handleChange} 
              className="bg-transparent flex-1 p-3 outline-none text-white text-sm" 
              placeholder="Image URL..." 
            />
            <button 
              type="button" 
              className="bg-[#3e3e3e] px-6 py-2 text-sm font-bold text-white hover:bg-[#4a4a4a] transition-colors border-l border-[#404040]"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Row 4: Release date & Total tracks */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Release date</label>
            <div className="relative">
              <input 
                type="date" 
                name="release_date" 
                onChange={handleChange} 
                className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all w-full appearance-none invert-[0.8] brightness-[1.2]" 
                required 
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Total tracks</label>
            <input 
              type="number" 
              name="total_tracks" 
              className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all" 
              placeholder="0"
            />
          </div>
        </div>

        {/* ปุ่มกดยืนยันด้านล่าง */}
        <div className="flex justify-end gap-4 mt-10 pt-4">
          <button 
            type="button" 
            onClick={() => setIsModalOpen(false)} 
            className="px-8 py-2.5 rounded-xl border border-[#555] font-bold text-gray-300 hover:bg-[#333] transition-all"
          >
            Cancle
          </button>
          <button 
            type="submit" 
            className="px-10 py-2.5 rounded-xl border border-[#1DB954] text-[#1DB954] font-bold hover:bg-[#1DB954] hover:text-black transition-all shadow-[0_0_15px_rgba(29,185,84,0.2)]"
          >
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