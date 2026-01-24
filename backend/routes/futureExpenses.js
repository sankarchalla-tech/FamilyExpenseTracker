const express = require('express');
const { body } = require('express-validator');
const futureExpenseController = require('../controllers/futureExpenseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/:familyId', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('total_amount').isFloat({ min: 0.01 }).withMessage('Total amount must be positive'),
  body('monthly_amount').isFloat({ min: 0.01 }).withMessage('Monthly amount must be positive'),
  body('start_month').matches(/^\d{4}-\d{2}$/).withMessage('Invalid start month format (YYYY-MM)'),
  body('end_month').matches(/^\d{4}-\d{2}$/).withMessage('Invalid end month format (YYYY-MM)')
], futureExpenseController.createFutureExpense);

router.get('/:familyId', auth, futureExpenseController.getFutureExpenses);

router.get('/:familyId/:futureExpenseId', auth, futureExpenseController.getFutureExpense);

router.put('/:familyId/:futureExpenseId', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('total_amount').optional().isFloat({ min: 0.01 }),
  body('monthly_amount').optional().isFloat({ min: 0.01 }),
  body('start_month').optional().matches(/^\d{4}-\d{2}$/),
  body('end_month').optional().matches(/^\d{4}-\d{2}$/)
], futureExpenseController.updateFutureExpense);

router.delete('/:familyId/:futureExpenseId', auth, futureExpenseController.deleteFutureExpense);

module.exports = router;