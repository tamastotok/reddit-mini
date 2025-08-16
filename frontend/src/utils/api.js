import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request Interceptor: Attaches token to every request
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    // If token is expired, refresh it before sending the request
    if (token && isTokenExpired(token)) {
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );

          const newAccessToken = refreshResponse.data.access;

          // Save new access token to localStorage
          localStorage.setItem(ACCESS_TOKEN, newAccessToken);

          // Update the Authorization header with the new token
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (error) {
          console.error(error);
          // If refresh fails, redirect to login
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          window.location.href = '/login';
        }
      } else {
        // If no refresh token, redirect to login
        window.location.href = '/login';
      }
    } else if (token) {
      // If token is valid, include it in the request headers
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to check if the token is expired
function isTokenExpired(token) {
  const decoded = jwtDecode(token);
  const tokenExpiration = decoded.exp;
  const now = Date.now() / 1000; // Current time in seconds
  return tokenExpiration < now; // Return true if expired
}

// Response Interceptor: Handles 401 and token refresh
api.interceptors.response.use(
  (response) => response, // Return the response as is if no error
  (error) => {
    // Pass other errors through
    return Promise.reject(error);
  }
);

export default api;
