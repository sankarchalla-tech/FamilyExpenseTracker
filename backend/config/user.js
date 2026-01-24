const db = require('../config/database');

const updateUserPassword = async (userId, newPassword) => {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email',
    [newPassword, userId]
  );
  return result.rows[0];
};

const getAllUsers = async (familyId) => {
  const result = await pool.query(`
    SELECT u.id, u.name, u.email, u.created_at,
           CASE WHEN fm.user_id = $1 THEN true ELSE false END as is_current_user
    FROM users u
    JOIN family_members fm ON u.id = fm.user_id
    WHERE fm.family_id = $1
    ORDER BY u.name
  `, [familyId]);
  return result.rows;
};

module.exports = { updateUserPassword, getAllUsers };
};