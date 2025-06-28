import React from 'react';
import styles from './HighScores.module.css';

const HighScores = ({ scores, loading, error }) => {
  const renderContent = () => {
    if (loading) {
      return <p className={styles.message}>Yükleniyor...</p>;
    }
    if (error) {
      return <p className={`${styles.message} ${styles.error}`}>Hata: {error}</p>;
    }
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