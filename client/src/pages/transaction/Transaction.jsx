import React, { useState, useEffect, useCallback } from "react";
import SearchBox from "../../components/searchBox";
import FilterBtn from "../../components/filterBtn";
import DeleteModal from "../../components/DeleteModal";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4567") + "/api";

const STATUS_CONFIG = {
  completed: { label: "SUCCESS",  bg: "bg-[#1db954]/10", text: "text-[#1db954]", border: "border-[#1db954]/20", dot: "bg-[#1db954]" },
  failed:    { label: "FAILED",   bg: "bg-[#e05252]/10", text: "text-[#e05252]", border: "border-[#e05252]/20", dot: "bg-[#e05252]" },
  pending:   { label: "PENDING",  bg: "bg-[#e0c452]/10", text: "text-[#e0c452]", border: "border-[#e0c452]/20", dot: "bg-[#e0c452]" },
  refunded:  { label: "REFUNDED", bg: "bg-gray-500/10",  text: "text-gray-400",  border: "border-gray-500/20",  dot: "bg-gray-400"  },
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
  const s = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>
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
    <div className="bg-[#141414] border-t border-[#2a2a2a] px-14 py-5">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        {/* Table */}
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
          <p className="text-[#8e8e8e] text-[11px] font-bold uppercase tracking-[0.1em] mb-4">
            Transaction Detail (Items)
          </p>
          {loading ? (
            <p className="text-gray-500 text-xs animate-pulse">Loading detail...</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-500 text-xs">No detail available</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Plan code</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Unit Price</th>
                  <th className="pb-3 pr-4">Qty</th>
                  <th className="pb-3">Period covered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {rows.map((r, i) => (
                  <tr key={i} className="text-xs text-gray-300">
                    <td className="py-2.5 pr-4 font-medium">{r.plan_code || "—"}</td>
                    <td className="py-2.5 pr-4">{r.plan_description || "—"}</td>
                    <td className="py-2.5 pr-4">{r.unit_price} {cur}</td>
                    <td className="py-2.5 pr-4">{r.quantity}</td>
                    <td className="py-2.5">
                      {r.period_covered ? String(r.period_covered).slice(0,10) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 min-w-[160px] w-full lg:w-auto mt-4 lg:mt-0">
          <button
            onClick={handleViewInvoice}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#252525] border border-[#444] rounded-md text-xs font-semibold text-gray-300 hover:bg-[#333] hover:border-gray-500 transition-colors"
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
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[#e05252]/50 rounded-md text-xs font-semibold text-[#e05252] hover:bg-[#e05252]/10 hover:border-[#e05252] transition-colors ${refunding ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            {refunding ? "Refunding..." : "Refund This Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch]             = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);
  const userRole = localStorage.getItem('userRole');
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ page });
      if (searchQuery)  p.append("search", searchQuery);
      if (statusFilter) p.append("status", statusFilter); 
      const res  = await fetch(`${API_BASE}/transactions?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTransactions(json.data || []);
      setPagination(json.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err) {
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => { fetchData(pagination.currentPage); }, [fetchData, pagination.currentPage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(search);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/${deleteTarget.transaction_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`Deleted ${deleteTarget.transactions_code || "#" + deleteTarget.transaction_id} successfully`);
      setExpandedId(null);
      fetchData(pagination.currentPage);
    } catch (err) {
      showToast("Delete failed: " + err.message, "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRefundDone = () => {
    showToast("Refund successful");
    fetchData(pagination.currentPage);
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-5 p-8 text-[#e0e0e0]">
      {toast && (
        <div className={`fixed top-8 right-8 z-[1100] flex items-center gap-3 px-6 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300 ${
          toast.type === "error" ? "bg-[#3a1010] border-red-500/30 text-red-500" : "bg-[#0f2e1a] border-[#1db954]/30 text-[#1db954]"
        }`}>
          <span className="text-lg font-bold">{toast.type === "error" ? "✕" : "✓"}</span>
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <SearchBox 
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, currentPage: 1 })); }}
              className="appearance-none bg-[#242424] border border-[#444] rounded-md py-1.5 pl-4 pr-10 text-sm text-gray-300 outline-none cursor-pointer focus:border-[#1DB954]"
            >
              <option value="">All Status</option>
              <option value="completed">SUCCESS</option>
              <option value="failed">FAILED</option>
              <option value="pending">PENDING</option>
              <option value="refunded">REFUNDED</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>

          <FilterBtn onClick={() => { setSearchQuery(search); setPagination(prev => ({ ...prev, currentPage: 1 })); }} />
        </div>
      </div>

      {/* Table container */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#333]">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Create At</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[72px]">
                    <td colSpan="8" className="px-6 py-4"><div className="h-4 bg-[#333] rounded w-full"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan="8" className="px-6 py-20 text-center text-red-500 text-sm">⚠ {error}</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-20 text-center text-gray-500 text-sm italic">No transactions found</td></tr>
              ) : (
                transactions.map((tx, i) => {
                  const rowNo  = (pagination.currentPage - 1) * 10 + i + 1;
                  const isOpen = expandedId === tx.transaction_id;

                  return (
                    <React.Fragment key={tx.transaction_id}>
                      <tr
                        className={`group hover:bg-[#2a2a2a] transition-colors cursor-pointer h-[72px] ${isOpen ? "bg-[#252525]" : ""}`}
                        onClick={() => toggleExpand(tx.transaction_id)}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-500">{rowNo}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors">
                            {tx.transactions_code || `TX-${String(tx.transaction_id).padStart(4,"0")}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">{fmtDate(tx.transaction_date).split('T')[0]}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-semibold">{tx.display_name || tx.username || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5 text-sm text-gray-400">
                            <span className="opacity-60">{PAYMENT_SVG[tx.payment_method]}</span>
                            {tx.payment_method || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white">
                            {tx.amount?.toLocaleString() || 0} <span className="text-[10px] text-gray-500 ml-0.5">{tx.currency || "THB"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(tx); }}
                              className="px-3 py-1.5 bg-[#252525] border border-[#444] rounded text-[11px] font-bold text-[#e05252] opacity-0 group-hover:opacity-100 hover:bg-[#333] hover:border-[#e05252] transition-all"
                            >Delete</button>
                            <span className="text-gray-600 group-hover:text-gray-400 transition-colors"><Chevron open={isOpen} /></span>
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan="8" className="p-0 border-b border-[#2a2a2a]">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-3 pb-8 pr-2">
        <button 
          disabled={pagination.currentPage === 1}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${
            pagination.currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"
          }`}
        >
          ‹
        </button>
        {Array.from({ length: pagination.totalPages }, (_, k) => k + 1)
          .filter((p) => Math.abs(p - pagination.currentPage) <= 2 || p === 1 || p === pagination.totalPages)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx-1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && <span className="text-gray-600 mx-1">...</span>}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: p }))}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                    p === pagination.currentPage 
                      ? "bg-[#1DB954] border-[#1DB954] text-black scale-105 shadow-[0_0_15px_rgba(29,185,84,0.3)]"
                      : "bg-transparent border-[#444] text-gray-400 hover:border-gray-200 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}
        <button 
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, pagination.totalPages) }))}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#444] transition-colors ${
            pagination.currentPage === pagination.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-[#333] text-gray-300"
          }`}
        >
          »
        </button>
      </div>

      {deleteTarget && (
        <DeleteModal 
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Transaction?"
          targetName={deleteTarget?.transactions_code || `#${deleteTarget?.transaction_id}`}
        />
      )}
    </div>
  );
};

export default Transaction;

