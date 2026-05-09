// const express = require('express');
// const router = express.Router();
// const albumController = require('../controllers/albumController');

// router.get('/', albumController.getAllAlbums);
// module.exports = router;

const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artistController");

router.get("/", artistController.getAllArtists);
router.post("/", artistController.createArtist);
router.get("/:id", artistController.getArtistDetail);
router.put("/:id", artistController.updateArtist);
router.delete("/:id", artistController.deleteArtist);

router.get('/', albumController.getAllAlbums);
router.post('/',albumController.createAlbum);
router.delete('/:id',albumController.deleteAlbum);
router.get('/:id', albumController.getAlbumById);
router.put('/:id', albumController.updateAlbum);
module.exports = router;