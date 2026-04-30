const db = require("../db/pool");

const getAllAlbums = async (req,res) => {
    const result = await db.query('SELECT album_id, album_name FROM album ORDER BY album_name ASC');
    res.json(result.rows);
};
module.exports = {
    getAllAlbums
};