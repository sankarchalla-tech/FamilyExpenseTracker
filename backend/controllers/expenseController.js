const db = require('../config/database');
const { validationResult } = require('express-validator');

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { family_id, category_id, amount, date, note } = req.body;
    
    const expense = await db.createExpense({
      family_id,
      user_id: req.user.id,
      category_id,
      amount,
      date,
      note
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error creating expense' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { userId, categoryId, startDate, endDate, search } = req.query;
    
    const filters = {};
    if (userId) filters.userId = parseInt(userId);
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;
    
    const expenses = await db.getExpenses(familyId, filters);
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
};

const getExpense = async (req, res) => {
  try {
    const { familyId, expenseId } = req.params;
    
    const expense = await db.getExpenseById(expenseId, familyId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error fetching expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { familyId, expenseId } = req.params;
    
    const existingExpense = await db.getExpenseById(expenseId, familyId);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    if (existingExpense.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this expense' });
    }
    
    const updates = {};
    const { category_id, amount, date, note } = req.body;
    
    if (category_id !== undefined) updates.category_id = category_id;
    if (amount !== undefined) updates.amount = amount;
    if (date !== undefined) updates.date = date;
    if (note !== undefined) updates.note = note;
    
    const expense = await db.updateExpense(expenseId, familyId, updates);
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error updating expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { familyId, expenseId } = req.params;
    
    const existingExpense = await db.getExpenseById(expenseId, familyId);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    if (existingExpense.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this expense' });
    }
    
    await db.deleteExpense(expenseId, familyId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error deleting expense' });
  }
};

module.exports = { createExpense, getExpenses, getExpense, updateExpense, deleteExpense };