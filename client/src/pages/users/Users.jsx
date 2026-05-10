import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ── Icons ── */
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?page=${currentPage}&search=${searchQuery}&plan=${selectedPlan}`
      );
      const result = await res.json();
      setUsers(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchUsers();
    }, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery, selectedPlan]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        setSearchQuery(searchTerm);
        setCurrentPage(1);
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
              placeholder="Search users..."
              className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-64 focus:outline-none focus:border-[#1DB954]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="relative">
            <select 
              value={selectedPlan}
              onChange={(e) => { setSelectedPlan(e.target.value); setCurrentPage(1); }}
              className="appearance-none bg-[#242424] border border-[#444] rounded-md py-1.5 pl-4 pr-10 text-sm text-gray-300 outline-none cursor-pointer focus:border-[#1DB954]"
            >
              <option value="">All Plans</option>
              <option value="Free">Free</option>
              <option value="Individual">Individual</option>
              <option value="Student">Student</option>
              <option value="Duo">Duo</option>
              <option value="Family">Family</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500 transition-colors">
            <FilterIcon /> Filter
          </button>
        </div>
      </div>

      {/* ── Users Table Container ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">User Code</th>
                <th className="px-6 py-4 text-center">Profile</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Plan Type</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[64px]">
                    <td colSpan="7" className="px-6 py-5">
                      <div className="h-4 bg-[#333] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user, i) => (
                  <tr key={user.user_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {(currentPage - 1) * 20 + (i + 1)}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-300">
                      {user.user_code}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <img 
                          src={user.profile_image_url || "/icons.svg#user"} 
                          className="w-8 h-8 rounded-full object-cover bg-[#333]"
                          alt="Profile"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-300">{user.display_name || user.username}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.plan_type === 'Free' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' : 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20'
                      }`}>
                        {user.plan_type || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-400">
                      {user.created_at ? user.created_at.split('T')[0] : "-"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => navigate(`/users/${user.user_id}`)}
                          className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]"
                        >
                          Detail
                        </button>
                        <button className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-[#f87171] hover:bg-[#333]">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No users found
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
    </div>
  );
}