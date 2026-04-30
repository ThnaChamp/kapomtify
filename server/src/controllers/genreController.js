const db = require("../db/pool");

const getAllGenres = async (req, res) => {
    try {
        const result = await db.query("SELECT genre_id, genre_name FROM genre ORDER BY genre_name ASC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching genres:", err.message);
        res.status(500).json({ error: "Server error while fetching genres"});
    }
};

module.exports = {
    getAllGenres
};