import React, { useState, useEffect } from 'react';
import styles from './HighScores.module.css';

const HighScores = ({ gameOver }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const loadScores = () => {
      const savedScores = JSON.parse(localStorage.getItem('tetrisHighScores')) || [];
      setScores(savedScores);
    };
    loadScores();
  }, [gameOver]); // Her oyun bittiğinde skorları yeniden yükle

  return (
    <div className={styles.highScores}>
      <h2>YÜKSEK SKORLAR</h2>
      <ol className={styles.scoreList}>
        {scores.length > 0 ? (
          scores.map((score, index) => (
            <li key={index}>
              <span>{score.name}</span>
              <span>{score.score}</span>
            </li>
          ))
        ) : (
          <p>Henüz skor yok.</p>
        )}
      </ol>
    </div>
  );
};

export default HighScores;