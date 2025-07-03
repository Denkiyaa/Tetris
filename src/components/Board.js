import React from 'react';
import Cell from './Cell';
import styles from './Board.module.css';
import { BOARD_HEIGHT, INTERNAL_BOARD_HEIGHT } from '../gameHelpers';

const Board = ({ board, player, isFlashing }) => {
  // 1. Önce tam tahtanın (örn: 24 satır) bir kopyasını al.
  const finalBoard = JSON.parse(JSON.stringify(board));

  // 2. Oyuncuyu bu tam kopya üzerine işle.
  if (player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + player.pos.y;
          const boardX = x + player.pos.x;
          // Sınır kontrolü önemli
          if (
            boardY >= 0 && boardY < finalBoard.length &&
            boardX >= 0 && boardX < finalBoard[0].length &&
            finalBoard[boardY][boardX][1] === 'clear'
          ) {
            finalBoard[boardY][boardX] = [value, 'clear'];
          }
        }
      });
    });
  }

  // 3. Her şey bittikten sonra, nihai tahtanın sadece görünür kısmını (örn: son 20 satır) kes.
  const visibleBoard = finalBoard.slice(INTERNAL_BOARD_HEIGHT - BOARD_HEIGHT);

  // 4. Bu kesilmiş görünür parçayı ekrana bas.
  return (
    <div className={`${styles.board} ${isFlashing ? styles.flashing : ''}`}>
      {visibleBoard.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
};

export default Board;