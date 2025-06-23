import React from 'react';
import styles from './Stats.module.css';

const Stats = ({ score, rows, level, gameOver }) => (
  <div className={styles.stats}>
    <h2>SKOR</h2>
    <p>{score}</p>
    <h2>SATIR</h2>
    <p>{rows}</p>
    <h2>SEVİYE</h2>
    <p>{level}</p>
    {gameOver && (
      <div className={styles.gameOver}>
        <p>OYUN BİTTİ</p>
      </div>
    )}
  </div>
);

export default Stats;