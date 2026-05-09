import React, { useState, useEffect, useRef } from 'react';

// ─── External libs loaded via CDN in the HTML shell ───────────────────────────
// jsPDF  →  window.jspdf.jsPDF
// PapaParse → window.Papa
// ─────────────────────────────────────────────────────────────────────────────

/* ── tiny sparkline SVG ─────────────────────────────────────────── */
const Sparkline = ({ value, max }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="relative h-1 w-full rounded-full bg-white/10 overflow-hidden mt-4">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-[#1DB954] transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

/* ── star row ───────────────────────────────────────────────────── */
const Stars = ({ score }) => {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <div className="flex justify-center gap-0.5 mt-2">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${
            i < full
              ? 'text-[#1DB954]'
              : i === full && half
              ? 'text-[#1DB954]/50'
              : 'text-white/10'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const RecommendationAnalytics = () => {
  const [tempFilters, setTempFilters] = useState({ month: '0', year: '0' });
  const [data, setData] = useState({ efficiency: [], satisfaction: [], loading: true });
  const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null

  const formatNumber = (num) => (num ? Number(num).toLocaleString() : '0');

  /* ── fetch ─────────────────────────────────────────────────────── */
  const fetchRecData = async (month, year) => {
    setData((p) => ({ ...p, loading: true }));
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const qs = `?month=${month}&year=${year}`;
      const res = await fetch(`${baseUrl}/api/analytics/recommendation${qs}`);
      const result = await res.json();
      setData({ efficiency: result.efficiency || [], satisfaction: result.satisfaction || [], loading: false });
    } catch (e) {
      console.error(e);
      setData((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => { fetchRecData('0', '0'); }, []);

  const handleSearch = () => fetchRecData(tempFilters.month, tempFilters.year);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => {
      let next = { ...prev, [name]: value };
      if (name === 'month' && value === '0') next.year = '0';
      else if (name === 'year' && value === '0') next.month = '0';
      else if (name === 'year' && value !== '0' && next.month === '0') next.month = '1';
      else if (next.month !== '0' && next.year === '0') next.year = String(new Date().getFullYear());
      return next;
    });
  };

  /* ── Export CSV ─────────────────────────────────────────────────── */
  const handleExportCSV = () => {
    setExporting('csv');
    try {
      const effRows = data.efficiency.map((d) => ({
        section: 'Efficiency',
        artist: d.artist_name,
        title: d.title,
        efficiency_score: d.efficiency_score,
        rec_users: d.rec_users,
        play_count: d.play_count ?? '',
        genre: '',
        avg_score: '',
      }));
      const satRows = data.satisfaction.map((g) => ({
        section: 'Satisfaction',
        artist: '',
        title: '',
        efficiency_score: '',
        rec_users: '',
        play_count: '',
        genre: g.name,
        avg_score: g.avg_score,
      }));
      const csv = window.Papa
        ? window.Papa.unparse([...effRows, ...satRows])
        : [...effRows, ...satRows]
            .map((r) => Object.values(r).join(','))
            .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recommendation_analytics_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(null), 1200);
    }
  };

  /* ── Export PDF ─────────────────────────────────────────────────── */
  const handleExportPDF = () => {
    setExporting('pdf');
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const green = [29, 185, 84];
      const dark = [18, 18, 18];
      const gray = [160, 160, 160];

      /* background */
      doc.setFillColor(...dark);
      doc.rect(0, 0, 210, 297, 'F');

      /* header bar */
      doc.setFillColor(...green);
      doc.rect(0, 0, 210, 14, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATION ANALYTICS', 14, 9.5);

      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(8);
      doc.text(dateStr, 196, 9.5, { align: 'right' });

      let y = 26;

      /* ─ Efficiency section ─ */
      doc.setFillColor(30, 30, 30);
      doc.roundedRect(12, y - 6, 186, 8, 2, 2, 'F');
      doc.setTextColor(...green);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('⚡  RECOMMENDATION EFFICIENCY', 18, y - 0.5);
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.text('Play Count / Recommend Users', 192, y - 0.5, { align: 'right' });
      y += 8;

      data.efficiency.forEach((item, idx) => {
        const x = 12 + idx * 63;
        doc.setFillColor(42, 42, 42);
        doc.roundedRect(x, y, 60, 42, 3, 3, 'F');

        doc.setTextColor(...gray);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text((item.artist_name || '').toUpperCase(), x + 5, y + 7);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(item.title || '', x + 5, y + 14, { maxWidth: 50 });

        doc.setTextColor(...gray);
        doc.setFontSize(6);
        doc.text('EFFICIENCY SCORE', x + 5, y + 24);
        doc.setTextColor(...green);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(formatNumber(item.efficiency_score), x + 5, y + 32);

        doc.setTextColor(...gray);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text('REC. USERS', x + 38, y + 24);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(formatNumber(item.rec_users), x + 38, y + 32);
      });

      y += 52;

      /* ─ Satisfaction section ─ */
      doc.setFillColor(30, 30, 30);
      doc.roundedRect(12, y - 6, 186, 8, 2, 2, 'F');
      doc.setTextColor(...green);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('★  MONTHLY SATISFACTION BY GENRE', 18, y - 0.5);
      y += 8;

      const cols = 4;
      const cardW = (186 - (cols - 1) * 4) / cols;
      data.satisfaction.forEach((genre, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = 12 + col * (cardW + 4);
        const cy = y + row * 36;

        doc.setFillColor(42, 42, 42);
        doc.roundedRect(x, cy, cardW, 32, 3, 3, 'F');

        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(genre.name, x + cardW / 2, cy + 9, { align: 'center' });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(Number(genre.avg_score).toFixed(1), x + cardW / 2, cy + 22, { align: 'center' });

        doc.setTextColor(...gray);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text('AVG SCORE', x + cardW / 2, cy + 29, { align: 'center' });
      });

      /* footer */
      doc.setFillColor(42, 42, 42);
      doc.rect(0, 285, 210, 12, 'F');
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.text('Generated by Recommendation Analytics Dashboard', 14, 292);
      doc.text('Page 1 of 1', 196, 292, { align: 'right' });

      doc.save(`recommendation_analytics_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Make sure jsPDF is loaded.');
    } finally {
      setTimeout(() => setExporting(null), 1200);
    }
  };

  /* ── Loading ────────────────────────────────────────────────────── */
  if (data.loading) {
    return (
      <div className="p-8 bg-[#0d0d0d] min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#1DB954]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />
        </div>
        <p className="text-[#1DB954] font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
          Analyzing recommendations…
        </p>
      </div>
    );
  }

  const { efficiency, satisfaction } = data;
  const maxScore = efficiency.length ? Math.max(...efficiency.map((d) => Number(d.efficiency_score))) : 1;
  const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];
  const rankLabels = ['1st', '2nd', '3rd'];

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] font-sans selection:bg-[#1DB954]/20"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      

      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* ── filter + export bar ── */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4 items-center">
            <span className="text-gray-400 text-sm font-bold opacity-80">Data insights reports</span>
            <div className="flex gap-2">
              {/* Dropdown เลือกเดือน */}
              <select
                name="month"
                value={tempFilters.month}
                onChange={handleFilterChange}
                className="bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1DB954] cursor-pointer"
              >
                <option value="0">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>

              {/* Dropdown เลือกปี */}
              <select
                name="year"
                value={tempFilters.year}
                onChange={handleFilterChange}
                className="bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1DB954] cursor-pointer"
              >
                <option value="0">All Years</option>
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={handleSearch}
                className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] p-2.5 rounded-lg text-white transition-all active:scale-95 flex items-center justify-center group"
                title="Search"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={exporting !== null}
              className="bg-transparent border border-[#444] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#252525] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting === 'csv' ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              Export CSV
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="bg-[#1DB954] text-black px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting === 'pdf' ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              Export PDF
            </button>
          </div>
        </div>

        {/* ══ Recommendation Efficiency ══ */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <span className="text-yellow-400 text-sm">⚡</span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-base leading-tight">Recommendation Efficiency</h2>
                <p className="text-white/30 text-xs">Play Count ÷ Recommend Users × 1000</p>
              </div>
            </div>
            <span className="text-white/20 text-[10px] uppercase tracking-widest hidden md:block">Top 3 songs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {efficiency.map((item, i) => (
              <div
                key={i}
                className="relative bg-[#161616] border border-white/5 hover:border-[#1DB954]/20 rounded-2xl p-6 transition-all duration-300 group overflow-hidden"
              >
                {/* rank glow accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-300' : 'bg-amber-600'}`} />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">{item.artist_name}</p>
                    <h3 className="text-xl font-bold text-white truncate max-w-[160px]">{item.title}</h3>
                  </div>
                  <div className={`text-xs font-bold ${rankColors[i]} bg-white/5 rounded-lg px-2 py-1 border border-white/10`}>
                    {rankLabels[i]}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-semibold">Efficiency Score</p>
                    <p className="text-3xl font-black text-[#1DB954] tabular-nums">
                      {formatNumber(item.efficiency_score)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-semibold">Rec. Users</p>
                    <p className="text-lg font-bold text-white tabular-nums">{formatNumber(item.rec_users)}</p>
                  </div>
                </div>

                <Sparkline value={Number(item.efficiency_score)} max={maxScore} />
              </div>
            ))}
            {efficiency.length === 0 && (
              <div className="col-span-3 py-16 text-center text-white/20 text-sm italic">
                No efficiency data for the selected period
              </div>
            )}
          </div>
        </section>

        {/* ══ Monthly Satisfaction ══ */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center">
              <span className="text-[#1DB954] text-sm">★</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Monthly Satisfaction by Genre</h2>
              <p className="text-white/30 text-xs">Average rating from user reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {satisfaction.map((genre, i) => {
              const score = Number(genre.avg_score);
              const pct = Math.round((score / 5) * 100);
              return (
                <div
                  key={i}
                  className="relative bg-[#161616] border border-white/5 hover:border-[#1DB954]/20 rounded-2xl p-6 text-center transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#1DB954]/0 group-hover:bg-[#1DB954]/[0.03] transition-all duration-300" />
                  <div
                    className="absolute bottom-0 left-0 h-0.5 bg-[#1DB954] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />

                  <p className="text-white/50 text-sm font-semibold mb-3">{genre.name}</p>
                  <p className="text-4xl font-black text-white tabular-nums">{score.toFixed(1)}</p>
                  <Stars score={score} />
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mt-2">Avg Score</p>
                </div>
              );
            })}
            {satisfaction.length === 0 && (
              <div className="col-span-4 py-16 text-center text-white/20 text-sm italic">
                No satisfaction data for the selected period
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecommendationAnalytics;