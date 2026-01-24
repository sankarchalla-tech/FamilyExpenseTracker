import api from './axios';

export const expenseAPI = {
  createExpense: async (expense) => {
    const response = await api.post('/expenses', expense);
    return response.data;
  },

  getExpenses: async (familyId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/expenses/${familyId}?${params}`);
    return response.data;
  },

  getExpense: async (familyId, expenseId) => {
    const response = await api.get(`/expenses/${familyId}/${expenseId}`);
    return response.data;
  },

  updateExpense: async (familyId, expenseId, updates) => {
    const response = await api.put(`/expenses/${familyId}/${expenseId}`, updates);
    return response.data;
  },

  deleteExpense: async (familyId, expenseId) => {
    const response = await api.delete(`/expenses/${familyId}/${expenseId}`);
    return response.data;
  },
};