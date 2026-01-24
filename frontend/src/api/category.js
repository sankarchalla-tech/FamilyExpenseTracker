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

  updateCategory: async (familyId, categoryId, name, color) => {
    const response = await api.put(`/categories/${familyId}/${categoryId}`, { name, color });
    return response.data;
  },

  deleteCategory: async (familyId, categoryId) => {
    const response = await api.delete(`/categories/${familyId}/${categoryId}`);
    return response.data;
  },
};