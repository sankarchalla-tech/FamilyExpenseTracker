# Family Expense Tracker

A modern web application for families to track, manage, and analyze expenses together.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Family Management**: Create and manage family groups
- **Expense Tracking**: Add, edit, and delete expenses
- **Categories**: Default and custom expense categories with color coding
- **Analytics**: Dashboard with spending insights, trends, and breakdowns
- **Responsive Design**: Mobile-first responsive UI with dark mode support

## Tech Stack

### Backend
- Node.js
- Express
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs (password hashing)

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Recharts (for charts)
- Axios (for API calls)

## Project Structure

```
FamilyExpenseWebApp/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── familyController.js
│   │   ├── expenseController.js
│   │   ├── categoryController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── family.js
│   │   ├── expenses.js
│   │   ├── categories.js
│   │   └── analytics.js
│   ├── server.js
│   ├── schema.sql
│   ├── init-db.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── family.js
│   │   │   ├── expense.js
│   │   │   ├── category.js
│   │   │   └── analytics.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FamilyContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FamilyPage.jsx
│   │   │   └── ExpensesPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── .env
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following:
   ```
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/family_expense_tracker
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. Create the PostgreSQL database:
   ```bash
   createdb family_expense_tracker
   ```

5. Initialize the database schema:
   ```bash
   node init-db.js
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the frontend directory with the following:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Create your first family
4. Start adding expenses!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Families
- `POST /api/families` - Create a family
- `GET /api/families` - Get user's families
- `GET /api/families/:familyId` - Get family details

### Expenses
- `POST /api/expenses` - Create an expense
- `GET /api/expenses/:familyId` - Get family expenses
- `GET /api/expenses/:familyId/:expenseId` - Get expense details
- `PUT /api/expenses/:familyId/:expenseId` - Update expense
- `DELETE /api/expenses/:familyId/:expenseId` - Delete expense

### Categories
- `GET /api/categories/:familyId` - Get family categories
- `POST /api/categories/:familyId` - Create category

### Analytics
- `GET /api/analytics/:familyId` - Get family analytics

## Default Categories

The application comes with the following default categories:
- Food (Red)
- Rent (Blue)
- Utilities (Amber)
- Transportation (Green)
- Medical (Purple)
- Entertainment (Pink)
- Shopping (Indigo)
- Education (Teal)
- Other (Gray)

## Future Enhancements

- Expense splitting
- OCR receipt scanning
- Export to Excel/PDF
- Mobile app (React Native)
- AI-based spending insights
- Budget tracking
- Email notifications
- Multi-currency support
- Advanced filtering and reporting

## License

ISC