import { useState, useCallback } from 'react';
import { SHAPES, randomShape, BOARD_WIDTH, checkCollision } from '../gameHelpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    shape: SHAPES[0].shape, // Artık matris yerine 'shape' diyoruz
    collided: false,
  });
  
  // State'de artık parçanın kendisi yerine sadece ID'sini (harfini) tutuyoruz
  const [nextPieceId, setNextPieceId] = useState(0);

  const rotate = (matrix) => {
    const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotated.map(row => row.reverse());
  };

  const playerRotate = (board) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.shape = rotate(clonedPlayer.shape);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.shape[0].length) {
        clonedPlayer.shape = rotate(clonedPlayer.shape); // Rotate back
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

  const resetPlayer = useCallback(() => {
    // Önceki "nextPieceId"yi kullanarak mevcut oyuncuyu ayarla
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
      shape: SHAPES[nextPieceId] ? SHAPES[nextPieceId].shape : randomShape().shape, // ID'den şekli al
      collided: false,
    });
    // Bir sonraki tur için YENİ bir rastgele ID oluştur
    setNextPieceId(randomShape().shape[1][1]); // Şeklin ortasından harfi alarak ID'yi belirliyoruz
  }, [nextPieceId]);

  // Dışarıya artık 'nextPiece' objesini ID'ye göre oluşturup gönderiyoruz
  return [player, SHAPES[nextPieceId], updatePlayerPos, resetPlayer, playerRotate];
};