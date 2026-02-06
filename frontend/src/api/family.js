import api from './axios';

export const familyAPI = {
  createFamily: async (name) => {
    const response = await api.post('/families', { name });
    return response.data;
  },

  getFamilies: async () => {
    const response = await api.get('/families');
    return response.data;
  },

  getFamily: async (familyId) => {
    const response = await api.get(`/families/${familyId}`);
    return response.data;
  },

  addMember: async (familyId, email, name, role) => {
    const response = await api.post(`/families/${familyId}/members`, { email, name, role });
    return response.data;
  },

  removeMember: async (familyId, userId) => {
    const response = await api.delete(`/families/${familyId}/members/${userId}`);
    return response.data;
  },

  getFamilyMembers: async (familyId) => {
    const response = await api.get(`/families/${familyId}/members`);
    return response.data;
  },

  deleteFamily: async (familyId) => {
    const response = await api.delete(`/families/${familyId}`);
    return response.data;
  },
};