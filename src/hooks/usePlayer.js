import { useState, useCallback } from 'react';
import { SHAPES, randomShape, BOARD_WIDTH } from '../gameHelpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);

  const rotate = (matrix) => {
    // Matrisi döndür (transpose + reverse)
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  };

  const playerRotate = (board) => {
    if (!player) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.matrix = rotate(clonedPlayer.matrix);
    // Wall-kick (duvardan sekme) mantığı buraya eklenebilir, şimdilik basit tutuyoruz.
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
    const newPiece = nextPiece || randomShape();
    setNextPiece(randomShape());
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      matrix: newPiece.shape,
      collided: false,
    });
  }, [nextPiece]);

  return [player, nextPiece, updatePlayerPos, resetPlayer, playerRotate];
};