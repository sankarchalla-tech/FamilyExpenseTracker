# Building a Family Expense Tracker from Scratch

## A Step-by-Step Guide with Explanations

---

## Overview

This guide walks you through building a **Family Expense Tracker** - a full-stack web application that allows families to track, manage, and analyze their expenses together.

### Tech Stack

| Layer | Technology |
|-------|-------------|
| **Backend** | Node.js, Express, PostgreSQL |
| **Frontend** | React, Vite, Tailwind CSS |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Database** | PostgreSQL |
| **Charts** | Recharts |

---

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

---

# Part 1: Backend Setup

## Step 1: Initialize the Backend Project

Create the backend directory structure and initialize npm:

```bash
mkdir backend
cd backend
npm init -y
```

### Why?
- Creates a Node.js project with a `package.json` file
- This file manages all dependencies and project metadata

## Step 2: Install Backend Dependencies

```bash
npm install express pg bcryptjs jsonwebtoken cors dotenv express-validator
npm install --save-dev nodemon
```

### Why Each Package?

| Package | Purpose |
|---------|---------|
| **express** | Web framework for building REST APIs |
| **pg** | PostgreSQL client for Node.js to connect to the database |
| **bcryptjs** | Hashes passwords for secure storage |
| **jsonwebtoken** | Creates and verifies JWT tokens for authentication |
| **cors** | Allows the frontend to make requests to the backend |
| **dotenv** | Loads environment variables from `.env` file |
| **express-validator** | Validates user input (emails, passwords, etc.) |
| **nodemon** | Auto-restarts the server during development |

## Step 3: Create Backend Package.json Scripts

Update `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Why?
- `npm start` runs the server in production mode
- `npm run dev` runs with nodemon for auto-reload during development

---

## Step 4: Create Environment Configuration

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/family_expense_tracker
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Why?

| Variable | Purpose |
|----------|---------|
| **PORT** | The port the server listens on |
| **DATABASE_URL** | Connection string for PostgreSQL |
| **JWT_SECRET** | Secret key used to sign JWT tokens (change in production!) |
| **NODE_ENV** | Sets the environment mode |

---

## Step 5: Create Database Schema

Create `backend/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_id, user_id)
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_id, name)
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS income (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS future_expenses (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    monthly_amount DECIMAL(10, 2) NOT NULL,
    start_month VARCHAR(7) NOT NULL,
    end_month VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_expenses_family_id ON expenses(family_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);

-- Insert default categories
INSERT INTO categories (name, color, is_default) VALUES
    ('Housing', '#3B82F6', true),
    ('Bills', '#F59E0B', true),
    ('Shopping', '#8B5CF6', true),
    ('Transport', '#10B981', true),
    ('Ration', '#EF4444', true),
    ('Credit Card', '#EC4899', true),
    ('Medical', '#6366F1', true),
    ('Dining', '#14B8A6', true),
    ('Travel', '#F97316', true),
    ('Other', '#6B7280', true)
ON CONFLICT DO NOTHING;
```

### Why Each Table?

| Table | Purpose |
|-------|---------|
| **users** | Stores registered users with hashed passwords |
| **families** | Groups of users who share expenses |
| **family_members** | Links users to families with roles (admin/member) |
| **categories** | Expense categories with colors (per family or default) |
| **expenses** | Individual expense records |
| **income** | Family income sources |
| **future_expenses** | Planned/recurring expenses |

**Key Design Decisions:**
- `ON DELETE CASCADE` automatically deletes related records
- `UNIQUE` constraints prevent duplicate entries
- Indexes improve query performance on frequently searched columns
- Default categories provide ready-to-use expense types

---

## Step 6: Database Connection Configuration

Create `backend/config/db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = { pool };
```

### Why?
- Creates a connection pool for efficient database access
- SSL configuration for secure connections
- Error handling for connection issues

---

## Step 7: Database Helper Functions

Create `backend/config/database.js`:

```javascript
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
  
  // ... more helper methods for families, expenses, categories, etc.
};

module.exports = db;
```

### Why?
- Abstracts database queries into reusable functions
- Prevents SQL injection through parameterized queries
- Makes controllers cleaner and more maintainable

---

## Step 8: Create Authentication Middleware

Create `backend/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;
```

### Why?
- Protects routes that require authentication
- Extracts and verifies JWT token from request headers
- Attaches user information to the request object

---

## Step 9: Create Routes and Controllers

### Auth Routes - `backend/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], authController.register);

router.post('/login', [
  body('password').notEmpty()
], authController.login);

router.get('/me', auth, authController.getMe);

module.exports = router;
```

### Why?
- Defines API endpoints for registration, login, and getting current user
- Uses express-validator for input validation
- Protects the `/me` route with auth middleware

### Auth Controller - `backend/controllers/authController.js`

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    
    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.createUser(name, email, passwordHash, username);
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { login, email, password } = req.body;
    const loginInput = login || email;
    
    // Find user by email or username
    let user;
    if (loginInput.includes('@')) {
      user = await db.getUserByEmail(loginInput);
    } else {
      user = await db.getUserByUsername(loginInput);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { register, login, getMe };
```

### Why?
- **bcrypt.hash()**: Hashes password with salt (10 rounds) for secure storage
- **bcrypt.compare()**: Verifies password against hash without exposing the original
- **jwt.sign()**: Creates a signed token containing user info
- Token expires in 7 days for security

---

## Step 10: Main Server File

Create `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');
const incomeRoutes = require('./routes/income');
const futureExpenseRoutes = require('./routes/futureExpenses');
const userRoutes = require('./routes/users');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/future-expenses', futureExpenseRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, pool };
```

### Why?
- **express.json()**: Parses JSON request bodies
- **cors**: Enables Cross-Origin Resource Sharing for frontend communication
- Route mounting organizes endpoints under `/api/*` paths
- Health check endpoint verifies server is running

---

## Step 11: Initialize Database Script

Create `backend/init-db.js`:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Initializing database schema...');
    await client.query(schema);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

### Why?
- Reads and executes the SQL schema file
- Creates all tables and default data
- Essential for setting up the database for the first time

---

# Part 2: Frontend Setup

## Step 1: Initialize Vite React Project

From the project root:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Why?
- **Vite**: Modern, fast build tool with hot module replacement
- **React**: Component-based UI library
- Creates a ready-to-use React project structure

---

## Step 2: Install Frontend Dependencies

```bash
npm install axios react-router-dom recharts react-hook-form
npm install -D tailwindcss postcss autoprefixer
```

### Why Each Package?

| Package | Purpose |
|---------|---------|
| **axios** | HTTP client for API requests |
| **react-router-dom** | Client-side routing |
| **recharts** | Charting library for analytics |
| **react-hook-form** | Form handling with validation |
| **tailwindcss** | Utility-first CSS framework |
| **postcss/autoprefixer** | CSS processing tools for Tailwind |

---

## Step 3: Configure Tailwind CSS

Create `frontend/tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

Create `frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Add to `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Why?
- Configures Tailwind to scan project files for classes
- Autoprefixer adds vendor prefixes for browser compatibility
- `@tailwind` directives include Tailwind's styles

---

## Step 4: Configure Vite

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts']
        }
      }
    }
  }
})
```

### Why?
- **manualChunks**: Splits vendor code into separate bundles for better caching
- **sourcemap**: Helps with debugging production issues

---

## Step 5: Create API Client

Create `frontend/src/api/axios.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Why?
- Creates an axios instance with base URL
- Attaches JWT token to every request automatically
- Handles 401 errors by redirecting to login

---

## Step 6: Create Authentication Context

Create `frontend/src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (loginData) => {
    const res = await api.post('/auth/login', loginData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Why?
- **Context API**: Shares auth state across the entire app
- **useEffect**: Checks for existing token on app load
- **login/register**: Handle auth and store token
- **logout**: Clears auth state

---

## Step 7: Create API Service Files

Create `frontend/src/api/auth.js`:

```javascript
import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/users/profile', data);
export const updatePassword = (data) => api.put('/users/password', data);
```

Create `frontend/src/api/expense.js`:

```javascript
import api from './axios';

export const getExpenses = (familyId, filters) => 
  api.get(`/expenses/${familyId}`, { params: filters });

export const createExpense = (expense) => 
  api.post('/expenses', expense);

export const updateExpense = (familyId, expenseId, data) => 
  api.put(`/expenses/${familyId}/${expenseId}`, data);

export const deleteExpense = (familyId, expenseId) => 
  api.delete(`/expenses/${familyId}/${expenseId}`);
```

### Why?
- Abstracts API calls into reusable functions
- Makes components cleaner by hiding axios details
- Easy to modify API endpoints in one place

---

## Step 8: Create Main App Component

Update `frontend/src/App.jsx`:

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FamilyProvider } from './context/FamilyContext';
import { ToastProvider } from './hooks/useToast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FamilyPage from './pages/FamilyPage';
import ExpensesPage from './pages/ExpensesPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="large" text="Authenticating..." />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/family/:familyId" element={<ProtectedRoute><FamilyPage /></ProtectedRoute>} />
      <Route path="/family/:familyId/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <FamilyProvider>
              <AppRoutes />
            </FamilyProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
```

### Why?
- **Router**: Enables client-side routing
- **AuthProvider**: Makes user authentication available globally
- **FamilyProvider**: Manages family selection state
- **ProtectedRoute**: Redirects unauthenticated users to login
- **ErrorBoundary**: Catches React errors gracefully

---

## Step 9: Create Login Page

Create `frontend/src/pages/LoginPage.jsx`:

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <input
          type="text"
          placeholder="Email or Username"
          value={formData.login}
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-2 border rounded mb-6"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
```

### Why?
- **useState**: Manages form input and error state
- **useAuth hook**: Access authentication context
- **useNavigate**: Programmatic navigation after login
- **Tailwind classes**: Styling for responsive design

---

## Step 10: Create Dashboard Page

Create `frontend/src/pages/DashboardPage.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFamilies } from '../api/family';
import { getAnalytics } from '../api/analytics';

function DashboardPage() {
  const { user, logout } = useAuth();
  const [families, setFamilies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getFamilies().then(res => setFamilies(res.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Family Expense Tracker</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="text-red-600">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Families</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Family
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map(family => (
            <Link key={family.id} to={`/family/${family.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold">{family.name}</h3>
              <p className="text-gray-500">Role: {family.role}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
```

### Why?
- **useEffect**: Fetches families on component mount
- **Link**: Creates navigable family cards
- **logout**: Clears session and redirects

---

# Part 3: Running the Application

## Step 1: Create PostgreSQL Database

```bash
createdb family_expense_tracker
```

### Why?
- Creates the database that stores all application data

---

## Step 2: Initialize Database Schema

```bash
cd backend
node init-db.js
```

### Why?
- Creates tables and inserts default categories

---

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

### Why?
- Starts the Express server on port 5000

---

## Step 4: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

### Why?
- Starts the Vite dev server on port 5173

---

## Step 5: Access the Application

Open browser to `http://localhost:5173`

---

# Summary: Why Each Layer?

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  - User Interface                                            │
│  - State Management (Context)                                │
│  - API Communication (Axios)                                 │
│  - Routing (React Router)                                    │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND (Express)                       │
│  - REST API Endpoints                                       │
│  - Request Validation                                        │
│  - Authentication (JWT)                                       │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL)                     │
│  - Data Storage                                              │
│  - Relationships (Users → Families → Expenses)              │
│  - Indexes for Performance                                   │
└─────────────────────────────────────────────────────────────┘
```

---

# File Structure Summary

```
FamilyExpenseWebApp/
├── backend/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── database.js     # Query helper functions
│   ├── controllers/        # Request handlers
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/             # API route definitions
│   ├── schema.sql          # Database schema
│   ├── init-db.js          # Database initialization
│   └── server.js           # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── api/            # API service functions
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   ├── tailwind.config.js # Tailwind configuration
│   └── vite.config.js     # Vite configuration
└── package.json            # Root scripts
```

---

# Next Steps to Extend

1. **Add more routes**: income, future expenses, user management
2. **Enhance UI**: Add charts with Recharts
3. **Add form validation**: Use react-hook-form
4. **Add error handling**: Toast notifications
5. **Production deployment**: Configure for Vercel/Heroku

---

*This guide provides a complete foundation for building a family expense tracking application. Each step includes the reasoning behind the code to help you understand the full picture.*
