import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ChartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ music_id: "", last_rank: "", peak_rank: "" });
  const [allMusic, setAllMusic] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = localStorage.getItem('userRole');
  const fetchChart = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts/${id}`);
      const data = await res.json();
      setChart(data);
      setEditForm({
        chart_code: data.chart_code || "",
        chart_name: data.chart_name || "",
        description: data.description || "",
        chart_date: data.chart_date ? data.chart_date.split("T")[0] : "",
      });
    } catch (err) {
      console.error("Error fetching chart:", err);
    }
  };

  useEffect(() => { fetchChart(); }, [id]);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/music?page=1&search=`);
        const data = await res.json();
        setAllMusic(data.data || []);
      } catch (err) {
        console.error("Error fetching music list:", err);
      }
    };
    fetchMusic();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Chart นี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("ลบข้อมูล Chart เรียบร้อยแล้ว");
        navigate("/chart");
      } else {
        const err = await res.json();
        alert(`ลบไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลเรียบร้อย");
        setIsEditModalOpen(false);
        fetchChart();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMusic = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts/${id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          music_id: parseInt(addForm.music_id),
          last_rank: parseInt(addForm.last_rank),
          peak_rank: addForm.peak_rank ? parseInt(addForm.peak_rank) : parseInt(addForm.last_rank),
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setAddForm({ music_id: "", last_rank: "", peak_rank: "" });
        fetchChart();
      } else {
        const err = await res.json();
        alert(`เพิ่มไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error adding music:", err);
    }
  };

  const handleRemoveMusic = async (musicId) => {
    if (!window.confirm("ต้องการลบเพลงนี้ออกจาก Chart?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/charts/${id}/entries/${musicId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchChart();
      } else {
        const err = await res.json();
        alert(`ลบไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error removing music:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  if (!chart) return <div className="p-8 text-white">Loading...</div>;

  const entries = chart.entries || [];
  const filtered = entries.filter((e) =>
    !searchTerm.trim() || (e.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 text-[#e0e0e0] font-sans">
      {/* Header */}
      <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 flex gap-6 mb-6">
        <div className="w-36 h-36 rounded-xl bg-[#1DB954]/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="1.5" className="w-16 h-16">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold text-[#1DB954] uppercase tracking-widest mb-1">Chart</span>
          <h1 className="text-3xl font-bold mb-2">{chart.chart_name}</h1>
          <div className="flex gap-2 flex-wrap mb-4">
            {chart.chart_code && (
              <span className="bg-[#333] px-3 py-1 rounded-full text-xs text-gray-300 font-bold">
                {chart.chart_code}
              </span>
            )}
            <span className="bg-[#333] px-3 py-1 rounded-full text-xs text-gray-300 font-bold">
              {chart.chart_date ? chart.chart_date.split("T")[0] : "No date"}
            </span>
            <span className="bg-[#333] px-3 py-1 rounded-full text-xs text-gray-300 font-bold">
              {entries.length} songs
            </span>
          </div>
          {chart.description && (
            <p className="text-sm text-gray-400 max-w-xl">{chart.description}</p>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-1.5 border border-gray-500 rounded text-sm font-bold hover:bg-[#333]"
            >
              Edit
            </button>
            {userRole === 'super_admin' && (
            <button
              onClick={handleDelete}
              className="px-6 py-1.5 border border-red-900/50 text-red-500 text-sm font-bold rounded hover:bg-red-500/10"
            >
              Delete
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Song Table */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Song Rankings</h2>
        <div className="flex gap-3 items-center">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search song..."
            className="bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-1.5 text-sm text-gray-300 outline-none focus:border-[#1DB954] w-52"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 rounded-lg border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954] hover:text-black transition-all"
          >
            + Add Song
          </button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#252525]">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                <th className="px-6 py-4 w-16">Rank</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Peak Rank</th>
                <th className="px-6 py-4">Entry Date</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {filtered.length > 0 ? (
                filtered.map((e) => (
                  <tr key={e.music_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px]">
                    <td className="px-6 py-4 text-base font-bold text-[#1DB954]">
                      #{e.last_rank}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">
                      {e.title || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {e.artist_names || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {e.genre_names || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      #{e.peak_rank}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {e.entry_date ? e.entry_date.split("T")[0] : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRemoveMusic(e.music_id)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    {searchTerm ? "No songs match your search" : "No songs in this chart yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200">Edit Chart</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-300 hover:text-white text-lg font-bold border-b-2 border-gray-400 leading-none pb-0.5"
              >
                X
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400">Code</label>
                  <input
                    value={editForm.chart_code}
                    onChange={(e) => setEditForm({ ...editForm, chart_code: e.target.value })}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400">Chart Name</label>
                  <input
                    value={editForm.chart_name}
                    onChange={(e) => setEditForm({ ...editForm, chart_name: e.target.value })}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400">Chart Date</label>
                <input
                  type="date"
                  value={editForm.chart_date}
                  onChange={(e) => setEditForm({ ...editForm, chart_date: e.target.value })}
                  className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[0.8]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954] h-20 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 rounded-xl border border-white text-white text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954]/10 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200">Add Song to Chart</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-300 hover:text-white text-lg font-bold border-b-2 border-gray-400 leading-none pb-0.5"
              >
                X
              </button>
            </div>
            <form onSubmit={handleAddMusic} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400">Song</label>
                <select
                  value={addForm.music_id}
                  onChange={(e) => setAddForm({ ...addForm, music_id: e.target.value })}
                  className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer"
                  required
                >
                  <option value="">Select song...</option>
                  {allMusic.map((m) => (
                    <option key={m.music_id} value={m.music_id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400">Rank</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.last_rank}
                    onChange={(e) => setAddForm({ ...addForm, last_rank: e.target.value })}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-400">Peak Rank</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.peak_rank}
                    onChange={(e) => setAddForm({ ...addForm, peak_rank: e.target.value })}
                    className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    placeholder="Same as rank"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 rounded-xl border border-white text-white text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954]/10 transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
