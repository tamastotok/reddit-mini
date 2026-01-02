import { logout } from '../services/user';
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID, USERNAME } from './constants';

export async function logoutUser() {
  const refresh = localStorage.getItem(REFRESH_TOKEN);

  try {
    if (refresh) {
      await logout(refresh);
    }
  } catch (error) {
    console.error('Failed to blacklist refresh token:', error);
  } finally {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER_ID);
    localStorage.removeItem(USERNAME);

    window.dispatchEvent(new Event('session-expired'));
  }
}
