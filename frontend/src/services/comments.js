import api from './api';

// Create
export const createComment = (postId, data) =>
  api.post(`/api/post/${postId}/comment/create/`, data);

// Update
export const updateComment = (commentId, data) =>
  api.put(`/api/comment/${commentId}/update/`, data);

// Delete
export const deleteComment = (postId, commentId) =>
  api.delete(`/api/post/${postId}/comment/${commentId}/delete/`);

// Vote
export const voteComment = (commentId, voteType) =>
  api.post(`/api/comment/${commentId}/vote/`, { vote_type: voteType });
