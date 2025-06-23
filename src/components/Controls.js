import React from 'react';
import styles from './Controls.module.css';

const Controls = ({ moveLeft, moveRight, rotate, drop, hardDrop }) => {
  return (
    <div className={styles.controls}>
      <div className={styles.dpad}>
        <button onTouchStart={moveLeft} onClick={moveLeft}>←</button>
        <div className={styles.spacer}></div>
        <button onTouchStart={moveRight} onClick={moveRight}>→</button>
      </div>
      <div className={styles.actions}>
        <button onTouchStart={rotate} onClick={rotate}>↻</button>
        <button onTouchStart={drop} onClick={drop}>↓</button>
        <button onTouchStart={hardDrop} onClick={hardDrop}>⤓</button>
      </div>
    </div>
  );
};

export default Controls;