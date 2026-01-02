import axios from 'axios';
import { logoutUser } from '../utils/logoutUser';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL });

// Separate axios instance for refreshing token
const plainAxios = axios.create({ baseURL });

// Check if token is expired or about to expire in the next 30 seconds
function isTokenExpired(token) {
  const decoded = jwtDecode(token);
  const now = Date.now() / 1000;
  const bufferTime = 30; // seconds before actual expiration
  return decoded.exp < now + bufferTime;
}

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    if (token && isTokenExpired(token)) {
      if (refreshToken) {
        try {
          const response = await plainAxios.post('/api/token/refresh/', {
            refresh: refreshToken,
          });

          token = response.data.access;
          localStorage.setItem(ACCESS_TOKEN, token);
        } catch (err) {
          console.error('Token refresh failed:', err);
          logoutUser();
          return Promise.reject(err);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      // Only treat it as session expired if the user is already logged in
      localStorage.getItem(ACCESS_TOKEN) && // or any other auth indicator
      !originalRequest._retry // to prevent loops
    ) {
      const event = new Event('session-expired');
      window.dispatchEvent(event);
    }

    return Promise.reject(error);
  }
);

export default api;
