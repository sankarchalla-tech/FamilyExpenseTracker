import api from './axios';

export const futureExpenseAPI = {
  createFutureExpense: async (familyId, expense) => {
    const response = await api.post(`/future-expenses/${familyId}`, expense);
    return response.data;
  },

  getFutureExpenses: async (familyId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/future-expenses/${familyId}?${params}`);
    return response.data;
  },

  getFutureExpense: async (familyId, futureExpenseId) => {
    const response = await api.get(`/future-expenses/${familyId}/${futureExpenseId}`);
    return response.data;
  },

  updateFutureExpense: async (familyId, futureExpenseId, updates) => {
    const response = await api.put(`/future-expenses/${familyId}/${futureExpenseId}`, updates);
    return response.data;
  },

  deleteFutureExpense: async (familyId, futureExpenseId) => {
    const response = await api.delete(`/future-expenses/${familyId}/${futureExpenseId}`);
    return response.data;
  },
};