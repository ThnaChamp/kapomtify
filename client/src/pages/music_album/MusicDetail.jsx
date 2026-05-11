import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/DeleteModal";
export default function MusicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const fetchMusicDetail = async () => {
    try {
      setLoading(true);
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
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/music/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        navigate("/music");
      } else {
        const errorData = await res.json();
        alert(`ลบไม่สำเร็จ: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
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
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-[#1DB954] font-bold">
      Loading...
    </div>
  );
  if (!data) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-red-400 font-bold">
      Music not found.
    </div>
  );

  const genres = data.genre_names?.split(",").map((g) => g.trim()) ?? [];

  return (
    <div className="bg-[#121212] min-h-screen text-[#e0e0e0] font-sans p-8 flex flex-col gap-6">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xl font-bold mb-2">
        <span className="text-[#1DB954] underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate("/music")}>Music</span>
        <span className="text-gray-500 mx-1">›</span>
        <span className="text-white">{data.title}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1e1e1e] rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-end border border-white/5 shadow-xl">
        <img
          src={data.cover_image_url || "https://via.placeholder.com/220"}
          alt={data.title}
          className="w-56 h-56 rounded-2xl object-cover shadow-2xl border border-white/10"
        />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {genres.map((g) => (
              <span key={g} className="bg-[#1DB954] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
                {g}
              </span>
            ))}
          </div>

          <h2 className="text-5xl font-black text-white leading-tight">{data.title}</h2>

          <div className="bg-[#2a2a2a] border border-white/10 px-5 py-2.5 rounded-xl inline-flex items-center gap-3 text-sm text-gray-300 self-start shadow-md">
            <span className="font-bold">{data.album_name}</span>
            <span className="text-gray-600">|</span>
            <span className="font-bold">{data.artist_names}</span>
            <span className="text-gray-600">|</span>
            <span className="text-[#1DB954]">Track {data.track_number}</span>
          </div>

          <div className="flex gap-4 mt-2">
            <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-bold rounded-lg border border-white/10 transition-all">
              Edit
            </button>
            {userRole === 'super_admin' && (
              <button onClick={() => setIsDeleteModalOpen(true)} className="px-8 py-2 bg-transparent hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/30 transition-all">
              Delete
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Music Details */}
        <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-8 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Music Info</h3>
          <div className="space-y-1">
            {[
              { label: "Music Code", value: data.music_code, green: true },
              { label: "Duration", value: data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, "0")}` : "0:00" },
              { label: "Release Date", value: data.release_date?.split("T")[0] },
              { label: "Explicit", value: data.is_explicit ? "Yes" : "No" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                <span className="text-gray-500 text-xs font-bold uppercase">{item.label}</span>
                <span className={`text-sm font-bold ${item.green ? "text-[#1DB954]" : "text-gray-200"}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Artist & Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-8 shadow-lg flex-1">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Total plays</p>
            <h2 className="text-5xl font-black text-[#1DB954]">{Number(data.play_count || 0).toLocaleString()}</h2>
            <p className="text-gray-600 text-[10px] font-bold mt-2 uppercase tracking-widest">All time streams</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-8 shadow-lg flex-1">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Artist</p>
            <h2 className="text-2xl font-black text-white">{data.artist_names}</h2>
            <p className="text-gray-600 text-[10px] font-bold mt-1 uppercase tracking-widest">Main artist</p>
          </div>
        </div>

        {/* More Actions / Social */}
        <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 p-8 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Analytics</h3>
          <div className="space-y-4">
             <div className="bg-[#2a2a2a] p-5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Genre Engagement</p>
                <p className="text-xl font-black text-white">{genres[0] || "N/A"}</p>
             </div>
             <div className="bg-[#2a2a2a] p-5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Last Played</p>
                <p className="text-xl font-black text-white">Today</p>
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Standardized) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Edit Music</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Code</label>
                <input name="music_code" value={editFormData.music_code} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                <input name="title" value={editFormData.title} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Duration (sec)</label>
                <input name="duration" value={editFormData.duration} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Release Date</label>
                <input type="date" name="release_date" value={editFormData.release_date?.split('T')[0]} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[1.2]" />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">File URL</label>
                <input name="file_url" value={editFormData.file_url || ""} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Explicit</label>
                <select name="is_explicit" value={editFormData.is_explicit} onChange={handleEditChange} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]">
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-2 rounded-md transition-all active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Music?"
        targetName={data.title}
      />
    </div>
  );
}
