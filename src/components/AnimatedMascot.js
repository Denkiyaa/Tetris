import React from 'react';
import styles from './AnimatedMascot.module.css';

const AnimatedMascot = ({ status }) => {
  let face;
  let bodyAnimation = styles.breathing;
  let waterLevel = styles.waterRelaxed;

  switch (status) {
    case 'worried':
      face = (
        <>
          {/* Endişeli Gözler (Büyük Noktalar) */}
          <circle cx="38" cy="48" r="4" fill="#2c3e50" />
          <circle cx="62" cy="48" r="4" fill="#2c3e50" />
          {/* Endişeli Ağız (Düz Çizgi) */}
          <line x1="45" y1="60" x2="55" y2="60" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.bobbing;
      waterLevel = styles.waterWorried;
      break;

    case 'panicked':
      face = (
        <>
          {/* Panik Gözleri (> <) */}
          <path d="M 32 42 L 40 50 M 40 42 L 32 50" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 52 42 L 60 50 M 60 42 L 52 50" stroke="#2c3e50" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Panik Ağzı (Küçük "o") */}
          <circle cx="50" cy="60" r="3" fill="#2c3e50" />
        </>
      );
      bodyAnimation = styles.panickedShake;
      waterLevel = styles.waterPanicked;
      break;

    case 'gameOver':
      face = (
        <>
          {/* Oyun Bitti Gözleri (X X) */}
          <path d="M 32 42 L 42 50 M 42 42 L 32 50" stroke="#444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 52 42 L 62 50 M 62 42 L 52 50" stroke="#444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.gameOverSunk;
      waterLevel = styles.waterGameOver;
      break;
      
    default: // relaxed
      face = (
        <>
          {/* Mutlu Gözler ( ^ ^ ) */}
          <path d="M 32 48 Q 36 44 40 48" stroke="#2c3e50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 48 Q 56 44 60 48" stroke="#2c3e50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Ağız */}
          <path d="M 45 55 L 47 58 L 49 55" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.breathing;
      waterLevel = styles.waterRelaxed;
      break;
  }

  return (
    <div className={styles.container}>
      <svg viewBox="0 0 100 100" className={styles.mascotSvg}>
        {/* Yükselen Su */}
        <path className={`${styles.water} ${styles[status]}`} d="M -10 100 Q 25 80 50 100 T 110 100 V 120 H -10 Z" />

        {/* Kedi Çizimi */}
        <g className={`${styles.catBody} ${bodyAnimation}`}>
          {/* Kafa (Basit Daire) */}
          <circle cx="50" cy="50" r="30" fill="#EAEAEA" stroke="#444" strokeWidth="3"/>
          
          {/* Kulaklar (Basit Üçgenler) */}
          <polygon points="25,28 40,10 50,32" fill="#EAEAEA" stroke="#444" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="75,28 60,10 50,32" fill="#EAEAEA" stroke="#444" strokeWidth="3" strokeLinejoin="round" />
          {/* İç Kulaklar */}
          <polygon points="31,29 40,18 47,30" fill="#FFDDE1" />
          <polygon points="69,29 60,18 53,30" fill="#FFDDE1" />

          {/* Bıyıklar */}
          <g stroke="#333" strokeWidth="1" strokeLinecap="round">
            <line x1="24" y1="50" x2="10" y2="48" />
            <line x1="24" y1="55" x2="10" y2="57" />
            <line x1="76" y1="50" x2="90" y2="48" />
            <line x1="76" y1="55" x2="90" y2="57" />
          </g>

          {/* O anki duruma göre Yüz İfadesi */}
          {face}
        </g>
      </svg>
    </div>
  );
};

export default AnimatedMascot;