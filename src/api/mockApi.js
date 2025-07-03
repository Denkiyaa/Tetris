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

// *** BU FONKSİYONU GÜVENLİ HALE GETİRİYORUZ ***
export const postScore = async (name, score) => {
  // 1. .env dosyasından gizli anahtarımızı çekiyoruz.
  // Bu, kodun içine doğrudan yazmaktan daha iyi bir organizasyon pratiğidir.
  const secretKey = process.env.REACT_APP_REQUEST_SECRET_KEY;

  if (!secretKey) {
    // .env dosyasının doğru ayarlandığından emin olmak için bir kontrol
    throw new Error('.env dosyasında REACT_APP_REQUEST_SECRET_KEY tanımlı değil!');
  }

  // 2. Tekrar saldırılarını (replay attacks) önlemek için bir zaman damgası oluşturuyoruz.
  const timestamp = Math.floor(Date.now() / 1000);

  // 3. Sunucunun imza oluşturmak için kullanacağı veriyi AYNI SIRAYLA birleştiriyoruz.
  const dataToSign = `${name}:${score}:${timestamp}`;
  console.log('%cCLIENT TARAFI İMZA METNİ:', 'color: blue; font-weight: bold;', dataToSign);


  // 4. HMAC-SHA256 algoritması ve gizli anahtarımızla veriyi imzalıyoruz.
  const signature = hmacSHA256(dataToSign, secretKey).toString();

  // 5. Sunucuya göndereceğimiz gövdeyi (body) hazırlıyoruz. Artık imza ve zaman damgası da içeriyor.
  const secureBody = {
    name,
    score,
    timestamp,
    signature,
  };

  // 6. API isteğini yeni ve güvenli gövdeyle yapıyoruz.
  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(secureBody), // Güvenli gövdeyi gönder
  });

  if (!response.ok) {
    const errorData = await response.json(); // Sunucudan gelen hata mesajını al
    // Sunucudan gelen özel hata mesajını (örn: "Geçersiz İmza") göstermek daha bilgilendirici olur.
    throw new Error(errorData.error || 'Skor kaydedilemedi.');
  }

  return await response.json();
};