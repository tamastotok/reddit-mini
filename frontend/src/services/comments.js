import api from './api';

// ---- CREATE ----
export const createComment = (postId, data) =>
  api.post(`/api/post/${postId}/comment/create/`, data);

// ---- UPDATE ----
export const updateComment = (commentId, data) =>
  api.put(`/api/comment/${commentId}/update/`, data);

// ---- DELETE ----
export const deleteComment = (postId, commentId) =>
  api.delete(`/api/post/${postId}/comment/${commentId}/delete/`);

// ---- VOTE ----
export const voteComment = (commentId, voteType) =>
  api.post(`/api/comment/${commentId}/vote/`, { vote_type: voteType });
