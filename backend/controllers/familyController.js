const db = require('../config/database');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const createFamily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name } = req.body;
    const family = await db.createFamily(name, req.user.id);
    
    res.status(201).json(family);
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ error: 'Server error creating family' });
  }
};

const getFamilies = async (req, res) => {
  try {
    const families = await db.getUserFamilies(req.user.id);
    res.json(families);
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ error: 'Server error fetching families' });
  }
};

const getFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const members = await db.getFamilyMembers(familyId);
    
    res.json({ ...family, members });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ error: 'Server error fetching family' });
  }
};

const getFamilyMembers = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const members = await db.getFamilyMembers(familyId);
    
    res.json(members);
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({ error: 'Server error fetching family members' });
  }
};

const addFamilyMember = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { email, name, role } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    if (family.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }
    
    let user = await db.getUserByEmail(email);
    
    if (!user) {
      if (!name) {
        return res.status(400).json({ error: 'Name is required for new users' });
      }
      
      const defaultPassword = 'password123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      // Generate username from email if not provided
      const username = email.split('@')[0];
      user = await db.createUser(name, email, passwordHash, username);
    }
    
    const member = await db.addFamilyMember(familyId, user.id, role || 'member');
    
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      isNewUser: !user.password_hash
    });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({ error: 'Server error adding family member' });
  }
};

const removeFamilyMember = async (req, res) => {
  try {
    const { familyId, userId } = req.params;
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    if (family.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself from the family' });
    }
    
    const member = await db.removeFamilyMember(familyId, userId);
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove family member error:', error);
    res.status(500).json({ error: 'Server error removing family member' });
  }
};

module.exports = { createFamily, getFamilies, getFamily, getFamilyMembers, addFamilyMember, removeFamilyMember };