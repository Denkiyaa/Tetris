import React from 'react';
import styles from './HighScores.module.css';

// Bileşen artık state tutmuyor, sadece props (scores, loading, error) alıyor
const HighScores = ({ scores, loading, error }) => {
  
  const renderContent = () => {
    // Veri hala yükleniyorsa "Yükleniyor..." mesajı göster
    if (loading) {
      return <p className={styles.message}>Yükleniyor...</p>;
    }
    // Bir hata oluştuysa hatayı göster
    if (error) {
      return <p className={`${styles.message} ${styles.error}`}>Hata: {error}</p>;
    }
    // Skorlar varsa ve liste boş değilse, listeyi oluştur
    if (scores && scores.length > 0) {
      return (
        <ol className={styles.scoreList}>
          {scores.map((score, index) => (
            <li key={index}>
              <span>{score.name}</span>
              <span>{score.score}</span>
            </li>
          ))}
        </ol>
      );
    }
    // Yukarıdakilerin hiçbiri değilse, henüz skor yok demektir
    return <p className={styles.message}>Henüz skor yok.</p>;
  };

  return (
    <div className={styles.highScores}>
      <h2>YÜKSEK SKORLAR</h2>
      {renderContent()}
    </div>
  );
};

export default HighScores;