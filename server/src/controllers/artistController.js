const db = require("../db/pool");

const getAllArtists = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const query = `
            SELECT artist_id, artist_code, artist_name, profile_image_url, type, gender 
            FROM artist 
            ORDER BY artist_id ASC 
            LIMIT $1 OFFSET $2;
        `;
        const countQuery = `SELECT COUNT(*) FROM artist;`;

        const [artistRes, countRes] = await Promise.all([
            db.query(query, [limit, offset]),
            db.query(countQuery)
        ]);
        
        const totalItems = parseInt(countRes.rows[0].count);
        res.status(200).json({
            data: artistRes.rows,
            pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems }
        });
    } catch (err) {
        console.error(err);
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
    const { artist_code, artist_name, debut_year, verified_status, profile_image_url, bio, type, gender } = req.body;
    try {
        const query = `
            INSERT INTO artist (artist_code, artist_name, debut_year, verified_status, profile_image_url, bio, type, gender) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        
        // แปลงค่าให้ถูกต้องป้องกัน Database Error
        const isVerifiedBool = verified_status === 'Yes' || verified_status === true;
        const finalDebutYear = debut_year && debut_year.trim() !== '' ? debut_year : null;
        const finalGender = gender && gender.trim() !== '' ? gender : null; 
        const finalType = type ? type : 'Solo';

        const values = [artist_code, artist_name, finalDebutYear, isVerifiedBool, profile_image_url, bio, finalType, finalGender];
        
        const result = await db.query(query, values);
        res.status(201).json({ message: "Artist created", data: result.rows[0] });
    } catch (err) {
        console.error("Create Artist Error:", err.message);
        res.status(500).json({ error: "Create failed: " + err.message });
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

const deleteArtist = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM artist WHERE artist_id = $1`, [id]);
        res.status(200).json({ message: "Artist deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
};

module.exports = { getAllArtists, getArtistDetail, createArtist, updateArtist, deleteArtist };