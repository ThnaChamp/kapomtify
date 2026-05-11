import { useState, useEffect } from "react";
import SearchBox from "../../components/searchBox";
import Filter from "../../components/filterBtn";
import Create from "../../components/createBtn";

export default function SubscriptionPlans() {
  // 1. States สำหรับจัดการข้อมูลและ UI
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editId, setEditId] = useState(null);       
  const [currentPage, setCurrentPage] = useState(1);
  const userRole = localStorage.getItem('userRole');
  // ── States สำหรับ Search & Filter ──
  const [searchTerm, setSearchTerm] = useState("");     
  const [searchQuery, setSearchQuery] = useState("");   
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_name: '', 
    price: 0,
    duration_day: 30,
    description: ''
  });

  // 2. ฟังก์ชันดึงข้อมูลจาก API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscriptions?search=${searchQuery}`); 
      const data = await res.json();
      setPlans(data.data || data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchPlans();
    }, 500); 
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        setSearchQuery(searchTerm); 
    }
  };

  // 3. Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = (name === 'price' || name === 'duration_day') ? (value === "" ? "" : parseInt(value)) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ plan_code: '', plan_name: '', price: 0, duration_day: 30, description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setEditId(plan.plan_id);
    setFormData({
      plan_code: plan.plan_code || '',
      plan_name: plan.plan_name || '',
      price: plan.price || 0,
      duration_day: plan.duration_day || 30,
      description: plan.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/subscriptions/${editId}`
        : `${import.meta.env.VITE_API_URL}/api/subscriptions`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPlans();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error submitting plan:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscriptions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">
      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <SearchBox
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
          <Filter onClick={() => setIsFilterOpen(!isFilterOpen)} active={isFilterOpen} />
        </div>

        <Create text="Plan" onClick={handleOpenCreate} />
      </div>  

      {/* Data Table */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto max-h-[496px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-4 py-4">Duration (Days)</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 w-[15%] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[64px]">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : plans.length > 0 ? (
                plans.map((plan, index) => (
                  <tr key={plan.plan_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + (index + 1)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-300 truncate max-w-[120px]">{plan.plan_code}</td>
                    <td className="px-6 py-5 text-sm text-gray-300 truncate max-w-[150px]">{plan.plan_name}</td>
                    <td className="px-6 py-5 text-sm text-[#1DB954] font-bold truncate max-w-[100px]">฿{plan.price}</td>
                    <td className="px-4 py-5 text-sm text-gray-400 truncate max-w-[100px]">{plan.duration_day} Days</td>
                    <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[200px]">{plan.description || "-"}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Edit
                        </button>
                        {userRole === 'super_admin' && (
                        <button
                          onClick={() => handleDelete(plan.plan_id)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                        >
                          Delete
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No plans found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal สำหรับ Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-tight">{isEditing ? "Edit Plan" : "Create New Plan"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Plan Code</label>
                <input 
                  name="plan_code" 
                  value={formData.plan_code} 
                  className="bg-[#222] border border-[#444] rounded-md p-2 text-white focus:border-[#1DB954] outline-none text-sm readOnly cursor-not-allowed pointer-events-none" 
                  placeholder="Auto-generating..." 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Plan Name</label>
                <input 
                  name="plan_name" 
                  value={formData.plan_name} 
                  onChange={handleChange} 
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-white focus:border-[#1DB954] outline-none text-sm" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Price (฿)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-white focus:border-[#1DB954] outline-none text-sm" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Duration (Days)</label>
                  <input 
                    type="number" 
                    name="duration_day" 
                    value={formData.duration_day} 
                    onChange={handleChange} 
                    className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-white focus:border-[#1DB954] outline-none text-sm" 
                    required 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-white h-24 focus:border-[#1DB954] outline-none text-sm resize-none" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-2 rounded-md transition-all active:scale-95 text-sm"
                >
                  {isEditing ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
