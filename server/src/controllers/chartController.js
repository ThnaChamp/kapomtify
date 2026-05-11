const db = require("../db/pool");

const getAllCharts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 10;
        const offset = (page - 1) * limit;
        const searchParam = `%${search}%`;

        // ✅ ปรับปรุง Query: เพิ่มคอลัมน์ใน GROUP BY ให้ครบถ้วนตามมาตรฐาน SQL
        const query = `
            SELECT
                c.chart_id,
                c.chart_code,
                c.chart_name,
                c.description,
                c.chart_date,
                COUNT(mc.music_id)::INT AS total_music -- Cast เป็น INT เพื่อความชัวร์
            FROM chart c
            LEFT JOIN music_chart mc ON c.chart_id = mc.chart_id
            WHERE c.chart_name ILIKE $1 OR c.chart_code ILIKE $1
            GROUP BY 
                c.chart_id, 
                c.chart_code, 
                c.chart_name, 
                c.description, 
                c.chart_date
            ORDER BY c.chart_id ASC
            LIMIT $2 OFFSET $3;
        `;
        
        const countQuery = `
            SELECT COUNT(*) 
            FROM chart 
            WHERE chart_name ILIKE $1 OR chart_code ILIKE $1;
        `;

        const [chartRes, countRes] = await Promise.all([
            db.query(query, [searchParam, limit, offset]),
            db.query(countQuery, [searchParam])
        ]);

        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit) || 1;

        res.status(200).json({
            data: chartRes.rows,
            pagination: { 
                currentPage: page, 
                totalPages, 
                totalItems 
            }
        });
    } catch (err) {
        console.error("🔥 Error at getAllCharts:", err.message);
        res.status(500).json({ error: "Server error while fetching charts" });
    }
};

const getChartById = async (req, res) => {
    const { id } = req.params;
    try {
        const chartQuery = `
            SELECT chart_id, chart_code, chart_name, description, chart_date
            FROM chart WHERE chart_id = $1;
        `;
        const entriesQuery = `
            SELECT
                mc.music_id,
                mc.last_rank,
                mc.peak_rank,
                mc.entry_date,
                m.title,
                string_agg(DISTINCT a.artist_name, ', ') AS artist_names,
                string_agg(DISTINCT g.genre_name, ', ')  AS genre_names
            FROM music_chart mc
            JOIN music m ON mc.music_id = m.music_id
            LEFT JOIN music_artist ma ON m.music_id = ma.music_id
            LEFT JOIN artist a ON ma.artist_id = a.artist_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            WHERE mc.chart_id = $1
            GROUP BY mc.music_id, mc.last_rank, mc.peak_rank, mc.entry_date, m.title
            ORDER BY mc.last_rank ASC;
        `;

        const [chartRes, entriesRes] = await Promise.all([
            db.query(chartQuery, [id]),
            db.query(entriesQuery, [id])
        ]);

        if (chartRes.rows.length === 0) {
            return res.status(404).json({ error: "ไม่พบ Chart นี้" });
        }

        res.status(200).json({ ...chartRes.rows[0], entries: entriesRes.rows });
    } catch (err) {
        console.error("Error at getChartById:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const createChart = async (req, res) => {
    // 1. เชื่อมต่อ Client สำหรับทำ Transaction
    const client = await db.connect();

    // รับข้อมูลโดยไม่ต้องสนใจ chart_code จากหน้าบ้าน
    const { chart_name, description, chart_date } = req.body;

    try {
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!chart_name || !chart_date) {
            return res.status(400).json({ error: "กรุณากรอกชื่อ Chart และวันที่ให้ครบถ้วน" });
        }

        await client.query('BEGIN'); // เริ่มต้น Transaction

        // 2. INSERT ข้อมูล Chart (เว้น chart_code ไว้เป็น NULL ก่อน)
        const insertQuery = `
            INSERT INTO chart (chart_name, description, chart_date)
            VALUES ($1, $2, $3)
            RETURNING chart_id;
        `;
        const result = await client.query(insertQuery, [
            chart_name, 
            description || null, 
            chart_date || null
        ]);

        const newChartId = result.rows[0].chart_id;

        // 3. ✅ สร้าง Code อัตโนมัติ (เช่น CHR-1, CHR-2)
        const generatedCode = `CHR-${newChartId}`;

        // 4. UPDATE รหัสกลับเข้าไปที่แถวเดิม
        const updateQuery = `UPDATE chart SET chart_code = $1 WHERE chart_id = $2`;
        await client.query(updateQuery, [generatedCode, newChartId]);

        await client.query('COMMIT'); // ยืนยันการบันทึกข้อมูลทั้งหมด

        res.status(201).json({ 
            message: "สร้าง Chart เรียบร้อยแล้ว!", 
            chart_code: generatedCode 
        });

    } catch (err) {
        await client.query('ROLLBACK'); // ถ้าพังให้ยกเลิกสิ่งที่ทำมาทั้งหมด
        console.error("Error at createChart:", err.message);
        res.status(500).json({ error: "Failed to create chart: " + err.message });
    } finally {
        client.release(); // คืน Connection ให้กับ Pool
    }
};
const updateChart = async (req, res) => {
    const { id } = req.params;
    const { chart_code, chart_name, description, chart_date } = req.body;
    try {
        const query = `
            UPDATE chart
            SET chart_code = $1, chart_name = $2, description = $3, chart_date = $4
            WHERE chart_id = $5
            RETURNING chart_id;
        `;
        const result = await db.query(query, [chart_code || null, chart_name, description || null, chart_date || null, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบ Chart" });
        res.status(200).json({ message: "แก้ไข Chart เรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Error at updateChart:", err.message);
        res.status(500).json({ error: "Failed to update chart" });
    }
};

const deleteChart = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM music_chart WHERE chart_id = $1', [id]);
        const result = await client.query('DELETE FROM chart WHERE chart_id = $1', [id]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "ไม่พบ Chart ที่ต้องการลบ" });
        }
        await client.query('COMMIT');
        res.status(200).json({ message: "ลบ Chart เรียบร้อยแล้ว" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Delete Chart Error:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบ Chart" });
    } finally {
        client.release();
    }
};

const addMusicToChart = async (req, res) => {
    const { id } = req.params;
    const { music_id, last_rank, peak_rank, entry_date } = req.body;
    try {
        const query = `
            INSERT INTO music_chart (chart_id, music_id, last_rank, peak_rank, entry_date)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (chart_id, music_id) DO UPDATE
                SET last_rank = EXCLUDED.last_rank,
                    peak_rank = EXCLUDED.peak_rank,
                    entry_date = EXCLUDED.entry_date;
        `;
        await db.query(query, [id, music_id, last_rank, peak_rank || last_rank, entry_date || null]);
        res.status(201).json({ message: "เพิ่มเพลงใน Chart เรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Error at addMusicToChart:", err.message);
        res.status(500).json({ error: "Failed to add music to chart" });
    }
};

const removeMusicFromChart = async (req, res) => {
    const { id, musicId } = req.params;
    try {
        const result = await db.query('DELETE FROM music_chart WHERE chart_id = $1 AND music_id = $2', [id, musicId]);
        if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบเพลงในชาร์ตนี้" });
        res.status(200).json({ message: "ลบเพลงออกจาก Chart เรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Error at removeMusicFromChart:", err.message);
        res.status(500).json({ error: "Failed to remove music from chart" });
    }
};

module.exports = { getAllCharts, getChartById, createChart, updateChart, deleteChart, addMusicToChart, removeMusicFromChart };
