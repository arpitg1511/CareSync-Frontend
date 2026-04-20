import api from './api';

const APPOINTMENT_URL = '/appointments';

export const appointmentService = {
  create: (data) => api.post(`${APPOINTMENT_URL}/book`, data),
  getById: (id) => api.get(`${APPOINTMENT_URL}/${id}`),
  cancel: (id) => api.put(`${APPOINTMENT_URL}/${id}/cancel`),
  complete: (id) => api.put(`${APPOINTMENT_URL}/${id}/complete`),
  markNoShow: (id) => api.put(`${APPOINTMENT_URL}/${id}/no-show`),
  getSlots: (providerId, date) => api.get(`/slots/available?providerId=${providerId}&date=${date}`),
  getMyList: () => api.get(`${APPOINTMENT_URL}/my`),
  
  // Doctor/Provider Endpoints
  getByProvider: (providerId) => api.get(`${APPOINTMENT_URL}/provider/${providerId}`),
  getCount: (providerId) => api.get(`${APPOINTMENT_URL}/provider/${providerId}/count`),
  
  // Patient Endpoints
  getByUser: (userId) => api.get(`${APPOINTMENT_URL}/patient/${userId}`),
  reschedule: (id, data) => api.put(`${APPOINTMENT_URL}/${id}/reschedule`, data),
};
