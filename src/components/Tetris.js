import React, { useState, useEffect, useRef } from 'react';
import { createBoard, checkCollision } from '../gameHelpers';
import { usePlayer } from '../hooks/usePlayer';
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
  const [board, setBoard] = useState(createBoard());
  
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);
  
  const { scores, loading, error, addScore, refetchScores } = useHighScores();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const movePlayer = (dir) => {
    if (gameOver || !player) return;
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
    refetchScores();
  };
  
  const handleNicknameSubmit = (name) => {
    setNickname(name);
    setGamePhase('playing');
    startGame();
  };

  const drop = () => {
    if (gameOver || !player) return;

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Parça yere çarptı!
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        if (score > 0) addScore(nickname, score);
        return;
      }
      
      // 1. Parçayı board'a birleştir
      const newBoard = JSON.parse(JSON.stringify(board));
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
          }
        });
      });

      // 2. Dolu satırları temizle ve say
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

      // 3. Skoru, satırları ve seviyeyi GÜNCELLE
      if (clearedRowsCount > 0) {
        const linePoints = [10, 30, 60, 100];
        setScore(prev => prev + linePoints[clearedRowsCount - 1] * (level + 1));
        const newTotalRows = rows + clearedRowsCount;
        setRows(newTotalRows);
        const newLevel = Math.floor(newTotalRows / 10);
        if (newLevel > level) {
          setLevel(newLevel);
          setDropTime(1000 / (newLevel + 1) + 200);
        }
      }
      
      // 4. Board'u son haliyle set et ve yeni parça iste
      setBoard(sweptBoard);
      resetPlayer();
    }
  };
  
  const dropPlayer = () => { if (gameOver) return; setDropTime(null); drop(); };
  const hardDrop = () => { if (gameOver || !player) return; let y = 0; while (!checkCollision(player, board, { x: 0, y: y + 1 })) { y++; } updatePlayerPos({ x: 0, y: y, collided: true }); };
  const rotatePlayer = () => { if (gameOver || !player) return; playerRotate(board); };
  
  const keyUp = ({ keyCode }) => { if (!gameOver) { if (keyCode === 40 || keyCode === 83) { setDropTime(1000 / (level + 1) + 200); } } };
  const move = ({ keyCode }) => { if (gameOver) return; if (keyCode === 37 || keyCode === 65) movePlayer(-1); else if (keyCode === 39 || keyCode === 68) movePlayer(1); else if (keyCode === 40 || keyCode === 83) dropPlayer(); else if (keyCode === 38 || keyCode === 87) rotatePlayer(); else if (keyCode === 32) hardDrop(); };
  
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
              <button
                className={styles.startButton}
                onClick={() => window.location.reload()}
              >
                Yeniden Başlat
              </button>
              <HighScores scores={scores} loading={loading} error={error} />
            </aside>
          </div>
          <Controls 
             moveLeft={() => movePlayer(-1)}
             moveRight={() => movePlayer(1)}
             rotate={rotatePlayer}
             drop={dropPlayer}
             hardDrop={hardDrop}
          />
        </>
      )}
    </div>
  );
};

export default Tetris;