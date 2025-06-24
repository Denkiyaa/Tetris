import React from 'react';
import Cell from './Cell';
import styles from './NextPiece.module.css';

const NextPiece = ({ piece }) => {
  const style = {
    gridTemplateRows: `repeat(${piece.length}, 1fr)`,
    gridTemplateColumns: `repeat(${piece[0].length}, 1fr)`,
  };

  return (
    <div className={styles.nextPiece}>
      <h4>SONRAKİ</h4>
      <div className={styles.grid} style={style}>
        {piece.map((row, y) =>
          row.map((cell, x) => (cell !== 0 ? <Cell key={`${y}-${x}`} type={cell} /> : null))
        )}
      </div>
    </div>
  );
};

export default NextPiece;