const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const verifyFamilyMember = require('../middleware/verifyFamilyMember');

const router = express.Router();

router.get('/:familyId', auth, verifyFamilyMember, categoryController.getCategories);

router.post('/:familyId', auth, verifyFamilyMember, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format')
], categoryController.createCategory);

router.put('/:familyId/:categoryId', auth, verifyFamilyMember, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format')
], categoryController.updateCategory);

router.delete('/:familyId/:categoryId', auth, verifyFamilyMember, categoryController.deleteCategory);

module.exports = router;