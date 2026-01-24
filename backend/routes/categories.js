const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:familyId', auth, categoryController.getCategories);

router.post('/:familyId', auth, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format')
], categoryController.createCategory);

router.put('/:familyId/:categoryId', auth, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format')
], categoryController.updateCategory);

router.delete('/:familyId/:categoryId', auth, categoryController.deleteCategory);

module.exports = router;