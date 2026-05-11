const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/',userController.getAllUsers);
router.get('/:id', userController.getUserDetail);
router.get('/:id/saved-albums', userController.getUserSavedAlbums);
router.get('/:id/library-albums', userController.getUserLibraryAlbums);
router.get('/:id/library-artists', userController.getUserLibraryArtists);
router.get('/:id/library-playlists', userController.getUserLibraryPlaylists); // มั่นใจว่ามีตัวนี้
router.get('/:id/sub-history', userController.getUserSubHistory);
router.delete('/:id',userController.deleteUser);
module.exports = router;