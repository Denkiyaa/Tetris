import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createBoard, checkCollision, BOARD_WIDTH, randomShape } from '../gameHelpers';
import useHighScores from '../hooks/useHighScores';
import Board from './Board';
import Stats from './Stats';
import NicknameForm from './NicknameForm';
import HighScores from './HighScores';
import Controls from './Controls';
import HelpModal from './HelpModal';
import NextPiece from './NextPiece';
import styles from './Tetris.module.css';

const Tetris = () => {
  const [player, setPlayer] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [board, setBoard] = useState(createBoard());
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gamePhase, setGamePhase] = useState('welcome');
  const [nickname, setNickname] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const { scores, loading, error, addScore, refetchScores } = useHighScores();
  const actionLock = useRef(false);

  const updatePlayerPos = ({ x, y, matrix, collided }) => {
    setPlayer(prev => {
      if (!prev) return null;
      return { ...prev, matrix: matrix || prev.matrix, pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) }, collided, };
    });
  };

  const resetPlayer = useCallback(() => {
    const newPiece = nextPiece || randomShape();
    setNextPiece(randomShape());
    const newPlayer = {
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      matrix: newPiece.shape,
      collided: false,
    };
    if (checkCollision(newPlayer, board, { x: 0, y: 0 })) {
      setGameOver(true);
      setDropTime(null);
    } else {
      setPlayer(newPlayer);
    }
  }, [nextPiece, board]);

  useEffect(() => {
    const newLevel = Math.floor(rows / 10);
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(1000 / (newLevel + 1) + 200);
    }
  }, [rows, level]);

  useEffect(() => {
    if (gameOver) {
      if (score > 0) addScore(nickname, score);
      refetchScores();
    }
  }, [gameOver, score, nickname, addScore, refetchScores]);

  useEffect(() => {
    if (isFlashing) {
      const timer = setTimeout(() => setIsFlashing(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isFlashing]);

  const startGame = () => {
    setBoard(createBoard());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(0);
    setGameOver(false);
    actionLock.current = false;
    refetchScores();
  };
  
  const handleNicknameSubmit = (name) => {
    setNickname(name);
    setGamePhase('playing');
    startGame();
  };

  const movePlayer = (dir) => {
    if (gameOver || !player || actionLock.current) return;
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const drop = () => {
    if (gameOver || !player) return;

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };
  
  useEffect(() => {
    if (player?.collided) {
        if (player.pos.y < 1) {
            setGameOver(true);
            setDropTime(null);
            return;
        }

        const newBoard = JSON.parse(JSON.stringify(board));
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
            });
        });

        let clearedRowsCount = 0;
        const sweptBoard = newBoard.reduce((ack, row) => {
            if (row.findIndex(cell => cell[0] === 0) === -1) {
                clearedRowsCount++;
                ack.unshift(new Array(newBoard[0].length).fill([0, 'clear']));
                return ack;
            }
            ack.push(row);
            return ack;
        }, []);

        if (clearedRowsCount > 0) {
            const linePoints = [10, 30, 60, 100];
            setScore(prev => prev + linePoints[clearedRowsCount - 1] * (level + 1));
            setRows(prev => prev + clearedRowsCount);
            setIsFlashing(true);
        }

        setBoard(sweptBoard);
        resetPlayer();
        actionLock.current = false; // [DÜZELTME] Kilidi burada açıyoruz
    }
  }, [player?.collided, resetPlayer]);


  const dropPlayer = () => { if (gameOver || actionLock.current) return; setDropTime(null); drop(); };
  
  const hardDrop = () => {
    if (gameOver || !player || actionLock.current) return;
    actionLock.current = true; // [DÜZELTME] Hareketi anında kilitle
    let y = 0;
    while (!checkCollision(player, board, { x: 0, y: y + 1 })) {
      y++;
    }
    updatePlayerPos({ x: 0, y: y, collided: true });
  };
  
  const rotatePlayer = () => {
    if (gameOver || !player || actionLock.current) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    const matrix = clonedPlayer.matrix.map((_, index) => clonedPlayer.matrix.map(col => col[index]));
    clonedPlayer.matrix = matrix.map(row => row.reverse());
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > clonedPlayer.matrix[0].length) {
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };
  
  const keyUp = ({ keyCode }) => { if (!gameOver) { if ((keyCode === 40 || keyCode === 83)) { setDropTime(1000 / (level + 1) + 200); } } };
  
  const move = (event) => {
    if (gameOver || gamePhase !== 'playing') return;
    const { keyCode, repeat } = event;
    if (keyCode === 37 || keyCode === 65) movePlayer(-1);
    else if (keyCode === 39 || keyCode === 68) movePlayer(1);
    else if (keyCode === 40 || keyCode === 83) dropPlayer();
    else if (keyCode === 38 || keyCode === 87) rotatePlayer();
    else if (keyCode === 32) {
      if (!repeat) {
        hardDrop();
      }
    }
  };
  
  const useInterval = (callback, delay) => { const savedCallback = useRef(); useEffect(() => { savedCallback.current = callback; }, [callback]); useEffect(() => { function tick() { savedCallback.current(); } if (delay !== null) { let id = setInterval(tick, delay); return () => clearInterval(id); } }, [delay]); };
  useInterval(() => { if (!gameOver) drop(); }, dropTime);

  return (
    <div className={styles.tetrisWrapper} role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp}>
      <button className={styles.helpButton} onClick={() => setIsHelpOpen(true)}>?</button>
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      
      {gamePhase === 'welcome' ? (
        <NicknameForm onStart={handleNicknameSubmit} />
      ) : (
        <>
          <div className={styles.tetris}>
            <Board board={board} player={player} isFlashing={isFlashing} />
            <aside>
              {nextPiece && <NextPiece piece={nextPiece} />}
              <Stats score={score} rows={rows} level={level} gameOver={gameOver} />
              <button className={styles.startButton} onClick={() => window.location.reload()}>Yeniden Başlat</button>
              <HighScores scores={scores} loading={loading} error={error} />
            </aside>
          </div>
          <Controls moveLeft={() => movePlayer(-1)} moveRight={() => movePlayer(1)} rotate={rotatePlayer} drop={dropPlayer} hardDrop={hardDrop} />
        </>
      )}
    </div>
  );
};
export default Tetris;