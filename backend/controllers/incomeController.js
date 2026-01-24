const db = require('../config/database');
const { validationResult } = require('express-validator');

const createIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { source, amount, month, note } = req.body;
    const familyId = parseInt(req.params.familyId);

    const income = await db.createIncome({
      family_id: familyId,
      user_id: req.user.id,
      source,
      amount: parseFloat(amount),
      month,
      note
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ error: 'Server error creating income' });
  }
};

const getIncomes = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { userId, month, source } = req.query;

    const filters = {};
    if (userId) filters.userId = parseInt(userId);
    if (month) filters.month = month;
    if (source) filters.source = source;

    const incomes = await db.getIncomes(parseInt(familyId), filters);
    res.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ error: 'Server error fetching incomes' });
  }
};

const getIncome = async (req, res) => {
  try {
    const { familyId, incomeId } = req.params;
    
    const income = await db.getIncomeById(incomeId, familyId);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    
    res.json(income);
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ error: 'Server error fetching income' });
  }
};

const updateIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { familyId, incomeId } = req.params;
    const { source, amount, month, note } = req.body;
    
    const existingIncome = await db.getIncomeById(incomeId, familyId);
    if (!existingIncome) {
      return res.status(404).json({ error: 'Income not found' });
    }
    
    if (existingIncome.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this income' });
    }
    
    const updates = {};
    if (source !== undefined) updates.source = source;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (month !== undefined) updates.month = month;
    if (note !== undefined) updates.note = note;
    
    const income = await db.updateIncome(incomeId, familyId, updates);
    res.json(income);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Server error updating income' });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { familyId, incomeId } = req.params;
    
    const existingIncome = await db.getIncomeById(incomeId, familyId);
    if (!existingIncome) {
      return res.status(404).json({ error: 'Income not found' });
    }
    
    if (existingIncome.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this income' });
    }
    
    await db.deleteIncome(incomeId, familyId);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Server error deleting income' });
  }
};

module.exports = { createIncome, getIncomes, getIncome, updateIncome, deleteIncome };