import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBox from '../../components/searchBox';
import Filter from '../../components/filterBtn';
import Create from '../../components/createBtn';
import Cancel from '../../components/cancelBtn';
import CreateM from "../../components/createMBtn";
import DeleteModal from "../../components/DeleteModal";
const userRole = localStorage.getItem('userRole');
export default function ChartPage() {
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    chart_code: '',
    chart_name: '',
    description: '',
    chart_date: new Date().toISOString().split('T')[0]
  });

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
        const result = await res.json();
        setUsers(result.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/charts?page=${currentPage}&search=${searchQuery}`
      );
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
    fetchCharts();
  }, [currentPage, searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ chart_code: '', chart_name: '', description: '', chart_date: new Date().toISOString().split('T')[0] });
        fetchCharts();
      } else {
        const err = await res.json();
        alert(`สร้างไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error creating chart:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/charts/${deleteTarget.chart_id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // ✅ ส่ง Token
        }
      });
      if (res.ok) {
        fetchCharts();
      } else {
        const err = await res.json();
        alert(`ลบไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error("Error deleting chart:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <SearchBox 
            placeholder="Search charts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
            
          </div>
          <Create text="Chart" onClick={() => setIsModalOpen(true)} />
        </div>

        {/* Table */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Chart Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Chart Date</th>
                  <th className="px-6 py-4 text-center">Total music</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {charts.length > 0 ? charts.map((c, i) => (
                  <tr key={c.chart_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px]">
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{(currentPage - 1) * 10 + (i + 1)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{c.chart_code || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">{c.chart_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[200px]">{c.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {c.chart_date ? c.chart_date.split('T')[0] : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-400">{c.total_music || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/chart/${c.chart_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        {userRole === 'super_admin' && (
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
                          Delete
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">No charts found</td>
                  </tr>
                )}
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

      {/* ── Modal Create ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Chart</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl">x</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Code</label>
                <input
                  name="chart_code"
                  value={formData.chart_code}
                  className="bg-[#222] border border-[#444] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm readOlny cursor-not-allowed pointer-events-none"
                  placeholder="Auto-generating..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Chart name</label>
                <input
                  name="chart_name"
                  value={formData.chart_name}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Date</label>
                <input
                  type="date"
                  name="chart_date"
                  value={formData.chart_date}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm"
                  required
                />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-[#3e3e3e] border border-[#555] focus:border-[#1DB954] rounded-md p-2 outline-none text-white text-sm h-24 resize-none"
                  placeholder="Chart description..."
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-6 border-t border-[#333] pt-6">
                <Cancel onClick={() => setIsModalOpen(false)} />
                <CreateM/>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Chart?"
        targetName={deleteTarget?.chart_name}
      />
    </div>
  );
}
