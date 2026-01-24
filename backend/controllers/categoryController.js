const db = require('../config/database');
const { validationResult } = require('express-validator');

const getCategories = async (req, res) => {
  try {
    const { familyId } = req.params;
    const categories = await db.getCategories(familyId);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { familyId } = req.params;
    const { name, color } = req.body;
    
    const category = await db.createCategory(familyId, name, color);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error creating category' });
  }
};

module.exports = { getCategories, createCategory };