#!/bin/bash

echo "🚀 Starting Family Expense Tracker..."
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
  echo "❌ Backend directory not found!"
  exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
  echo "❌ Frontend directory not found!"
  exit 1
fi

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "Backend dependencies already installed"
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "Frontend dependencies already installed"
fi
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Setup Instructions:"
echo ""
echo "1. Make sure PostgreSQL is running and the database is created:"
echo "   createdb family_expense_tracker"
echo ""
echo "2. Initialize the database:"
echo "   cd backend && node init-db.js && cd .."
echo ""
echo "3. Start the backend server (in terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "4. Start the frontend server (in terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "🎉 Happy tracking!"