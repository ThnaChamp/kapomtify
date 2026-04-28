import { useState, useMemo } from "react";

/* ── Icons ──────────────────────────────────────────────────────────────── */
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FilterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

/* ── Dummy Data ─────────────────────────────────────────────────────────── */
const MUSIC_DATA = [
  { id: "M001", title: "กระเป๋าแบบแฟนยิ้ม", artist: "The Richman Toy", date: "2009-06-03", genre: "Thai Rock" },
  { id: "M002", title: "เศษใจเหลือเหลือ", artist: "Dr. Fuu", date: "2008-01-01", genre: "Thai Pop" },
  { id: "M003", title: "รักรักรักรักรักรักรัก (Talk Less)", artist: "D Gerrard", date: "2022-09-29", genre: "Thai HipHop" },
  { id: "M004", title: "จดหมาย", artist: "The Toy", date: "2016-07-10", genre: "Thai Pop" },
  { id: "M005", title: "APRIL", artist: "Sirimongkol", date: "2020-04-11", genre: "Thai Indie" },
  { id: "M006", title: "เปิดตัวเขา", artist: "Three Man Down", date: "2023-06-29", genre: "Thai Rock" },
];

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState("Music");

  return (
    <div className="flex flex-col gap-5 p-0 text-[#e0e0e0]">
      
      {/* ── Tabs ── */}
      <div className="flex gap-8 border-b border-[#333] pl-8 pt-3">
        {["Music", "Album"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all ${
              activeTab === tab ? "text-[#1DB954] border-b-2 border-[#1DB954]" : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="px-8 flex flex-col gap-5">
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#242424] border border-[#444] rounded-md py-1.5 px-4 text-sm w-48 focus:outline-none focus:border-[#1DB954]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-[#444] rounded-md text-sm text-gray-300 hover:border-gray-500">
            <FilterIcon /> Filter
          </button>
        </div>
        <button className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-4 py-2 rounded-md text-sm transition-transform active:scale-95">
          <PlusIcon /> Create music
        </button>
      </div>
      

      {/* ── Data Table ── */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden mt-2 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#252525] text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
              <th className="px-6 py-4 w-12">#</th>
              <th className="px-6 py-4">Music ID</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Artist</th>
              <th className="px-6 py-4">Release Date</th>
              <th className="px-6 py-4">Genre</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {MUSIC_DATA.map((m, i) => (
              <tr key={m.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-5 text-sm font-bold text-gray-300">{i + 1}</td>
                <td className="px-6 py-5 text-sm font-bold text-gray-300">{m.id}</td>
                <td className="px-6 py-5 text-sm font-medium text-gray-300">{m.title}</td>
                <td className="px-6 py-5 text-sm text-gray-400">{m.artist}</td>
                <td className="px-6 py-5 text-sm text-gray-400">{m.date}</td>
                <td className="px-6 py-5 text-sm text-gray-400">{m.genre}</td>
                <td className="px-6 py-5">
                  <div className="flex gap-2 justify-end">
                    <button className="px-3 py-1 bg-[#252525] border border-[#444] rounded text-[11px] text-gray-300 hover:bg-[#333]">
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

      {/* ── Pagination ── */}
      <div className="flex justify-end items-center gap-2 mt-2">
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#444] text-xs text-gray-400 hover:bg-[#333]">1</button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#444] text-xs text-gray-400 hover:bg-[#333]">2</button>
        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#444] text-xs text-gray-400 hover:bg-[#333]">»</button>
      </div>
    </div>
    </div>
  );
}