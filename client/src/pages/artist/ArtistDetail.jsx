import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchArtist = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`);
    const data = await res.json();
    setArtist(data);
    setEditForm(data);
  };

  useEffect(() => { fetchArtist(); }, [id]);

  // --- เพิ่มฟังก์ชัน handleDelete สำหรับปุ่มลบในหน้านี้ ---
  const handleDelete = async () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบศิลปินท่านนี้?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/artists/${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("ลบข้อมูลศิลปินเรียบร้อยแล้ว");
          navigate('/artist'); // กลับไปหน้าตารางศิลปิน
        } else {
          const errData = await res.json();
          alert(`ลบไม่สำเร็จ: ${errData.error || 'เกิดข้อผิดพลาด'}`);
        }
      } catch(err) {
        alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    }
  };

  if (!artist) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 text-[#e0e0e0] font-sans">
      <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 flex gap-6 mb-6">
        <img src={artist.profile_image_url || "https://via.placeholder.com/200"} className="w-48 h-48 rounded object-cover shadow-lg" alt="Profile" />
        <div>
          <h1 className="text-3xl font-bold mb-2">{artist.artist_name}</h1>
          <span className="bg-[#333] px-3 py-1 rounded-full text-xs text-gray-300 font-bold">
            Release Date : {artist.debut_year || 'Unknown'}
          </span>
          <div className="mt-4">
            <h3 className="font-bold mb-1">Bio:</h3>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              "{artist.bio || 'No bio available.'}"
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-1.5 border border-gray-500 rounded text-sm font-bold hover:bg-[#333]">Edit</button>
            {/* เรียกใช้ฟังก์ชัน handleDelete ที่สร้างขึ้นมาใหม่ */}
            <button onClick={handleDelete} className="px-6 py-1.5 border border-red-900/50 text-red-500 text-sm font-bold rounded hover:bg-red-500/10">Delete</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5">
          <h3 className="font-bold text-lg mb-6">Artist Info</h3>
          <div className="text-sm space-y-4">
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-200 font-bold">Code</span>
              <span className="text-gray-200 font-bold">{artist.artist_code}</span>
            </div>
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-200 font-bold">Artist name</span>
              <span className="text-gray-200 font-bold">{artist.artist_name}</span>
            </div>
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-200 font-bold">Album</span>
              <span className="text-gray-200 font-bold">{artist.total_albums || 0}</span>
            </div>
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-200 font-bold">During the year</span>
              <span className="text-gray-200 font-bold">{artist.debut_year ? `${artist.debut_year} - current` : '-'}</span>
            </div>
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-200 font-bold">Type</span>
              <span className="text-gray-200 font-bold">{artist.type || 'Band'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 flex flex-col">
          <h3 className="font-bold text-lg mb-6">Top song</h3>
          <div className="flex flex-col gap-4">
            {artist.top_songs && artist.top_songs.length > 0 ? (
              artist.top_songs.map((song, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-200 font-bold truncate pr-4">{song.title}</span>
                  <span className="text-gray-200 font-bold">{Number(song.play_count).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No top songs available</p>
            )}
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-xl border border-white/5 flex flex-col">
          <h3 className="font-bold text-lg mb-6">List Albums</h3>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
            {artist.albums && artist.albums.length > 0 ? (
              artist.albums.map((al, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-200 font-bold truncate pr-4">{al.album_name}</span>
                  <span className="text-gray-200 font-bold">{al.release_year}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No albums available</p>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-200">Edit artist</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-300 hover:text-white text-lg font-bold border-b-2 border-gray-400 leading-none pb-0.5">X</button>
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
            }} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">Code</label>
                  <input name="artist_code" value={editForm.artist_code || ''} onChange={e => setEditForm({...editForm, artist_code: e.target.value})} className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"/>
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">Artist name</label>
                  <input name="artist_name" value={editForm.artist_name || ''} onChange={e => setEditForm({...editForm, artist_name: e.target.value})} className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">Debut year</label>
                  <input name="debut_year" value={editForm.debut_year || ''} onChange={e => setEditForm({...editForm, debut_year: e.target.value})} className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]"/>
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-bold text-gray-400">Verified status</label>
                  <select name="verified_status" value={editForm.verified_status ? 'Yes' : 'No'} onChange={e => setEditForm({...editForm, verified_status: e.target.value === 'Yes'})} className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954]">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-400">Profile</label>
                <div className="flex bg-[#333333] border border-gray-500 rounded-lg items-center px-2 py-1">
                  <input name="profile_image_url" value={editForm.profile_image_url || ''} onChange={e => setEditForm({...editForm, profile_image_url: e.target.value})} className="bg-transparent flex-1 text-sm text-white outline-none"/>
                  <button type="button" className="px-4 py-1 border border-white text-white rounded-lg text-xs font-bold hover:bg-white/10">Upload</button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-gray-400">Bio</label>
                <textarea name="bio" value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="bg-[#333333] border border-gray-500 rounded-lg p-2 text-sm text-white outline-none focus:border-[#1DB954] h-20 resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-xl border border-white text-white text-sm font-bold hover:bg-white/5 active:scale-95 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl border border-[#1DB954] text-[#1DB954] text-sm font-bold hover:bg-[#1DB954]/10 active:scale-95 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}