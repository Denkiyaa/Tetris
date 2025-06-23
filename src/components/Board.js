import React from 'react';
import Cell from './Cell';
import styles from './Board.module.css';

// isFlashing prop'u eklendi
const Board = ({ board, player, isFlashing }) => {
  const displayBoard = board.map(row => [...row]);

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

  return (
    // Parlama efekti için koşullu class eklendi
    <div className={`${styles.board} ${isFlashing ? styles.flashing : ''}`}>
      {displayBoard.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
};

export default Board;