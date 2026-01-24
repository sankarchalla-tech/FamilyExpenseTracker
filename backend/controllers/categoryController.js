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

const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { familyId, categoryId } = req.params;
    const { name, color } = req.body;
    
    // Check if user is admin of this family
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family || family.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update categories' });
    }
    
    const category = await db.updateCategory(categoryId, familyId, { name, color });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found or cannot be updated' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error updating category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { familyId, categoryId } = req.params;
    
    // Check if user is admin of this family
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family || family.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete categories' });
    }
    
    const category = await db.deleteCategory(categoryId, familyId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found or cannot be deleted' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error deleting category' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };