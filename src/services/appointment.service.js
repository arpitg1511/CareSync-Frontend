import api from './api';

const APPOINTMENT_URL = '/appointments';

export const appointmentService = {
  create: (data) => api.post(`${APPOINTMENT_URL}/book`, data),
  getById: (id) => api.get(`${APPOINTMENT_URL}/${id}`),
  cancel: (id) => api.put(`${APPOINTMENT_URL}/${id}/cancel`),
  complete: (id) => api.put(`${APPOINTMENT_URL}/${id}/complete`),
  getSlots: (providerId, date) => api.get(`/slots/available?providerId=${providerId}&date=${date}`),
  getMyList: () => api.get(`${APPOINTMENT_URL}/my`),
};
