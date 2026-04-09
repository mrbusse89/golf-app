import api from './client';

export async function getRounds(params = {}) {
  const { data } = await api.get('/rounds', { params });
  return data;
}

export async function getRound(id) {
  const { data } = await api.get(`/rounds/${id}`);
  return data;
}

export async function createRound(round) {
  const { data } = await api.post('/rounds', round);
  return data;
}

export async function updateRound(id, updates) {
  const { data } = await api.put(`/rounds/${id}`, updates);
  return data;
}

export async function deleteRound(id) {
  const { data } = await api.delete(`/rounds/${id}`);
  return data;
}
