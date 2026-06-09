import api from './api';

// Auth/Register
export const registerUser = (data) => api.post('/api/user/register/', data);

// Profile
export const getUserProfile = (userId) => api.get(`/api/profile/${userId}/`);

export const getUserActivity = (username) =>
  api.get(`/api/user-activity/${username}/`);

// Password
export const changePassword = (userId, data) =>
  api.put(`/api/user/${userId}/change-password/`, data);

// Update profile
export const updateUserProfile = (userId, formData) =>
  api.put(`/api/user/${userId}/edit/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Delete user
export const deleteUser = (userId) => api.delete(`/api/user/${userId}/delete/`);

// Logout user
export const logout = async (refreshToken) => {
  return api.post('/api/logout/', { refresh: refreshToken });
};
