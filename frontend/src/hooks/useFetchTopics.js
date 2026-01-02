import { useState, useEffect, useCallback } from 'react';
import { getTopics } from '../services/topics';

const useFetchTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await getTopics();
      setTopics(res.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();

    const handleUpdate = () => {
      fetchTopics();
    };

    window.addEventListener('communitiesUpdated', handleUpdate);

    return () => {
      window.removeEventListener('communitiesUpdated', handleUpdate);
    };
  }, [fetchTopics]);

  return { topics, loading };
};

export default useFetchTopics;
