import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function AlbumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('userRole');
  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`);
        const data = await res.json();
        setAlbum(data);
        setEditData({
            album_code: data.album_code,
            album_name: data.album_name,
            artist_id: data.artist_id,
            album_type: data.album_type,
            cover_image_url: data.cover_image_url,
            release_date: data.release_date.split('T')[0],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/artists`)
      .then(res => res.json())
      .then(data => setArtists(data.data || data))
      .catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลสำเร็จ");
        setIsEditModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (loading) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-[#1DB954] font-bold">
      Loading...
    </div>
  );
  if (!album) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-red-400 font-bold">
      Album not found.
    </div>
  );

  return (
    <div className="bg-[#121212] min-h-screen text-[#e0e0e0] font-sans p-8 flex flex-col gap-6">
      
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xl font-bold mb-2">
        <span className="text-[#1DB954] underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate("/album")}>Albums</span>
        <span className="text-gray-500 mx-1">›</span>
        <span className="text-white">{album.album_name}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1e1e1e] p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-end border border-white/5 shadow-xl">
        <img 
          src={album.cover_image_url || "https://via.placeholder.com/220"} 
          className="w-56 h-56 rounded-2xl object-cover shadow-2xl border border-white/10" 
          alt="Cover"
        />
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
             <span className="bg-[#1DB954] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
               {album.album_type}
             </span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">{album.album_name}</h1>
          <p className="text-gray-400 text-lg">
            By <span className="text-white font-bold">{album.artist_name}</span> • Released {album.release_date.split('T')[0]}
          </p>
          <div className="flex gap-4 mt-2">
            <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg font-bold text-sm hover:bg-[#333] transition-all">Edit</button>
            {userRole === 'super_admin' && (
            <button className="px-8 py-2 bg-transparent border border-red-500/30 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/10 transition-all">Delete</button>
            )}
            </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Album Info */}
        <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Album Info</h3>
          <div className="space-y-1">
            {[
              { label: "Album Code", value: album.album_code, green: true },
              { label: "Artist", value: album.artist_name },
              { label: "Type", value: album.album_type },
              { label: "Total Tracks", value: album.total_tracks },
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

        {/* Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg flex-1 text-center md:text-left">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Total plays</p>
            <h2 className="text-5xl font-black text-[#1DB954]">
              {Number(album.total_play).toLocaleString()}
            </h2>
            <p className="text-gray-600 text-[10px] font-bold mt-2 uppercase tracking-widest">All Time</p>
          </div>
          <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg flex-1 text-center md:text-left">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">In libraries</p>
            <h2 className="text-5xl font-black text-[#1DB954]">
              {Number(album.in_playlists).toLocaleString()}
            </h2>
            <p className="text-gray-600 text-[10px] font-bold mt-2 uppercase tracking-widest">User saves</p>
          </div>
        </div>

        {/* More Info */}
        <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Quick View</h3>
          <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Featured Artist</p>
            <p className="text-xl font-black text-white">{album.artist_name}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal (Standardized) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Edit Album</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Code</label>
                <input value={editData.album_code} onChange={(e) => setEditData({...editData, album_code: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                <input value={editData.album_name} onChange={(e) => setEditData({...editData, album_name: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Artist</label>
                <select value={editData.artist_id} onChange={(e) => setEditData({...editData, artist_id: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer">
                  {artists.map(art => (
                    <option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                <select value={editData.album_type} onChange={(e) => setEditData({...editData, album_type: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-pointer">
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Cover URL</label>
                <input value={editData.cover_image_url} onChange={(e) => setEditData({...editData, cover_image_url: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Release Date</label>
                <input type="date" value={editData.release_date} onChange={(e) => setEditData({...editData, release_date: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[1.2]" />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-400 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-2 rounded-md transition-all active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
