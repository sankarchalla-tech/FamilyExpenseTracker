import api from './axios';

export const authAPI = {
  register: async (name, email, username, password) => {
    const response = await api.post('/auth/register', { name, email, username, password });
    return response.data;
  },

  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};