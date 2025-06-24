import React from 'react';
import Cell from './Cell';
import styles from './NextPiece.module.css';

const NextPiece = ({ piece }) => {
  // Her zaman 4x4'lük bir alan oluşturuyoruz
  const grid = Array.from(Array(4), () => Array(4).fill(0));

  // Gelen parçayı bu 4x4'lük alanın ortasına yerleştiriyoruz
  if (piece) {
    const yOffset = Math.floor((4 - piece.length) / 2);
    const xOffset = Math.floor((4 - piece[0].length) / 2);

    piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          grid[y + yOffset][x + xOffset] = value;
        }
      });
    });
  }

  return (
    <div className={styles.nextPiece}>
      <h4>SONRAKİ</h4>
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell} />)
        )}
      </div>
    </div>
  );
};

export default NextPiece;