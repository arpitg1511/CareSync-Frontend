import api from './api';

const AUTH_URL = '/auth';

export const authService = {
  login: async (credentials) => {
    // credentials: { username, password }
    const response = await api.post(`${AUTH_URL}/signin`, credentials);
    // Returns { token, id, username, email, roles, name, speciality, bio, ... }
    return response.data;
  },

  register: async (userData) => {
    // userData: { username, email, password, role: ['ROLE_PATIENT'|'ROLE_DOCTOR'], name, ... }
    const response = await api.post(`${AUTH_URL}/signup`, userData);
    return response.data;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`${AUTH_URL}/profile`, data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put(`${AUTH_URL}/password`, data);
    return response.data;
  }
};
