const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
], userController.updateProfile);

router.post('/update-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6, max: 100 }).withMessage('New password must be 6-100 characters')
], userController.updatePassword);

router.post('/:userId/reset-password', auth, userController.resetPassword);

router.get('/:familyId/users', auth, userController.getUsers);

module.exports = router;