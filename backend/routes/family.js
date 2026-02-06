const express = require('express');
const { body } = require('express-validator');
const familyController = require('../controllers/familyController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
], familyController.createFamily);

router.get('/', auth, familyController.getFamilies);

router.get('/:familyId', auth, familyController.getFamily);

router.get('/:familyId/members', auth, familyController.getFamilyMembers);

router.post('/:familyId/members', auth, [
  body('email').isEmail().withMessage('Invalid email'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role')
], familyController.addFamilyMember);

router.delete('/:familyId/members/:userId', auth, familyController.removeFamilyMember);

router.delete('/:familyId', auth, familyController.deleteFamily);

module.exports = router;