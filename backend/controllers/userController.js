const db = require('../config/database');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }
    
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUserPassword(req.user.id, passwordHash);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Server error updating password' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, username } = req.body;
    const updates = {};
    
    if (name && name.trim()) {
      updates.name = name.trim();
    }
    
    if (username && username.trim()) {
      // Check if username is already taken by another user
      const existingUser = await db.getUserByUsername(username.trim());
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      updates.username = username.trim();
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const updatedUser = await db.updateProfile(req.user.id, updates);
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate a more secure temporary password
    const temporaryPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    await db.updateUserPassword(userId, passwordHash);
    
    res.json({ 
      message: 'Password reset successfully',
      temporaryPassword: temporaryPassword,
      userName: user.name,
      userEmail: user.email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { familyId } = req.params;
    const families = await db.getUserFamilies(req.user.id);
    
    if (families.length === 0) {
      return res.status(400).json({ error: 'You must be in a family' });
    }
    
    const userFamily = families.find(f => f.id === parseInt(familyId));
    if (!userFamily || userFamily.role !== 'admin') {
      return res.status(403).json({ error: 'Only family admins can view all users' });
    }
    
    const users = await db.getAllUsers(familyId);
    // Mark current user
    const usersWithCurrentUser = users.map(u => ({
      ...u,
      is_current_user: u.id === req.user.id
    }));
    res.json(usersWithCurrentUser);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

module.exports = { updatePassword, updateProfile, resetPassword, getUsers };