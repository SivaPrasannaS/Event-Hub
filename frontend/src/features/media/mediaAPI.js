import axiosInstance from '../../services/axiosInstance';

const mediaAPI = {
  list: (params) => axiosInstance.get('/api/media', { params }),
  upload: (payload) => axiosInstance.post('/api/media', payload, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/api/media/${id}`),
};

export default mediaAPI;
