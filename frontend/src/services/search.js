import api from './api';

// ---- SEARCH ----
export const searchAll = (query) =>
  api.get('/api/search/', { params: { q: query } });
