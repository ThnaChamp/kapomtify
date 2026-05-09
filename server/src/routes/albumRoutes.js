const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', albumController.getAllAlbums);
module.exports = router;

router.get('/', albumController.getAllAlbums);
router.post('/',albumController.createAlbum);
router.delete('/:id',albumController.deleteAlbum);
router.get('/:id', albumController.getAlbumById);
router.put('/:id', albumController.updateAlbum);
module.exports = router;