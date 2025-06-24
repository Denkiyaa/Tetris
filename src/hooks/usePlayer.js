import { useState, useCallback } from 'react';
import { SHAPES, randomShape, BOARD_WIDTH, checkCollision } from '../gameHelpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    matrix: SHAPES[0].shape,
    collided: false,
  });
  
  // Sonraki parçayı tutmak için yeni state eklendi
  const [nextPiece, setNextPiece] = useState(SHAPES[0].shape);

  const rotate = (matrix) => {
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  };

  const playerRotate = (board) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.matrix = rotate(clonedPlayer.matrix);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.matrix[0].length) {
        clonedPlayer.matrix = rotate(clonedPlayer.matrix);
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
      // Eğer oyun yeni başlıyorsa rastgele bir parça al, değilse sıradaki parçayı al
      matrix: nextPiece === SHAPES[0].shape ? randomShape().shape : nextPiece,
      collided: false,
    });
    // Bir sonraki parçayı daima rastgele yenile
    setNextPiece(randomShape().shape);
  }, [nextPiece]);

  // Hook artık dışarıya 5 değer döndürüyor: player, nextPiece, ve 3 fonksiyon
  return [player, nextPiece, updatePlayerPos, resetPlayer, playerRotate];
};