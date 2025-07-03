// crypto-js kütüphanesinden gerekli fonksiyonu import ediyoruz
import hmacSHA256 from 'crypto-js/hmac-sha256';

// Artık bu dosya sahte değil, gerçek API ile konuşuyor!
const API_URL = 'https://api.denkiya.com.tr'; // Kendi API adresiniz

// Bu fonksiyonda bir değişiklik yapmamıza gerek yok.
export const fetchScores = async () => {
  const response = await fetch(`${API_URL}/scores`);
  if (!response.ok) {
    throw new Error('Sunucudan skorlar alınamadı.');
  }
  return await response.json();
};


// Bu fonksiyon 3 parametre almalı: name, score, durationInSeconds
export const postScore = async (name, score, durationInSeconds) => {
  const secretKey = process.env.REACT_APP_REQUEST_SECRET_KEY;
  const timestamp = Math.floor(Date.now() / 1000);

  // 1. İmzalanacak metne 'durationInSeconds' EKLENMELİ
  const dataToSign = `${name}:${score}:${timestamp}:${durationInSeconds}`;

  const signature = hmacSHA256(dataToSign, secretKey).toString();

  // 2. İstek gövdesine 'duration' alanı EKLENMELİ
  const body = {
    name,
    score,
    timestamp,
    signature,
    duration: durationInSeconds,
  };

  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Skor kaydedilemedi.');
  }

  return await response.json();
};