import { useState, useCallback } from 'react';
import { SHAPES, randomShape, BOARD_WIDTH } from '../gameHelpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    matrix: null,
    collided: false,
  });
  
  const [nextPiece, setNextPiece] = useState(null);

  const rotate = (matrix) => {
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  };

  const playerRotate = (board, dir) => {
    if (!player.matrix) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.matrix = rotate(clonedPlayer.matrix, dir);
    // ... (Wall kick logic - basit tutmak için şimdilik kaldırıldı, eklenebilir)
    setPlayer(clonedPlayer);
  };

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      matrix: nextPiece ? nextPiece.shape : randomShape().shape,
      collided: false,
    });
    setNextPiece(randomShape());
  }, [nextPiece]);

  return [player, nextPiece, updatePlayerPos, resetPlayer, playerRotate];
};