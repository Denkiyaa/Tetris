// Tetris.js (TAMAMI)

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
};

// --- 2. Oyunun Tüm Mantığını Yöneten Reducer Fonksiyonu ---
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME':
      const firstPiece = randomShape();
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

    case 'MOVE_PLAYER': {
      if (state.gameOver || !state.player) return state;
      const { player, board } = state;
      const moveX = action.payload;
      if (!checkCollision(player, board, { x: moveX, y: 0 })) {
        return {
          ...state,
          player: { ...player, pos: { ...player.pos, x: player.pos.x + moveX } },
        };
      }
      return state;
    }

    case 'ROTATE_PLAYER': {
      if (state.gameOver || !state.player) return state;
      const { player, board } = state;
      const clonedPlayer = JSON.parse(JSON.stringify(player));
      const matrix = clonedPlayer.matrix.map((_, index) => clonedPlayer.matrix.map(col => col[index]));
      clonedPlayer.matrix = matrix.map(row => row.reverse());
      const pos = clonedPlayer.pos.x;
      let offset = 1;
      while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
        clonedPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (Math.abs(offset) > clonedPlayer.matrix[0].length) {
          return state; // Rotasyon başarısız, state'i değiştirme
        }
      }
      return { ...state, player: clonedPlayer };
    }

    case 'DROP': {
      if (state.gameOver || !state.player) return state;
      const { player, board } = state;

      if (!checkCollision(player, board, { x: 0, y: 1 })) {
        return {
          ...state,
          player: { ...player, pos: { ...player.pos, y: player.pos.y + 1 } },
        };
      }

      // Parça çarptıysa, yeni bir state hesapla
      const newBoard = JSON.parse(JSON.stringify(board));
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
          }
        });
      });

      let clearedRowsCount = 0;
      const sweptBoard = newBoard.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          clearedRowsCount++;
          ack.unshift(Array.from(Array(newBoard[0].length), () => [0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);
      
      const newPlayerState = {
        pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
        matrix: state.nextPiece.shape,
        collided: false,
      };

      if (checkCollision(newPlayerState, sweptBoard, { x: 0, y: 0 })) {
        return { ...state, gameOver: true, dropTime: null };
      }

      const newScore = state.score + (clearedRowsCount > 0 ? [10, 30, 60, 100][clearedRowsCount - 1] * (state.level + 1) : 0);
      const newRows = state.rows + clearedRowsCount;
      const newLevel = Math.floor(newRows / 10);
      const newDropTime = 1000 / (newLevel + 1) + 200;

      return {
        ...state,
        board: sweptBoard,
        player: newPlayerState,
        nextPiece: randomShape(),
        score: newScore,
        rows: newRows,
        level: newLevel,
        dropTime: newDropTime,
      };
    }
    
    case 'HARD_DROP': {
        if (state.gameOver || !state.player) return state;
        let y = 0;
        while (!checkCollision(state.player, state.board, { x: 0, y: y + 1 })) {
            y++;
        }
        const playerCopy = JSON.parse(JSON.stringify(state.player));
        playerCopy.pos.y += y;
        // Hard drop'un hemen ardından DROP action'ını tetikleyerek çarpışma mantığını yeniden kullan
        return gameReducer({...state, player: playerCopy }, { type: 'DROP' });
    }
    
    default:
      return state;
  }
};


const Tetris = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const { board, player, nextPiece, score, rows, level, gameOver } = gameState;

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
            <Board board={board} player={player} />
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