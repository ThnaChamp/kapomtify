const db = require("../db/pool");
const getAllMusic = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page -1) * limit;

        const musicQuery = `
            SELECT
                m.music_id,
                m.music_code,
                m.title,
                m.release_date,
                m.duration,
                string_agg(DISTINCT a.artist_name,', ') AS artist_names,
                string_agg(DISTINCT g.genre_name, ', ') AS genre_names
            FROM music m
            LEFT JOIN music_artist ma ON m.music_id = ma.music_id
            LEFT JOIN artist a ON ma.artist_id = a.artist_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            GROUP BY m.music_id , m.music_code
            ORDER BY m.music_id ASC
            LIMIT $1 OFFSET $2;
        `;
        const countQuery = `SELECT COUNT(*) FROM music;`;

        const [musicRes, countRes] = await Promise.all([
            db.query(musicQuery, [limit,offset]),
            db.query(countQuery)
        ]);
        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: musicRes.rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totaltems: totalItems
            }
        });
    } catch (err) {
        console.error("Error at getAllMusic:",err.message);
        res.status(500).json({ error: "Server error while fetching music"});
    }
};

const createMusic = async (req, res) => {
    const client = await db.connect();

    const { 
        music_code, title, release_date, duration, 
        track_number, file_url, album_id, is_explicit,
        artist_id, 
        genres  
    } = req.body;

    try {
        await client.query('BEGIN');
        const musicQuery = `
            INSERT INTO music (album_id, music_code, title, release_date, duration, track_number, file_url, is_explicit)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING music_id;
        `;
        const musicRes = await db.query(musicQuery, [
            album_id, music_code, title, release_date, duration, track_number, file_url, is_explicit
        ]);
        const newMusicId = musicRes.rows[0].music_id;
        
        const artistQuery = `INSERT INTO music_artist (music_id, artist_id, role) VALUES ($1, $2, $3);`;
        await client.query(artistQuery, [newMusicId, artist_id, 'Main Artist']);
        const genreQuery = `INSERT INTO music_genre (music_id, genre_id) VALUES ($1, $2);`;
        if (genres && genres.length > 0) {
            const genreQuery = `INSERT INTO music_genre (music_id, genre_id) VALUES ($1, $2);`;
            for (const g_id of genres) {
                await client.query(genreQuery, [newMusicId, g_id]);
            }
        }

        // ถ้าทุกอย่างผ่านหมด ให้บันทึกลง DB จริง
        await client.query('COMMIT');
        res.status(201).json({ message: "เพิ่มเพลงเรียบร้อยแล้ว!" });
    } catch (err){
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: "Failed to create music"});
    } finally {
        client.release();
    }
};

const deleteMusic = async (req, res) => {
    const { id } = req.params;
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM music_artist WHERE music_id = $1', [id]);
        await client.query('DELETE FROM music_genre WHERE music_id = $1', [id]);

        const result = await client.query('DELETE FROM music WHERE music_id = $1', [id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "ไม่พบเพลงที่ต้องการลบ"});
        }
        
        await client.query('COMMIT');
        res.status(200).json({ message: "ลบเพลงเรียบร้อยเเล้ว"});
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("🔥 Delete Error:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบเพลง"});
    } finally {
        client.release();
    }
};
const getMusicDetail = async (req, res) => {
    const { id } = req.params; // รับ ID จาก URL
    try {
        const query = `
            SELECT 
                m.music_id, 
                m.music_code, 
                m.title, 
                m.release_date, 
                m.duration,
                m.track_number,
                al.album_name,
                al.cover_image_url,
                string_agg(DISTINCT a.artist_name, ', ') AS artist_names,
                string_agg(DISTINCT g.genre_name, ', ') AS genre_names
            FROM music m
            -- ⚠️ เช็คการ JOIN: ชื่อตารางและ Foreign Key ต้องถูกต้อง
            LEFT JOIN album al ON m.album_id = al.album_id
            LEFT JOIN music_artist ma ON m.music_id = ma.music_id
            LEFT JOIN artist a ON ma.artist_id = a.artist_id
            LEFT JOIN music_genre mg ON m.music_id = mg.music_id
            LEFT JOIN genre g ON mg.genre_id = g.genre_id
            WHERE m.music_id = $1
            GROUP BY m.music_id, al.album_id;
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "ไม่พบข้อมูลเพลงนี้" });
        }

        // ✅ ส่งข้อมูลกลับไปเป็น Object ตัวเดียว (ไม่ต้องส่งเป็น Array)
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
            music_code || "",           // ถ้าไม่มีโค้ด ให้ส่ง string ว่าง
            title || "Untitled",        // ถ้าไม่มีชื่อ ให้ส่ง Untitled
            duration || 0,              // ถ้าไม่มีความยาว ให้ส่ง 0
            release_date || null,       // วันที่ยอมให้เป็น null ได้ถ้า DB อนุญาต (ถ้าไม่ได้ให้ใส่ new Date())
            file_url || "",             // ✅ แก้ปัญหา file_url null
            is_explicit ?? false,       // ✅ แก้ปัญหา is_explicit null (ใช้ ?? เพื่อเช็ค null/undefined)
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