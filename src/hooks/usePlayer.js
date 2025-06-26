import { useState, useCallback } from 'react';
import { SHAPES, randomShape, BOARD_WIDTH, checkCollision } from '../gameHelpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    matrix: null, // Başlangıçta matrix null olacak
    collided: false,
  });
  
  // Sonraki parçayı tutmak için yeni state eklendi
  const [nextPiece, setNextPiece] = useState(null);

  const rotate = (matrix) => {
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  };

  const playerRotate = (board) => {
    if (!player.matrix) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.matrix = rotate(clonedPlayer.matrix);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.matrix[0].length) {
        clonedPlayer.matrix = rotate(clonedPlayer.matrix); // Hata varsa geri döndür
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided,
    }));
  };

  // resetPlayer artık bir sonraki parçayı oyuna sokuyor ve yeni bir "sonraki" oluşturuyor
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      matrix: nextPiece ? nextPiece.shape : randomShape().shape,
      collided: false,
    });
    setNextPiece(randomShape());
  }, [nextPiece]);

  // Hook artık dışarıya 5 değer döndürüyor: player, nextPiece, ve 3 fonksiyon
  return [player, nextPiece, updatePlayerPos, resetPlayer, playerRotate];
};