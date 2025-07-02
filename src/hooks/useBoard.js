import { useState, useEffect } from 'react';
import { createBoard } from '../gameHelpers';

// Hook artık 3. parametre olarak bir "callback" fonksiyonu alıyor: onRowsCleared
export const useBoard = (player, resetPlayer, onRowsCleared) => {
  const [board, setBoard] = useState(createBoard());

  useEffect(() => {
    if (!player) {
      return;
    }

    const updateBoard = (prevBoard) => {
      // Önceki izleri temizle
      const newBoard = prevBoard.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // Oyuncuyu yeni pozisyonuna çiz
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            if (newBoard[y + player.pos.y]?.[x + player.pos.x]) {
              newBoard[y + player.pos.y][x + player.pos.x] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      // Eğer parça çarptıysa, satırları temizle
      if (player.collided) {
        let clearedRowsCount = 0;
        const sweptBoard = newBoard.reduce((ack, row) => {
          if (row.findIndex(cell => cell[0] === 0) === -1) {
            clearedRowsCount += 1; // Sadece say, state'i değiştirme
            ack.unshift(new Array(newBoard[0].length).fill([0, 'clear']));
            return ack;
          }
          ack.push(row);
          return ack;
        }, []);

        // Eğer en az bir satır temizlendiyse, Tetris.js'e haber ver
        if (clearedRowsCount > 0) {
          onRowsCleared(clearedRowsCount);
        }

        resetPlayer();
        return sweptBoard;
      }
      
      return newBoard;
    };

    setBoard(prev => updateBoard(prev));
    
  }, [player, resetPlayer, onRowsCleared]);

  // Artık dışarıya rowsCleared döndürmüyor
  return [board, setBoard];
};