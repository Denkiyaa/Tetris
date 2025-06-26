import React from 'react';
import Cell from './Cell';
import styles from './NextPiece.module.css';

const NextPiece = ({ piece }) => {
  // Gelen parçayı 4x4'lük bir alanda ortalamak için
  const grid = Array.from(Array(4), () => Array(4).fill(0));
  if (piece && piece.shape) {
    const yOffset = Math.floor((4 - piece.shape.length) / 2);
    const xOffset = Math.floor((4 - piece.shape[0].length) / 2);
    piece.shape.forEach((row, y) => {
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