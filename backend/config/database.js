const { pool } = require('./db');

const db = {
  query: (text, params) => pool.query(text, params),
  
  getUserByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  getUserById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  createUser: async (name, email, passwordHash, username = null) => {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, username) VALUES ($1, $2, $3, $4) RETURNING id, name, email, username, password_hash, created_at',
      [name, email, passwordHash, username]
    );

    return result.rows[0];
  },
  
  getUserByUsername: async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  },
  
  createFamily: async (name, createdBy) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const familyResult = await client.query(
        'INSERT INTO families (name, created_by) VALUES ($1, $2) RETURNING *',
        [name, createdBy]
      );
      const family = familyResult.rows[0];
      
      await client.query(
        'INSERT INTO family_members (family_id, user_id, role) VALUES ($1, $2, $3)',
        [family.id, createdBy, 'admin']
      );
      
      await client.query('COMMIT');
      return family;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  getUserFamilies: async (userId) => {
    const result = await pool.query(`
      SELECT f.*, fm.role 
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = $1
    `, [userId]);
    return result.rows;
  },
  
  getFamilyMembers: async (familyId) => {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, fm.role, fm.created_at as joined_at
      FROM users u
      JOIN family_members fm ON u.id = fm.user_id
      WHERE fm.family_id = $1
    `, [familyId]);
    return result.rows;
  },
  
  addFamilyMember: async (familyId, userId, role = 'member') => {
    const result = await pool.query(
      `INSERT INTO family_members (family_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (family_id, user_id) DO UPDATE 
       SET role = $3
       RETURNING *`,
      [familyId, userId, role]
    );
    return result.rows[0];
  },
  
  removeFamilyMember: async (familyId, userId) => {
    const result = await pool.query(
      'DELETE FROM family_members WHERE family_id = $1 AND user_id = $2 RETURNING *',
      [familyId, userId]
    );
    return result.rows[0];
  },
  
  createExpense: async (expense) => {
    const result = await pool.query(
      `INSERT INTO expenses (family_id, user_id, category_id, amount, date, note) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [expense.family_id, expense.user_id, expense.category_id, expense.amount, expense.date, expense.note]
    );
    const row = result.rows[0];
    return { ...row, amount: parseFloat(row.amount) };
  },
  
  getExpenses: async (familyId, filters = {}) => {
    let query = `
      SELECT e.*, u.name as user_name, c.name as category_name, c.color as category_color
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.family_id = $1
    `;
    const params = [familyId];
    let paramIndex = 2;
    
    if (filters.userId) {
      query += ` AND e.user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }
    
    if (filters.categoryId) {
      query += ` AND e.category_id = $${paramIndex++}`;
      params.push(filters.categoryId);
    }
    
    if (filters.startDate) {
      query += ` AND e.date >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ` AND e.date <= $${paramIndex++}`;
      params.push(filters.endDate);
    }
    
    if (filters.search) {
      query += ` AND (e.note ILIKE $${paramIndex++} OR e.amount::text ILIKE $${paramIndex++})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += ' ORDER BY e.date DESC, e.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount)
    }));
  },
  
  getExpenseById: async (id, familyId) => {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND family_id = $2',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },
  
  updateExpense: async (id, familyId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id, familyId);
    
    const result = await pool.query(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND family_id = $${paramIndex} RETURNING *`,
      values
    );
    
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },
  
  deleteExpense: async (id, familyId) => {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND family_id = $2 RETURNING *',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },
  
  getCategories: async (familyId) => {
    const result = await pool.query(`
      SELECT c.* FROM categories c
      WHERE c.family_id = $1 OR c.is_default = true
      ORDER BY c.name
    `, [familyId]);
    return result.rows;
  },
  
  createCategory: async (familyId, name, color) => {
    const result = await pool.query(
      'INSERT INTO categories (family_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [familyId, name, color]
    );
    return result.rows[0];
  },

  updateCategory: async (id, familyId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id, familyId);
    
    const result = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND family_id = $${paramIndex} AND is_default = false RETURNING *`,
      values
    );
    
    return result.rows[0];
  },

  deleteCategory: async (id, familyId) => {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND family_id = $2 AND is_default = false RETURNING *',
      [id, familyId]
    );
    return result.rows[0];
  },

  getAnalytics: async (familyId, startDate, endDate, userId = null) => {
    const params = userId ? [familyId, startDate, endDate, parseInt(userId)] : [familyId, startDate, endDate];

    const totalExpense = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE family_id = $1 AND date >= $2 AND date <= $3 ${userId ? 'AND user_id = $4' : ''}`,
      params
    );

    const totalIncome = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE family_id = $1 AND month >= $2 AND month <= $3 ${userId ? 'AND user_id = $4' : ''}`,
      params
    );

    const perMemberSpending = await pool.query(`
      SELECT u.id, u.name, SUM(e.amount) as total
      FROM users u
      JOIN expenses e ON u.id = e.user_id
      WHERE e.family_id = $1 AND e.date >= $2 AND e.date <= $3 ${userId ? 'AND e.user_id = $4' : ''}
      GROUP BY u.id, u.name
      ORDER BY total DESC
    `, params);

    const categoryBreakdown = await pool.query(`
      SELECT c.name, c.color, SUM(e.amount) as total
      FROM categories c
      JOIN expenses e ON c.id = e.category_id
      WHERE e.family_id = $1 AND e.date >= $2 AND e.date <= $3 ${userId ? 'AND e.user_id = $4' : ''}
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `, params);

    const monthlyTrends = await pool.query(`
      SELECT
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        SUM(amount) as total
      FROM expenses
      WHERE family_id = $1 AND date >= $2 AND date <= $3 ${userId ? 'AND user_id = $4' : ''}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
      ORDER BY year, month
    `, params);
    
    const totalExpenseValue = parseFloat(totalExpense.rows[0].total);
    const totalIncomeValue = parseFloat(totalIncome.rows[0].total);
    const netBalance = totalIncomeValue - totalExpenseValue;
    const expensePercentage = totalIncomeValue > 0 ? (totalExpenseValue / totalIncomeValue) * 100 : 0;
    
      return {
        total: totalExpenseValue,
        totalIncome: totalIncomeValue,
        netBalance: netBalance,
        expensePercentage: expensePercentage,
        perMember: perMemberSpending.rows.map(row => ({
          ...row,
          total: parseFloat(row.total)
        })),
        byCategory: categoryBreakdown.rows.map(row => ({
          ...row,
          total: parseFloat(row.total)
        })),
        monthlyTrends: monthlyTrends.rows.map(row => ({
          ...row,
          total: parseFloat(row.total)
        }))
      };
  },

  updateUserPassword: async (userId, newPassword) => {
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email, created_at',
      [newPassword, userId]
    );
    return result.rows[0];
  },

  updateProfile: async (userId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(userId);
    
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, username, created_at`,
      values
    );
    
    return result.rows[0];
  },

  getAllUsers: async (familyId) => {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at,
           CASE WHEN fm.user_id = $1 THEN true ELSE false END as is_current_user
      FROM users u
      JOIN family_members fm ON u.id = fm.user_id
      WHERE fm.family_id = $1
      ORDER BY u.name
    `, [familyId]);
    return result.rows;
  },

  createIncome: async (income) => {
    const result = await pool.query(
      `INSERT INTO income (family_id, user_id, source, amount, month, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [income.family_id, income.user_id, income.source, income.amount, income.month, income.note]
    );
    const row = result.rows[0];
    return { ...row, amount: parseFloat(row.amount) };
  },

  getIncomes: async (familyId, filters = {}) => {
    let query = `
      SELECT i.*, u.name as user_name
      FROM income i
      JOIN users u ON i.user_id = u.id
      WHERE i.family_id = $1
    `;
    const params = [familyId];
    let paramIndex = 2;

    if (filters.month) {
      query += ` AND i.month = $${paramIndex++}`;
      params.push(filters.month);
    }

    if (filters.source) {
      query += ` AND i.source ILIKE $${paramIndex++}`;
      params.push(`%${filters.source}%`);
    }

    if (filters.userId) {
      query += ` AND i.user_id = $${paramIndex++}`;
      params.push(parseInt(filters.userId));
    }

    query += ' ORDER BY i.month DESC, i.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount)
    }));
  },

  getIncomeById: async (id, familyId) => {
    const result = await pool.query(
      'SELECT * FROM income WHERE id = $1 AND family_id = $2',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },

  updateIncome: async (id, familyId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id, familyId);

    const result = await pool.query(
      `UPDATE income SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND family_id = $${paramIndex} RETURNING *`,
      values
    );

    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },

  deleteIncome: async (id, familyId) => {
    const result = await pool.query(
      'DELETE FROM income WHERE id = $1 AND family_id = $2 RETURNING *',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, amount: parseFloat(row.amount) };
  },


  createFutureExpense: async (expense) => {
    const result = await pool.query(
      `INSERT INTO future_expenses (family_id, user_id, title, total_amount, monthly_amount, start_month, end_month) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [expense.family_id, expense.user_id, expense.title, expense.total_amount, expense.monthly_amount, expense.start_month, expense.end_month]
    );
    const row = result.rows[0];
    return {
      ...row,
      total_amount: parseFloat(row.total_amount),
      monthly_amount: parseFloat(row.monthly_amount)
    };
  },
  
  getFutureExpenses: async (familyId, filters = {}) => {
    let query = `
      SELECT fe.*, u.name as user_name
      FROM future_expenses fe
      JOIN users u ON fe.user_id = u.id
      WHERE fe.family_id = $1
    `;
    const params = [familyId];
    let paramIndex = 2;
    
    if (filters.userId) {
      query += ` AND fe.user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }
    
    if (filters.activeOnly) {
      query += ` AND fe.end_month >= CURRENT_DATE`;
    }
    
    query += ' ORDER BY fe.start_month DESC';
    
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount),
      monthly_amount: parseFloat(row.monthly_amount)
    }));
  },
  
  getFutureExpenseById: async (id, familyId) => {
    const result = await pool.query(
      'SELECT * FROM future_expenses WHERE id = $1 AND family_id = $2',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...row,
      total_amount: parseFloat(row.total_amount),
      monthly_amount: parseFloat(row.monthly_amount)
    };
  },
  
  updateFutureExpense: async (id, familyId, updates) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id, familyId);
    
    const result = await pool.query(
      `UPDATE future_expenses SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND family_id = $${paramIndex} RETURNING *`,
      values
    );
    
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...row,
      total_amount: parseFloat(row.total_amount),
      monthly_amount: parseFloat(row.monthly_amount)
    };
  },
  
  deleteFutureExpense: async (id, familyId) => {
    const result = await pool.query(
      'DELETE FROM future_expenses WHERE id = $1 AND family_id = $2 RETURNING *',
      [id, familyId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      ...row,
      total_amount: parseFloat(row.total_amount),
      monthly_amount: parseFloat(row.monthly_amount)
    };
  },
  
  getFutureExpensesTotal: async (familyId) => {
    const result = await pool.query(
      'SELECT COALESCE(SUM(monthly_amount), 0) as total FROM future_expenses WHERE family_id = $1 AND end_month >= CURRENT_DATE',
      [familyId]
    );
    return parseFloat(result.rows[0].total);
  }
};

module.exports = db;