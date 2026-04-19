import api from './api';

const RECORD_URL = '/records';

export const recordService = {
  create: (data) => api.post(RECORD_URL, data),
  getById: (id) => api.get(`${RECORD_URL}/${id}`),
  getByAppointment: (appointmentId) => api.get(`${RECORD_URL}/appointment/${appointmentId}`),
  getByPatient: (patientId) => api.get(`${RECORD_URL}/patient/${patientId}`),
  getByProvider: (providerId) => api.get(`${RECORD_URL}/provider/${providerId}`),
  update: (id, data) => api.put(`${RECORD_URL}/${id}`, data),
  getFollowUps: () => api.get(`${RECORD_URL}/follow-ups/today`),
  getCount: (patientId) => api.get(`${RECORD_URL}/patient/${patientId}/count`),
  attachDocument: (id, url) => api.put(`${RECORD_URL}/${id}/attach?attachmentUrl=${url}`),
};
