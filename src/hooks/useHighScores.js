import { useState, useEffect, useCallback } from 'react';
import { fetchScores, postScore } from '../api/mockApi';

const useHighScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skorları getiren fonksiyon (artık 'refetchScores' olarak da kullanılacak)
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

  // Yeni skor ekleyen fonksiyon artık daha basit: Sadece skoru gönderiyor.
  const addScore = useCallback(async (name, score) => {
    try {
      setError(null);
      await postScore(name, score);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Bileşen ilk yüklendiğinde skorları otomatik olarak çek
  useEffect(() => {
    getScores();
  }, [getScores]);

  // Dışarıya artık 'getScores' fonksiyonunu da veriyoruz
  return { scores, loading, error, addScore, refetchScores: getScores };
};

export default useHighScores;