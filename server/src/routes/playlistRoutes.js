const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

router.get('/', playlistController.getAllPlaylists);
router.get('/:id', playlistController.getPlaylistDetail);
router.post('/', playlistController.createPlaylist);
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;
