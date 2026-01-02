import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID, USERNAME } from './constants';

export function saveAuthData({ access, refresh, user_id, username }) {
  localStorage.setItem(ACCESS_TOKEN, access);
  localStorage.setItem(REFRESH_TOKEN, refresh);
  localStorage.setItem(USER_ID, user_id);
  localStorage.setItem(USERNAME, username);
}
