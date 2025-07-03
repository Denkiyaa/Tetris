import React from 'react';
import styles from './AnimatedMascot.module.css';

const AnimatedMascot = ({ status }) => {
  let face;
  let bodyAnimation = styles.tetrisBreathing; // Tetris blokları gibi nefes alma
  let ears = (
    <>
      {/* Rahat ve Endişeli Kulaklar (Basit blok) */}
      <rect x="28" y="20" width="10" height="10" fill="#EAEAEA" stroke="#444" strokeWidth="2" />
      <rect x="62" y="20" width="10" height="10" fill="#EAEAEA" stroke="#444" strokeWidth="2" />
    </>
  );

  switch (status) {
    case 'worried':
      face = (
        <>
          {/* Endişeli Gözler (Küçük noktalar, hafif içe dönük) */}
          <circle cx="42" cy="48" r="3" fill="#2c3e50" />
          <circle cx="58" cy="48" r="3" fill="#2c3e50" />
          {/* Endişeli Ağız (Kısa, düz çizgi) */}
          <line x1="45" y1="60" x2="55" y2="60" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.tetrisBobbing; // Hafif yukarı aşağı hareket
      ears = (
        <>
          {/* Endişeli Kulaklar (Hafifçe eğilmiş, gergin) */}
          <path d="M 28 20 L 38 20 L 38 30 L 28 30 Z" fill="#EAEAEA" stroke="#444" strokeWidth="2" className={styles.earWiggle} />
          <path d="M 62 20 L 72 20 L 72 30 L 62 30 Z" fill="#EAEAEA" stroke="#444" strokeWidth="2" className={styles.earWiggle} />
        </>
      );
      break;

    case 'panicked':
      face = (
        <>
          {/* Panik Gözleri (Dikey çizgiler - şaşkınlık) */}
          <line x1="40" y1="45" x2="40" y2="55" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="45" x2="60" y2="55" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
          {/* Panik Ağzı (Küçük açık "o") */}
          <circle cx="50" cy="62" r="4" fill="#2c3e50" />
        </>
      );
      bodyAnimation = styles.tetrisPanickedShake; // Hızlı, titrek hareket
      ears = (
        <>
          {/* Panik Kulaklar (Yanlara doğru açılmış, daha belirgin) */}
          <path d="M 25 25 L 35 15 L 40 25 L 30 35 Z" fill="#EAEAEA" stroke="#444" strokeWidth="2.5" />
          <path d="M 75 25 L 65 15 L 60 25 L 70 35 Z" fill="#EAEAEA" stroke="#444" strokeWidth="2.5" />
        </>
      );
      break;

    case 'gameOver':
      face = (
        <>
          {/* Oyun Bitti Gözleri (X X) - Sadece bu aşamada! */}
          <path d="M 35 45 L 45 55 M 45 45 L 35 55" stroke="#444" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 55 45 L 65 55 M 65 45 L 55 55" stroke="#444" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Oyun Bitti Ağzı (Düz çizgi, ifade yok) */}
          <line x1="45" y1="65" x2="55" y2="65" stroke="#444" strokeWidth="2" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.tetrisGameOverSunk; // Batma animasyonu
      ears = (
        <>
          {/* Oyun Bitti Kulaklar (Aşağı düşmüş veya yok olmuş gibi) */}
          <path d="M 28 30 L 38 30 L 38 35 L 28 35 Z" fill="#BBBBBB" stroke="#444" strokeWidth="2" opacity="0.5" />
          <path d="M 62 30 L 72 30 L 72 35 L 62 35 Z" fill="#BBBBBB" stroke="#444" strokeWidth="2" opacity="0.5" />
        </>
      );
      break;

    default: // relaxed
      face = (
        <>
          {/* Rahat Gözler (Küçük, huzurlu noktalar) */}
          <circle cx="40" cy="50" r="2.5" fill="#2c3e50" />
          <circle cx="60" cy="50" r="2.5" fill="#2c3e50" />
          {/* Rahat Ağız (Hafifçe gülümseyen) */}
          <path d="M 45 58 Q 50 60 55 58" stroke="#2c3e50" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
      bodyAnimation = styles.tetrisBreathing; // Tetris blokları gibi nefes alma
      // Varsayılan kulaklar zaten tanımlı
      break;
  }

  return (
    <div className={styles.container}>
      <svg viewBox="0 0 100 100" className={styles.mascotSvg}>
        {/* Su - Alt kısımdaki "zemin" gibi düşünebiliriz */}
        <path className={`${styles.tetrisGround} ${styles[status]}`} d="M 0 85 H 100 V 100 H 0 Z" />

        {/* Maskotun Gövdesi ve Animasyon Grubu */}
        <g className={`${styles.tetrisCatBody} ${bodyAnimation}`}>
          {/* Kafa (Tetris bloğu gibi karemsi, ama hafif yuvarlak köşeli) */}
          <rect x="25" y="30" width="50" height="50" rx="8" ry="8" fill="#FFC107" stroke="#D32F2F" strokeWidth="3" />

          {/* Kulaklar (Duruma göre değişen bloklar) */}
          {ears}

          {/* Burun (Küçük kare blok) */}
          <rect x="48" y="55" width="4" height="4" fill="#2c3e50" />

          {/* Bıyıklar (Daha sert, çizgisel Tetris tarzı) */}
          <g stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="square">
            <line x1="28" y1="52" x2="15" y2="50" />
            <line x1="28" y1="58" x2="15" y2="60" />
            <line x1="72" y1="52" x2="85" y2="50" />
            <line x1="72" y1="58" x2="85" y2="60" />
          </g>

          {/* Dinamik Yüz İfadesi */}
          {face}
        </g>
      </svg>
    </div>
  );
};

export default AnimatedMascot;