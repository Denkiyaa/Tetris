export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const createBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => [0, 'clear'])
  );
  
export const SHAPES = {
  0: { shape: [[0]], color: '0, 0, 0' },
  F: { shape: [[0]], color: '230, 230, 230' }, // [YENİ EKLENTİ] Parlama için parlak beyaz renk
  I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: '80, 227, 230' },
  J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: '36, 95, 223' },
  L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: '223, 173, 36' },
  O: { shape: [['O', 'O'], ['O', 'O']], color: '223, 217, 36' },
  S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: '48, 211, 56' },
  T: { shape: [[0, 0, 0], ['T', 'T', 'T'], [0, 'T', 0]], color: '132, 61, 198' },
  Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: '227, 78, 78' },
};

export const randomShape = () => {
  const shapes = 'IJLOSTZ';
  const randShape = shapes[Math.floor(Math.random() * shapes.length)];
  return SHAPES[randShape];
};

export const checkCollision = (player, board, { x: moveX, y: moveY }) => {
  // [ANA DÜZELTME] Oyuncu (player) veya matrisi (matrix) null ise hata vermemesi için güvenlik kontrolü
  if (!player || !player.matrix) {
    return false;
  }

  for (let y = 0; y < player.matrix.length; y += 1) {
    for (let x = 0; x < player.matrix[y].length; x += 1) {
      if (player.matrix[y][x] !== 0) {
        if (
          !board[y + player.pos.y + moveY] ||
          !board[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          board[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};