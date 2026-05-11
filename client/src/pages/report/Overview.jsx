import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

// SVG Icons
const Icons = {
  Play: () => (
    <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6 text-[#1DB954]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg className={`w-6 h-6 ${filled ? 'fill-white text-white' : 'text-yellow-400'}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
};

// ── Color constants ──
const C = {
  bg:        [26,  26,  26],
  card:      [42,  42,  42],
  card2:     [36,  36,  36],
  green:     [29,  185, 84],
  white:     [255, 255, 255],
  gray:      [136, 136, 136],
  lgray:     [200, 200, 200],
  blue:      [74,  144, 217],
  border:    [55,  55,  55],
  header:    [17,  17,  17],
  footer:    [33,  33,  33],
};

function hex(rgb) {
  return `#${rgb.map(v => v.toString(16).padStart(2,'0')).join('')}`;
}

// ── jsPDF helper wrappers ──
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

function text(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y);
}

function textRight(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y, { align: 'right' });
}

function circle(doc, cx, cy, r, fillRgb, strokeRgb) {
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

// ── Draw icons as vector shapes (no Unicode) ──
function drawIconPlay(doc, cx, cy, color) {
  // Triangle pointing right
  doc.setFillColor(...color);
  doc.triangle(cx - 2.5, cy - 3.5, cx - 2.5, cy + 3.5, cx + 3.5, cy, 'F');
}

function drawIconUsers(doc, cx, cy, color) {
  // Two circles (heads)
  doc.setFillColor(...color);
  doc.circle(cx - 1.5, cy - 2, 2, 'F');
  doc.circle(cx + 2.5, cy - 2, 1.5, 'F');
  // Bodies (arcs approximated as ellipses)
  doc.ellipse(cx - 1.5, cy + 1.5, 3, 1.8, 'F');
  doc.setFillColor(...color);
  doc.ellipse(cx + 2.5, cy + 1.5, 2.2, 1.4, 'F');
}

function drawIconStar(doc, cx, cy, color) {
  doc.setFillColor(...color);
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * Math.PI / 180;
    const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
    points.push([cx + 4 * Math.cos(outerAngle), cy + 4 * Math.sin(outerAngle)]);
    points.push([cx + 1.8 * Math.cos(innerAngle), cy + 1.8 * Math.sin(innerAngle)]);
  }
  // Draw as filled polygon using lines
  doc.setDrawColor(...color);
  doc.setLineWidth(0.1);
  doc.lines(
    points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]),
    points[0][0], points[0][1], [1, 1], 'FD', true
  );
}

function drawIconHeart(doc, cx, cy, color) {
  // Two circles + triangle approximation
  doc.setFillColor(...color);
  doc.circle(cx - 1.8, cy - 1, 2, 'F');
  doc.circle(cx + 1.8, cy - 1, 2, 'F');
  doc.triangle(cx - 3.5, cy, cx + 3.5, cy, cx, cy + 4, 'F');
}

function drawIconGlobe(doc, cx, cy, color) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.setFillColor(0, 0, 0, 0);
  doc.circle(cx, cy, 4, 'S');
  doc.line(cx - 4, cy, cx + 4, cy);
  doc.ellipse(cx, cy, 2, 4, 'S');
}

// ── Draw one stat card ──
function drawStatCard(doc, x, y, w, h, iconType, label, value, change, iconColor) {
  roundRect(doc, x, y, w, h, 6, C.card);

  // icon circle bg
  const icx = x + 13, icy = y + 10;
  circle(doc, icx, icy, 7, C.bg);

  // draw icon shape
  if (iconType === 'play')  drawIconPlay(doc, icx, icy, iconColor);
  if (iconType === 'users') drawIconUsers(doc, icx, icy, iconColor);
  if (iconType === 'star')  drawIconStar(doc, icx, icy, iconColor);
  if (iconType === 'heart') drawIconHeart(doc, icx, icy, iconColor);

  // label
  text(doc, label, x + 5, y + 25, C.gray, 5.5, true);

  // value
  text(doc, String(value), x + 5, y + 34, C.white, 16, true);

  // change
  textRight(doc, change, x + w - 4, y + 34, C.green, 6.5, true);
}

export default function OverviewPage() {
  const [tempFilters, setTempFilters] = useState({
    month: "0",
    year: "0"
  });

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [data, setData] = useState({
    stats: null,
    countries: [],
    engagement: null,
    loading: true
  });

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    const n = Number(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };
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

function text(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y);
}

function textRight(doc, str, x, y, rgb, size, bold = false) {
  doc.setTextColor(...rgb);
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text(String(str), x, y, { align: 'right' });
}

function circle(doc, cx, cy, r, fillRgb, strokeRgb) {
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

// ── Draw icons as vector shapes (no Unicode) ──
function drawIconPlay(doc, cx, cy, color) {
  doc.setFillColor(...color);
  doc.triangle(cx - 2.5, cy - 3.5, cx - 2.5, cy + 3.5, cx + 3.5, cy, 'F');
}

function drawIconUsers(doc, cx, cy, color) {
  doc.setFillColor(...color);
  doc.circle(cx - 1.5, cy - 2, 2, 'F');
  doc.circle(cx + 2.5, cy - 2, 1.5, 'F');
  doc.ellipse(cx - 1.5, cy + 1.5, 3, 1.8, 'F');
  doc.setFillColor(...color);
  doc.ellipse(cx + 2.5, cy + 1.5, 2.2, 1.4, 'F');
}

function drawIconStar(doc, cx, cy, color) {
  doc.setFillColor(...color);
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * Math.PI / 180;
    const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
    points.push([cx + 4 * Math.cos(outerAngle), cy + 4 * Math.sin(outerAngle)]);
    points.push([cx + 1.8 * Math.cos(innerAngle), cy + 1.8 * Math.sin(innerAngle)]);
  }
  doc.setDrawColor(...color);
  doc.setLineWidth(0.1);
  doc.lines(
    points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]),
    points[0][0], points[0][1], [1, 1], 'FD', true
  );
}

function drawIconHeart(doc, cx, cy, color) {
  doc.setFillColor(...color);
  doc.circle(cx - 1.8, cy - 1, 2, 'F');
  doc.circle(cx + 1.8, cy - 1, 2, 'F');
  doc.triangle(cx - 3.5, cy, cx + 3.5, cy, cx, cy + 4, 'F');
}

function drawIconGlobe(doc, cx, cy, color) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.setFillColor(0, 0, 0, 0);
  doc.circle(cx, cy, 4, 'S');
  doc.line(cx - 4, cy, cx + 4, cy);
  doc.ellipse(cx, cy, 2, 4, 'S');
}

// ── Draw one stat card ──
function drawStatCard(doc, x, y, w, h, iconType, label, value, change, iconColor) {
  roundRect(doc, x, y, w, h, 6, C.card);

  const icx = x + 13, icy = y + 10;
  circle(doc, icx, icy, 7, C.bg);

  if (iconType === 'play')  drawIconPlay(doc, icx, icy, iconColor);
  if (iconType === 'users') drawIconUsers(doc, icx, icy, iconColor);
  if (iconType === 'star')  drawIconStar(doc, icx, icy, iconColor);
  if (iconType === 'heart') drawIconHeart(doc, icx, icy, iconColor);

  text(doc, label, x + 5, y + 25, C.gray, 5.5, true);
  text(doc, String(value), x + 5, y + 34, C.white, 16, true);
  textRight(doc, change, x + w - 4, y + 34, C.green, 6.5, true);
}

// ── handleExportPDF (ใช้ภายใน Component โดยรับ tempFilters, data เป็น param) ──
const handleExportPDF = (tempFilters, data, formatNumber) => {
  const { stats, countries, engagement } = data;
  const now = new Date();

  const dateStr = now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  // ── FIX 1: แปลง month/year จาก tempFilters เป็นชื่อจริง ──
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = tempFilters.month === '0'
    ? 'All Months'
    : (monthNames[Number(tempFilters.month)] || 'All Months');
  const yearLabel = tempFilters.year === '0'
    ? 'All Years'
    : String(tempFilters.year);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const mg = 14;

  // ── Background ──
  fillRect(doc, 0, 0, W, H, C.bg);

  // ── Header bar ──
  fillRect(doc, 0, 0, W, 18, C.header);
  text(doc, 'Overview', mg, 12, C.white, 12, true);
  roundRect(doc, W - 52, 4, 22, 9, 2, C.card);
  text(doc, 'Admin', W - 49, 10, C.lgray, 6.5);
  circle(doc, W - 18, 9, 7, [85, 85, 85]);
  text(doc, 'AD', W - 18, 11, C.white, 5.5, true);

  // ── Sub-header row ──
  const subY = 26;
  text(doc, 'Data Insights Report', mg, subY, C.gray, 7, true);

  // FIX 1: แสดงค่าจริงใน pill แทน "Month v / Year v"
  const mPillW = Math.max(26, monthLabel.length * 2.2 + 8);
  roundRect(doc, 65, subY - 6, mPillW, 9, 2, C.card);
  text(doc, monthLabel + ' v', 68, subY, C.lgray, 6);

  const yPillX = 65 + mPillW + 4;
  roundRect(doc, yPillX, subY - 6, 26, 9, 2, C.card);
  text(doc, yearLabel + ' v', yPillX + 3, subY, C.lgray, 6);

  text(doc, `Generated: ${dateStr}  ${timeStr}`, mg, subY + 8, C.gray, 5.5);

  // Export buttons
  roundRect(doc, W - 60, subY - 6, 22, 9, 2, C.bg, C.lgray);
  text(doc, 'Export CSV', W - 59, subY, C.lgray, 5.5, true);
  roundRect(doc, W - 34, subY - 6, 22, 9, 2, C.green);
  text(doc, 'Export PDF', W - 33, subY, C.white, 5.5, true);

  // Separator
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(mg, subY + 11, W - mg, subY + 11);

  // ── Stat Cards ──
  const cardY = subY + 15;
  const cardH = 42;
  const cardGap = 5;
  const cardW = (W - mg * 2 - cardGap * 3) / 4;

  const statsConfig = [
    { icon: 'play',  label: 'TOTAL STREAMS', value: formatNumber(stats?.total_streams ?? 0), iconColor: C.green },
    { icon: 'users', label: 'ACTIVE USERS',  value: formatNumber(stats?.active_users  ?? 0), iconColor: C.green },
    { icon: 'star',  label: 'AVG. RATING',   value: stats?.avg_rating ?? '0.0',              iconColor: [245, 166, 35] },
    { icon: 'heart', label: 'TOTAL SAVES',   value: formatNumber(stats?.total_saves   ?? 0), iconColor: [231, 76, 60] },
  ];

  statsConfig.forEach((s, i) => {
    const cx = mg + i * (cardW + cardGap);
    drawStatCard(doc, cx, cardY, cardW, cardH, s.icon, s.label, s.value, '+0.0%', s.iconColor);
  });

  // ── Bottom section ──
  const botY = cardY + cardH + 6;
  const botH = H - botY - 14;
  const leftW  = (W - mg * 2) * 0.36;
  const rightW = (W - mg * 2) - leftW - 5;
  const leftX  = mg;
  const rightX = mg + leftW + 5;

  // ── User Countries card ──
  roundRect(doc, leftX, botY, leftW, botH, 8, C.card);

  const globeCx = leftX + 10, globeCy = botY + 9;
  circle(doc, globeCx, globeCy, 5, C.bg);
  drawIconGlobe(doc, globeCx, globeCy, C.gray);
  text(doc, 'User Countries', leftX + 18, botY + 12, C.white, 8, true);

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(leftX + 5, botY + 17, leftX + leftW - 5, botY + 17);

  // FIX 2: ใช้ข้อมูลจริงจาก API ไม่มี hardcode fallback
  const countryList = countries ?? [];
  const total = countryList.reduce((a, c) => a + Number(c.value), 0);

  if (countryList.length === 0) {
    // แสดง empty state เมื่อไม่มีข้อมูล
    text(doc, 'No data for selected period', leftX + leftW / 2, botY + botH / 2, C.gray, 7);
  } else {
    const rowH = (botH - 22) / Math.min(countryList.length, 6);
    countryList.slice(0, 6).forEach((c, i) => {
      const ry = botY + 22 + i * rowH;

      doc.setDrawColor(...C.gray);
      doc.setLineWidth(0.5);
      doc.circle(leftX + 8, ry + 3, 2.5, 'S');

      text(doc, c.name, leftX + 14, ry + 5, C.blue, 7, true);
      textRight(doc, String(c.value), leftX + leftW - 5, ry + 5, C.lgray, 7, true);

      const barX = leftX + 14;
      const barW = leftW - 14 - 12;
      fillRect(doc, barX, ry + 7, barW, 1.5, C.border);
      doc.setFillColor(...C.green);
      doc.rect(barX, ry + 7, barW * (Number(c.value) / total), 1.5, 'F');
    });
  }

  // ── Top Albums Engagement card ──
  roundRect(doc, rightX, botY, rightW, botH, 8, C.card);

  circle(doc, rightX + 10, botY + 9, 5, [85, 85, 85]);
  circle(doc, rightX + 17, botY + 9, 5, [119, 119, 119]);
  text(doc, 'Top Albums Engagement', rightX + 26, botY + 12, C.white, 8, true);

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(rightX + 5, botY + 17, rightX + rightW - 5, botY + 17);

  const subCardY = botY + 21;
  const subCardH = botH - 25;
  const subCardW = (rightW - 15) / 2;

  // Best Rating
  roundRect(doc, rightX + 5, subCardY, subCardW, subCardH, 6, C.card2);
  text(doc, 'BEST RATING', rightX + 10, subCardY + 8, C.gray, 5.5, true);
  text(doc, engagement?.best_rating_name || 'No Data', rightX + 10, subCardY + 18, C.white, 10, true);
  const rScore = String(engagement?.best_rating_score || '0.0');
  text(doc, rScore, rightX + 10, subCardY + 27, C.lgray, 12, true);
  // วาด star shape หลังตัวเลข rating
  doc.setFontSize(12);
  const scoreW = doc.getTextWidth(rScore);
  drawIconStar(doc, rightX + 10 + scoreW + 5, subCardY + 24, C.lgray);

  // Best Saved
  const sx2 = rightX + 5 + subCardW + 5;
  roundRect(doc, sx2, subCardY, subCardW, subCardH, 6, C.card2);
  text(doc, 'BEST SAVED', sx2 + 5, subCardY + 8, C.gray, 5.5, true);
  text(doc, engagement?.best_saved_name || 'No Data', sx2 + 5, subCardY + 18, C.white, 10, true);
  text(doc,
    Number(engagement?.best_saved_count || 0).toLocaleString() + ' Saves',
    sx2 + 5, subCardY + 27, C.green, 12, true
  );

  // ── Footer ──
  fillRect(doc, 0, H - 10, W, 10, C.footer);
  text(doc, 'Music & Album Platform  |  Data Insights Report', mg, H - 4, C.gray, 5.5);
  textRight(doc, `Page 1 of 1  |  ${now.toISOString().split('T')[0]}`, W - mg, H - 4, C.gray, 5.5);

  doc.save('overview-analytics.pdf');
};
const handleExportCSV = () => {
  const { stats, countries, engagement } = data;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  const monthNames = ['','January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const monthLabel = tempFilters.month === '0' ? 'All Months' : monthNames[Number(tempFilters.month)];
  const yearLabel  = tempFilters.year  === '0' ? 'All Years'  : tempFilters.year;

  const countryList = countries ?? [];
  const totalUsers  = countryList.reduce((a, c) => a + Number(c.value), 0);

  const rows = [
    // Header
    ['================================================'],
    ['MUSIC & ALBUM PLATFORM - DATA INSIGHTS REPORT'],
    ['================================================'],
    ['Generated', `${dateStr} ${timeStr}`],
    ['Period', `${monthLabel} ${yearLabel}`],
    ['Exported By', 'Admin'],
    [],
    // Section 1
    ['================================================'],
    ['SECTION 1: OVERVIEW STATS'],
    ['================================================'],
    ['Metric', 'Value', 'Change'],
    ['Total Streams', formatNumber(stats?.total_streams ?? 0), '+0.0%'],
    ['Active Users',  formatNumber(stats?.active_users  ?? 0), '+0.0%'],
    ['Avg. Rating',   stats?.avg_rating ?? '0.0',              '+0.0%'],
    ['Total Saves',   formatNumber(stats?.total_saves   ?? 0), '+0.0%'],
    [],
    // Section 2
    ['================================================'],
    ['SECTION 2: USER COUNTRIES'],
    ['================================================'],
    ['Rank', 'Country', 'Users', 'Share (%)'],
    ...countryList.map((c, i) => [
      i + 1,
      c.name,
      c.value,
      totalUsers > 0 ? ((Number(c.value) / totalUsers) * 100).toFixed(1) + '%' : '0%'
    ]),
    ['', 'TOTAL', totalUsers, '100%'],
    [],
    // Section 3
    ['================================================'],
    ['SECTION 3: TOP ALBUMS ENGAGEMENT'],
    ['================================================'],
    ['Category', 'Album Name', 'Value'],
    ['Best Rating', engagement?.best_rating_name || 'No Data', (engagement?.best_rating_score || '0.0') + ' stars'],
    ['Best Saved',  engagement?.best_saved_name  || 'No Data', (engagement?.best_saved_count  || 0) + ' saves'],
  ];

  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `overview-analytics-${now.toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  const fetchOverviewData = async (month,year) => {
      setData(prev => ({ ...prev,loading:true}));
      try{
        
        const baseUrl = import.meta.env.VITE_API_URL;

        const queryString = `?month=${month}&year=${year}`;

        const [sRes,cRes,eRes] = await Promise.all([
          fetch(`${baseUrl}/api/analytics/stats${queryString}`),
          fetch(`${baseUrl}/api/analytics/countries${queryString}`),
          fetch(`${baseUrl}/api/analytics/engagement${queryString}`)
        ]);
        setData({
          stats: await sRes.json(),
          countries:await cRes.json(),
          engagement: await eRes.json(),
          loading:false
        });
      } catch (error){
        console.error("Error fetching analytics:",error);
        setData(prev => ({ ...prev, loading: false}));
      }
  };
  useEffect(() => {
    fetchOverviewData("0","0");
  },[]);

  const handleSearchClick = () => {
    fetchOverviewData(tempFilters.month, tempFilters.year);
  };

  
const handleTempFilterChange = (e) => {
    const { name, value } = e.target;

    setTempFilters(prev => {
        let nextFilters = { ...prev, [name]: value };

        if (name === 'month' && value === '0') {
            nextFilters.year = '0';
        }

        else if (name === 'year' && value === '0') {
            nextFilters.month = '0';
        }

        else if (name === 'year' && value !== '0' && nextFilters.month === '0') {
            nextFilters.month = '1'; 
        }else if (nextFilters.month !== '0' && nextFilters.year === '0') {
            nextFilters.year = String(new Date().getFullYear()); 
        }

        return nextFilters;
    });
};
  if (data.loading) {
    return <div className="p-8 bg-[#121212] min-h-screen text-[#1DB954] font-bold">Loading Analytics...</div>;
  }

  const { stats, countries, engagement } = data;

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-[#e0e0e0] font-sans selection:bg-[#1DB954]/30">

      {/* Filters */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4 items-center">
          <span className="text-gray-400 text-sm font-bold opacity-80">Data insights reports</span>
          <div className="flex gap-2">
            {/* Dropdown เลือกเดือน */}
            <select 
              name="month"
              value={tempFilters.month}
              onChange={handleTempFilterChange}
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
              onChange={handleTempFilterChange}
              className="bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#1DB954] cursor-pointer"
            >
              <option value="0">All Years</option>
              {[2020,2021,2022,2023,2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button 
              onClick={handleSearchClick}
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
          <button  onClick={handleExportCSV} className="bg-transparent border border-[#444] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#252525] transition-all">
            Export CSV
          </button>
          <button
            onClick={() => handleExportPDF(tempFilters, data, formatNumber)}
            className="bg-[#1DB954] text-black px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-transform active:scale-95"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
         { label: "total streams", value: formatNumber(stats?.total_streams), icon: <Icons.Play />, change: stats?.streams_change },
        { label: "active users",  value: formatNumber(stats?.active_users),  icon: <Icons.Users />, change: stats?.users_change },
        { label: "avg.rating",    value: stats?.avg_rating || "0.0",          icon: <Icons.Star />,  change: stats?.rating_change },
        { label: "total saves",   value: formatNumber(stats?.total_saves),   icon: <Icons.Heart />, change: stats?.saves_change },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 shadow-xl hover:bg-[#252525] transition-colors">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4">
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
              <span className={`text-xs font-bold ${Number(stat.change) >= 0 ? "text-[#1DB954]" : "text-red-500"}`}>
                {stat.change ? (Number(stat.change) >= 0 ? `+${stat.change}%` : `${stat.change}%`) : "+0.0%"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* User Countries */}
        <div className="col-span-4 bg-[#1e1e1e] p-7 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Icons.Globe />
            <h3 className="font-bold text-lg">User Countries</h3>
          </div>
          <div className="space-y-5">
            {countries?.map((c, i) => (
              <div key={i} className="flex justify-between items-center group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                  <span className="text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{c.name}</span>
                </div>
                <span className="text-sm font-mono font-bold text-gray-400">{formatNumber(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement */}
        <div className="col-span-8 bg-[#1e1e1e] p-7 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full border border-gray-500" />
              <div className="w-5 h-5 rounded-full border border-gray-500" />
            </div>
            <h3 className="font-bold text-lg">Top Albums Engagement</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#2a2a2a] p-7 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">best rating</p>
              <h4 className="text-2xl font-bold text-white mb-2 truncate">{engagement?.best_rating_name || "No Data"}</h4>
              <div className="flex items-center gap-2 text-3xl font-black text-white">
                {engagement?.best_rating_score || "0.0"} <Icons.Star filled />
              </div>
            </div>
            <div className="bg-[#2a2a2a] p-7 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">best saved</p>
              <h4 className="text-2xl font-bold text-white mb-2 truncate">{engagement?.best_saved_name || "No Data"}</h4>
              <p className="text-[#1DB954] text-2xl font-black drop-shadow-[0_0_10px_rgba(29,185,84,0.3)]">
                {Number(engagement?.best_saved_count || 0).toLocaleString()} Saves
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}