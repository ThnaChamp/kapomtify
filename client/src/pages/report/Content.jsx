import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

// ── PDF Color palette (Spotify dark + accent) ──
const C = {
  bg:       [15,  15,  15],
  card:     [28,  28,  28],
  card2:    [38,  38,  38],
  card3:    [48,  48,  48],
  green:    [29,  185, 84],
  greenDim: [20,  130, 58],
  white:    [255, 255, 255],
  offwhite: [230, 230, 230],
  gray:     [120, 120, 120],
  lgray:    [180, 180, 180],
  dgray:    [70,  70,  70],
  red:      [255, 72,  72],
  redDim:   [180, 40,  40],
  border:   [55,  55,  55],
  header:   [10,  10,  10],
  yellow:   [255, 211, 78],
  blue:     [66,  153, 225],
};

// ── jsPDF helpers ──
const fillRect  = (doc, x, y, w, h, rgb)           => { doc.setFillColor(...rgb);   doc.rect(x, y, w, h, 'F'); };
const setDraw   = (doc, rgb, lw = 0.3)             => { doc.setDrawColor(...rgb);   doc.setLineWidth(lw); };

function roundRect(doc, x, y, w, h, r, fill, stroke) {
  doc.setFillColor(...fill);
  setDraw(doc, stroke ?? fill, stroke ? 0.3 : 0);
  doc.roundedRect(x, y, w, h, r, r, stroke ? 'FD' : 'F');
}

function txt(doc, str, x, y, rgb, size, bold = false, align = 'left') {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y, { align });
}

function circ(doc, cx, cy, r, fill, stroke) {
  doc.setFillColor(...fill);
  setDraw(doc, stroke ?? fill, stroke ? 0.4 : 0);
  doc.circle(cx, cy, r, stroke ? 'FD' : 'F');
}

// Draws a horizontal gradient-like bar using stacked rects
function gradientBar(doc, x, y, w, h, fromRgb, toRgb) {
  const steps = Math.ceil(w);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * t);
    const g = Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * t);
    const b = Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(x + i, y, 1, h, 'F');
  }
}

// Dot for decorative use
function dot(doc, x, y, r, fill) { circ(doc, x, y, r, fill); }

// ── Skip forward icon ──
function skipIcon(doc, cx, cy, color) {
  doc.setFillColor(...color);
  doc.triangle(cx - 3.5, cy - 4, cx - 3.5, cy + 4, cx + 2, cy, 'F');
  doc.triangle(cx + 2,   cy - 4, cx + 2,   cy + 4, cx + 7, cy, 'F');
  doc.rect(cx + 7.5, cy - 4, 2, 8, 'F');
}

// ── Horizontal pill badge ──
function badge(doc, x, y, label, fillRgb, textRgb, size = 5) {
  const pad = 4; const bh = size + 3;
  doc.setFontSize(size);
  const tw = doc.getTextWidth(label);
  roundRect(doc, x, y - bh + 1, tw + pad * 2, bh, bh / 2, fillRgb);
  txt(doc, label, x + pad, y, textRgb, size, true);
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

  // ── Export CSV (unchanged) ──
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
    const dateStr  = now.toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'2-digit' });
    const timeStr  = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
    const isoDate  = now.toISOString().split('T')[0];

    const monthNames = ['','January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    const monthLabel = tempFilters.month === '0' ? 'All Months' : (monthNames[Number(tempFilters.month)] || 'All Months');
    const yearLabel  = tempFilters.year  === '0' ? 'All Years'  : String(tempFilters.year);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210, mg = 14;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BACKGROUND
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    fillRect(doc, 0, 0, W, H, C.bg);

    // Subtle top-left glow blob (layered translucent circles)
    const glowColors = [[29,185,84,0.04],[29,185,84,0.03],[29,185,84,0.02]];
    [[55,55,38],[55,55,52],[55,55,64]].forEach(([cx,cy,r], i) => {
      const alpha = [0.06,0.04,0.02][i];
      doc.setFillColor(29,185,84);
      doc.setGState(doc.GState({ opacity: alpha }));
      doc.circle(cx, cy, r, 'F');
    });
    doc.setGState(doc.GState({ opacity: 1 }));

    // Bottom-right red glow
    [[255,72,72],[255,72,72],[255,72,72]].forEach((_, i) => {
      const rads = [45,58,70][i];
      doc.setFillColor(255,72,72);
      doc.setGState(doc.GState({ opacity: [0.04,0.025,0.015][i] }));
      doc.circle(W - 55, H - 55, rads, 'F');
    });
    doc.setGState(doc.GState({ opacity: 1 }));

    // Faint grid lines for depth (vertical)
    doc.setDrawColor(...C.dgray);
    doc.setLineWidth(0.08);
    for (let gx = mg; gx < W - mg; gx += 18) {
      doc.setGState(doc.GState({ opacity: 0.12 }));
      doc.line(gx, 22, gx, H - 12);
    }
    doc.setGState(doc.GState({ opacity: 1 }));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HEADER STRIP
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    fillRect(doc, 0, 0, W, 20, C.header);
    // Green left accent stripe
    fillRect(doc, 0, 0, 3, 20, C.green);

    // Logo mark (small circle + wordmark)
    circ(doc, mg + 7, 10, 5, C.green);
    txt(doc, '♫', mg + 4.8, 12.5, C.bg, 7, true);
    txt(doc, 'Kapomtify', mg + 16, 11.5, C.white, 8, true);
    txt(doc, 'Admin Dashboard', mg + 16, 16, C.gray, 5);

    // Center title
    txt(doc, 'CONTENT INSIGHTS REPORT', W / 2, 12, C.white, 9, true, 'center');

    // Right: avatar chip
    const chipX = W - 54;
    roundRect(doc, chipX, 5.5, 40, 10, 5, C.card2);
    circ(doc, chipX + 35, 10.5, 4.5, [80, 80, 80]);
    txt(doc, 'A', chipX + 33.5, 12.5, C.white, 5, true);
    txt(doc, 'Admin', chipX + 5, 12, C.lgray, 5.5);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    // META BAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    const metaY = 28;
    fillRect(doc, 0, 21, W, 14, [18, 18, 18]);
    setDraw(doc, C.border, 0.25);
    doc.line(0, 21, W, 21);
    doc.line(0, 35, W, 35);

    // Period pill
    badge(doc, mg, metaY + 4.5, `Period: ${monthLabel} ${yearLabel}`, [29, 185, 84, 0.15], C.green, 5.5);
    // Generated badge
    const genW = doc.getTextWidth(`Generated: ${dateStr}  ${timeStr}`) + 8;
    badge(doc, mg + 72, metaY + 4.5, `Generated: ${dateStr}  ${timeStr}`, C.card3, C.lgray, 5);

    // Export buttons (decorative)
    const btnY = metaY - 2;
    roundRect(doc, W - 68, btnY, 24, 9, 2, C.card2, C.border);
    txt(doc, 'Export CSV', W - 66, btnY + 5.8, C.lgray, 5, true);
    roundRect(doc, W - 40, btnY, 24, 9, 2, C.green);
    txt(doc, 'Export PDF', W - 38, btnY + 5.8, C.bg, 5.5, true);

    // Decorative dots row
    [C.green, C.red, C.yellow, C.blue].forEach((col, i) => {
      dot(doc, W - 80 - i * 6, metaY + 2.5, 1.2, col);
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BODY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    const bodyTop    = 39;
    const bodyBottom = H - 14;
    const bodyH      = bodyBottom - bodyTop;
    const gutter     = 7;
    const leftW      = (W - mg * 2 - gutter) * 0.56;
    const rightW     = (W - mg * 2 - gutter) * 0.44;
    const leftX      = mg;
    const rightX     = mg + leftW + gutter;

    // ── LEFT CARD ──
    roundRect(doc, leftX, bodyTop, leftW, bodyH, 6, C.card);
    // Green top accent line
    fillRect(doc, leftX, bodyTop, leftW, 1.5, C.green);
    // Top-left corner glow
    doc.setFillColor(...C.green);
    doc.setGState(doc.GState({ opacity: 0.06 }));
    doc.roundedRect(leftX, bodyTop, leftW * 0.5, bodyH * 0.5, 6, 6, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));

    // Card header
    const lhY = bodyTop + 11;
    // Section label pill
    roundRect(doc, leftX + 10, bodyTop + 3.5, 38, 6, 3, [29, 185, 84, 0.18]);
    txt(doc, 'GENRE ANALYTICS', leftX + 12, bodyTop + 8, C.green, 4.5, true);

    txt(doc, 'Genre Loyalty vs Reach', leftX + 10, lhY + 6, C.white, 10, true);
    txt(doc, 'Engagement depth per unique listener', leftX + 10, lhY + 12, C.gray, 5.5);

    // Thin separator with glow
    setDraw(doc, C.border, 0.25);
    doc.line(leftX + 8, lhY + 16, leftX + leftW - 8, lhY + 16);

    // Genre rows
    const maxRatio   = genres.length > 0 ? Math.max(...genres.map(g => parseFloat(g.plays_per_user) || 0)) : 1;
    const barAreaTop = lhY + 20;
    const barAreaH   = bodyH - (barAreaTop - bodyTop) - 8;
    const rowCount   = Math.max(genres.length, 1);
    const rowH       = barAreaH / rowCount;
    const barMaxW    = leftW - 30;
    const barH       = 5.5;

    if (genres.length === 0) {
      txt(doc, 'No data for selected period', leftX + leftW / 2, bodyTop + bodyH / 2, C.gray, 7, false, 'center');
    } else {
      genres.forEach((genre, i) => {
        const ry    = barAreaTop + i * rowH;
        const ratio = parseFloat(genre.plays_per_user) || 0;
        const barFill = barMaxW * (ratio / maxRatio);

        // Row hover strip (subtle alternating)
        if (i % 2 === 0) {
          doc.setFillColor(...C.card2);
          doc.setGState(doc.GState({ opacity: 0.5 }));
          doc.roundedRect(leftX + 7, ry + 0.5, leftW - 14, rowH - 1, 2, 2, 'F');
          doc.setGState(doc.GState({ opacity: 1 }));
        }

        // Rank number
        const rankColor = i === 0 ? C.yellow : i === 1 ? C.lgray : i === 2 ? [205, 127, 50] : C.dgray;
        txt(doc, `${i + 1}`, leftX + 13, ry + rowH / 2 + 2, rankColor, 7, true, 'center');

        // Genre name
        txt(doc, genre.name, leftX + 22, ry + rowH / 2 - 1, C.white, 7.5, true);

        // Plays / user label
        txt(doc, `${ratio.toFixed(2)} plays/user`, leftX + leftW - 9, ry + rowH / 2 - 1, C.gray, 5, false, 'right');

        // Bar track
        const barY = ry + rowH / 2 + 2.5;
        roundRect(doc, leftX + 22, barY, barMaxW, barH, 2, [40, 40, 40]);

        // Gradient bar fill (green → cyan-ish)
        if (barFill > 3) {
          gradientBar(doc, leftX + 22, barY, barFill, barH, C.green, [30, 215, 140]);
          // End glow dot
          circ(doc, leftX + 22 + barFill, barY + barH / 2, barH / 2 + 0.5, [30, 215, 140]);
        }

        // Separator
        if (i < genres.length - 1) {
          setDraw(doc, C.border, 0.15);
          doc.line(leftX + 10, ry + rowH, leftX + leftW - 10, ry + rowH);
        }
      });
    }

    // ── RIGHT CARD ──
    roundRect(doc, rightX, bodyTop, rightW, bodyH, 6, C.card);
    // Red top accent line
    fillRect(doc, rightX, bodyTop, rightW, 1.5, C.red);
    // Subtle red glow behind header
    doc.setFillColor(...C.red);
    doc.setGState(doc.GState({ opacity: 0.05 }));
    doc.roundedRect(rightX, bodyTop, rightW, bodyH * 0.4, 6, 6, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));

    // Card header
    const rhY = bodyTop + 11;
    // Section label pill
    roundRect(doc, rightX + 10, bodyTop + 3.5, 38, 6, 3, [255, 72, 72, 0.15]);
    txt(doc, 'SKIP ANALYSIS', rightX + 12, bodyTop + 8, C.red, 4.5, true);

    // Skip icon + title
    skipIcon(doc, rightX + 16, rhY + 3, C.red);
    txt(doc, 'High Skip Rate Artists', rightX + 28, rhY + 6, C.white, 10, true);
    txt(doc, 'Artists most frequently skipped by listeners', rightX + 10, rhY + 12, C.gray, 5.5);

    // Columns header
    const colHeaderY = rhY + 18;
    setDraw(doc, C.border, 0.25);
    doc.line(rightX + 8, colHeaderY - 2, rightX + rightW - 8, colHeaderY - 2);
    txt(doc, '#',         rightX + 13,          colHeaderY, C.dgray, 5, true);
    txt(doc, 'ARTIST',    rightX + 22,          colHeaderY, C.dgray, 5, true);
    txt(doc, 'SKIP RATE', rightX + rightW - 10, colHeaderY, C.dgray, 5, true, 'right');
    doc.line(rightX + 8, colHeaderY + 2, rightX + rightW - 8, colHeaderY + 2);

    // Artist rows
    const artistAreaTop = colHeaderY + 5;
    const artistAreaH   = bodyH - (artistAreaTop - bodyTop) - 6;
    const aRowH         = artistAreaH / Math.max(skipArtists.length, 1);

    if (skipArtists.length === 0) {
      txt(doc, 'No data for selected period', rightX + rightW / 2, bodyTop + bodyH / 2, C.gray, 7, false, 'center');
    } else {
      skipArtists.forEach((artist, i) => {
        const ry   = artistAreaTop + i * aRowH;
        const cy   = ry + aRowH / 2;
        const rate = parseFloat(artist.skip_rate) || 0;

        // Alternating row bg
        if (i % 2 === 0) {
          doc.setFillColor(...C.card2);
          doc.setGState(doc.GState({ opacity: 0.45 }));
          doc.roundedRect(rightX + 7, ry + 0.5, rightW - 14, aRowH - 1, 2, 2, 'F');
          doc.setGState(doc.GState({ opacity: 1 }));
        }

        // Rank
        const rColor = i === 0 ? C.red : i === 1 ? [255, 130, 100] : i === 2 ? [255, 160, 130] : C.dgray;
        txt(doc, `${i + 1}`, rightX + 15, cy + 2.5, rColor, 6.5, true, 'center');

        // Avatar circle with initial
        const avatarColors = [
          [80, 30, 30],[60, 35, 80],[30, 60, 80],[30, 80, 55],[80, 70, 20]
        ];
        const avColor = avatarColors[i % avatarColors.length];
        circ(doc, rightX + 26, cy, 7, avColor);
        // Subtle ring
        setDraw(doc, C.red, 0.3);
        doc.setGState(doc.GState({ opacity: 0.4 }));
        doc.circle(rightX + 26, cy, 7.5, 'S');
        doc.setGState(doc.GState({ opacity: 1 }));
        txt(doc, (artist.name[0] || '?').toUpperCase(), rightX + 24.5, cy + 2.5, C.white, 6, true);

        // Artist name
        txt(doc, artist.name, rightX + 37, cy + 2.5, C.offwhite, 7.5, true);

        // Skip rate pill
        const isHigh  = rate > 10;
        const pillCol = isHigh ? [70, 20, 20] : [40, 40, 40];
        const rateTxt = `${rate.toFixed(1)}%`;
        const pillW   = doc.getTextWidth(rateTxt) + 8;
        const pillX   = rightX + rightW - 12 - pillW;
        roundRect(doc, pillX, cy - 5, pillW, 10, 5, pillCol);
        txt(doc, rateTxt, pillX + pillW / 2, cy + 2.5, isHigh ? C.red : C.lgray, 7.5, true, 'center');

        // Thin separator
        if (i < skipArtists.length - 1) {
          setDraw(doc, C.border, 0.15);
          doc.line(rightX + 10, ry + aRowH, rightX + rightW - 10, ry + aRowH);
        }
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FOOTER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━
    fillRect(doc, 0, H - 12, W, 12, C.header);
    fillRect(doc, 0, H - 12, W, 0.5, C.border);

    // Green bottom accent
    fillRect(doc, 0, H - 1, W, 1, C.green);

    // Left: branding
    circ(doc, mg + 4, H - 5.5, 3, C.green);
    txt(doc, '♫', mg + 2.8, H - 4, C.bg, 4, true);
    txt(doc, 'Kapomtify  |  Content Insights Report', mg + 10, H - 4, C.gray, 5);

    // Center: data summary
    const totalGenres = genres.length;
    const totalSkip   = skipArtists.length;
    txt(doc, `${totalGenres} Genre${totalGenres !== 1 ? 's' : ''}  ·  ${totalSkip} Artist${totalSkip !== 1 ? 's' : ''} analyzed`, W / 2, H - 4, C.dgray, 5, false, 'center');

    // Right: page info
    txt(doc, `Page 1 of 1  ·  ${isoDate}`, W - mg, H - 4, C.gray, 5, false, 'right');

    // Decorative corner dots (bottom right)
    [[C.green, 0.8],[C.red, 0.6],[C.yellow, 0.4]].forEach(([col, op], i) => {
      doc.setGState(doc.GState({ opacity: op }));
      dot(doc, W - mg - 25 + i * 5, H - 6, 1, col);
    });
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.save(`content-analytics-${isoDate}.pdf`);
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