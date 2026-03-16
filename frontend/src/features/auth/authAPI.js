import axiosInstance from '../../services/axiosInstance';

const authAPI = {
  login: (payload) => axiosInstance.post('/api/auth/login', payload),
  register: (payload) => axiosInstance.post('/api/auth/register', payload),
  refresh: (payload) => axiosInstance.post('/api/auth/refresh', payload),
};

export default authAPI;
