import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ── Icons ── */
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

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
  const [selectedPlan, setSelectedPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?page=${currentPage}&search=${searchTerm}&plan=${selectedPlan}`
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
    const delay = setTimeout(fetchUsers, 500);
    return () => clearTimeout(delay);
  }, [currentPage, searchTerm, selectedPlan]);

  return (
    <div className="flex flex-col gap-6 p-8 bg-[#222121] min-h-screen text-[#e0e0e0]">
      

      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-4 items-center">
          {/* Search Box */}
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              className="bg-[#2a2a2a] border border-[#555] rounded-lg py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#2a2a2a] border border-[#555] rounded-lg text-sm text-gray-300 hover:bg-[#333]">
            <FilterIcon /> Filter
          </button>
        </div>

        {/* Plan Dropdown */}
        <div className="relative">
          <select 
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="appearance-none bg-[#2a2a2a] border border-[#555] rounded-lg py-1.5 pl-4 pr-10 text-sm text-gray-300 outline-none cursor-pointer focus:border-gray-400"
          >
            <option value="">All Plan</option>
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
      </div>

      {/* ── Users Table Container ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto h-[495px] custom-scrollbar-tiny">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm font-bold text-gray-400 border-b border-[#333] sticky top-0 bg-[#252525] z-10">
                <th className="px-8 py-5 w-20 text-center">#</th>
                <th className="px-6 py-5 w-32">Code</th>
                <th className="px-6 py-5 w-32 text-center">Profile</th>
                <th className="px-6 py-5">Username</th>
                <th className="px-6 py-5">Plan type</th>
                <th className="px-6 py-5">Create date</th>
                <th className="px-6 py-5 w-48"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[90px]">
                    <td colSpan="7" className="px-8 py-4"><div className="h-4 bg-[#333] rounded w-full"></div></td>
                  </tr>
                ))
              ) : users.map((user, i) => (
                <tr key={user.user_id} className="hover:bg-[#2a2a2a] transition-colors h-[64px]">
                  <td className="px-8 py-4 text-center font-bold text-gray-300 text-lg">
                    {(currentPage - 1) * 20 + (i + 1)}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-300 text-lg">
                    {user.user_code}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <img 
                      src={user.profile_image_url} 
                      className="w-10 h-10 rounded-xl object-cover bg-white"
                      alt="Profile"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-300 text-lg">{user.display_name || user.username}</td>
                  <td className="px-6 py-4 font-bold text-gray-300 text-lg">{user.plan_type || 'Free'}</td>
                  <td className="px-6 py-4 font-bold text-gray-400 text-lg">
                    {user.created_at ? user.created_at.split('T')[0] : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-end pr-4">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex justify-end items-center gap-2 pr-2">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#555] text-gray-400 hover:bg-[#333] disabled:opacity-20"
        >
          ‹
        </button>
        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i+1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                currentPage === i + 1 ? "bg-[#1DB954] text-black" : "bg-[#2a2a2a] border border-[#555] text-gray-400 hover:border-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#555] text-gray-400 hover:bg-[#333]"
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        >
          »
        </button>
      </div>
    </div>
  );
}