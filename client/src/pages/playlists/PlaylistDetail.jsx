import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Filter from "../../components/filterBtn";

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching playlist detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ Playlist นี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ");
        navigate("/playlists");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-[#1DB954] font-bold">
      Loading...
    </div>
  );
  if (!data) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-red-400 font-bold">
      Playlist not found.
    </div>
  );

  return (
    <div className="text-[#e0e0e0] min-h-screen p-8 flex flex-col gap-6 font-sans">
      
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xl font-bold mb-2">
        <span className="text-[#1DB954] underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate("/playlists")}>Playlists</span>
        <span className="text-gray-500 mx-1">›</span>
        <span className="text-white">{data.name}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-[#1e1e1e] border border-white/5 rounded-3xl p-8 flex items-center gap-8 shadow-xl">
        {data.cover_image_url
          ? <img src={data.cover_image_url} alt={data.name} className="w-32 h-32 rounded-2xl object-cover flex-shrink-0 shadow-2xl border border-white/10" />
          : <div className="w-32 h-32 rounded-2xl bg-[#2a2a2a] flex items-center justify-center text-gray-500 text-xs flex-shrink-0 border border-white/10">N/A</div>
        }

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-4xl font-black text-white">{data.name}</h2>
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase border ${data.is_public ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10' : 'border-gray-500 text-gray-400 bg-gray-500/10'}`}>
              {data.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          <p className="text-gray-400 text-lg">Created by <span className="text-white font-bold">{data.username}</span> • {data.create_at?.split('T')[0]}</p>
          {data.description && (
            <p className="text-gray-400 italic text-sm">"{data.description}"</p>
          )}
          <div className="flex gap-4 mt-2">
            <button className="px-6 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg font-bold text-sm hover:bg-[#333] transition-all">Edit</button>
            <button onClick={handleDelete} className="px-6 py-2 bg-transparent border border-red-500/30 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/10 transition-all">Delete</button>
          </div>
        </div>

        <div className="bg-white text-[#121212] rounded-[2rem] px-10 py-6 text-center flex-shrink-0 shadow-lg">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total music</p>
          <p className="text-6xl font-black leading-none">{data.total_music}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mt-4">
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search within playlist..."
            className="bg-[#242424] border border-[#444] rounded-md py-1.5 pl-10 pr-4 text-sm w-72 focus:outline-none focus:border-[#1DB954]"
          />
        </div>
        <Filter />
      </div>

      {/* Music Table */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333] sticky top-0 z-10">
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Music Name</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4 text-right">Added at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {(data.items || []).map((item, i) => (
                <tr key={i} className="hover:bg-[#2a2a2a] transition-colors h-[64px] group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">{item.sequence_no}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-300">{item.music_code}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-[#333] text-[10px] font-bold text-gray-300 uppercase border border-white/5">
                      {item.genre_names || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-right">{item.added_at?.split('T')[0]}</td>
                </tr>
              ))}
              {(!data.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500 text-sm italic">
                    No music in this playlist
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
