const db = require("../db/pool");

const getAllArtists = async (req, res) => {
    const result = await db.query("SELECT artist_id, artist_name FROM artist ORDER BY artist_name ASC");
    res.json(result.rows);
};
module.exports = {
    getAllArtists
};