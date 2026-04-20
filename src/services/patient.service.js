import api from './api';

const PATIENT_URL = '/patients';

export const patientService = {
  getMyProfile: () => api.get(`${PATIENT_URL}/me`),
  updateProfile: (data) => api.put(`${PATIENT_URL}/me`, data),
  createProfile: (data) => api.post(`${PATIENT_URL}/profile`, data),
  getById: (id) => api.get(`${PATIENT_URL}/${id}`),
  getByEmail: (email) => api.get(`${PATIENT_URL}/email/${email}`),
};
