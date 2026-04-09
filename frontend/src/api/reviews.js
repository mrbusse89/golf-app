import api from './client';

export async function getReviews(params = {}) {
  const { data } = await api.get('/reviews', { params });
  return data;
}

export async function createReview(review) {
  const { data } = await api.post('/reviews', review);
  return data;
}

export async function updateReview(id, updates) {
  const { data } = await api.put(`/reviews/${id}`, updates);
  return data;
}

export async function deleteReview(id) {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
}
