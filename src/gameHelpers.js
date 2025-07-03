export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const INTERNAL_BOARD_HEIGHT = BOARD_HEIGHT + 4; // GERÇEK YÜKSEKLİK (4 satır gizli)

export const createBoard = () =>
  Array.from(Array(INTERNAL_BOARD_HEIGHT), () => new Array(BOARD_WIDTH).fill([0, 'clear']));

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
  for (let y = 0; y < player.matrix.length; y++) {
    for (let x = 0; x < player.matrix[y].length; x++) {
      if (player.matrix[y][x] !== 0) {
        const newY = y + player.pos.y + moveY;
        const newX = x + player.pos.x + moveX;

        // Tahtanın sol/sağ sınırları
        if (newX < 0 || newX >= BOARD_WIDTH) {
          return true;
        }
        
        // Tahtanın alt sınırı
        if (newY >= INTERNAL_BOARD_HEIGHT) {
          return true;
        }
        
        // Dolu hücre kontrolü (newY negatif olabilir - üstteki gizli alan)
        if (newY >= 0 && board[newY][newX][1] !== 'clear') {
          return true;
        }
      }
    }
  }
  return false;
};