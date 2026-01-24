import React, { useState, useEffect } from 'react';
import { incomeAPI } from '../api/income';

export default function IncomeTable({ familyId, selectedMonth, selectedMember }) {
  const [incomes, setIncomes] = useState([]);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    month: selectedMonth.toISOString().slice(0, 7),
    note: ''
  });

  const loadIncomes = async () => {
    try {
      const month = selectedMonth.toISOString().slice(0, 7);
      const filters = { month };
      if (selectedMember && selectedMember !== 'all') {
        filters.userId = selectedMember;
      }
      const data = await incomeAPI.getIncomes(familyId, filters);
      setIncomes(data);
    } catch (error) {
      console.error('Error loading incomes:', error);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, [familyId, selectedMonth, selectedMember]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        await incomeAPI.updateIncome(familyId, editingIncome.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        await incomeAPI.createIncome(familyId, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      setShowAddIncome(false);
      setEditingIncome(null);
      setFormData({
        source: '',
        amount: '',
        month: selectedMonth.toISOString().slice(0, 7),
        note: ''
      });
      loadIncomes();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      source: income.source,
      amount: income.amount,
      month: income.month,
      note: income.note || ''
    });
    setShowAddIncome(true);
  };

  const handleDelete = async (incomeId) => {
    if (!confirm('Are you sure you want to delete this income?')) return;
    
    try {
      await incomeAPI.deleteIncome(familyId, incomeId);
      loadIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const monthlyTotal = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);

  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
          💰 Money In
        </h2>
        <button
          onClick={() => setShowAddIncome(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
        >
          + Add Income
        </button>
      </div>

      <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
        <p className="text-green-900 dark:text-green-200">
          <span className="font-bold">Monthly Total:</span> ₹{monthlyTotal.toFixed(2)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-100 dark:bg-green-900/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wider">
                Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wider">
                Note
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200 dark:divide-green-800">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No income records for this month
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income.id} className="hover:bg-green-50 dark:hover:bg-green-900/30">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {income.source}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-300">
                    ₹{income.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {income.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {income.note || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleEdit(income)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(income.id)}
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

      {showAddIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source *
                </label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Salary, Freelance, Business, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹) *
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
                  Month *
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
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
                    setShowAddIncome(false);
                    setEditingIncome(null);
                    setFormData({
                      source: '',
                      amount: '',
                      month: selectedMonth.toISOString().slice(0, 7),
                      note: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                >
                  {editingIncome ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}