import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { expenseAPI } from '../api/expense';
import { categoryAPI } from '../api/category';

function ExpensesPage() {
  const { user } = useAuth();
  const { selectedFamily } = useFamily();
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', search: '', startDate: '', endDate: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    if (parseInt(familyId) !== selectedFamily?.id) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [familyId, filters, selectedMonth]);

  const loadData = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0);
      const endDate = lastDay.toISOString().split('T')[0];
 
      const apiFilters = {
        userId: filters.userId,
        categoryId: filters.category || undefined,
        search: filters.search || undefined,
        startDate,
        endDate
      };
      
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === undefined || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });
      
      const [expensesData, categoriesData] = await Promise.all([
        expenseAPI.getExpenses(familyId, apiFilters),
        categoryAPI.getCategories(familyId)
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseAPI.updateExpense(familyId, editingExpense.id, formData);
      } else {
        await expenseAPI.createExpense({
          family_id: parseInt(familyId),
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      setShowAddExpense(false);
      setEditingExpense(null);
      setFormData({ category_id: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      loadData();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category_id: expense.category_id,
      amount: expense.amount,
      date: expense.date,
      note: expense.note
    });
    setShowAddExpense(true);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseAPI.deleteExpense(familyId, expenseId);
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', startDate: '', endDate: '' });
  };

  const spendingByMember = expenses.reduce((acc, expense) => {
    if (!acc[expense.user_id]) {
      acc[expense.user_id] = { name: expense.user_name || 'Unknown', total: 0, count: 0 };
    }
    acc[expense.user_id].total += expense.amount || 0;
    acc[expense.user_id].count += 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                loadData();
              }}
              className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedFamily?.name} - Expenses
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth.toISOString().slice(0, 7)}
                onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Current
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search expenses..."
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            {(filters.category || filters.search) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg w-full sm:w-auto"
          >
            + Add Your Expense
          </button>
        </div>
        
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium">Viewing expenses for: {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              <p className="mt-1">You can only edit or delete your own expenses. View all family expenses to see spending patterns.</p>
            </div>
          </div>
        </div>

        {expenses.length > 0 && Object.keys(spendingByMember).length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Spending by Member
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                - {selectedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              See who's spending the most this month
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(spendingByMember)
                .sort((a, b) => b.total - a.total)
                .map((member, index) => {
                  const isHighest = index === 0;
                  return (
                    <div key={member.name} className={`flex items-center gap-4 p-4 rounded-lg ${
                      isHighest 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400 dark:ring-yellow-500' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isHighest 
                          ? 'bg-yellow-100 dark:bg-yellow-900' 
                          : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <span className={`text-lg font-medium ${
                          isHighest 
                            ? 'text-yellow-600 dark:text-yellow-300' 
                            : 'text-blue-600 dark:text-blue-300'
                        }`}>
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {member.name}
                          {isHighest && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full">
                              Highest
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{member.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: expense.category_color + '20',
                            color: expense.category_color
                          }}
                        >
                          {expense.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {expense.note || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.user_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white text-right">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {expense.user_id === user.id && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note (optional)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Add a note..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExpense(false);
                      setEditingExpense(null);
                      setFormData({ category_id: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    {editingExpense ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ExpensesPage;