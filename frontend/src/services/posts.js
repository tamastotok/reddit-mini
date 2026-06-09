import api from './api';

// Get
export const getAllPosts = (params) => api.get('/api/posts/', { params });
export const getPostById = (id) => api.get(`/api/post/${id}/`);

// Create
export const createPost = (data) => api.post('/api/post/create/', data);

// Update
export const updatePost = (id, data) =>
  api.put(`/api/post/${id}/update/`, data);

// Delete
export const deletePost = (id) => api.delete(`/api/post/${id}/delete/`);

// Vote
export const votePost = (postId, voteType) =>
  api.post(`/api/post/${postId}/vote/`, { vote_type: voteType });
