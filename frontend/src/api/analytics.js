import api from './axios';

export const analyticsAPI = {
  getAnalytics: async (familyId, startDate, endDate, userId = null) => {
    const params = { startDate, endDate };
    if (userId) {
      params.userId = userId;
    }
    const response = await api.get(`/analytics/${familyId}`, { params });
    return response.data;
  },
};