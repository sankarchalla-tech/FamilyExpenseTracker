import api from './axios';

export const userAPI = {
  updateProfile: async (name, username) => {
    const response = await api.put('/users/profile', { name, username });
    return response.data;
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/update-password', { currentPassword, newPassword });
    return response.data;
  },

  resetPassword: async (userId) => {
    const response = await api.post(`/users/${userId}/reset-password`);
    return response.data;
  },

  getFamilyUsers: async (familyId) => {
    const response = await api.get(`/users/${familyId}/users`);
    return response.data;
  },
};