const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, username } = req.body;
    
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const existingUsername = await db.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser(name, email, passwordHash, username);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { login, email, password } = req.body;
    const loginInput = login || email;
    
    console.log('Login input:', loginInput);
    console.log('Password provided:', password ? 'YES' : 'NO');
    
    let user;
    
    if (loginInput && loginInput.includes('@')) {
      console.log('Searching by email...');
      user = await db.getUserByEmail(loginInput);
    } else {
      console.log('Searching by username...');
      user = await db.getUserByUsername(loginInput);
    }
    
    console.log('User found:', user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      hasPasswordHash: !!user.password_hash
    } : 'NO');
    
    if (!user) {
      console.log('USER NOT FOUND - returning 401');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Comparing passwords...');
    console.log('Stored hash length:', user.password_hash ? user.password_hash.length : 0);
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('INVALID PASSWORD - returning 401');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe };
