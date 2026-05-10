const db = require("../db/pool");


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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*)
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      ${whereClause}
    `;
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
    u.display_name
  FROM transactions t
  LEFT JOIN users u ON t.user_id = u.user_id
  ${whereClause}
  ORDER BY t.transaction_id ASC
  LIMIT $${limitIdx} OFFSET $${offsetIdx}
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
    console.error("Error at getAllTransactions:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/:id — single transaction detail
const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        t.transaction_id,
        t.transactions_code,
        t.transaction_date,
        t.status,
        t.payment_method,
        t.currency,
        u.username,
        u.display_name,
        sp.plan_name,
        sp.price,
        td.unit_price,
        td.quantity
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN transaction_detail td ON t.transaction_id = td.transaction_id
      LEFT JOIN subscription_plan sp ON td.plan_id = sp.plan_id
      WHERE t.transaction_id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ไม่พบ Transaction นี้" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error at getTransactionById:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM transaction_detail WHERE transaction_id = $1",
      [id]
    );
    const result = await client.query(
      "DELETE FROM transactions WHERE transaction_id = $1",
      [id]
    );
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

module.exports = { getAllTransactions, getTransactionById, deleteTransaction };
