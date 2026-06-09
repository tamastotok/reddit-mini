import api from './api';

// Search
export const searchAll = (query) =>
  api.get('/api/search/', { params: { q: query } });
