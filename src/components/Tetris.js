import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { createBoard, checkCollision, BOARD_WIDTH, BOARD_HEIGHT, randomShape } from '../gameHelpers';
import useHighScores from '../hooks/useHighScores';
import Board from './Board';
import Stats from './Stats';
import NicknameForm from './NicknameForm';
import HighScores from './HighScores';
import Controls from './Controls';
import HelpModal from './HelpModal';
import NextPiece from './NextPiece';
import styles from './Tetris.module.css';
import AnimatedMascot from './AnimatedMascot';


// --- 1. Oyunun Başlangıç Durumu ---
const initialState = {
  board: createBoard(),
  player: null,
  nextPiece: randomShape(),
  score: 0,
  rows: 0,
  level: 0,
  gameOver: false,
  dropTime: null,
  lockDelayTimer: null
};

// --- 2. Oyunun Tüm Mantığını Yöneten Reducer Fonksiyonu ---
// --- YENİ VE DOĞRU REDUCER ---

const gameReducer = (state, action) => {
  const { player, board, gameOver } = state;

  switch (action.type) {
    case 'START_GAME': {
      const firstPiece = randomShape();
      if (!firstPiece) return initialState;
      return {
        ...initialState,
        board: createBoard(),
        player: {
          pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
          matrix: firstPiece.shape,
          collided: false,
        },
        nextPiece: randomShape(),
        dropTime: 1000,
      };
    }

    case 'MOVE_PLAYER': {
      if (gameOver || !player) return state;
      const moveX = action.payload;
      if (checkCollision(player, board, { x: moveX, y: 0 })) {
        return state;
      }
      return {
        ...state,
        player: { ...player, pos: { ...player.pos, x: player.pos.x + moveX } },
      };
    }

    case 'ROTATE_PLAYER': {
      if (gameOver || !player) return state;
      const clonedPlayer = JSON.parse(JSON.stringify(player));
      const matrix = clonedPlayer.matrix.map((_, i) => clonedPlayer.matrix.map(col => col[i]));
      clonedPlayer.matrix = matrix.map(row => row.reverse());

      const pos = clonedPlayer.pos.x;
      let offset = 1;
      while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
        clonedPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > clonedPlayer.matrix[0].length) {
          clonedPlayer.pos.x = pos;
          return state;
        }
      }
      return { ...state, player: clonedPlayer };
    }

    case 'DROP': {
      if (gameOver || !player) return state;

      if (checkCollision(player, board, { x: 0, y: 1 })) {
        // Yere değdi. Parçayı tahtaya işle.
        const newBoard = JSON.parse(JSON.stringify(board));
        player.matrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
            }
          });
        });

        // Temizlenecek satır var mı diye kontrol et.
        const rowsToClear = [];
        for (let y = 0; y < newBoard.length; y++) {
          if (newBoard[y].every(cell => cell[1] === 'merged')) {
            rowsToClear.push(y);
          }
        }

        // Eğer temizlenecek satır varsa, onları 'flash' olarak işaretle.
        if (rowsToClear.length > 0) {
          const flashShapes = ['F1', 'F2', 'F3', 'F'];
          rowsToClear.forEach(y => {
            const randomFlashShapeForRow = flashShapes[Math.floor(Math.random() * flashShapes.length)];
            newBoard[y].forEach((_, x) => {
              newBoard[y][x] = [randomFlashShapeForRow, 'flash'];
            });
          });
          // Parlayan tahtayı göster ve oyunu duraklat
          return {
            ...state,
            board: newBoard,
            player: null,
            dropTime: null,
            isTetrisFlashing: rowsToClear.length === 4, // 4'lüde çerçeveyi yak
          };
        }

        // Temizlenecek satır yoksa, sadece parçayı kilitle.
        if (player.pos.y < 1) {
          return { ...state, board: newBoard, gameOver: true, dropTime: null, player: null };
        }
        const lockedState = { ...state, board: newBoard, player: null };

        return gameReducer(lockedState, { type: 'SPAWN_NEW_PIECE' });
      }

      // Düşmeye devam et
      return {
        ...state,
        player: { ...player, pos: { ...player.pos, y: player.pos.y + 1 } },
      };
    }



    case 'SPAWN_NEW_PIECE': {
      const { board: currentBoard, nextPiece } = state;

      // Satırları temizle
      let clearedRowsCount = 0;
      const sweptBoard = currentBoard.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          clearedRowsCount++;
          ack.unshift(new Array(BOARD_WIDTH).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

      const newPlayer = {
        pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
        matrix: nextPiece.shape,
        collided: false,
      };

      if (checkCollision(newPlayer, sweptBoard, { x: 0, y: 0 })) {
        return { ...state, board: sweptBoard, gameOver: true, dropTime: null };
      }

      const newScore = state.score + (clearedRowsCount > 0 ? [10, 30, 60, 100][clearedRowsCount - 1] * (state.level + 1) : 0);
      const newRows = state.rows + clearedRowsCount;
      const newLevel = Math.floor(newRows / 10);
      const newDropTime = 1000 / (newLevel + 1) + 200;
      const shouldFlash = clearedRowsCount === 4;


      const newState = {
        ...state,
        board: sweptBoard,
        player: newPlayer,
        nextPiece: randomShape(),
        score: newScore,
        rows: newRows,
        level: newLevel,
        dropTime: newDropTime,
        isFlashing: shouldFlash,
      };
      return newState;

    }

    case 'CLEAR_ROWS': {
      // Tahtadaki 'flash' durumundaki satırları temizle
      const sweptBoard = state.board.filter(row => row.every(cell => cell[1] !== 'flash'));
      const clearedRowsCount = BOARD_HEIGHT - sweptBoard.length;

      for (let i = 0; i < clearedRowsCount; i++) {
        sweptBoard.unshift(new Array(BOARD_WIDTH).fill([0, 'clear']));
      }
      return { ...state, board: sweptBoard };
    }

    case 'STOP_FLASHING': { // <-- Bu case'i dışarı taşıyıp parantezlerini ekleyin
      return { ...state, isFlashing: false };
    }

    case 'HARD_DROP': {
      if (gameOver || !player) return state;
      let y = 0;
      while (!checkCollision(player, board, { x: 0, y: y + 1 })) {
        y++;
      }
      const playerCopy = JSON.parse(JSON.stringify(player));
      playerCopy.pos.y += y;

      // Parçayı en dibe indirilmiş haliyle sadece DROP action'ına teslim et.
      // Geri kalanını (kilitleme, yeni parça getirme vb.) DROP case'i halledecek.
      return gameReducer({ ...state, player: playerCopy }, { type: 'DROP' });
    }

    default:
      return state;
  }
};

const Tetris = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const { board, player, nextPiece, score, rows, level, gameOver, isFlashing } = gameState;

  const [gamePhase, setGamePhase] = useState('welcome');
  const [nickname, setNickname] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mascotStatus, setMascotStatus] = useState('relaxed');

  const { scores, loading, error, addScore, refetchScores } = useHighScores();

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
    refetchScores();
  }, [refetchScores]);

  const handleNicknameSubmit = (name) => {
    setNickname(name);
    setGamePhase('playing');
    startGame();
  };

  const movePlayer = (dir) => dispatch({ type: 'MOVE_PLAYER', payload: dir });
  const rotatePlayer = () => dispatch({ type: 'ROTATE_PLAYER' });
  const hardDrop = () => dispatch({ type: 'HARD_DROP' });

  // Otomatik düşme için useInterval
  useEffect(() => {
    if (gameOver || gameState.dropTime === null) return;
    const interval = setInterval(() => {
      dispatch({ type: 'DROP' });
    }, gameState.dropTime);
    return () => clearInterval(interval);
  }, [gameOver, gameState.dropTime]);

  useEffect(() => {
    // Tahtada 'flash' hücreleri var mı diye bak
    const hasFlashedCells = board.some(row => row.some(cell => cell[1] === 'flash'));

    if (hasFlashedCells) {
      // Varsa, kısa bir süre bekle ve satırları temizle action'ını gönder
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_ROWS' }), 200);
      return () => clearTimeout(timer);
    }

    // Eğer flash yoksa VE oyuncu yoksa VE oyun bitmediyse, yeni parça getir
    if (!hasFlashedCells && !player && !gameOver) {
      dispatch({ type: 'SPAWN_NEW_PIECE' });
    }
  }, [board, player, gameOver, dispatch]);

  // Klavye kontrolleri
  const move = useCallback((event) => {
    if (gameOver || gamePhase !== 'playing') return;
    const { keyCode, repeat } = event;
    if (keyCode === 37 || keyCode === 65) movePlayer(-1);
    else if (keyCode === 39 || keyCode === 68) movePlayer(1);
    else if (keyCode === 40 || keyCode === 83) dispatch({ type: 'DROP' });
    else if (keyCode === 38 || keyCode === 87) rotatePlayer();
    else if (keyCode === 32) {
      if (!repeat) hardDrop();
    }
  }, [gameOver, gamePhase]);

  // Mascot durumunu yöneten useEffect
  useEffect(() => {
    if (gameOver) {
      setMascotStatus('gameOver');
      return;
    }
    let topMostBlock = BOARD_HEIGHT;
    for (let y = 0; y < board.length; y++) {
      if (board[y].some(cell => cell[1] === 'merged')) {
        topMostBlock = y;
        break;
      }
    }
    const filledPercentage = ((BOARD_HEIGHT - topMostBlock) / BOARD_HEIGHT) * 100;

    if (filledPercentage < 50) setMascotStatus('relaxed');
    else if (filledPercentage < 80) setMascotStatus('worried');
    else setMascotStatus('panicked');
  }, [board, gameOver]);

  // Skor kaydetme
  useEffect(() => {
    if (gameOver && score > 0) {
      addScore(nickname, score);
      refetchScores();
    }
  }, [gameOver, score, nickname, addScore, refetchScores]);

  return (
    <div className={styles.tetrisWrapper} role="button" tabIndex="0" onKeyDown={move}>
      <button className={styles.helpButton} onClick={() => setIsHelpOpen(true)}>?</button>
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}

      {gamePhase === 'welcome' ? (
        <NicknameForm onStart={handleNicknameSubmit} />
      ) : (
        <>
          <div className={styles.tetris}>
            <AnimatedMascot status={mascotStatus} />
            <Board board={board} player={player} isFlashing={isFlashing} />
            <aside>
              {nextPiece && <NextPiece piece={nextPiece} />}
              <Stats score={score} rows={rows} level={level} gameOver={gameOver} />
              <button className={styles.startButton} onClick={() => window.location.reload()}>Yeniden Başlat</button>
              <HighScores scores={scores} loading={loading} error={error} />
            </aside>
          </div>
          <Controls moveLeft={() => movePlayer(-1)} moveRight={() => movePlayer(1)} rotate={rotatePlayer} drop={() => dispatch({ type: 'DROP' })} hardDrop={hardDrop} />
        </>
      )}
    </div>
  );
};

export default Tetris;