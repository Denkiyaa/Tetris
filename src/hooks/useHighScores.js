import { useState, useEffect, useCallback } from 'react';
import { fetchScores, postScore } from '../api/mockApi';

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

  // [ANA DÜZELTME 2] addScore fonksiyonu, skor ekledikten sonra listeyi yenileyecek.
  const addScore = useCallback(async (name, score) => {
    try {
      setError(null);
      // Önce yeni skoru veritabanına gönder
      await postScore(name, score);
      // Ardından güncel listeyi tekrar çek
      await getScores();
    } catch (err) {
      setError(err.message);
    }
  }, [getScores]); // getScores fonksiyonuna bağımlı hale getirildi

  // Bileşen ilk yüklendiğinde skorları otomatik olarak çek
  useEffect(() => {
    getScores();
  }, [getScores]);

  // Artık sadece 4 değer döndürüyoruz, refetch'e gerek kalmadı
  return { scores, loading, error, addScore };
};

export default useHighScores;