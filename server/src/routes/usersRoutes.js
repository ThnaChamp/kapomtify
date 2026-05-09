const express = require('express');
const router = express.Router();
const db = require('../db/pool');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, display_name FROM users ORDER BY user_id ASC;');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
