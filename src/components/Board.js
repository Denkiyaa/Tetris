import React from 'react';
import Cell from './Cell';
import styles from './Board.module.css';

const Board = ({ board, player }) => {
  const displayBoard = board.map(row => [...row]);

  // [GÜVENLİK KONTROLÜ] Sadece player ve matrix varsa çizim yap
  if (player && player.matrix) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + player.pos.y;
          const boardX = x + player.pos.x;
          if (boardY >= 0 && boardY < displayBoard.length) {
            if (displayBoard[boardY][boardX] && displayBoard[boardY][boardX][1] === 'clear') {
              displayBoard[boardY][boardX] = [value, 'clear'];
            }
          }
        }
      });
    });
  }

  return (
    <div className={styles.board}>
      {displayBoard.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
};

export default Board;