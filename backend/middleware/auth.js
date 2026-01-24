const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Validate user exists in DB to handle cases where the user was deleted after token issuance
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.id]);
    if (!userCheck.rows || userCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
