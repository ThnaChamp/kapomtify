const express = require('express');
const router = express.Router();
const subController = require('../controllers/subscriptionController');
const { authorizeRole } = require("../middlewares/authMiddleware");
router.get('/', subController.getAllSubscriptions);
router.post('/', subController.createSubscription);
router.delete('/:id', authorizeRole('super_admin'), subController.deleteSubscription);

module.exports = router;