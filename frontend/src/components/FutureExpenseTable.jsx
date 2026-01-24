import { useState, useEffect } from 'react';
import { futureExpenseAPI } from '../api/futureExpense';

export default function FutureExpenseTable({ familyId, selectedMonth, selectedMember }) {
  const [futureExpenses, setFutureExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    total_amount: '',
    monthly_amount: '',
    start_month: '',
    end_month: ''
  });

  const loadFutureExpenses = async () => {
    try {
      const filters = {};
      if (selectedMember && selectedMember !== 'all') {
        filters.userId = selectedMember;
      }
      const data = await futureExpenseAPI.getFutureExpenses(familyId, filters);
      setFutureExpenses(data);
    } catch (error) {
      console.error('Error loading future expenses:', error);
    }
  };

  useEffect(() => {
    loadFutureExpenses();
  }, [familyId, selectedMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await futureExpenseAPI.updateFutureExpense(familyId, editingExpense.id, {
          ...formData,
          total_amount: parseFloat(formData.total_amount),
          monthly_amount: parseFloat(formData.monthly_amount)
        });
      } else {
        await futureExpenseAPI.createFutureExpense(familyId, {
          ...formData,
          total_amount: parseFloat(formData.total_amount),
          monthly_amount: parseFloat(formData.monthly_amount)
        });
      }
      setShowAddExpense(false);
      setEditingExpense(null);
      setFormData({
        title: '',
        total_amount: '',
        monthly_amount: '',
        start_month: '',
        end_month: ''
      });
      loadFutureExpenses();
    } catch (error) {
      console.error('Error saving future expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      total_amount: expense.total_amount,
      monthly_amount: expense.monthly_amount,
      start_month: expense.start_month,
      end_month: expense.end_month
    });
    setShowAddExpense(true);
  };

  const handleDelete = async (expenseId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await futureExpenseAPI.deleteFutureExpense(familyId, expenseId);
      loadFutureExpenses();
    } catch (error) {
      console.error('Error deleting future expense:', error);
    }
  };

  const monthlyTotal = futureExpenses.reduce((sum, expense) => sum + (expense.monthly_amount || 0), 0);
  const totalCommitment = futureExpenses.reduce((sum, expense) => sum + (expense.total_amount || 0), 0);

  const isActive = (endMonth) => {
    if (!endMonth) return false;
    const today = new Date();
    const end = new Date(endMonth);
    return end >= today;
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
          ⏰ Future Expenses / EMIs
        </h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg"
        >
          + Add EMI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-lg p-4">
          <p className="text-yellow-900 dark:text-yellow-200">
            <span className="font-bold">Monthly Commitment:</span> ₹{monthlyTotal.toFixed(2)}
          </p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900/40 rounded-lg p-4">
          <p className="text-orange-900 dark:text-orange-200">
            <span className="font-bold">Total Amount:</span> ₹{totalCommitment.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-yellow-100 dark:bg-yellow-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Monthly EMI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Start Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                End Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-200 dark:divide-yellow-800">
            {futureExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No future expenses or EMIs added yet
                </td>
              </tr>
            ) : (
              futureExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {expense.title}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{expense.total_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    ₹{expense.monthly_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {expense.start_month}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {expense.end_month}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {isActive(expense.end_month) ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id, expense.title)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingExpense ? 'Edit EMI / Future Expense' : 'Add New EMI / Future Expense'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Home Loan, Car EMI, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly EMI (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.monthly_amount}
                  onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Month *
                </label>
                <input
                  type="month"
                  required
                  value={formData.start_month}
                  onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Month *
                </label>
                <input
                  type="month"
                  required
                  value={formData.end_month}
                  onChange={(e) => setFormData({ ...formData, end_month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setEditingExpense(null);
                    setFormData({
                      title: '',
                      total_amount: '',
                      monthly_amount: '',
                      start_month: '',
                      end_month: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg"
                >
                  {editingExpense ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}