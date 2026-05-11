const db = require("../db/pool");

const getAllUsers = async (req, res) => {
    try {
        const { search, plan} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        let conditions =[];
        let queryParams = [];
        
        if (search) {
            queryParams.push(`%${search}%`);
            conditions.push(`(u.username ILIKE $${queryParams.length} OR u.user_code ILIKE $${queryParams.length})`);
        }

        if(plan) {
            queryParams.push(plan);
            conditions.push(`sp.plan_name = $${queryParams.length}`);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : "";

       const countParams = [...queryParams];

        queryParams.push(limit);
        const limitIdx = queryParams.length;
        queryParams.push(offset);
        const offsetIdx = queryParams.length;

        const userQuery = `
            SELECT
                u.user_id,
                u.user_code,
                u.username,
                u.display_name,
                u.email,
                u.profile_image_url,
                COALESCE(sp.plan_name, 'Free') AS plan_type,
                u.created_at
            FROM users u
            LEFT JOIN user_subscription us ON u.user_id = us.user_id AND us.status = 'active'
            LEFT JOIN subscription_plan sp ON us.plan_id = sp.plan_id
            ${whereClause}
            ORDER BY u.user_id ASC
            LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `;
        const countQuery = `
            SELECT COUNT(*)
            FROM users u
            LEFT JOIN user_subscription us ON u.user_id = us.user_id AND us.status = 'active'
            LEFT JOIN subscription_plan sp ON us.plan_id = sp.plan_id
            ${whereClause}
        `;

        const [userRes, countRes] = await Promise.all([
            db.query(userQuery, queryParams), // ใช้ queryParams ที่มีทั้ง filter + limit + offset
            db.query(countQuery, countParams)  // ใช้เฉพาะ filter params
        ]);
        const totalItems = parseInt(countRes.rows[0].count);

        res.status(200).json({
            data: userRes.rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit) || 1,
                totalItems: totalItems
            }
        });
    } catch (err) {
        console.error("Error at getAllUsers:", err.message);
        res.status(500).json({ error: err.message});
    }
};

const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT
                u.user_id, u.user_code, u.username, u.display_name, u.email, u.country, u.profile_image_url,
                COALESCE(sp.plan_name, 'Free') AS plan_type,
                (SELECT COUNT(*) FROM library_albums WHERE user_id = u.user_id) AS total_saved_albums,
                (SELECT COUNT(*) FROM library_artist WHERE user_id = u.user_id) AS total_followed_artists,
                (SELECT COUNT(*) FROM library_playlist WHERE user_id = u.user_id) AS total_playlists
            FROM users u
            LEFT JOIN user_subscription us ON u.user_id = us.user_id AND us.status = 'active'
            LEFT JOIN subscription_plan sp ON us.plan_id = sp.plan_id
            WHERE u.user_id = $1
        `;
        const result = await db.query(query,[id]);

        if ( result.rows.length === 0){
            return res.status(404).json({ error: "User not found"});
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error"});
    }
};
const getUserSavedAlbums = async (req,res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page -1) * limit;

        const query = `
                SELECT 
                    al.album_id,
                    al.album_name AS album,
                    al.cover_image_url AS cover,
                    ar.artist_name AS artist,
                    al.album_type AS type,
                    usa.added_at
                FROM library_albums usa
                JOIN album al ON usa.album_id = al.album_id
                JOIN artist ar ON al.artist_id = ar.artist_id
                WHERE usa.user_id = $1
                ORDER BY usa.added_at DESC
                LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [id, limit, offset]);
        res.status(200).json({ data: result.rows });
    }catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
};

const getUserStats = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT total_ablums, total_artists,total_playlists
            FROM librarys
            WHERE user_id = $1
        `;
        const result = await db.query(query,[id]);
        res.status(200).json(result.rows[0] || { total_albums: 0, total_artists: 0, total_playlists: 0});
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};
const getUserLibraryAlbums = async (req, res) =>  {
    try{
        const { id } = req.params;
        const query = `
            SELECT 
                la.lib_album_id,
                a.album_id,
                a.album_name,
                a.cover_image_url,
                art.artist_name,
                a.album_type as type,
                la.added_at as saved_at
            FROM library_albums la
            INNER JOIN album a ON la.album_id = a.album_id
            INNER JOIN artist art ON a.artist_id = art.artist_id
            WHERE la.user_id = $1
            ORDER BY la.added_at DESC
        `;
        const result = await db.query(query,[id]);
        res.status(200).json(result.rows);
    }catch (err){
        res.status(500).json({ error: err.message});
    }
};

const getUserLibraryArtists = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT
                lar.lib_artist_id,
                art.artist_id,
                art.artist_name AS album,
                art.profile_image_url AS cover,
                'Artist' AS artist,     
                'Music Artist' AS type,
                lar.followed_at as saved_at
            FROM library_artist lar
            JOIN artist art ON lar.artist_id = art.artist_id
            WHERE lar.user_id = $1
            ORDER By lar.followed_at DESC
        `;
        const result = await db.query(query,[id]);
        res.status(200).json(result.rows);
    } catch (err){
        res.status(500).json({ error: err.message});
    }
};
const getUserSubHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT
                us.subscription_id,
                sp.plan_name as album,
                us.start_date,
                us.end_date,
                us.status as type,
                us.start_date as saved_at
            FROM user_subscription us
            JOIN subscription_plan sp ON us.plan_id = sp.plan_id
            WHERE us.user_id = $1
            ORDER BY us.start_date DESC
        `;
        const result = await db.query(query,[id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};
const getUserLibraryPlaylists = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                lp.lib_playlist_id,
                p.playlist_id,
                p.name AS album,
                p.cover_image_url AS cover, -- **แก้ไขตรงนี้** ให้ตรงกับ Schema (cover_image_url)
                u.username AS artist,
                CASE WHEN lp.is_owner = TRUE THEN 'Owner' ELSE 'Saved' END AS type,
                lp.saved_at
            FROM library_playlist lp
            INNER JOIN playlist p ON lp.playlist_id = p.playlist_id
            INNER JOIN users u ON p.user_id = u.user_id
            WHERE lp.user_id = $1
            ORDER BY lp.saved_at DESC
        `;
        const result = await db.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("DEBUG ERROR PLAYLIST:", err.message);
        res.status(500).json({ error: err.message });
    }
};
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // --- ลบตามลำดับ "ลูก/หลาน" ไปหา "พ่อ" ---

        // 1. ประวัติการฟัง
        await client.query('DELETE FROM listen_history WHERE user_id = $1', [id]);

        // 2. รายละเอียดธุรกรรม (ต้องลบ detail ก่อน sub เพราะ detail ชี้ไปหา sub/trans)
        await client.query(`
            DELETE FROM transaction_detail 
            WHERE transaction_id IN (SELECT transaction_id FROM transactions WHERE user_id = $1)
        `, [id]);

        // 3. การสมัครสมาชิก
        await client.query('DELETE FROM user_subscription WHERE user_id = $1', [id]);

        // 4. ธุรกรรมการเงิน
        await client.query('DELETE FROM transactions WHERE user_id = $1', [id]);

        // 5. ข้อมูลในห้องสมุด (Library)
        await client.query('DELETE FROM library_albums WHERE user_id = $1', [id]);
        await client.query('DELETE FROM library_artist WHERE user_id = $1', [id]);
        await client.query('DELETE FROM library_playlist WHERE user_id = $1', [id]);
        await client.query('DELETE FROM librarys WHERE user_id = $1', [id]);

        // 6. Playlist (ลบเพลงในเพลย์ลิสต์ก่อน ถ้ามี)
        // ** ตรวจสอบชื่อตารางให้ดี ถ้าติด error "relation does not exist" ให้คอมเมนต์บรรทัดล่างทิ้ง **
        // await client.query(`DELETE FROM playlist_songs WHERE playlist_id IN (SELECT playlist_id FROM playlist WHERE user_id = $1)`, [id]);
        await client.query('DELETE FROM playlist WHERE user_id = $1', [id]);

        // 7. ลบตัว User เป็นลำดับสุดท้าย
        const result = await client.query('DELETE FROM users WHERE user_id = $1', [id]);

        if (result.rowCount === 0) {
            throw new Error("ไม่พบผู้ใช้งานที่ต้องการลบ");
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "ลบผู้ใช้งานสำเร็จ" });

    } catch (err) {
        // หากมีคำสั่งใดพัง ให้สั่ง ROLLBACK ทันทีเพื่อล้าง Error ใน Transaction Block
        await client.query('ROLLBACK');
        console.error("🔥 Error ตัวจริงคือบรรทัดนี้ ->", err.message);
        res.status(500).json({ error: "ลบไม่ได้: " + err.message });
    } finally {
        client.release();
    }
};
module.exports = { 
    getAllUsers,
    getUserDetail,
    getUserSavedAlbums,
    getUserLibraryArtists,
    getUserLibraryAlbums,
    getUserStats,
    getUserSubHistory,
    getUserLibraryPlaylists,
    deleteUser
};