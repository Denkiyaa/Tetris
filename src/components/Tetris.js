import React, { useState, useEffect, useRef } from 'react';
import { createBoard, checkCollision } from '../gameHelpers';
import { usePlayer } from '../hooks/usePlayer';
import { useBoard } from '../hooks/useBoard';
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
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gamePhase, setGamePhase] = useState('welcome');
  const [nickname, setNickname] = useState('');

  const [player, nextPiece, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [board, setBoard, rowsCleared] = useBoard(player, resetPlayer);
  
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);
  
  const { scores, loading, error, addScore, refetchScores } = useHighScores();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (rowsCleared > 0) {
      setScore(prev => prev + [40, 100, 300, 1200][rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
    }
  }, [rowsCleared, level]);
  
  useEffect(() => {
    const newLevel = Math.floor(rows / 10);
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(1000 / (newLevel + 1) + 200);
    }
  }, [rows, level]);

  const movePlayer = (dir) => {
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    setBoard(createBoard());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(0);
    setGameOver(false);
    refetchScores(); // Oyuna başlarken skorları yenile
  };
  
  const handleNicknameSubmit = (name) => {
    setNickname(name);
    setGamePhase('playing');
    startGame();
  };

  const drop = () => {
    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        if (score > 0) {
          addScore(nickname, score);
        }
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };
  
  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 40 || keyCode === 83) { // S veya Aşağı Ok
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37 || keyCode === 65) movePlayer(-1);       // Sol
      else if (keyCode === 39 || keyCode === 68) movePlayer(1);  // Sağ
      else if (keyCode === 40 || keyCode === 83) dropPlayer();      // Aşağı
      else if (keyCode === 38 || keyCode === 87) playerRotate(board, 1); // Yukarı (Döndür)
    }
  };

  // Otomatik düşme için interval
  const useInterval = (callback, delay) => {
    const savedCallback = useRef();
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
      function tick() { savedCallback.current(); }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <div className={styles.tetrisWrapper} role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp}>
      <button className={styles.helpButton} onClick={() => setIsHelpOpen(true)}>?</button>
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      
      {gamePhase === 'welcome' ? (
        <NicknameForm onStart={handleNicknameSubmit} />
      ) : (
        <>
          <div className={styles.tetris}>
            <Board board={board} player={player} />
            <aside>
              {nextPiece && <NextPiece piece={nextPiece} />}
              <Stats score={score} rows={rows} level={level} gameOver={gameOver} />
              <button className={styles.startButton} onClick={startGame}>
                Yeniden Başlat
              </button>
              <HighScores scores={scores} loading={loading} error={error} />
            </aside>
          </div>
          <Controls 
             moveLeft={() => movePlayer(-1)}
             moveRight={() => movePlayer(1)}
             rotate={() => playerRotate(board, 1)}
             drop={dropPlayer}
             hardDrop={() => {}} // Hard drop şimdilik devre dışı
          />
        </>
      )}
    </div>
  );
};

export default Tetris;