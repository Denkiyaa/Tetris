// Artık bu dosya sahte değil, gerçek API ile konuşuyor!
const API_URL = 'https://api.denkiya.com.tr'; // Kendi API adresiniz

export const fetchScores = async () => {
  const response = await fetch(`${API_URL}/scores`);
  if (!response.ok) {
    throw new Error('Sunucudan skorlar alınamadı.');
  }
  return await response.json();
};

export const postScore = async (name, score) => {
  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, score }),
  });
  if (!response.ok) {
    throw new Error('Skor kaydedilemedi.');
  }
  return await response.json();
};