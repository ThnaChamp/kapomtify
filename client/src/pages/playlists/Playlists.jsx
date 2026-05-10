import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const userRole = localStorage.getItem('userRole');
  const [formData, setFormData] = useState({
    playlist_code: '',
    name: '',
    user_id: '',
    is_public: 'true',
    cover_image_url: '',
    description: ''
  });

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
        const data = await res.json();
        setUsers(data.data || data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists?page=${currentPage}&search=${searchQuery}`);
      const result = await res.json();
      setPlaylists(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchPlaylists();
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
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        is_public: formData.is_public === 'true'
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ playlist_code: '', name: '', user_id: '', is_public: 'true', cover_image_url: '', description: '' });
        fetchPlaylists();
      } else {
        const err = await res.json();
        alert(`สร้างไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error creating playlist:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Playlist นี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPlaylists();
        alert("ลบข้อมูลสำเร็จ");
      } else {
        const err = await res.json();
        alert(`ลบไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error deleting playlist:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">
      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <SearchBox
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Filter />
        </div>
        <Create text="Playlist" onClick={() => setIsModalOpen(true)} />
      </div>  

      {/* ── Data Table ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto max-h-[496px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4 text-center">Cover</th>
                <th className="px-6 py-4">Playlist Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Music</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[64px]">
                    <td colSpan="8" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : playlists.length > 0 ? (
                playlists.map((p, i) => (
                  <tr key={p.playlist_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + (i + 1)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-300 truncate max-w-[100px]">{p.playlist_code}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {p.cover_image_url
                          ? <img src={p.cover_image_url} alt={p.name} className="w-8 h-8 rounded object-cover bg-[#333]" />
                          : <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center text-gray-500 text-[10px]">N/A</div>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-300 truncate max-w-[200px]">{p.name}</td>
                    <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[150px]">{p.username}</td>
                    <td className="px-6 py-5 text-sm text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.is_public ? 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {p.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-center text-gray-400 font-bold">{p.total_music}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/playlist/${p.playlist_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        {userRole === 'super_admin' && (
                        <button
                          onClick={() => handleDelete(p.playlist_id)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
                          Delete
                        </button>)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                    No playlists found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2">
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

      {/* ── Modal Create ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create New Playlist</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Playlist Code</label>
                <input
                  name="playlist_code"
                  value={formData.playlist_code}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm"
                  placeholder="PL-XXX"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Playlist Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">User / Owner</label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm cursor-pointer"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.username}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Visibility</label>
                <select
                  name="is_public"
                  value={formData.is_public}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm cursor-pointer"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Cover Image URL</label>
                <input
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm h-24 resize-none"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
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
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
