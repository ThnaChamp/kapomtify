import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";
import Cancel from "../../components/cancelBtn";
import CreateM from "../../components/createMBtn";

export default function Artist() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ตั้งค่า state สำหรับ Form เริ่มต้น
  const [formData, setFormData] = useState({
    artist_code: "",
    artist_name: "",
    debut_year: "",
    verified_status: "No",
    profile_image_url: "",
    bio: "",
  });

  const fetchArtists = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/artists?page=${currentPage}`,
    );
    const data = await res.json();
    setArtists(data.data || []);
    setTotalPages(data.pagination?.totalPages || 1);
  };

  useEffect(() => {
    fetchArtists();
  }, [currentPage]);

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
        alert("เพิ่มข้อมูลศิลปินเรียบร้อยแล้ว!");
        setIsModalOpen(false);
        // เคลียร์ฟอร์ม
        setFormData({
          artist_code: "",
          artist_name: "",
          debut_year: "",
          verified_status: "No",
          profile_image_url: "",
          bio: "",
        });
        fetchArtists();
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errData.error || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ลบศิลปินนี้?")) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, {
        method: "DELETE",
      });
      fetchArtists();
    }
  };

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0] font-sans">
      {/* ── Toolbar ── */}
      <div className="px-8 flex flex-col gap-5 pt-8">
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <SearchBox placeholder="Search artists..." />
            </div>
            <Filter />
          </div>
          <Create text="Artist" onClick={() => setIsModalOpen(true)} />
        </div>

        {/* ── Data Table ── */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden mt-2 shadow-xl flex flex-col">
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-[8%]">#</th>
                  <th className="px-6 py-4 w-[15%]">Code</th>
                  <th className="px-6 py-4 w-[12%]">Profile</th>
                  <th className="px-6 py-4 w-[25%]">Artist name</th>
                  <th className="px-6 py-4 w-[15%]">Type</th>
                  <th className="px-6 py-4 w-[10%]">Gender</th>
                  <th className="px-6 py-4 w-[15%] text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#333]">
                {artists.map((a, i) => (
                  <tr
                    key={a.artist_id}
                    className="hover:bg-[#2a2a2a] transition-colors group h-[64px]"
                  >
                    <td className="px-6 py-3 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * 20 + (i + 1)}
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-300 truncate">
                      {a.artist_code}
                    </td>
                    <td className="px-6 py-3">
                      <img
                        src={
                          a.profile_image_url ||
                          "https://via.placeholder.com/40"
                        }
                        className="w-10 h-10 rounded object-cover"
                        alt="profile"
                      />
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-300 truncate">
                      {a.artist_name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400 truncate">
                      {a.type || "Solo"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400 truncate">
                      {a.gender || "-"}
                    </td>
                    <td className="px-6 py-3">
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
                ))}
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"}`}
          >
            »
          </button>
        </div>
      </div>

      {/* ── Modal Create (ปรับดีไซน์ใหม่) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200">
                Create new artist
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-white text-lg font-bold border-b-2 border-gray-400 leading-none pb-0.5"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">
                    Code
                  </label>
                  <input
                    name="artist_code"
                    value={formData.artist_code}
                    onChange={handleChange}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">
                    Artist name
                  </label>
                  <input
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleChange}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">
                    Debut year
                  </label>
                  <input
                    name="debut_year"
                    value={formData.debut_year}
                    onChange={handleChange}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    placeholder="เช่น 2004"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">
                    Verified status
                  </label>
                  <select
                    name="verified_status"
                    value={formData.verified_status}
                    onChange={handleChange}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-400">
                  Profile image
                </label>
                <div className="flex bg-[#333333] border border-gray-500 rounded-lg items-center px-2 py-1">
                  <input
                    name="profile_image_url"
                    value={formData.profile_image_url}
                    onChange={handleChange}
                    className="bg-transparent flex-1 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    className="px-4 py-1 border border-white text-white rounded-lg text-xs font-bold hover:bg-white/10"
                  >
                    Upload
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-400">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954] h-20 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl border border-white text-white text-sm font-bold hover:bg-white/5 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954]/10 active:scale-95 transition-all"
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
