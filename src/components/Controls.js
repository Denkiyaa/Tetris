import React from 'react';
import styles from './Controls.module.css';

const Controls = ({ moveLeft, moveRight, rotate, drop, hardDrop }) => {
  
  // Fonksiyonların iki kez çalışmasını engellemek için bir yardımcı fonksiyon
  const handleAction = (e, action) => {
    e.preventDefault(); // Varsayılan tarayıcı davranışını (zoom vb.) engelle
    action();
  };

  return (
    <div className={styles.controls}>
      <div className={styles.dpad}>
        {/* onClick yerine onMouseDown kullanıyoruz */}
        <button onTouchStart={(e) => handleAction(e, moveLeft)} onMouseDown={(e) => handleAction(e, moveLeft)}>←</button>
        <div className={styles.spacer}></div>
        <button onTouchStart={(e) => handleAction(e, moveRight)} onMouseDown={(e) => handleAction(e, moveRight)}>→</button>
      </div>
      <div className={styles.actions}>
        <button onTouchStart={(e) => handleAction(e, rotate)} onMouseDown={(e) => handleAction(e, rotate)}>↻</button>
        <button onTouchStart={(e) => handleAction(e, drop)} onMouseDown={(e) => handleAction(e, drop)}>↓</button>
        <button onTouchStart={(e) => handleAction(e, hardDrop)} onMouseDown={(e) => handleAction(e, hardDrop)}>⤓</button>
      </div>
    </div>
  );
};

export default Controls;