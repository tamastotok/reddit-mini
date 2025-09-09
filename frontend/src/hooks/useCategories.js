import { useState, useEffect } from 'react';
import api from '../utils/api';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  //const defaultCategory = { value: 'select', label: 'Select a category' };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/post/categories/');
        //const fetched = res.data;

        //const withDefault = [defaultCategory, ...fetched];

        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export default useCategories;
