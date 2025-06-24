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
  
  const [isFlashing, setIsFlashing] = useState(false);
  const { scores, loading, error, addScore } = useHighScores();
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const actionLock = useRef(false);

  useEffect(() => {
    if (rowsCleared > 0) {
      const linePoints = [10, 30, 60, 100];
      setScore(prev => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows(prev => prev + rowsCleared);
      setIsFlashing(true);
    }
  }, [rowsCleared]);
  
  useEffect(() => {
    const newLevel = Math.floor(rows / 10);
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(1000 / (newLevel + 1) + 200);
    }
  }, [rows, level]);

  useEffect(() => { if (isFlashing) { const timeout = setTimeout(() => setIsFlashing(false), 200); return () => clearTimeout(timeout); } }, [isFlashing]);
  useEffect(() => { if (gameOver) { addScore(nickname, score); } }, [gameOver, score, nickname, addScore]);

  useEffect(() => {
    if (player.collided) {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      resetPlayer();
      setTimeout(() => { actionLock.current = false; }, 50); 
    }
  }, [player.collided, resetPlayer]);
  
  const movePlayer = (dir) => { if (gameOver || actionLock.current) return; if (!checkCollision(player, board, { x: dir, y: 0 })) { updatePlayerPos({ x: dir, y: 0, collided: false }); } };
  const drop = () => { if (!checkCollision(player, board, { x: 0, y: 1 })) { updatePlayerPos({ x: 0, y: 1, collided: false }); } else { updatePlayerPos({ x: 0, y: 0, collided: true }); } };
  const dropPlayer = () => { if (gameOver || actionLock.current) return; setDropTime(null); drop(); };
  const hardDrop = () => { if (gameOver || actionLock.current) return; actionLock.current = true; let tempPlayer = JSON.parse(JSON.stringify(player)); while (!checkCollision(tempPlayer, board, { x: 0, y: 1 })) { tempPlayer.pos.y += 1; } updatePlayerPos({ x: 0, y: tempPlayer.pos.y - player.pos.y, collided: true }); };
  const rotatePlayer = () => { if (gameOver || actionLock.current) return; playerRotate(board); };
  
  const startGame = () => { setBoard(createBoard()); setDropTime(1000); resetPlayer(); setScore(0); setRows(0); setLevel(0); setGameOver(false); };
  const handleNicknameSubmit = (name) => { setNickname(name); setGamePhase('playing'); startGame(); };
  
  const keyUp = ({ keyCode }) => { if (!gameOver) { if ((keyCode === 40 || keyCode === 83) && dropTime === null && !player.collided) { setDropTime(1000 / (level + 1) + 200); } } };
  const useInterval = (callback, delay) => { const savedCallback = useRef(); useEffect(() => { savedCallback.current = callback; }, [callback]); useEffect(() => { function tick() { savedCallback.current(); } if (delay !== null) { let id = setInterval(tick, delay); return () => clearInterval(id); } }, [delay]); };
  useInterval(() => { if (!gameOver) drop(); }, dropTime);
  const move = ({ keyCode }) => { if (!gameOver) { const key = keyCode; if (key === 37 || key === 65) { movePlayer(-1); } else if (key === 39 || key === 68) { movePlayer(1); } else if (key === 40 || key === 83) { dropPlayer(); } else if (key === 38 || key === 87) { rotatePlayer(); } else if (key === 32) { hardDrop(); } } };

  const touchStartPos = useRef({ x: 0, y: 0 }); const isSwiping = useRef(false);
  const handleTouchStart = (e) => { e.preventDefault(); touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; isSwiping.current = true; };

  // [DOKUNMATİK KONTROL DÜZELTMESİ] Bu fonksiyonun mantığı güncellendi
  const handleTouchEnd = (e) => {
    if (!isSwiping.current || actionLock.current) return;
    isSwiping.current = false;
    
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;
    const threshold = 30; // Kaydırma hassasiyeti

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) {
        movePlayer(1);
      } else if (deltaX < -threshold) {
        movePlayer(-1);
      }
    } else {
      if (deltaY > threshold) {
        dropPlayer(); // Anında indirme yerine YAVAŞ İNDİRME
      } else if (deltaY < -threshold) {
        rotatePlayer(); // Yukarı kaydırınca DÖNDÜR
      }
    }
  };

  return (
    <div className={styles.tetrisWrapper} role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={(e) => e.preventDefault()} >
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      <button className={styles.helpButton} onClick={() => setIsHelpOpen(true)}>?</button>
      
      {gamePhase === 'welcome' ? (
        <NicknameForm onStart={handleNicknameSubmit} />
      ) : (
        <>
          <div className={styles.tetris}>
            <Board board={board} player={player} isFlashing={isFlashing} />
            <aside>
              {nextPiece && <NextPiece piece={nextPiece} />}
              <Stats score={score} rows={rows} level={level} gameOver={gameOver} />
              <button className={styles.startButton} onClick={startGame}>
                Yeniden Başlat
              </button>
              <HighScores gameOver={gameOver} />
            </aside>
          </div>
          <Controls 
             moveLeft={() => movePlayer(-1)} moveRight={() => movePlayer(1)}
             rotate={rotatePlayer} drop={dropPlayer} hardDrop={hardDrop}
          />
        </>
      )}
    </div>
  );
};

export default Tetris;