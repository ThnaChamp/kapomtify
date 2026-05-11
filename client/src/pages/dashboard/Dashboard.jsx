import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching dashboard:", err));
  }, []);

  if (!stats) return <div className="p-8 text-gray-400 font-bold">Loading Dashboard Data...</div>;

  // ชุดสีสำหรับกราฟให้เหมือนดีไซน์
  const PIE_COLORS = ['#1b5e20', '#A5D6A7', '#FDE047', '#4CAF50'];
  const BAR_COLORS = ['#fae992', '#ecd357', '#b4e922', '#a3d41a', '#1e8d08', '#0e7430', '#065e23'];

  return (
    <div className="p-8 font-sans text-[#e0e0e0] flex flex-col gap-6">
      
      {/* <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1> */}
      
      {/* ── แถวบน: การ์ดตัวเลข 4 ช่อง ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg">
           <h3 className="text-gray-300 font-bold text-lg mb-2">Total Music</h3>
           <p className="text-[40px] leading-none font-black text-[#1DB954] mb-2">{stats.totalMusic.toLocaleString()}</p>
           <p className="text-sm text-gray-400 font-bold">+{stats.newMusicWeek} this week</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg">
           <h3 className="text-gray-300 font-bold text-lg mb-2">Total Users</h3>
           <p className="text-[40px] leading-none font-black text-[#1DB954] mb-2">{stats.totalUsers.toLocaleString()}</p>
           <p className="text-sm text-gray-400 font-bold">+{stats.newUsersMonth} this month</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg">
           <h3 className="text-gray-300 font-bold text-lg mb-2 leading-tight">Active<br/>Subscriptions</h3>
           <p className="text-[40px] leading-none font-black text-[#1DB954] mb-2 mt-2">{stats.activeSubscriptions.toLocaleString()}</p>
           <p className="text-sm text-gray-400 font-bold">{stats.activePercent}% of users</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg">
           <h3 className="text-gray-300 font-bold text-lg mb-2 leading-tight">Revenue<br/>(THB)</h3>
           <p className="text-[40px] leading-none font-black text-[#1DB954] mb-2 mt-2">{stats.revenue.toLocaleString()}</p>
           <p className="text-sm text-gray-400 font-bold">this month</p>
        </div>
      </div>

      {/* ── แถวล่าง: กราฟและอันดับ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย (กินพื้นที่ 2 ส่วน) แบ่งเป็น บน-ล่าง */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Top 5 Songs */}
          <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg flex-1">
            <h3 className="text-gray-200 font-bold text-xl mb-4">Top 5 songs this week</h3>
            <div className="space-y-4">
              {stats.topSongs.map((song, i) => (
                <div key={i} className="flex justify-between items-center text-base">
                  <span className="text-gray-300 font-bold tracking-wide">
                    {i+1}. {song.title}
                  </span>
                  <span className="text-[#1DB954] font-bold">
                    {song.plays.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Play count */}
          <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg flex-1 h-[280px] flex flex-col">
            <h3 className="text-gray-200 font-bold text-xl mb-4">Play count (last 7 days)</h3>
            <div className="flex-1 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.playCountStats}>
                  <XAxis dataKey="day" tick={{fill: '#888', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff'}} />
                  <Bar dataKey="plays" radius={[6, 6, 6, 6]} barSize={45}>
                    {stats.playCountStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* คอลัมน์ขวา: Donut Chart */}
        <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col">
          <h3 className="text-gray-200 font-bold text-xl mb-4">Genre's proportion</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.genreStats} 
                  innerRadius={90} 
                  outerRadius={140} 
                  paddingAngle={0} 
                  dataKey="value"
                  stroke="none"
                >
                  {stats.genreStats.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-y-6 mt-8 px-4 pb-4">
            {stats.genreStats.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-5 rounded-md shadow-sm" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></div>
                <span className="text-gray-300 font-bold text-base">{g.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}