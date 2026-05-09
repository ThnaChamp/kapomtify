// const express = require('express');
// const router = express.Router();
// const analyticsController = require("../controllers/analyticsController");

// router.get("/stats",analyticsController.getOverviewStats);
// router.get("/countries",analyticsController.getUserCountryStats);
// router.get("/engagement",analyticsController.getTopAlbumsEngagement);
// router.get('/content',analyticsController.getContentAnalytics);
// router.get('/recommendation',analyticsController.getRecommendationAnalytics);
// module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/stats",analyticsController.getOverviewStats);
router.get("/countries",analyticsController.getUserCountryStats);
router.get("/engagement",analyticsController.getTopAlbumsEngagement);
router.get('/content',analyticsController.getContentAnalytics);
router.get('/recommendation',analyticsController.getRecommendationAnalytics);
router.get('/dashboard', analyticsController.getDashboardData);

module.exports = router;