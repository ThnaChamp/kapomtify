import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SearchIcon = () => <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Albums 24");
  const [tabData, setTabData] = useState([]);

  const fetchTabData = async () => {
    let endpoint = "";
    if (activeTab.includes("Albums")) endpoint = "library-albums";
    else if (activeTab.includes("Artists")) endpoint = "library-artists";
    // ✅ เช็คให้มั่นใจว่าชื่อ "Playlists" (ตัว s) ตรงกับ Tab ใน UI
    else if (activeTab.includes("Playlists")) endpoint = "library-playlists"; 
    else if (activeTab.includes("Subscription")) endpoint = "sub-history";

    if (!endpoint) return;
    console.log("Fetching from:", endpoint);
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/${endpoint}`);
        const result = await res.json();

        // ตรวจสอบโครงสร้าง Response
        // ถ้า Backend ส่งมาเป็น { data: [...] }
        const actualData = Array.isArray(result) ? result : (result.data || []);
        setTabData(actualData);
        
        console.log(`Data for ${endpoint}:`, actualData); // 👈 เพิ่ม log เพื่อดูว่าข้อมูลมาไหม
    } catch (error) {
        console.error("Error fetching tab data:", error);
        setTabData([]);
    }
};

useEffect(() => {
    fetchTabData();
}, [activeTab, id]);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user detail:", error);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (!user) return <div className="p-6 text-white bg-[#121212] min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#121212] min-h-screen text-[#e0e0e0] font-sans">
      
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xl font-bold mb-2">
        <span className="text-[#1DB954] underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate("/users")}>User</span>
        <span className="text-gray-500 mx-1">›</span>
        <span className="text-white">{user.display_name || user.username}</span>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="bg-[#1e1e1e] p-8 rounded-3xl flex justify-between items-center border border-white/5 shadow-lg">
        <div className="flex gap-8 items-center">
          <div className="relative p-1 rounded-full border-2 border-[#1DB954]">
            <img 
              src={user.profile_image_url || "https://via.placeholder.com/150"} 
              className="w-28 h-28 rounded-full object-cover"
              alt="Profile"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{user.display_name || user.username}</h1>
            <p className="text-lg text-gray-400">{user.email} - {user.country || 'TH'}</p>
          </div>
        </div>
        
        {/* ส่วนขวาบนที่ปรับปรุงให้สมดุล */}
        <div className="flex flex-col items-end gap-5">
          <div className="bg-[#d9d9d9] text-[#121212] px-10 py-2.5 rounded-full font-bold text-lg shadow-md">
            {user.plan_type || 'Individual'}
          </div>
          <div className="flex items-center gap-4">
            <button className="text-red-500 text-xs font-black uppercase tracking-tighter hover:text-red-400 transition-colors">Delete</button>
            <button className="text-orange-500 text-xs font-black uppercase tracking-tighter hover:text-orange-400 transition-colors">Suspend</button>
            <button className="px-4 py-1.5 bg-transparent border border-[#444] rounded-lg text-xs font-bold text-gray-300 hover:bg-[#333] transition-all">
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Summary Row ── */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Save albums", value: user.total_saved_albums || 24 },
          { label: "Followed artists", value: user.total_followed_artists || 50 },
          { label: "Playlists", value: user.total_playlists || 10 },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e1e1e] py-6 rounded-2xl text-center border border-white/5 shadow-sm">
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs & Content Section ── */}
      <div className="bg-[#1e1e1e] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        
        {/* ── Tab Headers ── */}
        <div className="flex border-b border-white/5 bg-[#252525]/50 px-6">
        {[
            { id: "Albums", label: "Albums", count: user.total_saved_albums || 0 },
            { id: "Artists", label: "Artists", count: user.total_followed_artists || 0 },
            { id: "Playlists", label: "Playlists", count: user.total_playlists || 0 },
            { id: "Subscription", label: "Subscription history", count: null },
        ].map((tab) => {
            // สร้างชื่อ Tab สำหรับเช็ค Active และแสดงผล
            const tabKey = tab.count !== null ? `${tab.label} ${tab.count}` : tab.label;

            return (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tabKey)}
                className={`px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === tabKey
                    ? "text-[#1DB954] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#1DB954]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
            >
                {tab.label} {tab.count !== null && <span className="ml-1">{tab.count}</span>}
            </button>
            );
        })}
        </div>

        {/* Inner Toolbar */}
        <div className="p-6 flex justify-between items-center">
          <div className="relative">
            <SearchIcon />
            <input
              type="text"
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl py-2 pl-10 pr-4 text-xs w-72 outline-none focus:border-[#1DB954]"
              placeholder="Search..."
            />
          </div>
          <button className="px-4 py-1.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-xs font-bold text-gray-300 flex items-center gap-2 hover:bg-[#333]">
             Filter
          </button>
        </div>

        {/* Data Table ที่ปรับขนาด Font Header และ Data */}
        <div className="px-6 pb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 font-bold border-b border-white/5 text-[11px] uppercase tracking-[0.2em]">
                <th className="pb-4 px-3 w-16">#</th>
                <th className="pb-4 px-3 text-center w-24">Cover</th>
                
                {/* ปรับเปลี่ยนหัวข้อตามแท็บที่เลือก */}
                <th className="pb-4 px-3">
                  {activeTab.includes("Artists") ? "Artist" : 
                  activeTab.includes("Playlists") ? "Playlist Name" : 
                  activeTab.includes("Subscription") ? "Plan Name" : "Album"}
                </th>
                
                <th className="pb-4 px-3">
                {!activeTab.includes("Artists") && !activeTab.includes("Subscription") ? "Artist" : ""}
              </th>
              
              <th className="pb-4 px-3">Type</th>
              <th className="pb-4 px-3">
                {activeTab.includes("Artists") ? "Followed At" : 
                activeTab.includes("Subscription") ? "Started At" : "Saved At"}
              </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tabData.map((item, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-all">
                  <td className="py-4 px-3 font-bold text-gray-500 text-sm">{i + 1}</td>
                  <td className="py-4 px-3 text-center">
                    <img 
                      src={item.cover_image_url || item.cover || "https://via.placeholder.com/150"} 
                      className="w-14 h-14 rounded-xl object-cover mx-auto shadow-md"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150" }} // กันรูปพัง
                    />
                  </td>
                  
                  {/* ชื่อหลัก */}
                  <td className="py-4 px-3 font-extrabold text-white text-[15px]">
                    {item.album_name || item.artist_name || item.album}
                  </td>
                  
                  {/* ชื่อศิลปินรอง (จะแสดงเฉพาะเมื่อไม่ใช่หน้า Artist) */}
                  <td className="py-4 px-3 text-gray-300 font-bold text-[15px]">
                  {/* ถ้าไม่ใช่หน้า Artists และไม่ใช่หน้า Subscription ถึงจะแสดงชื่อศิลปิน */}
                  {!activeTab.includes("Artists") && !activeTab.includes("Subscription") 
                    ? (item.artist_name || item.artist || "-") 
                    : ""
                  }
                </td>
                  
                  <td className="py-4 px-3 text-gray-400 text-sm font-medium">
                    {item.type || "Standard"}
                  </td>
                  
                  <td className="py-4 px-3 text-gray-500 text-sm font-medium">
                    {item.saved_at ? item.saved_at.split('T')[0] : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}