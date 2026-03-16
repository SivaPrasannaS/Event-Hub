import axiosInstance from '../../services/axiosInstance';

const venuesAPI = {
  list: (params) => axiosInstance.get('/api/venues', { params }),
  create: (payload) => axiosInstance.post('/api/venues', payload),
  update: (id, payload) => axiosInstance.put(`/api/venues/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/api/venues/${id}`),
};

export default venuesAPI;
