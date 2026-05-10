import React, { useState, useEffect, useCallback } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4567") + "/api";

const STATUS_STYLE = {
  completed: { label: "SUCCESS",  color: "#1db954", border: "#1db954" },
  failed:    { label: "FAILED",   color: "#e05252", border: "#e05252" },
  pending:   { label: "PENDING",  color: "#e0c452", border: "#e0c452" },
  refunded:  { label: "REFUNDED", color: "#888",    border: "#888"    },
};

const PAYMENT_SVG = {
  "Bank Transfers": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  "Mobile Payments": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
    </svg>
  ),
  "Credit card": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  "Debit card": (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const key = (status || "").toLowerCase();
  const s = STATUS_STYLE[key] || STATUS_STYLE.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      color: s.color, border: `1.5px solid ${s.border}`,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Detail Panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ transactionId, currency, onRefund }) => {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/transactions/${transactionId}/detail`)
      .then((r) => r.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [transactionId]);

  const cur = currency || "THB";

  const handleViewInvoice = () => {
    window.open(`${API_BASE}/transactions/${transactionId}/invoice`, "_blank");
  };

  const handleRefund = async () => {
    if (!window.confirm("ยืนยันการ Refund Transaction นี้?")) return;
    setRefunding(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/${transactionId}/refund`, { method: "PATCH" });
      if (!res.ok) throw new Error("Refund ไม่สำเร็จ");
      onRefund && onRefund();
    } catch (err) {
      alert(err.message);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div style={{ background: "#0d0d0d", borderTop: "1px solid #222", padding: "18px 24px 20px 56px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        {/* Table */}
        <div style={{ flex: 1 }}>
          <p style={{ color: "#aaa", fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: "0.07em" }}>
            TRANSACTION DETAIL (ITEM)
          </p>
          {loading ? (
            <p style={{ color: "#555", fontSize: 12 }}>กำลังโหลด...</p>
          ) : rows.length === 0 ? (
            <p style={{ color: "#555", fontSize: 12 }}>ไม่มีรายละเอียด</p>
          ) : (
            <table style={{ borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  {["Plan code","Plan description","Unit Price","Qty","Period covered"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: 11, color: "#666", fontWeight: 600, padding: "0 20px 8px 0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px 20px 6px 0", fontSize: 12, color: "#ccc" }}>{r.plan_code || "—"}</td>
                    <td style={{ padding: "6px 20px 6px 0", fontSize: 12, color: "#ccc" }}>{r.plan_description || "—"}</td>
                    <td style={{ padding: "6px 20px 6px 0", fontSize: 12, color: "#ccc" }}>{r.unit_price}{cur}</td>
                    <td style={{ padding: "6px 20px 6px 0", fontSize: 12, color: "#ccc" }}>{r.quantity}</td>
                    <td style={{ padding: "6px 0 6px 0", fontSize: 12, color: "#ccc" }}>
                      {r.period_covered ? String(r.period_covered).slice(0,10) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
          <button
            onClick={handleViewInvoice}
            style={{
              background: "#1a1a1a", color: "#d4d4d4",
              border: "1px solid #444", borderRadius: 7,
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#888")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#444")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            View Invoice PDF
          </button>

          <button
            onClick={handleRefund}
            disabled={refunding}
            style={{
              background: "transparent", color: "#e05252",
              border: "1.5px solid #e05252", borderRadius: 7,
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              cursor: refunding ? "default" : "pointer", whiteSpace: "nowrap",
              opacity: refunding ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}
            onMouseEnter={(e) => !refunding && (e.currentTarget.style.background = "#2a0a0a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            {refunding ? "กำลัง Refund..." : "Refund This Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ target, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
    <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "28px 32px", width: 340, textAlign: "center" }}>
      <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>ลบ Transaction นี้?</p>
      <p style={{ color: "#888", fontSize: 12, marginBottom: 24 }}>{target?.transactions_code || `#${target?.transaction_id}`} จะถูกลบถาวร</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onCancel} style={{ background: "#2a2a2a", color: "#ccc", border: "1px solid #444", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>ยกเลิก</button>
        <button onClick={onConfirm} style={{ background: "#e05252", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>ลบเลย</button>
      </div>
    </div>
  </div>
);

const PagBtn = ({ children, active, disabled, onClick }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: active ? "#1db954" : "#1a1a1a", color: active ? "#000" : "#888",
    border: "1px solid #2a2a2a", borderRadius: 6,
    fontSize: 13, fontWeight: active ? 700 : 400,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1,
  }}>{children}</button>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ page });
      if (search)       p.append("search", search);
      if (statusFilter) p.append("status", statusFilter);
      const res  = await fetch(`${API_BASE}/transactions?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTransactions(json.data || []);
      setPagination(json.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/${deleteTarget.transaction_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`ลบ ${deleteTarget.transactions_code || "#" + deleteTarget.transaction_id} เรียบร้อยแล้ว`);
      setExpandedId(null);
      fetchData(pagination.currentPage);
    } catch (err) {
      showToast("ลบไม่สำเร็จ: " + err.message, "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRefundDone = () => {
    showToast("Refund สำเร็จแล้ว");
    fetchData(pagination.currentPage);
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const TH = ({ children }) => (
    <th style={{
      padding: "14px 20px", textAlign: "left",
      fontSize: 11, color: "#888", fontWeight: 600,
      letterSpacing: "0.08em", borderBottom: "1px solid #2a2a2a", whiteSpace: "nowrap",
    }}>{children}</th>
  );

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", fontFamily: "inherit" }}>

      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 24, zIndex: 1000,
          background: toast.type === "error" ? "#3a1010" : "#0f2e1a",
          color: toast.type === "error" ? "#e05252" : "#1db954",
          border: `1px solid ${toast.type === "error" ? "#e0525244" : "#1db95444"}`,
          borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px #0008",
        }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 600, margin: "0 0 20px", letterSpacing: "-0.01em" }}>
        Transaction
      </h1>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
            placeholder="Search..."
            style={{
              width: 220, padding: "8px 12px 8px 32px",
              background: "transparent", border: "1px solid #333",
              borderRadius: 7, color: "#d4d4d4", fontSize: 13, outline: "none",
            }}
          />
        </div>
        <button onClick={() => fetchData(1)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", background: "transparent",
          border: "1px solid #333", borderRadius: 7,
          color: "#ccc", fontSize: 13, cursor: "pointer",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filter
        </button>
        <div style={{ flex: 1 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{
          padding: "8px 14px", background: "transparent",
          border: "1px solid #333", borderRadius: 7,
          color: statusFilter ? "#d4d4d4" : "#888", fontSize: 13,
          outline: "none", cursor: "pointer",
        }}>
          <option value="">All Status</option>
          <option value="completed">SUCCESS</option>
          <option value="failed">FAILED</option>
          <option value="pending">PENDING</option>
          <option value="refunded">REFUNDED</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 13 }}>กำลังโหลด...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#e05252", fontSize: 13 }}>⚠ {error}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a1a1a" }}>
                <TH>#</TH>
                <TH>CODE</TH>
                <TH>CREATE AT</TH>
                <TH>USER</TH>
                <TH>PAYMENT METHOD</TH>
                <TH>AMOUNT</TH>
                <TH>STATUS</TH>
                <th style={{ padding: "14px 20px", borderBottom: "1px solid #2a2a2a" }}></th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "56px 0", color: "#444", fontSize: 13 }}>ไม่พบข้อมูล</td></tr>
              ) : transactions.map((tx, i) => {
                const rowNo  = (pagination.currentPage - 1) * 10 + i + 1;
                const isOpen = expandedId === tx.transaction_id;
                const isEven = i % 2 === 1;
                const rowBg  = isEven ? "#141414" : "#111";

                return (
                  <React.Fragment key={tx.transaction_id}>
                    <tr
                      style={{ background: isOpen ? "#1a1a1a" : rowBg, transition: "background .1s", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                      onMouseLeave={(e) => !isOpen && (e.currentTarget.style.background = rowBg)}
                      onClick={() => toggleExpand(tx.transaction_id)}
                    >
                      <td style={{ padding: "16px 20px", fontSize: 14, color: "#666", fontWeight: 600, borderBottom: isOpen ? "none" : "1px solid #222", width: 40 }}>{rowNo}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#fff", fontWeight: 600, borderBottom: isOpen ? "none" : "1px solid #222" }}>
                        {tx.transactions_code || `TX-${String(tx.transaction_id).padStart(4,"0")}`}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#aaa", borderBottom: isOpen ? "none" : "1px solid #222" }}>{fmtDate(tx.transaction_date)}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#d4d4d4", borderBottom: isOpen ? "none" : "1px solid #222" }}>{tx.display_name || tx.username || "—"}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#d4d4d4", borderBottom: isOpen ? "none" : "1px solid #222" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#bbb" }}>
                          <span style={{ opacity: 0.55 }}>{PAYMENT_SVG[tx.payment_method]}</span>
                          {tx.payment_method || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#fff", fontWeight: 600, borderBottom: isOpen ? "none" : "1px solid #222", whiteSpace: "nowrap" }}>
                        {tx.amount || 0} {tx.currency || "THB"}
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: isOpen ? "none" : "1px solid #222" }}>
                        <StatusBadge status={tx.status} />
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: isOpen ? "none" : "1px solid #222", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(tx); }}
                            style={{
                              background: "transparent", color: "#e05252",
                              border: "1px solid #333", borderRadius: 6,
                              padding: "4px 12px", fontSize: 12, cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e05252")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
                          >Delete</button>
                          <span style={{ color: "#555" }}><Chevron open={isOpen} /></span>
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ background: "#0d0d0d" }}>
                        <td colSpan={8} style={{ padding: 0, borderBottom: "1px solid #2a2a2a" }}>
                          <DetailPanel
                            transactionId={tx.transaction_id}
                            currency={tx.currency}
                            onRefund={handleRefundDone}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 16 }}>
        <PagBtn disabled={pagination.currentPage === 1} onClick={() => fetchData(pagination.currentPage - 1)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </PagBtn>
        {Array.from({ length: pagination.totalPages }, (_, k) => k + 1)
          .filter((p) => Math.abs(p - pagination.currentPage) <= 2)
          .map((p) => (
            <PagBtn key={p} active={p === pagination.currentPage} onClick={() => fetchData(p)}>{p}</PagBtn>
          ))}
        <PagBtn disabled={pagination.currentPage === pagination.totalPages} onClick={() => fetchData(pagination.currentPage + 1)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </PagBtn>
      </div>

      {deleteTarget && (
        <ConfirmModal target={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default Transaction;
