const db = require("../db/pool");

const getAllAlbums = async (req,res) => {
   try {
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;


    let whereClause = "";
    let albumParams = [];
    let countParams = [];

    if (search) {
      const searchKeyword = `%${search}%`;
      whereClause = `WHERE al.album_name ILIKE $1 OR al.album_code ILIKE $1`;
      
      // params สำหรับดึงข้อมูล: $1 = search, $2 = limit, $3 = offset
      albumParams = [searchKeyword, limit, offset];
      
      // params สำหรับนับจำนวน: $1 = search
      countParams = [searchKeyword];
    } else {
      // ✅ กรณีไม่มีการค้นหา
      whereClause = "";
      
      // params สำหรับดึงข้อมูล: $1 = limit, $2 = offset
      albumParams = [limit, offset];
      
      // params สำหรับนับจำนวน: (ไม่มีตัวแปร)
      countParams = [];
    }

    const limitIdx = search ? "$2" : "$1";
    const offsetIdx = search ? "$3" : "$2";

    const albumQuery = `
        SELECT
            al.album_id,
            al.album_code,
            al.album_name,
            al.cover_image_url,
            al.release_date,
            a.artist_name AS artist_names,
            COUNT(m.music_id)::int AS total_music
        FROM album al
        LEFT JOIN artist a ON al.artist_id = a.artist_id
        LEFT JOIN music m ON al.album_id = m.album_id
        ${whereClause}
        GROUP BY al.album_id, al.album_code, al.album_name, al.cover_image_url, al.release_date, a.artist_name
        ORDER BY al.album_id ASC
        LIMIT ${limitIdx} OFFSET ${offsetIdx};
    `;

    const countQuery = `SELECT COUNT(*) FROM album al ${whereClause};`;


    const [albumRes,countRes] = await Promise.all([
        db.query(albumQuery,albumParams),
        db.query(countQuery, countParams)
    ]);
    res.status(200).json({
        data: albumRes.rows,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit) ||1,
            totalItems: parseInt(countRes.rows[0].count)
        }
    });
   }catch (err) {
    console.error("Error at getAllAlbums:",err.message);
    res.status(500).json({ error: err.message });
   }
};

const createAlbum = async (req, res) => {
    // ใช้ Transaction เพื่อความปลอดภัย
    const client = await db.connect();

    try {
        const {
            album_name, // ตัด album_code ออกจากตัวเช็ค เพราะเราจะรันให้เอง
            artist_id,
            album_type,
            cover_image_url,
            release_date
        } = req.body;

        // เช็คแค่ฟิลด์ที่จำเป็นต้องส่งมาจากหน้าบ้านจริงๆ
        if(!album_name || !artist_id || !release_date) {
            return res.status(400).json({ error: "Missing required fields (Name, Artist, or Date)"});
        }

        await client.query('BEGIN'); // เริ่มต้น Transaction

        const query = `
            INSERT INTO album (
                album_name,
                artist_id,
                album_type,
                cover_image_url,
                release_date
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING album_id;
        `;
        
        const values = [
            album_name,
            artist_id,
            (album_type || 'album').toLowerCase(),
            cover_image_url || null,
            release_date
        ];

        // ✅ ต้องรัน Query ก่อน ถึงจะได้ result มาใช้
        const result = await client.query(query, values);
        const newAlbumId = result.rows[0].album_id;

        // ✅ สร้าง Code จาก ID ที่เพิ่งได้มา
        const generatedCode = `AB0${newAlbumId}`;

        // ✅ Update กลับไปที่ตาราง
        await client.query(
            `UPDATE album SET album_code = $1 WHERE album_id = $2`,
            [generatedCode, newAlbumId]
        );

        await client.query('COMMIT'); // ยืนยันการบันทึก
        
        res.status(201).json({ 
            message: "Album created successfully", 
            album_code: generatedCode 
        });

    } catch (err) {
        await client.query('ROLLBACK'); // ยกเลิกหากพัง
        console.error("Error at createAlbum:", err.message);

        if (err.code === '23505') {
            return res.status(400).json({ error: "Album code already exists" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release(); // คืน Connection ให้ Pool
    }
};
const deleteAlbum = async (req,res) => {
    const { id } = req.params;
    try {
        const checkMusicQuery = `SELECT COUNT(*) FROM music WHERE album_id =$1`;
        const musicCount = await db.query(checkMusicQuery, [id]);

        if (parseInt(musicCount.rows[0].count) > 0) {
            return res.status(400).json({
                error: "ไม่สามารถลบอัลบั้มนี้ได้ เนื่องจากยังมีเพลงอยู่ในอัมบั้มนี้"
            });
        }
        const deleteQuery = `DELETE FROM album WHERE album_id = $1 RETURNING *`;
        const result = await db.query(deleteQuery, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบอัลบั้มที่ต้องการลบ"});
        }
        res.status(200).json({message: "ลยอัลบั้มสำเร็จ"});
    } catch (err) {
        console.error("Error at deleteAlbum:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูลนั้น"})
    }
};
const getAlbumById = async (req,res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                al.*,
                ar.artist_name,
                (
                    SELECT COUNT(*)
                    FROM listen_history lh
                    JOIN music m2 ON lh.music_id = m2.music_id
                    WHERE m2.album_id = al.album_id
                )::bigint AS total_play,

                (
                    SELECT COUNT(*)
                    FROM library_albums
                    WHERE album_id = al.album_id
                )::int AS in_playlists,

                (
                    SELECT COUNT(*)
                    FROM music
                    WHERE album_id = al.album_id
                )::int AS total_tracks

                FROM album al
                LEFT JOIN artist ar ON al.artist_id = ar.artist_id
                WHERE al.album_id = $1
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0){
            return res.status(404).json({ error: "ไม่พบข้อมูลอัลบั้ม"});
        }
        res.status(200).json(result.rows[0]);
    } catch (err){
        console.error(err.message);
        res.status(500).json({ error: "Server Error"});
    }
}
const updateAlbum = async (req, res) => {
    const { id } = req.params;
    const { album_code, album_name, artist_id, album_type, cover_image_url, release_date } = req.body;
    try {
        const query = `
            UPDATE album
            SET album_code = $1, album_name = $2, artist_id = $3,
                album_type = $4, cover_image_url = $5, release_date = $6
            WHERE album_id = $7
            RETURNING *;
        `;
        const values = [album_code, album_name, artist_id, album_type.toLowerCase(), cover_image_url,release_date, id];
        const result = await db.query(query,values);

        if (result.rowCount === 0) return res.status(404).json({ error: "ไม่พบอัลบั้ม"});
        
        res.json({ message: "อัปเดตข้อมูลสำเร็จ", data: result.rows[0]});
    } catch (err){
        console.error(err.message);
        res.status(500).json({ error: "Server Error"});
    }
}
module.exports = {
    getAllAlbums,
    createAlbum,
    deleteAlbum,
    getAlbumById,
    updateAlbum
};