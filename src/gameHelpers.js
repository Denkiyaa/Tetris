// gameHelpers.js (TAM VE DOĞRU HALİ)

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const createBoard = () =>
  Array.from(Array(BOARD_HEIGHT), () => new Array(BOARD_WIDTH).fill([0, 'clear']));

export const SHAPES = {
  0: { shape: [[0]], color: '0, 0, 0' }, // Boş hücre rengi
  I: {
    shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]],
    color: '80, 227, 230',
  },
  J: {
    shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]],
    color: '36, 95, 223',
  },
  L: {
    shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']],
    color: '223, 173, 36',
  },
  O: { shape: [['O', 'O'], ['O', 'O']], color: '223, 217, 36' },
  S: {
    shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]],
    color: '48, 211, 56',
  },
  T: {
    shape: [[0, 0, 0], ['T', 'T', 'T'], [0, 'T', 0]],
    color: '132, 61, 198',
  },
  Z: {
    shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]],
    color: '227, 78, 78',
  },
  // PARLAMA RENKLERİ
  F: { shape: [['F']], color: '230, 230, 230' },
  F1: { shape: [['F']], color: '255, 255, 0' },
  F2: { shape: [['F']], color: '0, 255, 255' },
  F3: { shape: [['F']], color: '255, 0, 255' },
};

export const randomShape = () => {
  const shapes = 'IJLOSTZ';
  const randShapeKey = shapes[Math.floor(Math.random() * shapes.length)];
  const newShape = SHAPES[randShapeKey];
  // Garanti olması için, tanımsız gelirse 'I' döndür
  return newShape || SHAPES['I'];
};

export const checkCollision = (player, board, { x: moveX, y: moveY }) => {
  if (!player?.matrix) {
    return false;
  }
  for (let y = 0; y < player.matrix.length; y += 1) {
    for (let x = 0; x < player.matrix[y].length; x += 1) {
      if (player.matrix[y][x] !== 0) {
        const newY = y + player.pos.y + moveY;
        const newX = x + player.pos.x + moveX;
        if (
          !board[newY] ||
          !board[newY][newX] ||
          board[newY][newX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};