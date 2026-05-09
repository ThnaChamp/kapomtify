import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    playlist_code: '',
    name: '',
    user_id: '',
    is_public: 'true',
    cover_image_url: '',
    description: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists?page=${currentPage}`);
      const result = await res.json();
      setPlaylists(result.data);
      setTotalPages(result.pagination.totalPages || 1);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [currentPage]);

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

  if (loading) return <div className="p-8 text-white">Loading playlists...</div>;

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0]">
      <div className="px-8 pt-6 flex flex-col gap-5">

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-48 focus:outline-none focus:border-[#1DB954]"
            />
            <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500">
              <FilterIcon /> Filter
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95"
          >
            <PlusIcon /> Create playlist
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-12">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Cover</th>
                  <th className="px-6 py-4">Playlist</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Total music</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {playlists.map((p, i) => (
                  <tr key={p.playlist_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px]">
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{(currentPage - 1) * 10 + (i + 1)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{p.playlist_code}</td>
                    <td className="px-6 py-4">
                      {p.cover_image_url
                        ? <img src={p.cover_image_url} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        : <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center text-gray-500 text-xs">N/A</div>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{p.username}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold ${p.is_public ? 'text-[#1DB954]' : 'text-gray-400'}`}>
                        {p.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{p.total_music}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/playlists/${p.playlist_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(p.playlist_id)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
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

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
          >
            ‹
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${currentPage === pageNum ? "bg-[#1DB954] border-[#1DB954] text-black scale-105" : "bg-transparent border-[#444] text-gray-400 hover:border-gray-200"}`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
          >
            »
          </button>
        </div>
      </div>

      {/* Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add playlist</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">X</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Code</label>
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
                <label className="text-xs font-bold text-gray-400">Playlist name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">User</label>
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
                <label className="text-xs font-bold text-gray-400">Playlist Type</label>
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
                <label className="text-xs font-bold text-gray-400">Cover Image</label>
                <div className="flex bg-[#3e3e3e] border border-[#555] rounded-md overflow-hidden">
                  <input
                    name="cover_image_url"
                    value={formData.cover_image_url}
                    onChange={handleChange}
                    className="bg-transparent flex-1 p-2 outline-none text-white text-sm"
                    placeholder="URL or path..."
                  />
                  <button type="button" className="bg-[#444] px-4 py-1 text-sm font-bold border-l border-[#555] hover:bg-[#555]">
                    Upload
                  </button>
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-6 border-t border-[#333] pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-[#666] font-bold text-white hover:bg-[#444] transition-colors"
                >
                  Cancle
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-lg border border-[#1DB954] text-[#1DB954] font-bold hover:bg-[#1DB954] hover:text-black transition-all"
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
