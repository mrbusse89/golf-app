import api from './client';

export async function getCourses(params = {}) {
  const { data } = await api.get('/courses', { params });
  return data;
}

export async function getCourse(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data;
}
