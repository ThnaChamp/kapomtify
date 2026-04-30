import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MusicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ editFormData, setEditFormData] = useState({});


 const fetchMusicDetail = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${id}`);
      const json = await res.json();
      setData(json);
      setEditFormData(json); 
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchMusicDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเพลงนี้?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ");
        navigate("/music");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const val = name === "is_explicit" ? value === "true" : value;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${id}`,{
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(editFormData),
        });
        if (res.ok) {
            alert("เเก้ไขข้อมูลเรียบร้อย");
            setIsEditModalOpen(false);
            fetchMusicDetail();
        }
    } catch (err) { console.error(err);}
  };
  if (loading) return (
    <div className="bg-[#1a1a1a] min-h-screen flex items-center justify-center text-white text-sm">
      Loading Detail...
    </div>
  );
  if (!data) return (
    <div className="bg-[#1a1a1a] min-h-screen flex items-center justify-center text-red-400 text-sm">
      Data not found.
    </div>
  );

  const genres = data.genre_names?.split(",").map((g) => g.trim()) ?? [];

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-[#e0e0e0] font-sans">

     

      {/* ── TABS ── */}
      <div className="px-8 flex gap-6 border-b border-white/10 bg-[#1a1a1a]">
        <button
          onClick={() => navigate("/music")}
          className="py-3 text-sm font-semibold text-[#1DB954] border-b-2 border-[#1DB954] -mb-px"
        >
          Music
        </button>
        <button
          onClick={() => navigate("/album")}
          className="py-3 text-sm font-semibold text-gray-400 hover:text-white border-b-2 border-transparent -mb-px transition-colors"
        >
          Album
        </button>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── HERO SECTION ── */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start border border-white/5">
          {/* Cover Art */}
          <img
            src={data.cover_image_url || "https://via.placeholder.com/220"}
            alt={data.title}
            className="w-[220px] h-[220px] rounded-lg object-cover flex-shrink-0 shadow-lg"
          />

          {/* Info */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Genres */}
            <div className="flex gap-2 flex-wrap">
              {genres.map((g) => (
                <span
                  key={g}
                  className="bg-[#1DB954] text-black text-xs font-bold px-4 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white leading-snug">{data.title}</h2>

            {/* Subtitle pill */}
            <div className="bg-[#383838] border border-white/10 px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm text-gray-300 self-start">
              <span>{data.album_name}</span>
              <span className="text-gray-600">-</span>
              <span>{data.artist_names}</span>
              <span className="text-gray-600">-</span>
              <span>Track {data.track_number}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2 bg-[#383838] hover:bg-[#444] text-white text-sm font-semibold rounded-md border border-white/10 transition-colors">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-transparent hover:bg-red-500/10 text-red-400 text-sm font-semibold rounded-md border border-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Box 1: Music Info */}
          <div className="bg-[#2a2a2a] rounded-xl border border-white/5 p-6">
            <h3 className="text-base font-bold text-white mb-5">Music Info</h3>
            <div className="space-y-0">
              {[
                { label: "Code", value: `#${String(data.music_code ?? "").padStart(5, "0")}`, green: true },
                { label: "Title", value: data.title },
                { label: "Album", value: data.album_name },
                { label: "Track no.", value: data.track_number },
                { label: "Duration", value: data.duration ? `${Math.floor(data.duration / 60)}.${String(data.duration % 60).padStart(2, "0")}` : "0.00" },
                { label: "Release Date", value: data.release_date?.split("T")[0] },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.green ? "text-[#1DB954] font-mono" : "text-gray-200"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Artist & Genre */}
          <div className="bg-[#2a2a2a] rounded-xl border border-white/5 p-6 flex flex-col gap-5">
            <h3 className="text-base font-bold text-white">Artist &amp; Genre</h3>

            {/* Artist */}
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Artist</p>
              <div className="bg-[#383838] border border-white/10 rounded-lg px-5 py-4">
                <p className="text-white font-bold text-lg leading-tight">{data.artist_names}</p>
                <p className="text-gray-500 text-xs mt-0.5">Main artist</p>
              </div>
            </div>

            {/* Genre */}
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Genre</p>
              <div className="bg-[#383838] border border-white/10 rounded-lg px-5 py-4">
                <p className="text-white font-bold text-lg leading-tight">
                  {genres.join(" , ")}
                </p>
              </div>
            </div>
          </div>

          {/* Box 3: Stats */}
          <div className="flex flex-col gap-5">
            <div className="bg-[#2a2a2a] rounded-xl border border-white/5 p-6 flex-1">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Total plays</p>
              <p className="text-4xl font-black text-[#1DB954] mt-2 mb-1">{Number(4156388).toLocaleString()}</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">All Time</p>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl border border-white/5 p-6 flex-1">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">In playlists</p>
              <p className="text-4xl font-black text-[#1DB954] mt-2 mb-1">{Number(3841).toLocaleString()}</p>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">User playlists</p>
            </div>
          </div>

        </div>
      </div>
      {isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
    {/* ปรับ max-w เป็น xl และลด padding รอบๆ จาก p-8 เหลือ p-6 */}
    <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      
      {/* Header: ลด margin-bottom จาก mb-6 เหลือ mb-4 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">Edit music</h2>
        <button 
          onClick={() => setIsEditModalOpen(false)} 
          className="text-gray-300 hover:text-white text-lg font-bold border-b-2 border-gray-400 leading-none pb-0.5"
        >
          X
        </button>
      </div>

      {/* ลด gap จาก 6 หรือ 5 เหลือ gap-y-3 เพื่อประหยัดพื้นที่แนวตั้ง */}
      <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-x-4 gap-y-3">
        
        {/* Code & Title */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Code</label>
          <input 
            name="music_code" 
            value={editFormData.music_code} 
            onChange={handleEditChange} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Title</label>
          <input 
            name="title" 
            value={editFormData.title} 
            onChange={handleEditChange} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
          />
        </div>

        {/* Duration & Release Date */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Duration (sec)</label>
          <input 
            name="duration" 
            value={editFormData.duration} 
            onChange={handleEditChange} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Release date</label>
          <input 
            type="date" 
            name="release_date" 
            value={editFormData.release_date?.split('T')[0]} 
            onChange={handleEditChange} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]" 
          />
        </div>

        {/* File Upload */}
        <div className="col-span-2 flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">File</label>
          <div className="flex bg-[#333333] border border-gray-500 rounded-lg items-center px-2 py-1">
            <input 
              name="file_url" 
              value={editFormData.file_url || ""} 
              onChange={handleEditChange} 
              className="bg-transparent flex-1 text-sm text-white outline-none" 
              placeholder="Filename..." 
            />
            <button 
              type="button" 
              className="px-4 py-1 border border-white text-white rounded-lg text-xs font-bold hover:bg-white/10"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Album & Artist */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Album</label>
          <input 
            name="album_name" 
            value={editFormData.album_name} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none" 
          />
        </div>
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Artist</label>
          <input 
            name="artist_names" 
            value={editFormData.artist_names} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none" 
          />
        </div>

        {/* Genre & Explicit: รวมเป็นแถวเดียวกันเพื่อลดความสูง */}
        <div className="col-span-1 flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Genre</label>
          <div className="flex flex-wrap gap-1.5">
            {["Pop", "Hip-hop"].map(g => (
              <button key={g} type="button" className="px-3 py-1 rounded-full bg-[#A5D6A7] text-black text-[10px] font-black">
                {g}
              </button>
            ))}
            {["R&B"].map(g => (
              <button key={g} type="button" className="px-3 py-1 rounded-full border border-gray-400 text-white text-[10px] font-bold">
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-gray-400">Explicit</label>
          <select 
            name="is_explicit" 
            value={editFormData.is_explicit ?? false} 
            onChange={handleEditChange} 
            className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white font-bold outline-none"
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>

        {/* Footer: ลบ border-t และลด mt-6 เป็น mt-4 เพื่อให้ปุ่มขยับขึ้น */}
        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => setIsEditModalOpen(false)} 
            className="px-6 py-2 rounded-xl border border-white text-white text-sm font-bold hover:bg-white/5 active:scale-95 transition-all"
          >
            Cancle
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 rounded-xl border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954]/10 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}