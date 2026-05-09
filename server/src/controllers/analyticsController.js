const db = require("../db/pool");

const getOverviewStats = async (req, res) => {
    const { month, year } = req.query;
    const values = [];
    
    // Logic: ต้องระบุทั้งคู่ และทั้งคู่ต้องไม่ใช่ '0' ถึงจะกรองข้อมูล
    const isFiltered = month && year && month !== '0' && year !== '0';

    const getTimeFilter = (dateColumn) => {
        if (isFiltered) {
            return `WHERE EXTRACT(MONTH FROM ${dateColumn}) = $1 AND EXTRACT(YEAR FROM ${dateColumn}) = $2`;
        }
        return "";
    };

    if (isFiltered) {
        values.push(parseInt(month), parseInt(year));
    }

    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM listen_history ${getTimeFilter('played_at')}) AS total_streams,
                (SELECT COUNT(*) FROM users ${getTimeFilter('created_at')}) AS active_users, 
                (SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) FROM reviews ${getTimeFilter('create_at')}) AS avg_rating,
                (SELECT COUNT(*) FROM library_albums ${getTimeFilter('added_at')}) AS total_saves
        `;
        const result = await db.query(query, values);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserCountryStats = async (req, res) => {
    const { month, year } = req.query;
    const values = [];
    const isFiltered = month && year && month !== '0' && year !== '0';

    let query = `
        SELECT country AS name, COUNT(*) AS value
        FROM users
    `;

    if (isFiltered) {
        query += ` WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 `;
        values.push(parseInt(month), parseInt(year));
    }

    query += ` GROUP BY country ORDER BY value DESC LIMIT 5 `;

    try {
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTopAlbumsEngagement = async (req, res) => {
    const { month, year } = req.query;
    const values = [];
    const isFiltered = month && year && month !== '0' && year !== '0';

    let reviewFilter = "";
    let saveFilter = "";

    if (isFiltered) {
        values.push(parseInt(month), parseInt(year));
        reviewFilter = `AND EXTRACT(MONTH FROM r.create_at) = $1 AND EXTRACT(YEAR FROM r.create_at) = $2`;
        saveFilter = `WHERE EXTRACT(MONTH FROM la.added_at) = $1 AND EXTRACT(YEAR FROM la.added_at) = $2`;
    }

    try {
        const query = `
            WITH AlbumRatings AS (
                SELECT a.album_name, ROUND(AVG(r.rating), 1) as score
                FROM album a
                JOIN music m ON a.album_id = m.album_id
                JOIN reviews r ON m.music_id = r.music_id
                WHERE 1=1 ${reviewFilter}
                GROUP BY a.album_id, a.album_name
                ORDER BY score DESC LIMIT 1
            ),
            AlbumSaves AS (
                SELECT a.album_name, COUNT(la.lib_album_id) as save_count
                FROM album a
                JOIN library_albums la ON a.album_id = la.album_id
                ${saveFilter}
                GROUP BY a.album_id, a.album_name
                ORDER BY save_count DESC LIMIT 1
            )
            SELECT
                COALESCE((SELECT album_name FROM AlbumRatings), 'No Data') as best_rating_name,
                COALESCE((SELECT score FROM AlbumRatings), 0.0) as best_rating_score,
                COALESCE((SELECT album_name FROM AlbumSaves), 'No Data') as best_saved_name,
                COALESCE((SELECT save_count FROM AlbumSaves), 0) as best_saved_count
        `;
        const result = await db.query(query, values);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getOverviewStats,
    getUserCountryStats,
    getTopAlbumsEngagement
};