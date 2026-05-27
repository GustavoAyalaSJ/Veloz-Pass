import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useFetch = (url, dependencies = []) => {
  const { request } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await request(url, { method: 'GET' });
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    if (url) {
      fetchData();
    }
  }, dependencies);

  return { data, loading, error };
};
