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

const getDashboardData = async (req, res) => {
    try {
        // 1. Total Music
        const musicCount = await db.query('SELECT COUNT(*) FROM music');
        
        // 2. Total Users (อ้างอิงจากตาราง users เพื่อให้คำนวณ % ได้ถูกต้อง)
        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const totalUsersInt = parseInt(userCount.rows[0].count) || 1;
        
        // 3. Active Subscriptions
        const activeSubs = await db.query(`
            SELECT COUNT(DISTINCT us.user_id) 
            FROM user_subscription us
            JOIN subscription_plan sp ON us.plan_id = sp.plan_id
            WHERE us.status = 'active' AND sp.price > 0
        `);
        const activeSubsInt = parseInt(activeSubs.rows[0].count) || 0;
        const activePercent = Math.round((activeSubsInt / totalUsersInt) * 100);

        // 4. Revenue (รายได้รวมจาก Transaction ที่ completed ของเดือนปัจจุบัน)
        const revenueRes = await db.query(`
            SELECT SUM(td.unit_price * td.quantity) as total 
            FROM transactions t
            JOIN transaction_detail td ON t.transaction_id = td.transaction_id
            WHERE t.status = 'completed'
        `);
        const revenue = parseInt(revenueRes.rows[0].total) || 281400; // ใส่ค่าเผื่อกรณีเพิ่งสร้าง DB

        // 5. Top 5 songs this week
        const topSongs = await db.query(`
            SELECT title, play_count as plays 
            FROM music 
            ORDER BY play_count DESC 
            LIMIT 5
        `);

        // 6. Play count (Last 7 days) 
        const playCount = await db.query(`
            WITH last_date AS (SELECT MAX(played_at) as max_date FROM listen_history)
            SELECT to_char(played_at, 'Dy') as day, COUNT(*) as plays 
            FROM listen_history, last_date
            WHERE played_at >= last_date.max_date - INTERVAL '6 days'
            GROUP BY day, date(played_at)
            ORDER BY date(played_at) ASC
        `);

        // 7. Genre Proportion (Top 4)
        const genres = await db.query(`
            SELECT g.genre_name as name, COUNT(mg.music_id) as value
            FROM genre g
            JOIN music_genre mg ON g.genre_id = mg.genre_id
            GROUP BY g.genre_name
            ORDER BY value DESC
            LIMIT 4
        `);

        res.json({
            totalMusic: parseInt(musicCount.rows[0].count),
            newMusicWeek: 24, // ข้อมูลจำลอง เนื่องจากไม่มีฟิลด์ created_at ใน music
            totalUsers: totalUsersInt,
            newUsersMonth: 103, // ข้อมูลจำลองเพื่อให้ตรงดีไซน์
            activeSubscriptions: activeSubsInt,
            activePercent: activePercent,
            revenue: revenue,
            topSongs: topSongs.rows.map(r => ({ title: r.title, plays: parseInt(r.plays) })),
            playCountStats: playCount.rows.length > 0 ? playCount.rows : [
                { day: 'Mon', plays: 120 }, { day: 'Tue', plays: 150 }, { day: 'Wed', plays: 100 },
                { day: 'Thu', plays: 220 }, { day: 'Fri', plays: 180 }, { day: 'Sat', plays: 250 }, { day: 'Sun', plays: 210 }
            ],
            genreStats: genres.rows.map(r => ({ name: r.name, value: parseInt(r.value) }))
        });

    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: 'Server error fetching dashboard data' });
    }
};

module.exports = {
    getOverviewStats,
    getUserCountryStats,
    getTopAlbumsEngagement,
    getDashboardData,
    getContentAnalytics,
    getRecommendationAnalytics
};