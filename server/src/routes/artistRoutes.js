const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');

router.get('/', artistController.getAllArtists);
router.post('/', artistController.createArtist);        // สำหรับปุ่ม Create
router.get('/:id', artistController.getArtistDetail);   // สำหรับหน้า Detail
router.put('/:id', artistController.updateArtist);      // สำหรับปุ่ม Edit
router.delete('/:id', artistController.deleteArtist);   // สำหรับปุ่ม Delete
module.exports = router;