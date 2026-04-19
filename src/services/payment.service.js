import api from './api';

const PAYMENT_URL = '/payments';

export const paymentService = {
  getEarnings: (providerId) => api.get(`${PAYMENT_URL}/provider/${providerId}/earnings`),
  getTransactions: (id) => api.get(`${PAYMENT_URL}/user/${id}`),
  createPayment: (data) => api.post(PAYMENT_URL, data),
};
