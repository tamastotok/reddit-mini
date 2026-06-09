import { useState, useEffect, useCallback } from 'react';
import { UserContext } from './UserContext';
import { getUserProfile } from '../services/user';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem('user_id');

  const refreshUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      return;
    }

    try {
      const res = await getUserProfile(userId);
      setUser({
        id: res.data.id,
        username: res.data.username,
        avatar: res.data.profile?.avatar,
        is_staff: res.data.is_staff,
        moderated_topics: res.data.moderated_topics,
      });
    } catch (err) {
      console.error('User context refresh error:', err);
    }
  }, [userId]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
