const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:familyId', auth, analyticsController.getAnalytics);

module.exports = router;