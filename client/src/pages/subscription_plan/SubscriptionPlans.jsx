import { useState, useEffect } from "react";

// Icons
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

export default function SubscriptionPlans() {
  // 1. States สำหรับจัดการข้อมูลและ UI
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ✅ เพิ่ม State สำหรับโหมดแก้ไข
  const [editId, setEditId] = useState(null);       // ✅ เก็บ ID ที่กำลังแก้ไข

  // ── States สำหรับ Search & Filter ──
  const [searchTerm, setSearchTerm] = useState("");     // ค่าที่พิมพ์ในช่อง Input
  const [searchQuery, setSearchQuery] = useState("");   // ค่าที่จะใช้ส่งไป API จริงๆ
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State สำหรับฟอร์ม (อ้างอิงตาม Column ใน Database)
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
          <div className="relative">
            <input
              type="text"
              placeholder="Search plans..."
              className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-64 focus:outline-none focus:border-[#1DB954]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500 transition-colors"
          >
            <FilterIcon /> Filter
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95"
        >
          <PlusIcon /> Create Plan
        </button>
      </div>  

      {/* Data Table */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
              <th className="px-6 py-4">#</th>
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
              <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
            ) : plans.length > 0 ? (
              plans.map((plan, index) => (
                <tr key={plan.plan_id} className="hover:bg-[#2a2a2a] transition-colors group">
                  <td className="px-6 py-5 text-sm text-bold-gray-400">{index + 1}</td>
                  <td className="px-6 py-5 text-sm font-bold text-gray-300">{plan.plan_code}</td>
                  <td className="px-6 py-5 text-sm text-gray-300">{plan.plan_name}</td>
                  <td className="px-6 py-5 text-sm text-[#1DB954] font-bold">฿{plan.price}</td>
                  <td className="px-4  py-5 text-sm text-gray-400">{plan.duration_day} Days</td>
                  <td className="px-6 py-5 text-sm text-gray-400 truncate max-w-[200px]">{plan.description || "-"}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan.plan_id)}
                        className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]"
                      >
                        Delete
                      </button>
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

      {/* Modal สำหรับ Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#282828] p-8 rounded-xl border border-[#333] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{isEditing ? "Edit Plan" : "Create New Plan"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400">Plan Code</label>
                <input 
                  name="plan_code" 
                  value={formData.plan_code} 
                  onChange={handleChange} 
                  className="w-full bg-[#3e3e3e] border border-[#555] rounded-md p-2 mt-1 text-white focus:border-[#1DB954] outline-none" 
                  placeholder="SUB-PREMIUM" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400">Plan Name</label>
                <input 
                  name="plan_name" 
                  value={formData.plan_name} 
                  onChange={handleChange} 
                  className="w-full bg-[#3e3e3e] border border-[#555] rounded-md p-2 mt-1 text-white focus:border-[#1DB954] outline-none" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400">Price (฿)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    className="w-full bg-[#3e3e3e] border border-[#555] rounded-md p-2 mt-1 text-white focus:border-[#1DB954] outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400">Duration (Days)</label>
                  <input 
                    type="number" 
                    name="duration_day" 
                    value={formData.duration_day} 
                    onChange={handleChange} 
                    className="w-full bg-[#3e3e3e] border border-[#555] rounded-md p-2 mt-1 text-white focus:border-[#1DB954] outline-none" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full bg-[#3e3e3e] border border-[#555] rounded-md p-2 mt-1 text-white h-20 focus:border-[#1DB954] outline-none" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-2 rounded-md transition-all active:scale-95"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
