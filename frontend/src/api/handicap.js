import api from './client';

/**
 * Get current handicap index and trend data
 */
export async function getHandicap() {
  const { data } = await api.get('/handicap');
  return data;
}

/**
 * Get detailed handicap history with per-round differentials
 */
export async function getHandicapHistory() {
  const { data } = await api.get('/handicap/history');
  return data;
}
