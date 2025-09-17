import api from './api';

// ---- AUTH/REGISTER ----
export const registerUser = (data) => api.post('/api/user/register/', data);

// ---- PROFILE ----
export const getUserProfile = (userId) => api.get(`/api/profile/${userId}/`);

export const getUserActivity = (username) =>
  api.get(`/api/user-activity/${username}/`);

// ---- PASSWORD ----
export const changePassword = (userId, data) =>
  api.put(`/api/user/${userId}/change-password/`, data);

// ---- UPDATE PROFILE ----
export const updateUserProfile = (userId, formData) =>
  api.put(`/api/user/${userId}/edit/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ---- DELETE USER ----
export const deleteUser = (userId) => api.delete(`/api/user/${userId}/delete/`);
