import axiosInstance from '../../services/axiosInstance';

const categoriesAPI = {
  list: () => axiosInstance.get('/api/categories'),
  create: (payload) => axiosInstance.post('/api/categories', payload),
  update: (id, payload) => axiosInstance.put(`/api/categories/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/api/categories/${id}`),
};

export default categoriesAPI;
