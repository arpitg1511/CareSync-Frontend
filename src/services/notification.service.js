import api from './api';

const NOTIF_URL = '/notifications';

export const notificationService = {
  getByRecipient: (id) => api.get(`${NOTIF_URL}/recipient/${id}`),
  getUnreadCount: (id) => api.get(`${NOTIF_URL}/recipient/${id}/unread/count`),
  markRead: (id) => api.put(`${NOTIF_URL}/${id}/read`),
  markAllRead: (recipientId) => api.put(`${NOTIF_URL}/recipient/${recipientId}/read-all`),
  delete: (id) => api.delete(`${NOTIF_URL}/${id}`),
};
