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
  // OYUNUN TÜM STATE'LERİ ARTIK BURADA, TEK BİR YERDE
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

  const { scores, loading, error, addScore, refetchScores } = useHighScores();

  // OYUNCUYU YÖNETEN FONKSİYONLAR ARTIK DOĞRUDAN BURADA
  const updatePlayerPos = ({ x, y, collided, matrix }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      matrix: matrix || prev.matrix,
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    const newPiece = nextPiece || randomShape();
    setNextPiece(randomShape());
    const newPlayer = {
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      matrix: newPiece.shape,
      collided: false,
    };
    // Yeni parça oluşur oluşmaz çarpışıp çarpmadığını kontrol et (Oyun sonu kontrolü)
    if (checkCollision(newPlayer, board, { x: 0, y: 0 })) {
      setGameOver(true);
      setDropTime(null);
    } else {
      setPlayer(newPlayer);
    }
  }, [nextPiece, board]);
  
  // OYUN AKIŞINI YÖNETEN ANA FONKSİYONLAR
  const startGame = () => {
    setBoard(createBoard());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(0);
    setGameOver(false);
    refetchScores();
  };

  const handleNicknameSubmit = (name) => {
    setNickname(name);
    setGamePhase('playing');
    startGame();
  };

  const movePlayer = (dir) => {
    if (!gameOver && !checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const rotatePlayer = () => {
    if (gameOver || !player) return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    // Matrisi döndür
    const matrix = clonedPlayer.matrix.map((_, index) => clonedPlayer.matrix.map(col => col[index]));
    clonedPlayer.matrix = matrix.map(row => row.reverse());
    
    // Duvarlardan sekme (Wall Kick) mantığı
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > clonedPlayer.matrix[0].length) {
        clonedPlayer.pos.x = pos;
        return; // Döndürme mümkün değil
      }
    }
    setPlayer(clonedPlayer);
  };
  
  const drop = () => {
    if (gameOver || !player) return;

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };
  
  // PARÇA YERE ÇARPTIĞINDA TÜM İŞLEMLERİ YAPAN TEK BİR YER
  useEffect(() => {
    if (player?.collided) {
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
      }
      
      setBoard(sweptBoard);
      resetPlayer();
    }
  }, [player?.collided, resetPlayer]);

  // Seviye atlama kontrolü
  useEffect(() => {
    const newLevel = Math.floor(rows / 10);
    if (newLevel > level) {
      setLevel(newLevel);
      setDropTime(1000 / (newLevel + 1) + 200);
    }
  }, [rows, level]);
  
  // Skor kaydetme
  useEffect(() => {
    if (gameOver) {
      if (score > 0) addScore(nickname, score);
      refetchScores();
    }
  }, [gameOver, score, nickname, addScore, refetchScores]);
  
  // Diğer fonksiyonlar
  const dropPlayer = () => { if (gameOver) return; setDropTime(null); drop(); };
  const hardDrop = () => { if (gameOver) return; let y = 0; while (!checkCollision(player, board, { x: 0, y: y + 1 })) { y++; } updatePlayerPos({ x: 0, y: y, collided: true }); };
  const keyUp = ({ keyCode }) => { if (!gameOver) { if (keyCode === 40 || keyCode === 83) { setDropTime(1000 / (level + 1) + 200); } } };
  const move = ({ keyCode }) => { if (gameOver) return; if (keyCode === 37 || keyCode === 65) movePlayer(-1); else if (keyCode === 39 || keyCode === 68) movePlayer(1); else if (keyCode === 40 || keyCode === 83) dropPlayer(); else if (keyCode === 38 || keyCode === 87) rotatePlayer(); else if (keyCode === 32) hardDrop(); };
  
  // Otomatik düşme için interval
  const useInterval = (callback, delay) => { const savedCallback = useRef(); useEffect(() => { savedCallback.current = callback; }, [callback]); useEffect(() => { function tick() { savedCallback.current(); } if (delay !== null) { let id = setInterval(tick, delay); return () => clearInterval(id); } }, [delay]); };
  useInterval(() => { drop(); }, dropTime);

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