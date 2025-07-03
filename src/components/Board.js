import React from 'react';
import Cell from './Cell';
import styles from './Board.module.css';

const Board = ({ board, player, isFlashing }) => {
  const displayBoard = JSON.parse(JSON.stringify(board));

  if (player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + player.pos.y;
          const boardX = x + player.pos.x;
          if (
            boardY >= 0 && boardY < displayBoard.length &&
            boardX >= 0 && boardX < displayBoard[0].length &&
            displayBoard[boardY][boardX][1] === 'clear'
          ) {
            displayBoard[boardY][boardX] = [value, 'clear'];
          }
        }
      });
    });
  }

  return (
    <div className={`${styles.board} ${isFlashing ? styles.flashing : ''}`}>
      {displayBoard.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
};
export default Board;