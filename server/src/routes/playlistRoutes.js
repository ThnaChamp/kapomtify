const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authorizeRole } = require("../middlewares/authMiddleware");

router.get('/', playlistController.getAllPlaylists);
router.get('/:id', playlistController.getPlaylistDetail);
router.post('/', playlistController.createPlaylist);
router.delete('/:id', authorizeRole('super_admin'), playlistController.deletePlaylist);

module.exports = router;
