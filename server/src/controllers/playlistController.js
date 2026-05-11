const db = require("../db/pool");

const getAllPlaylists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const query = `
            SELECT
                p.playlist_id,
                p.playlist_code,
                p.name,
                p.is_public,
                p.cover_image_url,
                p.create_at,
                u.username,
                COUNT(pi.music_id) AS total_music
            FROM playlist p
            LEFT JOIN users u ON p.user_id = u.user_id
            LEFT JOIN playlist_items pi ON p.playlist_id = pi.playlist_id
            GROUP BY p.playlist_id, u.username
            ORDER BY p.playlist_id ASC
            LIMIT $1 OFFSET $2;
        `;
        const countQuery = `SELECT COUNT(*) FROM playlist;`;

        const [playlistRes, countRes] = await Promise.all([
            db.query(query, [limit, offset]),
            db.query(countQuery)
        ]);

        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: playlistRes.rows,
            pagination: { currentPage: page, totalPages, totalItems }
        });
    } catch (err) {
        console.error("Error at getAllPlaylists:", err.message);
        res.status(500).json({ error: "Server error while fetching playlists" });
    }
};

const getPlaylistDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const playlistQuery = `
            SELECT
                p.playlist_id,
                p.playlist_code,
                p.user_id,
                p.name,
                p.description,
                p.is_public,
                p.cover_image_url,
                p.create_at,
                u.username,
                COUNT(pi.music_id) AS total_music
            FROM playlist p
            LEFT JOIN users u ON p.user_id = u.user_id
            LEFT JOIN playlist_items pi ON p.playlist_id = pi.playlist_id
            WHERE p.playlist_id = $1
            GROUP BY p.playlist_id, u.username;
        `;

        const itemsQuery = `
            SELECT
                pi.sequence_no,
                m.music_code,
                m.title,
                pi.added_at,
                string_agg(DISTINCT g.genre_name, ', ') AS genre_names
            FROM playlist_items pi
            JOIN music m ON pi.music_id = m.music_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            WHERE pi.playlist_id = $1
            GROUP BY pi.sequence_no, m.music_code, m.title, pi.added_at
            ORDER BY pi.sequence_no ASC;
        `;

        const [playlistRes, itemsRes] = await Promise.all([
            db.query(playlistQuery, [id]),
            db.query(itemsQuery, [id])
        ]);

        if (playlistRes.rows.length === 0) {
            return res.status(404).json({ error: "ไม่พบ Playlist นี้" });
        }

        res.status(200).json({ ...playlistRes.rows[0], items: itemsRes.rows });
    } catch (err) {
        console.error("Error at getPlaylistDetail:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const createPlaylist = async (req, res) => {
    // 1. ดึง Client ออกมาเพื่อทำ Transaction
    const client = await db.connect();
    
    const { user_id, name, description, is_public, cover_image_url } = req.body;

    try {
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !user_id) {
            return res.status(400).json({ error: "กรุณาระบุชื่อ Playlist และ User ID" });
        }

        await client.query('BEGIN'); // เริ่มต้น Transaction

        // 2. INSERT ข้อมูล Playlist (เว้น playlist_code ไว้ก่อน)
        const insertQuery = `
            INSERT INTO playlist (user_id, name, description, is_public, cover_image_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING playlist_id;
        `;
        const result = await client.query(insertQuery, [
            user_id, 
            name, 
            description || null, 
            is_public !== undefined ? is_public : true, 
            cover_image_url || null
        ]);

        const newPlaylistId = result.rows[0].playlist_id;

        // 3. ✅ สร้าง Code อัตโนมัติ (เช่น PL-1, PL-2)
        const generatedCode = `PL-${newPlaylistId}`;

        // 4. UPDATE รหัสกลับเข้าไปที่แถวเดิม
        const updateQuery = `UPDATE playlist SET playlist_code = $1 WHERE playlist_id = $2`;
        await client.query(updateQuery, [generatedCode, newPlaylistId]);

        await client.query('COMMIT'); // ยืนยันการบันทึกข้อมูล

        res.status(201).json({ 
            message: "สร้าง Playlist เรียบร้อยแล้ว!", 
            playlist_code: generatedCode 
        });

    } catch (err) {
        await client.query('ROLLBACK'); // ยกเลิกหากพัง
        console.error("Error at createPlaylist:", err.message);
        res.status(500).json({ error: "Failed to create playlist: " + err.message });
    } finally {
        client.release(); // คืน Connection
    }
};

const deletePlaylist = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM playlist_items WHERE playlist_id = $1', [id]);
        await client.query('DELETE FROM library_playlist WHERE playlist_id = $1', [id]);
        const result = await client.query('DELETE FROM playlist WHERE playlist_id = $1', [id]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "ไม่พบ Playlist ที่ต้องการลบ" });
        }
        await client.query('COMMIT');
        res.status(200).json({ message: "ลบ Playlist เรียบร้อยแล้ว" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Delete Playlist Error:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบ Playlist" });
    } finally {
        client.release();
    }
};

module.exports = { getAllPlaylists, getPlaylistDetail, createPlaylist, deletePlaylist };
