const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const { authorizeRole } = require("../middlewares/authMiddleware");

router.get('/', albumController.getAllAlbums);
router.post('/',albumController.createAlbum);
router.delete('/:id', authorizeRole('super_admin'),albumController.deleteAlbum);
router.get('/:id', albumController.getAlbumById);
router.put('/:id', albumController.updateAlbum);
module.exports = router;