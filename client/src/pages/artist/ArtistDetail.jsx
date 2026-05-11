import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/DeleteModal";
export default function ArtistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('userRole');
  const fetchArtist = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`);
      const data = await res.json();
      setArtist(data);
      setEditForm(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArtist(); }, [id]);

 const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, { 
        method: 'DELETE'
      });
      if (res.ok) {
        navigate('/artist'); 
      } else {
        const errData = await res.json();
        alert(`ลบไม่สำเร็จ: ${errData.error || 'เกิดข้อผิดพลาด'}`);
      }
    } catch(err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-[#1DB954] font-bold">
      Loading...
    </div>
  );
  if (!artist) return (
    <div className="bg-[#121212] min-h-screen flex items-center justify-center text-red-400 font-bold">
      Artist not found.
    </div>
  );

  return (
    <div className="bg-[#121212] min-h-screen text-[#e0e0e0] font-sans p-8 flex flex-col gap-6">
      
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xl font-bold mb-2">
        <span className="text-[#1DB954] underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate("/artist")}>Artists</span>
        <span className="text-gray-500 mx-1">›</span>
        <span className="text-white">{artist.artist_name}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1e1e1e] p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-end border border-white/5 shadow-xl">
        <img 
          src={artist.profile_image_url || "https://via.placeholder.com/220"} 
          className="w-56 h-56 rounded-full object-cover shadow-2xl border-4 border-[#1DB954]/20" 
          alt="Profile" 
        />
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
             <span className="bg-[#1DB954] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
               {artist.verified_status ? "Verified Artist" : "Artist"}
             </span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">{artist.artist_name}</h1>
          <p className="text-gray-400 text-lg">
            Debut Year: <span className="text-white font-bold">{artist.debut_year || 'Unknown'}</span> • {artist.type || 'Solo'}
          </p>
          <div className="mt-2">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Biography</h3>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed italic">
              "{artist.bio || 'No biography available.'}"
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg font-bold text-sm hover:bg-[#333] transition-all">Edit Profile</button>
            {userRole === 'super_admin' && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="px-8 py-2 bg-transparent border border-red-500/30 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/10 transition-all">Remove</button>
            )}
            </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Artist Info</h3>
          <div className="space-y-1">
            {[
              { label: "Artist Code", value: artist.artist_code, green: true },
              { label: "Gender", value: artist.gender || "N/A" },
              { label: "Total Albums", value: artist.total_albums || 0 },
              { label: "Status", value: artist.verified_status ? "Verified" : "Standard" },
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

        {/* Top Songs */}
        <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Top Songs</h3>
          <div className="space-y-4">
            {artist.top_songs && artist.top_songs.length > 0 ? (
              artist.top_songs.map((song, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span className="text-gray-300 font-bold text-sm group-hover:text-[#1DB954] transition-colors truncate pr-4">{idx+1}. {song.title}</span>
                  <span className="text-gray-500 font-mono text-xs">{Number(song.play_count).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm italic">No song data available</p>
            )}
          </div>
        </div>

        {/* Albums List */}
        <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Albums</h3>
          <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {artist.albums && artist.albums.length > 0 ? (
              artist.albums.map((al, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#2a2a2a] p-3 rounded-xl border border-white/5">
                  <span className="text-white font-bold text-sm truncate pr-4">{al.album_name}</span>
                  <span className="bg-[#333] px-2 py-0.5 rounded text-[10px] font-bold text-[#1DB954]">{al.release_year}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm italic">No albums recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Edit Artist</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm)
                });
                if (res.ok) {
                  alert("แก้ไขข้อมูลเรียบร้อย");
                  setIsEditModalOpen(false);
                  fetchArtist(); 
                } else {
                  alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                }
              } catch(err) { console.error(err); }
            }} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Code</label>
                  <input value={editForm.artist_code || ''} onChange={e => setEditForm({...editForm, artist_code: e.target.value})} readOnly className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] cursor-not-allowed"/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                  <input value={editForm.artist_name || ''} onChange={e => setEditForm({...editForm, artist_name: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Debut Year</label>
                  <input value={editForm.debut_year || ''} onChange={e => setEditForm({...editForm, debut_year: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]"/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Verified</label>
                  <select value={editForm.verified_status ? 'Yes' : 'No'} onChange={e => setEditForm({...editForm, verified_status: e.target.value === 'Yes'})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954]">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                <textarea value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="bg-[#3e3e3e] border border-[#555] rounded-md p-2 text-sm text-white outline-none focus:border-[#1DB954] h-24 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
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
        title="Delete Artist?"
        targetName={artist.artist_name}
      />
    </div>
  );
}
