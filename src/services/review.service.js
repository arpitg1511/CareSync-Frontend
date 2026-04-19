import api from './api';

const REVIEW_URL = '/reviews';

export const reviewService = {
  create: (data) => api.post(REVIEW_URL, data),
  getByProvider: (id) => api.get(`${REVIEW_URL}/provider/${id}`),
  getAvgRating: (id) => api.get(`${REVIEW_URL}/provider/${id}/avg`),
  flagReview: (id) => api.put(`${REVIEW_URL}/${id}/flag`),
};
