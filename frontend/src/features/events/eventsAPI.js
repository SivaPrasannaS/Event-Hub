import axiosInstance from '../../services/axiosInstance';

const eventsAPI = {
  list: (params) => axiosInstance.get('/api/events', { params }),
  getById: (id) => axiosInstance.get(`/api/events/${id}`),
  create: (payload) => axiosInstance.post('/api/events', payload),
  update: (id, payload) => axiosInstance.put(`/api/events/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/api/events/${id}`),
  publish: (id, publish = true) => axiosInstance.patch(`/api/events/${id}/publish`, null, { params: { publish } }),
};

export default eventsAPI;
