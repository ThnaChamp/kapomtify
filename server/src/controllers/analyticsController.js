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

const getContentAnalytics = async (req, res) => {
    const { month, year } = req.query;
    const values = [];
    const isFiltered = month && year && month !== '0' && year !== '0';

    const timeFilter = (dateCol) => isFiltered 
        ? `AND EXTRACT(MONTH FROM ${dateCol}) = $1 AND EXTRACT(YEAR FROM ${dateCol}) = $2` 
        : "";

    if (isFiltered) {
        values.push(parseInt(month), parseInt(year));
    }

    try {
        // 1. Genre Loyalty (ปรับ Join ให้เคลียร์ขึ้น)
        const genreQuery = `
            SELECT 
                g.genre_name AS name,
                ROUND(CAST(COUNT(lh.history_id) AS NUMERIC) / NULLIF(COUNT(DISTINCT lh.user_id), 0), 2) AS plays_per_user
            FROM genre g
            INNER JOIN music_genre mg ON g.genre_id = mg.genre_id
            INNER JOIN music m ON mg.music_id = m.music_id
            INNER JOIN listen_history lh ON m.music_id = lh.music_id
            WHERE 1=1 ${timeFilter('lh.played_at')}
            GROUP BY g.genre_id, g.genre_name
            ORDER BY plays_per_user DESC
            LIMIT 5
        `;

        // 2. High Skip Rate Artists (ปรับเงื่อนไข HAVING)
        const skipQuery = `
            SELECT 
                a.artist_name AS name,
                ROUND(
                    (CAST(COUNT(CASE WHEN ual.action_type = 'skip' THEN 1 END) AS NUMERIC) / 
                    NULLIF(COUNT(ual.activity_id), 0)) * 100, 1
                ) AS skip_rate
            FROM artist a
            INNER JOIN music_artist ma ON a.artist_id = ma.artist_id
            INNER JOIN music m ON ma.music_id = m.music_id
            INNER JOIN user_activity_log ual ON m.music_id = ual.music_id
            WHERE 1=1 ${timeFilter('ual.created_at')}
            GROUP BY a.artist_id, a.artist_name
            HAVING COUNT(ual.activity_id) > 0  -- แก้จาก > 5 เป็น > 0 เพื่อให้ข้อมูลใหม่โชว์
            ORDER BY skip_rate DESC
            LIMIT 5
        `;

        const [genres, skipArtists] = await Promise.all([
            db.query(genreQuery, values),
            db.query(skipQuery, values)
        ]);

        res.status(200).json({
            genres: genres.rows,
            skipArtists: skipArtists.rows
        });

    } catch (err) {
        console.error("Backend Error Details:", err.message);
        res.status(500).json({ error: err.message });
    }
};
const getRecommendationAnalytics = async (req,res) => {
    const { month, year} = req.query;
    const values = [];
    const isFiltered = month && year && month != '0' && year !== '0';

    const timeFilter = (dateCol) => isFiltered
        ? `AND EXTRACT(MONTH FROM ${dateCol}) = $1 AND EXTRACT(YEAR FROM ${dateCol}) = $2`
        : "";

    if (isFiltered) {
        values.push(parseInt(month), parseInt(year));
    }
    try{
        // Recommendation Efficiency
        const efficiencyQuery = `
            SELECT
                m.title,
                art.artist_name,
                COUNT(DISTINCT r.user_id) AS rec_users,
                m.play_count,
                ROUND(CAST(m.play_count AS NUMERIC) / NULLIF(COUNT(DISTINCT r.user_id), 0), 1) AS efficiency_score
            FROM recommend r
            JOIN music m ON r.music_id = m.music_id
            JOIN music_artist ma ON m.music_id = ma.music_id
            JOIN artist art ON ma.artist_id = art.artist_id
            WHERE 1=1 ${timeFilter('r.generate_at')}
            GROUP BY m.music_id, m.title,art.artist_name , m.play_count
            ORDER BY efficiency_score DESC
            LIMIT 3
        `;
        const satisfactionQuery = `
            SELECT
                g.genre_name AS name,
                ROUND(AVG(rev.rating), 1) AS avg_score
                FROM genre g
                JOIN music_genre mg ON g.genre_id = mg.genre_id
                JOIN reviews rev ON mg.music_id = rev.music_id
                WHERE 1=1 ${timeFilter('rev.create_at')}
                GROUP BY g.genre_id, g.genre_name
                ORDER BY avg_score DESC
                LIMIT 4
        `;
        const [efficiency, satisfaction] = await Promise.all([
            db.query(efficiencyQuery, values),
            db.query(satisfactionQuery, values)
        ]);
        res.status(200).json({
            efficiency: efficiency.rows,
            satisfaction:satisfaction.rows
        });
    }catch (err) {
        console.error("Recommendation Backend error:" , err.message);
        res.status(500).json({ error: err.message});
    }
};

module.exports = {
    getOverviewStats,
    getUserCountryStats,
    getTopAlbumsEngagement,
    getContentAnalytics,
    getRecommendationAnalytics
};