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
      if (!window.jspdf) throw new Error('jsPDF not loaded');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── safe number formatter (ASCII only, no Unicode separators) ──
      const fmtNum = (n) => {
        const num = Math.round(Number(n) || 0);
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };

      // ── ASCII-safe string (strip non-latin chars jsPDF can't render) ─
      const safe = (str = '') =>
        String(str)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
          .replace(/[^\x20-\x7E]/g, '')      // keep printable ASCII only
          .trim();

      // ── months lookup (ASCII) ─────────────────────────────────────
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      // ── color palette ─────────────────────────────────────────────
      const C = {
        green:   [29, 185, 84],
        dark:    [13, 13, 13],
        card:    [28, 28, 28],
        panel:   [38, 38, 38],
        white:   [230, 230, 230],
        gray:    [130, 130, 130],
        dimgray: [80, 80, 80],
        black:   [0, 0, 0],
        yellow:  [251, 191, 36],
        silver:  [148, 163, 184],
        amber:   [180, 120, 40],
      };

      const W = 210, H = 297, PAD = 12, INNER = W - PAD * 2;

      // ── drawing helpers ───────────────────────────────────────────
      const fill  = (...c)            => doc.setFillColor(...c);
      const ink   = (...c)            => doc.setTextColor(...c);
      const sz    = (n)               => doc.setFontSize(n);
      const bold  = (n)               => { doc.setFont('helvetica', 'bold');   sz(n); };
      const norm  = (n)               => { doc.setFont('helvetica', 'normal'); sz(n); };
      const rect  = (x,y,w,h,m='F')  => doc.rect(x, y, w, h, m);
      const rrect = (x,y,w,h,r=2.5)  => doc.roundedRect(x, y, w, h, r, r, 'F');
      const txt   = (s,x,y,o={})     => doc.text(safe(s), x, y, o);
      const hline = (x1,y1,x2,c=C.dimgray) => {
        doc.setDrawColor(...c); doc.line(x1, y1, x2, y1);
      };

      // ── PAGE BG ───────────────────────────────────────────────────
      fill(...C.dark); rect(0, 0, W, H);

      // ── TOP HEADER ────────────────────────────────────────────────
      fill(...C.green); rect(0, 0, W, 16);
      ink(...C.black); bold(10.5);
      txt('RECOMMENDATION ANALYTICS', PAD, 10.5);

      const now = new Date();
      const dateStr = MONTHS[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
      norm(8); ink(...C.black);
      txt(dateStr, W - PAD, 10.5, { align: 'right' });

      // ── SUB-HEADER (period info) ──────────────────────────────────
      fill(...C.panel); rect(0, 16, W, 9);
      const mon = Number(tempFilters.month);
      const yr  = tempFilters.year;
      const periodTxt = (mon > 0 && yr !== '0')
        ? 'Period: ' + MONTHS[mon - 1] + ' ' + yr
        : 'Period: All time';
      norm(7); ink(...C.gray);
      txt(periodTxt, PAD, 22);
      txt('Exported: ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), W - PAD, 22, { align: 'right' });

      let y = 34;

      // ── SECTION HEADER helper ─────────────────────────────────────
      const sectionHeader = (title, sub) => {
        // full-width panel bg
        fill(...C.panel); rect(PAD, y, INNER, 9);
        // green left accent
        fill(...C.green); rect(PAD, y, 3, 9);
        // title text
        ink(...C.white); bold(8.5);
        txt(title, PAD + 6, y + 6);
        // sub text right
        if (sub) { ink(...C.gray); norm(6.5); txt(sub, W - PAD, y + 6, { align: 'right' }); }
        y += 13;
      };

      // ════════════════════════════════════════════════════════
      // SECTION 1 — EFFICIENCY
      // ════════════════════════════════════════════════════════
      sectionHeader('RECOMMENDATION EFFICIENCY', 'Play Count / Recommend Users');

      const rankLabels = ['#1', '#2', '#3'];
      const rankColors = [C.yellow, C.silver, C.amber];
      const GAP_EFF    = 4;
      const effCardW   = (INNER - GAP_EFF * 2) / 3;   // 3 cards
      const effCardH   = 56;

      const maxEff = Math.max(...data.efficiency.map(d => Number(d.efficiency_score) || 0), 1);

      data.efficiency.forEach((item, idx) => {
        const cx = PAD + idx * (effCardW + GAP_EFF);

        // ── card background ──────────────────────────────────
        fill(...C.card); rrect(cx, y, effCardW, effCardH);

        // ── green top accent line ────────────────────────────
        fill(...C.green); rect(cx, y, effCardW, 1.2);

        // ── rank badge (top-right) ───────────────────────────
        fill(...rankColors[idx]);
        rrect(cx + effCardW - 13, y + 3.5, 11, 5.5, 1.5);
        ink(...C.black); bold(6);
        txt(rankLabels[idx], cx + effCardW - 7.5, y + 7.5, { align: 'center' });

        // ── artist name ──────────────────────────────────────
        ink(...C.gray); norm(5.5);
        txt((item.artist_name || '').toUpperCase().substring(0, 18), cx + 4, y + 12);

        // ── song title ───────────────────────────────────────
        ink(...C.white); bold(9);
        txt((item.title || '').substring(0, 20), cx + 4, y + 19);

        // ── divider ──────────────────────────────────────────
        hline(cx + 4, y + 22, cx + effCardW - 4, [50, 50, 50]);

        // ── efficiency score (left column) ───────────────────
        ink(...C.gray); norm(5.5);
        txt('EFFICIENCY SCORE', cx + 4, y + 28);
        ink(...C.green); bold(13);
        txt(fmtNum(item.efficiency_score), cx + 4, y + 37);

        // ── rec users (right column) ─────────────────────────
        ink(...C.gray); norm(5.5);
        txt('REC. USERS', cx + effCardW - 4, y + 28, { align: 'right' });
        ink(...C.white); bold(9);
        txt(fmtNum(item.rec_users), cx + effCardW - 4, y + 37, { align: 'right' });

        // ── progress bar ─────────────────────────────────────
        const barX = cx + 4, barY = y + effCardH - 6;
        const barW = effCardW - 8;
        const filled = (Number(item.efficiency_score) / maxEff) * barW;
        fill(50, 50, 50); rect(barX, barY, barW, 2);
        fill(...C.green);  rect(barX, barY, Math.max(2, filled), 2);

        // ── bar label ─────────────────────────────────────────
        const pctLabel = Math.round((Number(item.efficiency_score) / maxEff) * 100) + '%';
        ink(...C.dimgray); norm(5);
        txt(pctLabel, cx + effCardW - 4, y + effCardH - 3.5, { align: 'right' });
      });

      if (data.efficiency.length === 0) {
        ink(...C.gray); norm(8);
        txt('No efficiency data available', W / 2, y + effCardH / 2, { align: 'center' });
      }

      y += effCardH + 12;

      // ════════════════════════════════════════════════════════
      // SECTION 2 — SATISFACTION
      // ════════════════════════════════════════════════════════
      sectionHeader('MONTHLY SATISFACTION BY GENRE', 'Average rating from user reviews');

      const satCount  = data.satisfaction.length || 1;
      const satCols   = Math.min(satCount, 4);
      const GAP_SAT   = 4;
      const satCardW  = (INNER - GAP_SAT * (satCols - 1)) / satCols;
      const satCardH  = 44;

      data.satisfaction.forEach((genre, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const cx  = PAD + col * (satCardW + GAP_SAT);
        const cy  = y + row * (satCardH + 5);
        const score = Number(genre.avg_score);

        // ── card bg ──────────────────────────────────────────
        fill(...C.card); rrect(cx, cy, satCardW, satCardH);
        // green top accent
        fill(...C.green); rect(cx, cy, satCardW, 1.2);

        // ── genre name ───────────────────────────────────────
        ink(...C.gray); bold(7);
        txt((genre.name || '').substring(0, 14), cx + satCardW / 2, cy + 10, { align: 'center' });

        // ── score big number ─────────────────────────────────
        ink(...C.white); bold(20);
        txt(score.toFixed(1), cx + satCardW / 2, cy + 24, { align: 'center' });

        // ── star rating bar (5 segments) ─────────────────────
        const barTotalW = satCardW - 10;
        const segW      = barTotalW / 5;
        const barX      = cx + 5;
        const barY      = cy + 28;
        for (let s = 0; s < 5; s++) {
          const fillAmt = Math.min(1, Math.max(0, score - s));
          fill(50, 50, 50); rect(barX + s * segW + 0.5, barY, segW - 1, 2.5);
          if (fillAmt > 0) {
            fill(...C.green); rect(barX + s * segW + 0.5, barY, (segW - 1) * fillAmt, 2.5);
          }
        }

        // ── avg score label ───────────────────────────────────
        ink(...C.gray); norm(5.5);
        txt('AVG SCORE', cx + satCardW / 2, cy + satCardH - 3, { align: 'center' });
      });

      if (data.satisfaction.length === 0) {
        ink(...C.gray); norm(8);
        txt('No satisfaction data available', W / 2, y + satCardH / 2, { align: 'center' });
      }

      // ── FOOTER ────────────────────────────────────────────────────
      fill(...C.panel); rect(0, H - 11, W, 11);
      hline(PAD, H - 11, W - PAD, C.green);
      ink(...C.gray); norm(6.5);
      txt('Recommendation Analytics Dashboard', PAD, H - 4.5);
      txt('Page 1 of 1', W - PAD, H - 4.5, { align: 'right' });

      doc.save('recommendation_analytics_' + Date.now() + '.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
      alert(
        'PDF export failed: ' + err.message +
        '\n\nAdd this to your index.html before </body>:\n' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
      );
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