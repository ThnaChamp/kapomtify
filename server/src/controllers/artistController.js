const db = require("../db/pool");

const getAllArtists = async (req, res) => {
    try {
        const { search, type, gender } = req.query; 
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        let conditions = [];
        let queryParams = [];

        if (search) {
            queryParams.push(`%${search}%`);
            conditions.push(`(artist_name ILIKE $${queryParams.length} OR artist_code ILIKE $${queryParams.length})`);
        }

        if (type) {
            queryParams.push(type);
            conditions.push(`type = $${queryParams.length}`);
        }

        if (gender) {
            queryParams.push(gender);
            conditions.push(`gender = $${queryParams.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : "";

        const query = `
            SELECT artist_id, artist_code, artist_name, profile_image_url, type, gender 
            FROM artist 
            ${whereClause}
            ORDER BY artist_id ASC 
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
        `;

        const countQuery = `SELECT COUNT(*) FROM artist ${whereClause};`;

        const [artistRes, countRes] = await Promise.all([
            db.query(query, [...queryParams, limit, offset]),
            db.query(countQuery, queryParams)
        ]);
        
        const totalItems = parseInt(countRes.rows[0].count);
        res.status(200).json({
            data: artistRes.rows,
            pagination: { 
                currentPage: page, 
                totalPages: Math.ceil(totalItems / limit) || 1, 
                totalItems 
            }
        });
    } catch (err) {
        console.error("🔥 Error at getAllArtists:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getArtistDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const artistQuery = `SELECT * FROM artist WHERE artist_id = $1;`;
        const artistRes = await db.query(artistQuery, [id]);
        if (artistRes.rows.length === 0) return res.status(404).json({ error: "Artist not found" });

        const albumCountQuery = `SELECT COUNT(*) FROM album WHERE artist_id = $1;`;
        const albumCountRes = await db.query(albumCountQuery, [id]);
        const totalAlbums = parseInt(albumCountRes.rows[0].count);

        const topSongsQuery = `
            SELECT m.title, m.play_count 
            FROM music m
            JOIN music_artist ma ON m.music_id = ma.music_id
            WHERE ma.artist_id = $1
            ORDER BY m.play_count DESC
            LIMIT 6;
        `;
        const topSongsRes = await db.query(topSongsQuery, [id]);

        const albumsQuery = `
            SELECT album_name, EXTRACT(YEAR FROM release_date) AS release_year 
            FROM album 
            WHERE artist_id = $1
            ORDER BY release_date DESC;
        `;
        const albumsRes = await db.query(albumsQuery, [id]);

        const data = {
            ...artistRes.rows[0],
            total_albums: totalAlbums,
            top_songs: topSongsRes.rows,
            albums: albumsRes.rows
        };

        res.status(200).json(data);
    } catch (err) {
        console.error("Error at getArtistDetail:", err);
        res.status(500).json({ error: "Server error" });
    }
};

const createArtist = async (req, res) => {
    // 1. เชื่อมต่อ Client สำหรับ Transaction
    const client = await db.connect();

    const { 
        artist_name, debut_year, verified_status, 
        profile_image_url, bio, type, gender 
    } = req.body;

    try {
        await client.query('BEGIN'); // เริ่ม Transaction

        // 2. เตรียมข้อมูลเบื้องต้น
        const isVerifiedBool = verified_status === 'Yes' || verified_status === true;
        const finalDebutYear = debut_year && String(debut_year).trim() !== '' ? debut_year : null;
        const finalGender = gender && String(gender).trim() !== '' ? gender : null; 
        const finalType = type ? type : 'Solo';

        // 3. INSERT ข้อมูลโดยเว้น artist_code ไว้ (ให้ DB รัน ID ให้ก่อน)
        const insertQuery = `
            INSERT INTO artist (artist_name, debut_year, verified_status, profile_image_url, bio, type, gender) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING artist_id;
        `;
        
        const insertValues = [
            artist_name, finalDebutYear, isVerifiedBool, 
            profile_image_url, bio, finalType, finalGender
        ];
        
        const result = await client.query(insertQuery, insertValues);
        const newArtistId = result.rows[0].artist_id;

        // 4. ✅ สร้าง Code จาก ID (เช่น ART-12)
        const generatedCode = `ART-${newArtistId}`;

        // 5. UPDATE รหัสกลับเข้าไปที่แถวเดิม
        await client.query(
            `UPDATE artist SET artist_code = $1 WHERE artist_id = $2`,
            [generatedCode, newArtistId]
        );

        await client.query('COMMIT'); // บันทึกข้อมูลลง DB จริง

        res.status(201).json({ 
            message: "Artist created successfully", 
            artist_code: generatedCode,
            artist_id: newArtistId 
        });

    } catch (err) {
        await client.query('ROLLBACK'); // ถ้าพังให้ยกเลิกทั้งหมด
        console.error("Create Artist Error:", err.message);
        res.status(500).json({ error: "Create failed: " + err.message });
    } finally {
        client.release(); // คืน Connection ให้ Pool
    }
};
const updateArtist = async (req, res) => {
    const { id } = req.params;
    const { artist_code, artist_name, debut_year, verified_status, profile_image_url, bio } = req.body;
    try {
        const query = `
            UPDATE artist 
            SET artist_code=$1, artist_name=$2, debut_year=$3, verified_status=$4, profile_image_url=$5, bio=$6 
            WHERE artist_id=$7 RETURNING *;
        `;
        
        const isVerifiedBool = verified_status === 'Yes' || verified_status === true;
        const finalDebutYear = debut_year && debut_year.trim() !== '' ? debut_year : null;
        
        const values = [artist_code, artist_name, finalDebutYear, isVerifiedBool, profile_image_url, bio, id];
        await db.query(query, values);
        
        res.status(200).json({ message: "Artist updated successfully!" });
    } catch (err) {
        console.error("Update Artist Error:", err.message);
        res.status(500).json({ error: "Update failed" });
    }
};

// --- แก้ไขฟังก์ชัน deleteArtist ให้จัดการข้อมูลที่เกี่ยวข้องกันก่อนลบ ---
const deleteArtist = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect(); // ใช้ Transaction เพื่อความปลอดภัย
    try {
        await client.query('BEGIN');
        
        // 1. เคลียร์ข้อมูลที่ศิลปินคนนี้ไปเกี่ยวข้องในตารางต่างๆ (ที่ลบได้โดยไม่กระทบโครงสร้างหลัก)
        await client.query(`DELETE FROM library_artist WHERE artist_id = $1`, [id]);
        await client.query(`DELETE FROM music_artist WHERE artist_id = $1`, [id]);

        // 2. ลองลบตัวศิลปิน
        const result = await client.query(`DELETE FROM artist WHERE artist_id = $1`, [id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "ไม่พบศิลปินที่ต้องการลบ" });
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "ลบศิลปินเรียบร้อยแล้ว" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Delete Artist Error:", err.message);
        
        // ดัก Error code 23503 คือ Foreign Key Violation (เช่น ศิลปินนี้ยังมีอัลบั้มอยู่)
        if (err.code === '23503') {
            res.status(400).json({ error: "ไม่สามารถลบได้ เนื่องจากศิลปินนี้ยังมีอัลบั้มเพลงผูกอยู่ กรุณาลบอัลบั้มก่อน" });
        } else {
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบศิลปิน" });
        }
    } finally {
        client.release();
    }
};

module.exports = { getAllArtists, getArtistDetail, createArtist, updateArtist, deleteArtist };