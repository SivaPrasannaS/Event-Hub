import axiosInstance from '../../services/axiosInstance';

const rsvpAPI = {
  get: (eventId) => axiosInstance.get(`/api/events/${eventId}/rsvp`),
  save: (eventId, payload) => axiosInstance.post(`/api/events/${eventId}/rsvp`, payload),
  remove: (eventId) => axiosInstance.delete(`/api/events/${eventId}/rsvp`),
};

export default rsvpAPI;
