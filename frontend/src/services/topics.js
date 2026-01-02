import api from './api';

// hook -> useTopics
export const getTopics = () => api.get('/api/topics/');
