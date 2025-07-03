// NextPiece.js

import React from 'react';
import Cell from './Cell';
import styles from './NextPiece.module.css';

const NextPiece = ({ piece }) => {
  // Her zaman 4x4'lük boş bir alan oluştur
  const grid = Array.from(Array(4), () => Array(4).fill(0));

  // Parçayı bu alanın ortasına çiz
  if (piece && piece.shape) {
    const shape = piece.shape;
    const yOffset = Math.floor((grid.length - shape.length) / 2);
    const xOffset = Math.floor((grid[0].length - shape[0].length) / 2);

    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          if (grid[y + yOffset] && grid[y + yOffset][x + xOffset] !== undefined) {
            grid[y + yOffset][x + xOffset] = value;
          }
        }
      });
    });
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>SONRAKİ</p>
      <div className={styles.grid}>
        {grid.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell} isPreview />)
        )}
      </div>
    </div>
  );
};

export default NextPiece;