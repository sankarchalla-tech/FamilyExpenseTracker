const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // for development purposes; adjust as needed for production
  },
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');
const incomeRoutes = require('./routes/income');
const futureExpenseRoutes = require('./routes/futureExpenses');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/future-expenses', futureExpenseRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool };