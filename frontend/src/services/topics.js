import api from './api';

export const getAllTopicTags = () => api.get('/api/topic-tags/');
export const getTopics = () => api.get('/api/topics/');

export const createTopic = (data) => api.post('/api/topics/', data);

export const getTopicDetail = (slug) => api.get(`/api/topics/${slug}/`);
export const toggleSubscribe = (slug) =>
  api.post(`/api/topics/${slug}/subscribe/`);
