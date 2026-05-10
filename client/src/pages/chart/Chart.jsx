import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";

export default function ChartPage() {
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    chart_code: '',
    chart_name: '',
    description: '',
    chart_date: new Date().toISOString().split('T')[0]
  });

  const ITEMS_PER_PAGE = 20;

  const fetchCharts = async () => {
    try {
      setLoading(true);
      // Using /api/playlists for now as a placeholder since chart API might not exist yet
      // or if it exists, replace with /api/charts
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists?page=${currentPage}&search=${searchQuery}`);
      const result = await res.json();
      setCharts(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching charts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchCharts();
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
      // Placeholder POST to /api/playlists or /api/charts
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ chart_code: '', chart_name: '', description: '', chart_date: new Date().toISOString().split('T')[0] });
        fetchCharts();
      }
    } catch (err) {
      console.error("Error creating chart:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Chart นี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCharts();
      }
    } catch (err) {
      console.error("Error deleting chart:", err);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">
      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <SearchBox
            placeholder="Search charts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Filter />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Create Chart
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto max-h-[496px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Chart Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Music Count</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[64px]">
                    <td colSpan="6" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : charts.length > 0 ? (
                charts.map((c, i) => (
                  <tr key={c.playlist_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + (i + 1)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-300 truncate max-w-[100px]">{c.playlist_code}</td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-300 truncate max-w-[200px]">{c.name}</td>
                    <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[300px]">{c.description || "-"}</td>
                    <td className="px-6 py-5 text-sm text-center text-gray-400 font-bold">{c.total_music}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/charts/${c.playlist_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleDelete(c.playlist_id)}
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
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    No charts found
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
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create New Chart</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Chart Code</label>
                  <input
                    name="chart_code"
                    value={formData.chart_code}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    placeholder="CHT-XXX"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Chart Name</label>
                  <input
                    name="chart_name"
                    value={formData.chart_name}
                    onChange={handleChange}
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Chart Date</label>
                <input
                  type="date"
                  name="chart_date"
                  value={formData.chart_date}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[1.2]"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
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
                  Create Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
