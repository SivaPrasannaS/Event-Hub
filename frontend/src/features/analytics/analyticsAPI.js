import axiosInstance from '../../services/axiosInstance';

const analyticsAPI = {
  summary: () => axiosInstance.get('/api/analytics/summary'),
  monthly: () => axiosInstance.get('/api/analytics/monthly'),
  byCategory: () => axiosInstance.get('/api/analytics/by-category'),
};

export default analyticsAPI;
