import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

export default function PlaylistDetail() {
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
    <div className="bg-[#1a1a1a] min-h-screen flex items-center justify-center text-white text-sm">
      Loading...
    </div>
  );
  if (!data) return (
    <div className="bg-[#1a1a1a] min-h-screen flex items-center justify-center text-red-400 text-sm">
      Playlist not found.
    </div>
  );

  return (
    <div className="text-[#e0e0e0] min-h-screen">
      <div className="px-8 py-6 flex flex-col gap-6">

        {/* Hero Card */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-6 flex items-center gap-6">
          {data.cover_image_url
            ? <img src={data.cover_image_url} alt={data.name} className="w-24 h-24 rounded-full object-cover flex-shrink-0 shadow-lg" />
            : <div className="w-24 h-24 rounded-full bg-[#333] flex items-center justify-center text-gray-500 text-xs flex-shrink-0">N/A</div>
          }

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-white">{data.name}</h2>
              <span className="border border-[#555] text-gray-300 text-xs px-3 py-0.5 rounded-full">
                {data.is_public ? 'Public' : 'Private'}
              </span>
              <span className="border border-[#555] text-gray-300 text-xs px-3 py-0.5 rounded-full">
                Create at {data.create_at?.split('T')[0]}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Create by {data.username}</p>
            {data.description && (
              <p className="text-gray-400 text-sm">"{data.description}"</p>
            )}
          </div>

          <div className="bg-white text-black rounded-xl px-8 py-4 text-center flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 mb-1">Total music</p>
            <p className="text-5xl font-black leading-none">{data.total_music}</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by ID or Username..."
            className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-64 focus:outline-none focus:border-[#1DB954]"
          />
          <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500">
            <FilterIcon /> Filter
          </button>
        </div>

        {/* Music Table */}
        <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-y-auto max-h-[440px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#252525]">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                  <th className="px-6 py-4 w-12">#</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Music name</th>
                  <th className="px-6 py-4">Genre</th>
                  <th className="px-6 py-4">Added at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {(data.items || []).map((item, i) => (
                  <tr key={i} className="hover:bg-[#2a2a2a] transition-colors h-[56px]">
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{item.sequence_no}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-300">{item.music_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{item.genre_names || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{item.added_at?.split('T')[0]}</td>
                  </tr>
                ))}
                {(!data.items || data.items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                      No music in this playlist
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
