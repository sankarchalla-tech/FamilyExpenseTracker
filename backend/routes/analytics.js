const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const verifyFamilyMember = require('../middleware/verifyFamilyMember');

const router = express.Router();

router.get('/:familyId', auth, verifyFamilyMember, analyticsController.getAnalytics);

module.exports = router;