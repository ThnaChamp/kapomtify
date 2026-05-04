import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";


export default function AlbumDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [artists, setArtists] = useState([]);
  const isMusicActive = location.pathname.startsWith("/music");
  const isAlbumActive = location.pathname.startsWith("/album");
  useEffect(() => {
    const fetchAlbum = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/albums/${id}`);
      const data = await res.json();
      setAlbum(data);
    };
    fetchAlbum();
  }, [id]);
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/artists`)
        .then(res => res.json())
        .then(data => setArtists(data))
        .catch(err => console.error(err));
    }, []);
    const openEditModal = () => {
        setEditData({
        album_code: album.album_code,
        album_name: album.album_name,
        artist_id: album.artist_id,
        album_type: album.album_type, // ค่าจะเป็น 'single', 'ep', หรือ 'album'
        cover_image_url: album.cover_image_url,
        release_date: album.release_date.split('T')[0], // ตัดฟอร์แมตวันที่ให้เหลือ YYYY-MM-DD
        });
        setIsEditModalOpen(true);
    };

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
      window.location.reload(); // หรือเรียก fetchAlbum() อีกรอบเพื่ออัปเดตหน้าจอ
    }
  } catch (error) {
    console.error("Update error:", error);
  }
};
  if (!album) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-[#e0e0e0] font-sans">
         {/* ── TABS ── */}
      <div className="px-8 flex gap-6 border-b border-white/10 bg-[#1a1a1a] flex items-center justify-between">
        <div className="flex gap-6">
        <button
          onClick={() => navigate("/music")}
          className={`py-3 text-sm font-semibold transition-all -mb-px border-b-2 ${
            isMusicActive 
            ? "text-[#1DB954] border-[#1DB954]" 
            : "text-gray-400 hover:text-white border-transparent"
        }`}
        >
          Music
        </button>
      
        <button
          onClick={() => navigate("/album")}
          className={`py-3 text-sm font-semibold transition-all -mb-px border-b-2 ${
            isAlbumActive 
            ? "text-[#1DB954] border-[#1DB954]" 
            : "text-gray-400 hover:text-white border-transparent"
           }`}
        >
          Album
        </button>
      </div>
      
      <button 
      onClick={() => navigate("/album")}
      className="text-gray-400 hover:text-white transition-colors p-1"
      title="Back to Albums"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    </div>
    <div className="p-8 text-white bg-[#121212] min-h-screen">
        
      {/* Header Section (Banner) */}
      <div className="bg-[#1e1e1e] p-8 rounded-3xl flex gap-8 items-end mb-8 shadow-2xl">
        <img 
          src={album.cover_image_url} 
          className="w-56 h-56 rounded-2xl object-cover shadow-2xl" 
          alt="Cover"
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">{album.album_name}</h1>
          <div className="bg-white/10 inline-block px-4 py-2 rounded-full text-sm text-gray-300">
            {album.artist_name} • {album.album_type} • Released {album.release_date.split('T')[0]}
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={openEditModal} className="px-6 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg font-bold hover:bg-[#333]">Edit</button>
            <button className="px-6 py-2 bg-[#2a2a2a] border border-[#444] text-red-500 rounded-lg font-bold hover:bg-[#333]">Delete</button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Album Info Card */}
        <div className="md:col-span-1 bg-[#1e1e1e] p-6 rounded-3xl border border-[#333]">
          <h3 className="text-xl font-bold mb-6">Album Info</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Code</span>
              <span className="font-mono">{album.album_code}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Album name</span>
              <span>{album.album_name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Album type</span>
              <span className="capitalize">{album.album_type}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Total tracks</span>
              <span>{album.total_tracks}</span>
            </div>
          </div>
        </div>

        {/* Artist Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-[#333]">
          <h3 className="text-xl font-bold mb-6">Artist</h3>
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444]">
            <p className="font-bold text-lg">{album.artist_name}</p>
            <p className="text-xs text-gray-400 mt-1">Main artist</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-[#333]">
          <p className="text-gray-400 font-bold mb-2">Total plays</p>
          <h2 className="text-3xl font-bold text-[#1DB954]">
            {Number(album.total_play).toLocaleString()}
          </h2>
          <p className="text-xs text-gray-500 mt-1">All Time</p>
        </div>

        {/* ส่วน In Playlists */}
        <div className="bg-[#1e1e1e] p-6 rounded-3xl border border-[#333]">
          <p className="text-gray-400 font-bold mb-2">In playlists</p>
          <h2 className="text-3xl font-bold text-[#1DB954]">
            {Number(album.in_playlists).toLocaleString()}
          </h2>
          <p className="text-xs text-gray-500 mt-1">User playlists</p>
        </div>
        </div>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] p-8 rounded-2xl border border-[#3c3c3c] w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Edit album</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Row 1: Code & Album name */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Code</label>
                  <input 
                    value={editData.album_code}
                    onChange={(e) => setEditData({...editData, album_code: e.target.value})}
                    className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Album name</label>
                  <input 
                    value={editData.album_name}
                    onChange={(e) => setEditData({...editData, album_name: e.target.value})}
                    className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Artist & Album Type */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Artist</label>
                  <select 
                    value={editData.artist_id}
                    onChange={(e) => setEditData({...editData, artist_id: e.target.value})}
                    className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] appearance-none cursor-pointer"
                  >
                    {artists.map(art => (
                      <option key={art.artist_id} value={art.artist_id}>{art.artist_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Album Type</label>
                  <select 
                    value={editData.album_type}
                    onChange={(e) => setEditData({...editData, album_type: e.target.value})}
                    className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] appearance-none cursor-pointer"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Cover Image URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-400">Cover Image URL</label>
                <div className="flex bg-[#2a2a2a] border border-[#404040] rounded-xl overflow-hidden focus-within:border-[#1DB954] transition-all">
                  <input 
                    value={editData.cover_image_url}
                    onChange={(e) => setEditData({...editData, cover_image_url: e.target.value})}
                    className="bg-transparent flex-1 p-3 outline-none text-white text-sm"
                  />
                  <button type="button" className="bg-[#3e3e3e] px-6 py-2 text-sm font-bold text-white hover:bg-[#4a4a4a] border-l border-[#404040]">
                    Upload
                  </button>
                </div>
              </div>

              {/* Row 4: Release date & Total tracks (Read Only หรือใส่ Mock ไว้) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Release date</label>
                  <input 
                    type="date"
                    value={editData.release_date}
                    onChange={(e) => setEditData({...editData, release_date: e.target.value})}
                    className="bg-[#2a2a2a] border border-[#404040] rounded-xl p-3 text-white outline-none focus:border-[#1DB954] invert-[0.8] brightness-[1.2]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-400">Total tracks</label>
                  <input 
                    type="number"
                    value={album.total_tracks} // ดึงค่าจากข้อมูลเดิมมาโชว์ (มักจะแก้ไขที่หน้าจัดการเพลงแทน)
                    disabled
                    className="bg-[#232323] border border-[#333] rounded-xl p-3 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-4 mt-10 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-2.5 rounded-xl border border-[#555] font-bold text-gray-300 hover:bg-[#333] transition-all"
                >
                  Cancle
                </button>
                <button 
                  type="submit"
                  className="px-10 py-2.5 rounded-xl bg-transparent border border-[#1DB954] text-[#1DB954] font-bold hover:bg-[#1DB954] hover:text-black transition-all shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}