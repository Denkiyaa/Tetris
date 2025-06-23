import { useState, useEffect } from 'react';
import { createBoard } from '../gameHelpers';

export const useBoard = (player, resetPlayer) => {
  const [board, setBoard] = useState(createBoard());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    // Bu efekt sadece ve sadece bir parça yere çarptığında çalışır.
    if (!player.collided) {
      return;
    }

    setRowsCleared(0);
    const sweepRows = (newBoard) =>
      newBoard.reduce((ack, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          ack.unshift(new Array(newBoard[0].length).fill([0, 'clear']));
          setRowsCleared(prev => prev + 1);
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

    // Board'u güncelle: Yere çarpan parçayı board'a işle.
    setBoard(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev));

      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [
              value,
              'merged', // Hücreyi 'birleşti' olarak işaretle
            ];
          }
        });
      });

      return sweepRows(newBoard);
    });
  }, [player.collided]); // Sadece 'collided' durumu değiştiğinde tetiklenir.

  return [board, setBoard, rowsCleared];
};