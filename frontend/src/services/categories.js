import api from './api';

// hook -> useCategories
export const getCategories = () => api.get('/api/post/categories/');
