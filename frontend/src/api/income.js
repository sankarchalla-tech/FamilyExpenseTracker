import api from './axios';

export const incomeAPI = {
  createIncome: async (familyId, income) => {
    const response = await api.post(`/income/${familyId}`, income);
    return response.data;
  },

  getIncomes: async (familyId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/income/${familyId}?${params}`);
    return response.data;
  },

  getIncome: async (familyId, incomeId) => {
    const response = await api.get(`/income/${familyId}/${incomeId}`);
    return response.data;
  },

  updateIncome: async (familyId, incomeId, updates) => {
    const response = await api.put(`/income/${familyId}/${incomeId}`, updates);
    return response.data;
  },

  deleteIncome: async (familyId, incomeId) => {
    const response = await api.delete(`/income/${familyId}/${incomeId}`);
    return response.data;
  },
};