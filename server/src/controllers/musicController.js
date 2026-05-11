const db = require("../db/pool");
const getAllMusic = async (req, res) => {
    try {
        
        const { search,genreId, page: rawPage = 1 } = req.query; 
        const page = parseInt(rawPage);
        const limit = 20;
        const offset = (page - 1) * limit;

        let conditions = [];
        let queryParams = [];

        if (search) {
            queryParams.push(`%${search}%`);
            conditions.push(`(m.title ILIKE $${queryParams.length}::text OR m.music_code ILIKE $${queryParams.length}::text)`);
        }
        if (genreId) {
            queryParams.push(genreId);
            // ใช้ EXISTS หรือ IN เพื่อตรวจสอบความสัมพันธ์ใน music_genre
            conditions.push(`m.music_id IN (SELECT music_id FROM music_genre WHERE genre_id = $${queryParams.length})`);
        }
const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : "";
        
        // สำหรับ Count Query (ใช้ params ชุดเดียวกับ Filter)
        const countQuery = `SELECT COUNT(*) FROM music m ${whereClause}`;
        const countParams = [...queryParams];

        // สำหรับ Music Query (ต้องเพิ่ม Limit และ Offset ต่อท้าย)
        queryParams.push(limit);   // ตัวเลขต่อจากตัวสุดท้าย
        const limitIdx = queryParams.length;
        queryParams.push(offset);  // ตัวเลขถัดไป
        const offsetIdx = queryParams.length;

        const musicQuery = `
            SELECT
                m.music_id,
                m.music_code,
                m.title,
                m.release_date,
                m.duration,
                string_agg(DISTINCT a.artist_name, ', ') AS artist_names,
                string_agg(DISTINCT g.genre_name, ', ') AS genre_names
            FROM music m
            LEFT JOIN music_artist ma ON m.music_id = ma.music_id
            LEFT JOIN artist a ON ma.artist_id = a.artist_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            ${whereClause}
            GROUP BY m.music_id, m.music_code
            ORDER BY m.music_id ASC
            LIMIT $${limitIdx} OFFSET $${offsetIdx};
        `;
        const [musicRes, countRes] = await Promise.all([
            db.query(musicQuery, queryParams),
            db.query(countQuery, countParams)
        ]);

        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit) || 1;
        
        res.status(200).json({
            data: musicRes.rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems // แก้ตัวสะกดจาก totaltems เป็น totalItems
            }
        });
    } catch (err) {
        // บรรทัดนี้จะช่วยให้คุณเห็น Error ที่ชัดเจนขึ้นใน Terminal
        console.error("Error at getAllMusic:", err.message); 
        res.status(500).json({ error: err.message });
    }
};

const createMusic = async (req, res) => {
    console.log("Request Body:", req.body);
    const client = await db.connect();

    const { 
        title, release_date, duration, 
        track_number, file_url, album_id, is_explicit,
        artist_id, 
        genres  
    } = req.body;

    try {
        await client.query('BEGIN');

        // 1. INSERT เพลงโดย "เว้น" music_code ไว้ก่อน (หรือให้เป็น NULL)
        const musicQuery = `
            INSERT INTO music (album_id, title, release_date, duration, track_number, file_url, is_explicit)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING music_id;
        `;
        const musicRes = await client.query(musicQuery, [
            album_id, title, release_date, duration, track_number, file_url, is_explicit
        ]);
        
        const newMusicId = musicRes.rows[0].music_id;

        
        const generatedCode = `M0${newMusicId}`;

        // 3. UPDATE กลับไปที่แถวเดิมเพื่อใส่ music_code
        const updateCodeQuery = `UPDATE music SET music_code = $1 WHERE music_id = $2`;
        await client.query(updateCodeQuery, [generatedCode, newMusicId]);

        // 4. INSERT ความสัมพันธ์ศิลปิน
        const artistQuery = `INSERT INTO music_artist (music_id, artist_id, role) VALUES ($1, $2, $3);`;
        await client.query(artistQuery, [newMusicId, artist_id, 'Main Artist']);

        // 5. INSERT ประเภทเพลง (Genres)
        if (genres && genres.length > 0) {
            const genreQuery = `INSERT INTO music_genre (music_id, genre_id) VALUES ($1, $2);`;
            for (const g_id of genres) {
                await client.query(genreQuery, [newMusicId, g_id]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ 
            message: "เพิ่มเพลงเรียบร้อยแล้ว!", 
            music_code: generatedCode 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Database Error:", err.message);
        res.status(500).json({ error: "Failed to create music" });
    } finally {
        client.release();
    }
};
const deleteMusic = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. ลบข้อมูลในตารางเชื่อมโยง (Relation Tables) ทั้งหมดก่อน
        await client.query('DELETE FROM music_artist WHERE music_id = $1', [id]);
        await client.query('DELETE FROM music_genre WHERE music_id = $1', [id]);
        
        // ⚠️ เพิ่มเติม: ถ้ามีตารางเหล่านี้ ต้องลบด้วย!
        // await client.query('DELETE FROM chart_item WHERE music_id = $1', [id]);
        // await client.query('DELETE FROM playlist_item WHERE music_id = $1', [id]);

        // 2. ลบที่ตัวตารางหลัก (Music)
        const result = await client.query('DELETE FROM music WHERE music_id = $1', [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "ไม่พบเพลงที่ต้องการลบ"});
        }
        
        await client.query('COMMIT');
        res.status(200).json({ message: "ลบเพลงเรียบร้อยเเล้ว"});
    } catch (err) {
        await client.query('ROLLBACK');
        // ✅ สำคัญ: ดู Error ใน Console ว่ามันติด Foreign Key ที่ตารางไหน!
        console.error("🔥 Delete Error Details:", err.message); 
        res.status(500).json({ error: "ลบไม่ได้เพราะเพลงนี้ถูกใช้งานอยู่ในตารางอื่น"});
    } finally {
        client.release();
    }
};
const getMusicDetail = async (req, res) => {
    const { id } = req.params; 
    try {
        const query = `
            SELECT 
                m.music_id, 
                m.music_code, 
                m.title, 
                m.release_date, 
                m.duration,
                m.track_number,
                m.file_url,
                (SELECT COUNT(*) FROM listen_history WHERE music_id = m.music_id) AS play_count,
                m.is_explicit,
                al.album_name,
                al.cover_image_url,
                string_agg(DISTINCT a.artist_name, ', ') AS artist_names,
                string_agg(DISTINCT g.genre_name, ', ') AS genre_names
            FROM music m
            LEFT JOIN album al ON m.album_id = al.album_id
            LEFT JOIN music_artist ma ON m.music_id = ma.music_id
            LEFT JOIN artist a ON ma.artist_id = a.artist_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            WHERE m.music_id = $1
            GROUP BY m.music_id, al.album_id, al.album_name, al.cover_image_url;
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลเพลงนี้" });
        }

        res.status(200).json(result.rows[0]); 

    } catch (err) {
        console.error("🔥 Backend Error at getMusicDetail:", err.message);
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
};
const updateMusic = async (req, res) => {
    const { id } = req.params;
    const { music_code, title, duration, release_date, file_url, is_explicit } = req.body;

    try {
        const query = `
            UPDATE music 
            SET music_code = $1, title = $2, duration = $3, release_date = $4, file_url = $5, is_explicit = $6
            WHERE music_id = $7
        `;
        const values = [
            music_code || "",       
            title || "Untitled",     
            duration || 0,             
            release_date || null,     
            file_url || "",         
            is_explicit ?? false,       
            id
        ];
        const explicitValue = (is_explicit === null || is_explicit === undefined) ? false : is_explicit;
        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลเพลงที่ต้องการแก้ไข" });
        }

        res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
    }
};

// อย่าลืม Export และไปเพิ่ม router.put('/:id', musicController.updateMusic) นะครับ

module.exports = {
  getAllMusic,
  createMusic,
  deleteMusic,
  getMusicDetail,
  updateMusic
};