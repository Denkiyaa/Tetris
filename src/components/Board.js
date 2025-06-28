import { useState, useEffect } from 'react';
import { createBoard } from '../gameHelpers';

export const useBoard = (player, resetPlayer) => {
  const [board, setBoard] = useState(createBoard());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newBoard) =>
      newBoard.reduce((ack, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          setRowsCleared(prev => prev + 1);
          ack.unshift(new Array(newBoard[0].length).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

    const updateBoard = (prevBoard) => {
      if (!player.matrix) {
        return prevBoard;
      }

      const newBoard = JSON.parse(JSON.stringify(prevBoard));

      newBoard.forEach(row => 
        row.forEach(cell => {
          if (cell[1] === 'clear') {
            cell[0] = 0;
          }
        })
      );

      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            if (newBoard[y + player.pos.y] && newBoard[y + player.pos.y][x + player.pos.x]) {
                newBoard[y + player.pos.y][x + player.pos.x] = [value, `${player.collided ? 'merged' : 'clear'}`];
            }
          }
        });
      });

      if (player.collided) {
        resetPlayer();
        return sweepRows(newBoard);
      }
      return newBoard;
    };

    setBoard(prev => updateBoard(prev));
  }, [player, resetPlayer]);

  return [board, setBoard, rowsCleared];
};