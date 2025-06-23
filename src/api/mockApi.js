// localStorage için bir anahtar belirliyoruz
const HIGH_SCORES_KEY = 'tetrisHighScores';

// Başlangıçta localStorage'da veri var mı diye kontrol et, yoksa varsayılan listeyi kullan
const getInitialScores = () => {
  try {
    const savedScores = localStorage.getItem(HIGH_SCORES_KEY);
    if (savedScores) {
      return JSON.parse(savedScores);
    }
  } catch (e) {
    console.error("Skorlar okunurken hata oluştu:", e);
  }
  // Varsayılan skorlar
  return [
    { name: 'Gemini', score: 50000 }, { name: 'Player1', score: 42000 },
    { name: 'ReactFan', score: 35000 }, { name: 'TetrisMstr', score: 28000 },
    { name: 'Hook', score: 15000 },
  ];
};

// Skorları getiren fonksiyon artık localStorage'dan okuyor
export const fetchScores = () => {
  console.log('API: Skorlar localStorage\'dan isteniyor...');
  return new Promise((resolve) => {
    setTimeout(() => {
      const scores = getInitialScores();
      console.log('API: Skorlar başarıyla gönderildi.');
      resolve(scores);
    }, 500); // Gecikmeyi biraz kısalttık
  });
};

// Yeni bir skor ekleyen fonksiyon artık localStorage'a yazıyor
export const postScore = (name, score) => {
  console.log(`API: Yeni skor eklenecek... İsim: ${name}, Skor: ${score}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isFinite(score)) {
        return reject(new Error('Skor geçerli bir sayı değil.'));
      }
      // Mevcut skorları al
      const highScores = getInitialScores();
      const newScore = { name, score };
      highScores.push(newScore);
      highScores.sort((a, b) => b.score - a.score);
      const updatedScores = highScores.slice(0, 10);
      
      // Yeni listeyi localStorage'a kaydet
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updatedScores));
      
      console.log('API: Yeni skor başarıyla localStorage\'a eklendi.');
      resolve({ success: true, scores: updatedScores });
    }, 200);
  });
};