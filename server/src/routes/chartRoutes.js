const express = require('express');
const router = express.Router();
const {
    getAllCharts,
    getChartById,
    createChart,
    updateChart,
    deleteChart,
    addMusicToChart,
    removeMusicFromChart
} = require('../controllers/chartController');

router.get('/', getAllCharts);
router.get('/:id', getChartById);
router.post('/', createChart);
router.put('/:id', updateChart);
router.delete('/:id', deleteChart);
router.post('/:id/entries', addMusicToChart);
router.delete('/:id/entries/:musicId', removeMusicFromChart);

module.exports = router;
