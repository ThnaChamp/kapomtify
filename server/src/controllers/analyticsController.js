const db = require("../db/pool");

const getOverviewStats = async (req, res) => {
    const { month, year } = req.query;
    
    // ตรวจสอบสถานะการ Filter
    const isFiltered = month && year && month !== '0' && year !== '0';

    try {
        let query = "";
        
        if (!isFiltered) {
            // ✅ กรณีที่ 1: ดึงข้อมูลรวมทั้งหมด (All Time)
            query = `
                SELECT 
                    (SELECT COUNT(*) FROM listen_history) AS total_streams,
                    (SELECT COUNT(*) FROM users) AS active_users, 
                    (SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) FROM reviews) AS avg_rating,
                    (SELECT COUNT(*) FROM library_albums) AS total_saves,
                    '0.0' AS streams_change, '0.0' AS users_change, '0.0' AS rating_change, '0.0' AS saves_change
            `;
        } else {
            // ✅ กรณีที่ 2: ดึงตามเดือนที่เลือก และคำนวณเปรียบเทียบเดือนก่อนหน้า
            const m = parseInt(month);
            const y = parseInt(year);
            
            // คำนวณหาเดือนก่อนหน้า
            let pm = m - 1;
            let py = y;
            if (pm === 0) { pm = 12; py = y - 1; }

            query = `
                WITH curr AS (
                    SELECT 
                        (SELECT COUNT(*) FROM listen_history WHERE EXTRACT(MONTH FROM played_at) = ${m} AND EXTRACT(YEAR FROM played_at) = ${y}) AS s,
                        (SELECT COUNT(*) FROM users WHERE EXTRACT(MONTH FROM created_at) = ${m} AND EXTRACT(YEAR FROM created_at) = ${y}) AS u,
                        (SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) FROM reviews WHERE EXTRACT(MONTH FROM create_at) = ${m} AND EXTRACT(YEAR FROM create_at) = ${y}) AS r,
                        (SELECT COUNT(*) FROM library_albums WHERE EXTRACT(MONTH FROM added_at) = ${m} AND EXTRACT(YEAR FROM added_at) = ${y}) AS v
                ),
                prev AS (
                    SELECT 
                        (SELECT COUNT(*) FROM listen_history WHERE EXTRACT(MONTH FROM played_at) = ${pm} AND EXTRACT(YEAR FROM played_at) = ${py}) AS s,
                        (SELECT COUNT(*) FROM users WHERE EXTRACT(MONTH FROM created_at) = ${pm} AND EXTRACT(YEAR FROM created_at) = ${py}) AS u,
                        (SELECT COALESCE(ROUND(AVG(rating), 1), 0.0) FROM reviews WHERE EXTRACT(MONTH FROM create_at) = ${pm} AND EXTRACT(YEAR FROM create_at) = ${py}) AS r,
                        (SELECT COUNT(*) FROM library_albums WHERE EXTRACT(MONTH FROM added_at) = ${pm} AND EXTRACT(YEAR FROM added_at) = ${py}) AS v
                )
                SELECT 
                    curr.s AS total_streams, curr.u AS active_users, curr.r AS avg_rating, curr.v AS total_saves,
                    COALESCE(ROUND(((curr.s - prev.s)::numeric / NULLIF(prev.s, 0)) * 100, 1), 0.0) AS streams_change,
                    COALESCE(ROUND(((curr.u - prev.u)::numeric / NULLIF(prev.u, 0)) * 100, 1), 0.0) AS users_change,
                    COALESCE(ROUND(((curr.r - prev.r)::numeric / NULLIF(prev.r, 0)) * 100, 1), 0.0) AS rating_change,
                    COALESCE(ROUND(((curr.v - prev.v)::numeric / NULLIF(prev.v, 0)) * 100, 1), 0.0) AS saves_change
                FROM curr, prev
            `;
        }

        const result = await db.query(query);
        const stats = result.rows[0];

        res.status(200).json({
            total_streams: parseInt(stats.total_streams) || 0,
            active_users: parseInt(stats.active_users) || 0,
            avg_rating: parseFloat(stats.avg_rating || 0).toFixed(1),
            total_saves: parseInt(stats.total_saves) || 0,
            streams_change: String(stats.streams_change || "0.0"),
            users_change: String(stats.users_change || "0.0"),
            rating_change: String(stats.rating_change || "0.0"),
            saves_change: String(stats.saves_change || "0.0")
        });

    } catch (err) {
        console.error("🔥 Analytics Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
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

const getRecommendationAnalytics = async (req, res) => {
    const { month, year } = req.query;
    const values = [];
    const isFiltered = month && year && month != '0' && year !== '0';

    const timeFilter = (dateCol) => isFiltered
        ? `AND EXTRACT(MONTH FROM ${dateCol}) = $1 AND EXTRACT(YEAR FROM ${dateCol}) = $2`
        : "";

    if (isFiltered) {
        values.push(parseInt(month), parseInt(year));
    }
    try {
        // Recommendation Efficiency (คำนวณยอดวิวจาก listen_history)
        const efficiencyQuery = `
            SELECT
                m.title,
                art.artist_name,
                COUNT(DISTINCT r.user_id) AS rec_users,
                (SELECT COUNT(*) FROM listen_history WHERE music_id = m.music_id) AS play_count,
                ROUND(
                    CAST((SELECT COUNT(*) FROM listen_history WHERE music_id = m.music_id) AS NUMERIC) / 
                    NULLIF(COUNT(DISTINCT r.user_id), 0), 1
                ) AS efficiency_score
            FROM recommend r
            JOIN music m ON r.music_id = m.music_id
            JOIN music_artist ma ON m.music_id = ma.music_id
            JOIN artist art ON ma.artist_id = art.artist_id
            WHERE 1=1 ${timeFilter('r.generate_at')}
            GROUP BY m.music_id, m.title, art.artist_name
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
            satisfaction: satisfaction.rows
        });
    } catch (err) {
        console.error("Recommendation Backend error:", err.message);
        res.status(500).json({ error: err.message });
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

        // 4. Revenue (รายได้รวมจาก Transaction ที่ completed)
        const revenueRes = await db.query(`
            SELECT SUM(td.unit_price * td.quantity) as total 
            FROM transactions t
            JOIN transaction_detail td ON t.transaction_id = td.transaction_id
            WHERE t.status = 'completed'
        `);
        const revenue = parseInt(revenueRes.rows[0].total) || 0;

        // 5. Top 5 songs (คำนวณยอดวิวจาก listen_history)
        const topSongs = await db.query(`
            SELECT m.title, COUNT(lh.history_id) as plays 
            FROM music m
            LEFT JOIN listen_history lh ON m.music_id = lh.music_id
            GROUP BY m.music_id, m.title
            ORDER BY plays DESC 
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
            newMusicWeek: 24, // ข้อมูลจำลองเนื่องจากไม่มีฟิลด์ created_at ใน music
            totalUsers: totalUsersInt,
            newUsersMonth: 103, // ข้อมูลจำลอง
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