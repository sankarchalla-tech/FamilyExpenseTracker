const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const verifyFamilyMember = require('../middleware/verifyFamilyMember');

const router = express.Router();

router.post('/', auth, [
  body('family_id').isInt().withMessage('Invalid family ID'),
  body('category_id').isInt().withMessage('Invalid category ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('date').isISO8601().withMessage('Invalid date format')
], expenseController.createExpense);

router.get('/:familyId', auth, verifyFamilyMember, expenseController.getExpenses);

router.get('/:familyId/:expenseId', auth, verifyFamilyMember, expenseController.getExpense);

router.put('/:familyId/:expenseId', auth, verifyFamilyMember, [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], expenseController.updateExpense);

router.delete('/:familyId/:expenseId', auth, verifyFamilyMember, expenseController.deleteExpense);

module.exports = router;