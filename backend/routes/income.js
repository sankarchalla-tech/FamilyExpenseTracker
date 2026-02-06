const express = require('express');
const { body } = require('express-validator');
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');
const verifyFamilyMember = require('../middleware/verifyFamilyMember');

const router = express.Router();

router.post('/:familyId', auth, [
  body('source').trim().isLength({ min: 1, max: 100 }).withMessage('Source is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Invalid month format (YYYY-MM)'),
  body('note').optional().isLength({ max: 500 })
], incomeController.createIncome);

router.get('/:familyId', auth, incomeController.getIncomes);

router.get('/:familyId/:incomeId', auth, incomeController.getIncome);

router.put('/:familyId/:incomeId', auth, [
  body('source').optional().trim().isLength({ min: 1, max: 100 }),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('month').optional().matches(/^\d{4}-\d{2}$/),
  body('note').optional().isLength({ max: 500 })
], incomeController.updateIncome);

router.delete('/:familyId/:incomeId', auth, incomeController.deleteIncome);

module.exports = router;