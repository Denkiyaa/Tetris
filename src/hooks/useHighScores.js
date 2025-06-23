import { useState, useEffect, useCallback } from 'react';
import { fetchScores, postScore } from '../api/mockApi';

// "export const" yerine sadece "const" olarak değiştirildi.
const useHighScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedScores = await fetchScores();
      setScores(fetchedScores);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addScore = useCallback(async (name, score) => {
    try {
      setError(null);
      await postScore(name, score);
      await getScores();
    } catch (err) {
      setError(err.message);
    }
  }, [getScores]);

  useEffect(() => {
    getScores();
  }, [getScores]);

  return { scores, loading, error, addScore };
};

// Fonksiyonu "default" olarak export ediyoruz.
export default useHighScores;