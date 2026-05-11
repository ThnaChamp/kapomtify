const db = require("../db/pool");
const PDFDocument = require("pdfkit");

// GET /api/transactions
const getAllTransactions = async (req, res) => {
  try {
    const { search, status, page: rawPage = 1 } = req.query;
    const page = parseInt(rawPage);
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = [];
    let queryParams = [];

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(
        `(t.transactions_code ILIKE $${queryParams.length} OR u.username ILIKE $${queryParams.length} OR u.display_name ILIKE $${queryParams.length})`
      );
    }
    if (status) {
      queryParams.push(status);
      conditions.push(`t.status = $${queryParams.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countParams = [...queryParams];

    queryParams.push(limit);
    const limitIdx = queryParams.length;
    queryParams.push(offset);
    const offsetIdx = queryParams.length;

    const dataQuery = `
      SELECT
        t.transaction_id,
        t.transactions_code,
        t.transaction_date,
        t.status,
        t.payment_method,
        t.currency,
        u.username,
        u.display_name,
        COALESCE(SUM(td.unit_price * td.quantity), 0) AS amount
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN transaction_detail td ON t.transaction_id = td.transaction_id
      ${whereClause}
      GROUP BY t.transaction_id, u.username, u.display_name
      ORDER BY t.transaction_id ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT t.transaction_id)
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      ${whereClause}
    `;

    const [dataRes, countRes] = await Promise.all([
      db.query(dataQuery, queryParams),
      db.query(countQuery, countParams),
    ]);

    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.status(200).json({
      data: dataRes.rows,
      pagination: { currentPage: page, totalPages, totalItems },
    });
  } catch (err) {
    console.error("Error at getAllTransactions:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/:id/detail
const getTransactionDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        sp.plan_code,
        sp.plan_name AS plan_description,
        td.unit_price,
        td.quantity,
        td.period_covered
      FROM transaction_detail td
      LEFT JOIN subscription_plan sp ON td.plan_id = sp.plan_id
      WHERE td.transaction_id = $1
      ORDER BY td.detail_id ASC
    `;
    const result = await db.query(query, [id]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error at getTransactionDetail:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        t.transaction_id, t.transactions_code, t.transaction_date,
        t.status, t.payment_method, t.currency,
        u.username, u.display_name, u.email,
        sp.plan_name, sp.price, td.unit_price, td.quantity
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN transaction_detail td ON t.transaction_id = td.transaction_id
      LEFT JOIN subscription_plan sp ON td.plan_id = sp.plan_id
      WHERE t.transaction_id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "ไม่พบ Transaction นี้" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error at getTransactionById:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/transactions/:id/refund
const refundTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE transactions SET status = 'refunded' WHERE transaction_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบ Transaction" });
    res.status(200).json({ message: "Refund สำเร็จ", data: result.rows[0] });
  } catch (err) {
    console.error("Refund error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/:id/invoice — generate PDF
const getInvoicePDF = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch transaction header
    const txRes = await db.query(`
      SELECT
        t.transaction_id, t.transactions_code, t.transaction_date,
        t.status, t.payment_method, t.currency,
        u.display_name, u.username, u.email, u.country
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.transaction_id = $1
    `, [id]);

    if (txRes.rows.length === 0) return res.status(404).json({ error: "ไม่พบ Transaction" });
    const tx = txRes.rows[0];

    // Fetch detail rows
    const detailRes = await db.query(`
      SELECT sp.plan_code, sp.plan_name, td.unit_price, td.quantity, td.period_covered
      FROM transaction_detail td
      LEFT JOIN subscription_plan sp ON td.plan_id = sp.plan_id
      WHERE td.transaction_id = $1
      ORDER BY td.detail_id ASC
    `, [id]);
    const details = detailRes.rows;

    const currency = tx.currency || "THB";
    const total = details.reduce((sum, d) => sum + d.unit_price * d.quantity, 0);
    const txDate = tx.transaction_date ? new Date(tx.transaction_date).toLocaleString("th-TH") : "—";
    const txCode = tx.transactions_code || `TX-${String(id).padStart(4,"0")}`;

    // Build PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${txCode}.pdf"`);
    doc.pipe(res);

    // ── Header bar ────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill("#1db954");
    doc.fillColor("#000").fontSize(28).font("Helvetica-Bold")
      .text("KAPOMTIFY", 50, 25);
    doc.fillColor("#003a0f").fontSize(11).font("Helvetica")
      .text("Music Streaming Service", 50, 57);

    // INVOICE label (top right)
    doc.fillColor("#000").fontSize(22).font("Helvetica-Bold")
      .text("INVOICE", 0, 30, { align: "right" });
    doc.fontSize(10).font("Helvetica")
      .text(`# ${txCode}`, 0, 56, { align: "right" });

    doc.moveDown(3);

    // ── Billing info ─────────────────────────────────────────────────────
    const col1 = 50;
    const col2 = 320;
    let y = 110;

    doc.fillColor("#333").fontSize(9).font("Helvetica-Bold")
      .text("BILLED TO", col1, y)
      .text("INVOICE DETAILS", col2, y);

    y += 16;
    doc.font("Helvetica").fillColor("#000").fontSize(11)
      .text(tx.display_name || tx.username || "—", col1, y)
      .text(`Date:`, col2, y);
    doc.fillColor("#444")
      .text(txDate, col2 + 50, y);

    y += 16;
    doc.fillColor("#000")
      .text(tx.email || "—", col1, y)
      .text(`Status:`, col2, y);

    const statusColor = tx.status === "completed" ? "#1db954"
      : tx.status === "failed" ? "#e05252" : "#e0c452";
    doc.fillColor(statusColor).font("Helvetica-Bold")
      .text((tx.status || "—").toUpperCase(), col2 + 50, y);

    y += 16;
    doc.fillColor("#000").font("Helvetica")
      .text(tx.country || "—", col1, y)
      .text(`Payment:`, col2, y)
      .text(tx.payment_method || "—", col2 + 50, y);

    // ── Divider ───────────────────────────────────────────────────────────
    y += 36;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#1db954").lineWidth(2).stroke();

    // ── Table header ──────────────────────────────────────────────────────
    y += 14;
    doc.rect(50, y, 495, 24).fill("#f0fdf4");
    doc.fillColor("#1a6b35").fontSize(9).font("Helvetica-Bold")
      .text("PLAN", 60, y + 7)
      .text("DESCRIPTION", 160, y + 7)
      .text("UNIT PRICE", 320, y + 7)
      .text("QTY", 410, y + 7)
      .text("SUBTOTAL", 460, y + 7);

    // ── Table rows ────────────────────────────────────────────────────────
    y += 24;
    details.forEach((d, i) => {
      if (i % 2 === 1) doc.rect(50, y, 495, 28).fill("#f9fdf9");
      doc.fillColor("#111").fontSize(10).font("Helvetica")
        .text(d.plan_code || "—", 60, y + 8)
        .text(d.plan_name || "—", 160, y + 8)
        .text(`${d.unit_price} ${currency}`, 320, y + 8)
        .text(`${d.quantity}`, 415, y + 8)
        .text(`${d.unit_price * d.quantity} ${currency}`, 460, y + 8);

      if (d.period_covered) {
        y += 28;
        doc.fillColor("#888").fontSize(8)
          .text(`Period: ${String(d.period_covered).slice(0,10)}`, 160, y + 2);
      }
      y += 28;
    });

    // ── Total ─────────────────────────────────────────────────────────────
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#ddd").lineWidth(1).stroke();
    y += 14;
    doc.rect(380, y, 165, 30).fill("#1db954");
    doc.fillColor("#000").fontSize(11).font("Helvetica-Bold")
      .text("TOTAL", 390, y + 9)
      .text(`${total} ${currency}`, 460, y + 9);

    // ── Footer ────────────────────────────────────────────────────────────
    y += 60;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#eee").lineWidth(1).stroke();
    y += 12;
    doc.fillColor("#999").fontSize(8).font("Helvetica")
      .text("Thank you for subscribing to Kapomtify!", 50, y, { align: "center", width: 495 })
      .text("For support, contact support@kapomtify.com", 50, y + 14, { align: "center", width: 495 });

    doc.end();
  } catch (err) {
    console.error("Invoice PDF error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM transaction_detail WHERE transaction_id = $1", [id]);
    const result = await client.query("DELETE FROM transactions WHERE transaction_id = $1", [id]);
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "ไม่พบ Transaction ที่ต้องการลบ" });
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "ลบ Transaction เรียบร้อยแล้ว" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete Transaction Error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบ" });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTransactions,
  getTransactionDetail,
  getTransactionById,
  refundTransaction,
  getInvoicePDF,
  deleteTransaction,
};
