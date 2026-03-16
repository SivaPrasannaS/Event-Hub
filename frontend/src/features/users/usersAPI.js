import axiosInstance from '../../services/axiosInstance';

const usersAPI = {
  list: () => axiosInstance.get('/api/admin/users'),
  assignRole: (id, payload) => axiosInstance.put(`/api/admin/users/${id}/role`, payload),
  deactivate: (id) => axiosInstance.delete(`/api/admin/users/${id}`),
  activate: (id) => axiosInstance.patch(`/api/admin/users/${id}/activate`),
};

export default usersAPI;
