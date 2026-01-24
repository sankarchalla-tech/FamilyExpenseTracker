import api from './axios';

export const categoryAPI = {
  getCategories: async (familyId) => {
    const response = await api.get(`/categories/${familyId}`);
    return response.data;
  },

  createCategory: async (familyId, name, color) => {
    const response = await api.post(`/categories/${familyId}`, { name, color });
    return response.data;
  },
};