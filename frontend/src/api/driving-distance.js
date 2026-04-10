import api from './client';

export async function getDrivingDistanceStats() {
  const { data } = await api.get('/driving-distance/stats');
  return data;
}
