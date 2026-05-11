import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";

export default function ArtistPage() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    artist_code: "",
    artist_name: "",
    debut_year: "",
    verified_status: "No",
    profile_image_url: "",
    bio: "",
    type: "Solo",
    gender: "Male"
  });

  const ITEMS_PER_PAGE = 20;

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/artists?page=${currentPage}&search=${searchQuery}`
      );
      const data = await res.json();
      setArtists(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching artists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchArtists();
    }, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        setSearchQuery(searchTerm);
        setCurrentPage(1);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          artist_code: "",
          artist_name: "",
          debut_year: "",
          verified_status: "No",
          profile_image_url: "",
          bio: "",
          type: "Solo",
          gender: "Male"
        });
        fetchArtists();
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errData.error || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบศิลปินท่านนี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchArtists();
      } else {
        const errData = await res.json();
        alert(`ลบไม่สำเร็จ: ${errData.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">
      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <SearchBox
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Filter />
        </div>
        <Create text="Artist" onClick={() => setIsModalOpen(true)} />
      </div>

      {/* ── Data Table ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4 text-center">Profile</th>
                <th className="px-6 py-4">Artist Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[64px]">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : artists.length > 0 ? (
                artists.map((a, i) => (
                  <tr key={a.artist_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + (i + 1)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-300 truncate">{a.artist_code}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <img
                          src={a.profile_image_url || "https://via.placeholder.com/40"}
                          className="w-8 h-8 rounded-full object-cover bg-[#333]"
                          alt="profile"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-300 truncate">{a.artist_name}</td>
                    <td className="px-6 py-5 text-sm text-gray-400 truncate">{a.type || "Solo"}</td>
                    <td className="px-6 py-5 text-sm text-gray-400 truncate">{a.gender || "-"}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/artist/${a.artist_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(a.artist_id)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No artists found
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
        >
          »
        </button>
      </div>

      {/* ── Modal Create ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create New Artist</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Code</label>
                  <input
                    name="artist_code"
                    value={formData.artist_code}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    placeholder="ART-XXX"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Artist Name</label>
                  <input
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Debut Year</label>
                  <input
                    name="debut_year"
                    value={formData.debut_year}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    placeholder="e.g. 2024"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Verified Status</label>
                  <select
                    name="verified_status"
                    value={formData.verified_status}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Artist Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Group">Group</option>
                    <option value="Band">Band</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Profile Image URL</label>
                <input
                  name="profile_image_url"
                  value={formData.profile_image_url}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                  placeholder="https://..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] h-24 resize-none"
                ></textarea>
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
                  Create Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
