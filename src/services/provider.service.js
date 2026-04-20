import api from './api';

const PROVIDER_URL = '/providers';

export const providerService = {
  getAll: (speciality) => api.get(PROVIDER_URL + (speciality ? `/speciality/${speciality}` : '')),
  getById: (id) => api.get(`${PROVIDER_URL}/${id}`),
  search: (query) => api.get(`${PROVIDER_URL}/search?query=${query}`),
  getPending: () => api.get(`${PROVIDER_URL}/admin/pending`),
  approve: (id) => api.put(`${PROVIDER_URL}/admin/${id}/approve`),
  reject: (id) => api.put(`${PROVIDER_URL}/admin/${id}/reject`),
  getAvailability: (id) => api.get(`${PROVIDER_URL}/${id}/availability`),
  getStats: (id) => api.get(`${PROVIDER_URL}/${id}/stats`),
  saveProfile: (data) => api.post(`${PROVIDER_URL}/profile`, data),
  update: (id, data) => api.post(`${PROVIDER_URL}/profile`, data),
  deleteProfile: (id) => api.delete(`${PROVIDER_URL}/admin/${id}`),
  setAvailability: (id, available) => api.put(`${PROVIDER_URL}/${id}/availability?available=${available}`),
  getBySpeciality: (spec) => api.get(`${PROVIDER_URL}/speciality/${spec}`),
  getByEmail: (email) => api.get(`${PROVIDER_URL}/email/${email}`),
};
