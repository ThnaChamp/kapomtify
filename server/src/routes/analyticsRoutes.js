const express = require('express');
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/stats",analyticsController.getOverviewStats);
router.get("/countries",analyticsController.getUserCountryStats);
router.get("/engagement",analyticsController.getTopAlbumsEngagement);

module.exports = router;