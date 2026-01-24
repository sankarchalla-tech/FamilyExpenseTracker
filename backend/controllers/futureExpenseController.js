const db = require('../config/database');
const { validationResult } = require('express-validator');

const createFutureExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, total_amount, monthly_amount, start_month, end_month } = req.body;
    const familyId = parseInt(req.params.familyId);
    
    const futureExpense = await db.createFutureExpense({
      family_id: familyId,
      user_id: req.user.id,
      title,
      total_amount: parseFloat(total_amount),
      monthly_amount: parseFloat(monthly_amount),
      start_month,
      end_month
    });
    
    res.status(201).json(futureExpense);
  } catch (error) {
    console.error('Create future expense error:', error);
    res.status(500).json({ error: 'Server error creating future expense' });
  }
};

const getFutureExpenses = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { userId, activeOnly } = req.query;
    
    const filters = {};
    if (userId) filters.userId = parseInt(userId);
    if (activeOnly !== undefined) filters.activeOnly = activeOnly === 'true';
    
    const futureExpenses = await db.getFutureExpenses(familyId, filters);
    res.json(futureExpenses);
  } catch (error) {
    console.error('Get future expenses error:', error);
    res.status(500).json({ error: 'Server error fetching future expenses' });
  }
};

const getFutureExpense = async (req, res) => {
  try {
    const { familyId, futureExpenseId } = req.params;
    
    const futureExpense = await db.getFutureExpenseById(futureExpenseId, familyId);
    if (!futureExpense) {
      return res.status(404).json({ error: 'Future expense not found' });
    }
    
    res.json(futureExpense);
  } catch (error) {
    console.error('Get future expense error:', error);
    res.status(500).json({ error: 'Server error fetching future expense' });
  }
};

const updateFutureExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { familyId, futureExpenseId } = req.params;
    const { title, total_amount, monthly_amount, start_month, end_month } = req.body;
    
    const existingExpense = await db.getFutureExpenseById(futureExpenseId, familyId);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Future expense not found' });
    }
    
    if (existingExpense.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this future expense' });
    }
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (total_amount !== undefined) updates.total_amount = parseFloat(total_amount);
    if (monthly_amount !== undefined) updates.monthly_amount = parseFloat(monthly_amount);
    if (start_month !== undefined) updates.start_month = start_month;
    if (end_month !== undefined) updates.end_month = end_month;
    
    const futureExpense = await db.updateFutureExpense(futureExpenseId, familyId, updates);
    res.json(futureExpense);
  } catch (error) {
    console.error('Update future expense error:', error);
    res.status(500).json({ error: 'Server error updating future expense' });
  }
};

const deleteFutureExpense = async (req, res) => {
  try {
    const { familyId, futureExpenseId } = req.params;
    
    const existingExpense = await db.getFutureExpenseById(futureExpenseId, familyId);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Future expense not found' });
    }
    
    if (existingExpense.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this future expense' });
    }
    
    await db.deleteFutureExpense(futureExpenseId, familyId);
    res.json({ message: 'Future expense deleted successfully' });
  } catch (error) {
    console.error('Delete future expense error:', error);
    res.status(500).json({ error: 'Server error deleting future expense' });
  }
};

module.exports = { createFutureExpense, getFutureExpenses, getFutureExpense, updateFutureExpense, deleteFutureExpense };