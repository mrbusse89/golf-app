import api from './client';

export async function getFriends() {
  const { data } = await api.get('/friends');
  return data;
}

export async function sendFriendRequest(username) {
  const { data } = await api.post('/friends', { username });
  return data;
}

export async function respondToRequest(id, action) {
  const { data } = await api.put(`/friends/${id}`, { action });
  return data;
}

export async function removeFriend(id) {
  const { data } = await api.delete(`/friends/${id}`);
  return data;
}

export async function getFriendRounds(friendId) {
  const { data } = await api.get(`/friends/${friendId}/rounds`);
  return data;
}
