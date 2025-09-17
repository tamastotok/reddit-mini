import api from './api';

// ---- GET ----
export const getAllPosts = (params) => api.get('/api/posts/', { params });
export const getPostById = (id) => api.get(`/api/post/${id}/`);

// ---- CREATE ----
export const createPost = (data) => api.post('/api/post/create/', data);

// ---- UPDATE ----
export const updatePost = (id, data) =>
  api.put(`/api/post/${id}/update/`, data);

// ---- DELETE ----
export const deletePost = (id) => api.delete(`/api/post/${id}/delete/`);

// ---- VOTE ----
export const votePost = (postId, voteType) =>
  api.post(`/api/post/${postId}/vote/`, { vote_type: voteType });
