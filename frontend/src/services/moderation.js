import api from './api';

export const lockPost = (postId) => api.post(`/api/posts/${postId}/lock/`);
export const lockTopic = (topicId) => api.post(`/api/topics/${topicId}/lock/`);
export const lockComment = (commentId) =>
  api.post(`/api/comments/${commentId}/lock/`);

export const banUser = (topicId, userId, reason) =>
  api.post(`/api/topics/${topicId}/ban/`, { user_id: userId, reason });

export const promoteUser = (topicId, userId, role) =>
  api.post(`/api/topics/${topicId}/promote/`, { user_id: userId, role });

export const createReport = (reportData) =>
  api.post('/api/reports/create/', reportData);

export const getTopicReports = (topicId) =>
  api.get(`/api/topics/${topicId}/reports/`);

export const resolveReport = (reportId, action) =>
  api.post(`/api/reports/${reportId}/resolve/`, { action });
