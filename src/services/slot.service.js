import api from './api';

const SLOT_URL = '/slots';

export const slotService = {
  getAvailable: (providerId) => api.get(`${SLOT_URL}/provider/${providerId}/available`),
  getByProvider: (providerId) => api.get(`${SLOT_URL}/provider/${providerId}`),
  createBulk: (data) => api.post(`${SLOT_URL}/bulk`, data),
  delete: (id) => api.delete(`${SLOT_URL}/${id}`),
  block: (id) => api.put(`${SLOT_URL}/${id}/block`),
  unblock: (id) => api.put(`${SLOT_URL}/${id}/unblock`),
  deleteByDate: (providerId, date) => api.delete(`${SLOT_URL}/provider/${providerId}/date/${date}`),
  generateRecurring: (data) => api.post(`${SLOT_URL}/recurring`, data),
  update: (id, data) => api.put(`${SLOT_URL}/${id}`, data),
};
