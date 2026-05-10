const express = require("express");
const router = express.Router();
const musicController = require("../controllers/musicController");
const { authorizeRole } = require("../middlewares/authMiddleware");

// กำหนดเส้นทาง และเรียกใช้ฟังก์ชันจาก Controller
router.get("/", musicController.getAllMusic);
router.post('/',musicController.createMusic);
router.delete('/:id',authorizeRole('super_admin'),musicController.deleteMusic);
router.get('/:id', musicController.getMusicDetail);
router.put('/:id', musicController.updateMusic);

module.exports = router;