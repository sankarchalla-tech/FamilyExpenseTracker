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
    console.log('=== ADD FAMILY MEMBER ===');
    console.log('Request body:', req.body);
    
    const { familyId } = req.params;
    const { email, name, role } = req.body;
    
    console.log('Processing:', { familyId, email, name, role });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    console.log('Admin family check:', family ? { id: family.id, name: family.name, role: family.role } : 'NO');
    
    if (!family) {
      console.log('FAMILY NOT FOUND');
      return res.status(404).json({ error: 'Family not found' });
    }
    
    if (family.role !== 'admin') {
      console.log('NOT ADMIN - permission denied');
      return res.status(403).json({ error: 'Only admins can add members' });
    }
    
    console.log('Checking if user exists...');
    let user = await db.getUserByEmail(email);
    let isNewUser = false;
    
    if (!user) {
      console.log('Creating new user...');
      if (!name) {
        console.log('Name missing for new user');
        return res.status(400).json({ error: 'Name is required for new users' });
      }
      
      const defaultPassword = 'password123';
      console.log('Hashing default password...');
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      console.log('Password hash created:', passwordHash.substring(0, 20) + '...');
      
      // Generate username from email if not provided
      const username = email.split('@')[0];
      user = await db.createUser(name, email, passwordHash, username);
      console.log('Created new user:', { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        username: user.username,
        hasPasswordHash: !!user.password_hash 
      });
      isNewUser = true;
    } else {
      console.log('Found existing user:', { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        username: user.username,
        hasPasswordHash: !!user.password_hash 
      });
      isNewUser = false;
    }
    
    console.log('Adding to family...');
    const member = await db.addFamilyMember(familyId, user.id, role || 'member');
    console.log('Added to family:', member);
    
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      isNewUser: isNewUser
    };
    
    console.log('Sending response:', response);
    res.status(201).json(response);
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

const deleteFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    const families = await db.getUserFamilies(req.user.id);
    const family = families.find(f => f.id === parseInt(familyId));
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    if (family.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete families' });
    }
    
    await db.query('DELETE FROM families WHERE id = $1 AND created_by = $2', [familyId, req.user.id]);
    
    res.json({ message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({ error: 'Server error deleting family' });
  }
};

module.exports = { createFamily, getFamilies, getFamily, getFamilyMembers, addFamilyMember, removeFamilyMember, deleteFamily };