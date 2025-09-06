import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID, USERNAME } from './constants';

export function logoutUser() {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USERNAME);
  window.dispatchEvent(new Event('session-expired'));
}
