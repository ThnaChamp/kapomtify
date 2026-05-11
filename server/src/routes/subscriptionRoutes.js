const express = require('express');
const router = express.Router();
const subController = require('../controllers/subscriptionController');

router.get('/', subController.getAllSubscriptions);
router.post('/', subController.createSubscription);
router.delete('/:id', subController.deleteSubscription);

module.exports = router;