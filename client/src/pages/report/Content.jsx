import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

// ── PDF Color constants ──
const C = {
  bg:     [26,  26,  26],
  card:   [42,  42,  42],
  card2:  [52,  52,  52],
  green:  [29,  185, 84],
  white:  [255, 255, 255],
  gray:   [136, 136, 136],
  lgray:  [200, 200, 200],
  red:    [231, 76,  60],
  border: [65,  65,  65],
  header: [17,  17,  17],
  footer: [34,  34,  34],
  track:  [62,  62,  62],
  avatar: [72,  72,  72],
};

// ── jsPDF helpers ──
function fillRect(doc, x, y, w, h, rgb) {
  doc.setFillColor(...rgb);
  doc.rect(x, y, w, h, 'F');
}

function roundRect(doc, x, y, w, h, r, fillRgb, strokeRgb) {
  doc.setFillColor(...fillRgb);
  if (strokeRgb) {
    doc.setDrawColor(...strokeRgb);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, 'FD');
  } else {
    doc.setDrawColor(...fillRgb);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  }
}

function txt(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y);
}

function txtRight(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y, { align: 'right' });
}

function circ(doc, cx, cy, r, fillRgb, strokeRgb) {
  doc.setFillColor(...fillRgb);
  if (strokeRgb) {
    doc.setDrawColor(...strokeRgb);
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, r, 'FD');
  } else {
    doc.setDrawColor(...fillRgb);
    doc.circle(cx, cy, r, 'F');
  }
}

// draw play/skip icon (red triangle + bar)
function drawSkipIcon(doc, cx, cy) {
  doc.setFillColor(...C.red);
  doc.triangle(cx - 4, cy - 5, cx - 4, cy + 5, cx + 4, cy, 'F');
  doc.setFillColor(...C.red);
  doc.rect(cx + 6, cy - 5, 2.5, 10, 'F');
}

const ContentAnalytics = () => {
  const [tempFilters, setTempFilters] = useState({ month: "0", year: "0" });

  const [data, setData] = useState({
    genres: [],
    skipArtists: [],
    loading: true
  });

  const fetchContentData = async (month, year) => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const queryString = `?month=${month}&year=${year}`;
      const response = await fetch(`${baseUrl}/api/analytics/content${queryString}`);
      const result = await response.json();
      setData({
        genres: result.genres || [],
        skipArtists: result.skipArtists || [],
        loading: false
      });
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => { fetchContentData("0", "0"); }, []);

  const handleSearchClick = () => fetchContentData(tempFilters.month, tempFilters.year);

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => {
      let nextFilters = { ...prev, [name]: value };
      if (name === 'month' && value === '0')                                      nextFilters.year = '0';
      else if (name === 'year' && value === '0')                                  nextFilters.month = '0';
      else if (name === 'year' && value !== '0' && nextFilters.month === '0')     nextFilters.month = '1';
      else if (nextFilters.month !== '0' && nextFilters.year === '0')             nextFilters.year = String(new Date().getFullYear());
      return nextFilters;
    });
  };

  // ── Export CSV ──
  const handleExportCSV = () => {
    const { genres, skipArtists } = data;
    const now = new Date();
    const monthNames = ['','January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const monthLabel = tempFilters.month === '0' ? 'All Months' : monthNames[Number(tempFilters.month)];
    const yearLabel  = tempFilters.year  === '0' ? 'All Years'  : tempFilters.year;

    const rows = [
      ['================================================'],
      ['MUSIC & ALBUM PLATFORM - CONTENT INSIGHTS REPORT'],
      ['================================================'],
      ['Generated', now.toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'2-digit' }) + '  ' + now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false })],
      ['Period', `${monthLabel} ${yearLabel}`],
      ['Exported By', 'Admin'],
      [],
      ['================================================'],
      ['SECTION 1: GENRE LOYALTY VS REACH'],
      ['================================================'],
      ['Rank', 'Genre', 'Plays / User'],
      ...genres.map((g, i) => [i + 1, g.name, g.plays_per_user]),
      genres.length === 0 ? ['No data for selected period'] : [],
      [],
      ['================================================'],
      ['SECTION 2: HIGH SKIP RATE ARTISTS'],
      ['================================================'],
      ['Rank', 'Artist', 'Skip Rate (%)'],
      ...skipArtists.map((a, i) => [i + 1, a.name, a.skip_rate + '%']),
      skipArtists.length === 0 ? ['No data for selected period'] : [],
    ];

    const csvContent = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `content-analytics-${now.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF ──
  const handleExportPDF = () => {
    const { genres, skipArtists } = data;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    const monthNames = ['','January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const monthLabel = tempFilters.month === '0' ? 'All Months' : (monthNames[Number(tempFilters.month)] || 'All Months');
    const yearLabel  = tempFilters.year  === '0' ? 'All Years'  : String(tempFilters.year);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();  // 210
    const mg = 14;

    // ── Background ──
    fillRect(doc, 0, 0, W, H, C.bg);

    // ── Header bar ──
    fillRect(doc, 0, 0, W, 18, C.header);
    txt(doc, 'Content', mg, 12, C.white, 12, true);
    roundRect(doc, W - 52, 4, 22, 9, 2, C.card);
    txt(doc, 'Admin', W - 49, 10, C.lgray, 6.5);
    circ(doc, W - 18, 9, 7, [85, 85, 85]);
    txt(doc, 'AD', W - 18, 11, C.white, 5.5, true);

    // ── Sub-header row ──
    const subY = 26;
    txt(doc, 'Data Insights Report', mg, subY, C.gray, 7, true);

    // Month pill
    const mPillW = Math.max(28, monthLabel.length * 2.1 + 8);
    roundRect(doc, 65, subY - 6, mPillW, 9, 2, C.card);
    txt(doc, monthLabel + ' v', 68, subY, C.lgray, 6);

    // Year pill
    const yPillX = 65 + mPillW + 4;
    roundRect(doc, yPillX, subY - 6, 26, 9, 2, C.card);
    txt(doc, yearLabel + ' v', yPillX + 3, subY, C.lgray, 6);

    // Search icon (drawn as circle + line)
    const sIconX = yPillX + 32;
    doc.setDrawColor(...C.gray);
    doc.setLineWidth(0.6);
    doc.circle(sIconX + 4, subY - 1, 3.5, 'S');
    doc.line(sIconX + 6.5, subY - 3, sIconX + 9, subY - 5.5);

    txt(doc, `Generated: ${dateStr}  ${timeStr}`, mg, subY + 8, C.gray, 5.5);

    // Export CSV button
    roundRect(doc, W - 60, subY - 6, 22, 9, 2, C.bg, C.lgray);
    txt(doc, 'Export CSV', W - 59, subY, C.lgray, 5.5, true);
    // Export PDF button
    roundRect(doc, W - 34, subY - 6, 22, 9, 2, C.green);
    txt(doc, 'Export PDF', W - 33, subY, C.white, 5.5, true);

    // Separator
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(mg, subY + 11, W - mg, subY + 11);

    // ── Body layout ──
    // Cards sit between separator (subY+11) and footer (H-10)
    const cardTop    = subY + 15;          // top of both cards (in PDF coords from top=0)
    const cardBottom = H - 14;             // bottom of both cards
    const cardH      = cardBottom - cardTop;
    const leftW      = (W - mg * 2) * 0.50;
    const rightW     = (W - mg * 2) - leftW - 8;
    const leftX      = mg;
    const rightX     = mg + leftW + 8;

    // jsPDF y=0 is TOP, but drawString y is baseline from top
    // roundedRect: x,y = top-left corner
    const cardY_pdf  = cardTop;            // top-left y for roundedRect

    // ══ LEFT: Genre Loyalty vs Reach ══
    roundRect(doc, leftX, cardY_pdf, leftW, cardH, 8, C.card);

    // Title block (y measured from top of page)
    const titleY  = cardY_pdf + 10;
    txt(doc, 'Genre Loyalty vs Reach', leftX + 14, titleY, C.white, 10, true);
    txt(doc, 'Engagement depth per unique listener', leftX + 14, titleY + 7, C.gray, 6);

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(leftX + 8, titleY + 11, leftX + leftW - 8, titleY + 11);

    // Genre rows
    const genreAreaTop = titleY + 15;
    const genreAreaH   = cardH - (genreAreaTop - cardY_pdf) - 6;
    const maxRatio     = genres.length > 0 ? Math.max(...genres.map(g => parseFloat(g.plays_per_user))) : 1;
    const barMaxW      = leftW - 32;
    const genreRowH    = genreAreaH / Math.max(genres.length, 1);

    if (genres.length === 0) {
      txt(doc, 'No data for selected period', leftX + leftW / 2, cardY_pdf + cardH / 2, C.gray, 7);
    } else {
      genres.forEach((genre, i) => {
        const ry    = genreAreaTop + i * genreRowH + 4;
        const ratio = parseFloat(genre.plays_per_user) || 0;

        // genre name
        txt(doc, genre.name, leftX + 14, ry, C.white, 8, true);
        // plays/users right-aligned
        txtRight(doc, `${ratio.toFixed(2)} plays / users`, leftX + leftW - 10, ry, C.gray, 6);

        // bar track (dark background)
        const barY = ry + 3;
        doc.setFillColor(...C.track);
        doc.roundedRect(leftX + 14, barY, barMaxW, 5, 1, 1, 'F');

        // bar fill (green)
        const fillW = Math.max(6, barMaxW * (ratio / maxRatio));
        doc.setFillColor(...C.green);
        doc.roundedRect(leftX + 14, barY, fillW, 5, 1, 1, 'F');
      });
    }

    // ══ RIGHT: High Skip Rate Artists ══
    roundRect(doc, rightX, cardY_pdf, rightW, cardH, 8, C.card);

    // Skip icon + title
    const skipTitleY = cardY_pdf + 12;
    drawSkipIcon(doc, rightX + 14, skipTitleY);
    txt(doc, 'High Skip Rate Artists', rightX + 27, skipTitleY + 3, C.red, 10, true);

    // Column headers
    const colY = skipTitleY + 12;
    txt(doc, 'ARTIST', rightX + 32, colY, C.gray, 5.5, true);
    txtRight(doc, 'SKIP RATE', rightX + rightW - 10, colY, C.gray, 5.5, true);

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(rightX + 8, colY + 3, rightX + rightW - 8, colY + 3);

    // Artist rows
    const artistAreaTop = colY + 6;
    const artistAreaH   = cardH - (artistAreaTop - cardY_pdf) - 6;
    const artistRowH    = artistAreaH / Math.max(skipArtists.length, 1);

    if (skipArtists.length === 0) {
      txt(doc, 'No data for selected period', rightX + rightW / 2, cardY_pdf + cardH / 2, C.gray, 7);
    } else {
      skipArtists.forEach((artist, i) => {
        const ry   = artistAreaTop + i * artistRowH + artistRowH / 2;
        const rate = parseFloat(artist.skip_rate) || 0;

        // Avatar circle
        circ(doc, rightX + 18, ry, 8, C.avatar);
        txt(doc, artist.name[0].toUpperCase(), rightX + 18, ry + 2.5, C.gray, 6.5, true);

        // Artist name
        txt(doc, artist.name, rightX + 32, ry + 2.5, C.white, 8.5, true);

        // Skip rate
        const rateColor = rate > 0 ? C.red : C.gray;
        txtRight(doc, `${rate.toFixed(1)}%`, rightX + rightW - 10, ry + 2.5, rateColor, 9.5, true);

        // Separator between rows
        if (i < skipArtists.length - 1) {
          doc.setDrawColor(...C.border);
          doc.setLineWidth(0.25);
          doc.line(rightX + 8, ry + artistRowH / 2 + 2, rightX + rightW - 8, ry + artistRowH / 2 + 2);
        }
      });
    }

    // ── Footer ──
    fillRect(doc, 0, H - 10, W, 10, C.footer);
    txt(doc, 'Music & Album Platform  |  Content Insights Report', mg, H - 4, C.gray, 5.5);
    txtRight(doc, `Page 1 of 1  |  ${now.toISOString().split('T')[0]}`, W - mg, H - 4, C.gray, 5.5);

    doc.save(`content-analytics-${now.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white font-sans">

      {/* Header Section with Integrated Filter */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4 items-center">
          <span className="text-gray-400 text-sm font-bold opacity-80 tracking-tight">
            Data insights reports
          </span>
          <div className="flex gap-2">
            <select
              name="month"
              value={tempFilters.month}
              onChange={handleTempFilterChange}
              className="bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1DB954] cursor-pointer"
            >
              <option value="0">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              name="year"
              value={tempFilters.year}
              onChange={handleTempFilterChange}
              className="bg-[#2a2a2a] border border-[#444] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1DB954] cursor-pointer"
            >
              <option value="0">All Years</option>
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={handleSearchClick}
              className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] p-2.5 rounded-lg text-white transition-all active:scale-95"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-xl text-sm font-bold hover:bg-[#333] transition-all"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 bg-[#1DB954] text-black rounded-xl text-sm font-bold hover:scale-105 transition-all active:scale-95"
          >
            Export PDF
          </button>
        </div>
      </div>

      {data.loading ? (
        <div className="flex justify-center items-center h-64 text-[#1DB954] font-bold animate-pulse text-xl">
          Analyzing Content Data...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">

          {/* 1. Genre Loyalty vs Reach Card */}
          <div className="col-span-12 lg:col-span-7 bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">Genre Loyalty vs Reach</h3>
                <p className="text-gray-500 text-xs">Engagement depth per unique listener</p>
              </div>
            </div>

            <div className="space-y-8">
              {data.genres.map((genre, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sm tracking-widest">{genre.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{genre.plays_per_user} plays / users</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] rounded-full transition-all duration-1000"
                      style={{ width: `${(genre.plays_per_user / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.genres.length === 0 && <p className="text-gray-600 italic">No genre data found</p>}
            </div>
          </div>

          {/* 2. High Skip Rate Artists Card */}
          <div className="col-span-12 lg:col-span-5 bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-8 text-red-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L14.5 12L6 6V18ZM16 6V18H18V6H16Z"/>
              </svg>
              <h3 className="text-xl font-bold">High Skip Rate Artists</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 text-[10px] uppercase font-black text-gray-600 tracking-widest pb-2 border-b border-white/5">
                <div className="col-span-8">Artist</div>
                <div className="col-span-4 text-right">Skip Rate</div>
              </div>

              {data.skipArtists.map((artist, i) => (
                <div key={i} className="grid grid-cols-12 items-center py-3 hover:bg-white/5 rounded-xl px-2 transition-colors">
                  <div className="col-span-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-white/10" />
                    <span className="font-bold text-sm">{artist.name}</span>
                  </div>
                  <div className={`col-span-4 text-right font-mono font-bold ${parseFloat(artist.skip_rate) > 10 ? 'text-red-500' : 'text-gray-400'}`}>
                    {artist.skip_rate}%
                  </div>
                </div>
              ))}
              {data.skipArtists.length === 0 && <p className="text-gray-600 italic py-4">No skip data found</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ContentAnalytics;