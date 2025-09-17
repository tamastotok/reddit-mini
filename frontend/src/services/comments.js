import api from './api';

// ---- GET ----
// Get a single comment by its ID
// No idea of what is this
export const getCommentById = (commentId) =>
  api.get(`/api/comment/${commentId}/`);

// ---- CREATE ----
export const createComment = (postId, data) =>
  api.post(`/api/post/${postId}/comment/create/`, data);

// ---- UPDATE ----
export const updateComment = (commentId, data) =>
  api.put(`/api/comment/${commentId}/update/`, data);

// ---- DELETE ----
export const deleteComment = (commentId) =>
  api.delete(`/api/comment/${commentId}/delete/`);

// ---- VOTE ----
export const voteComment = (commentId, voteType) =>
  api.post(`/api/comment/${commentId}/vote/`, { vote_type: voteType });
