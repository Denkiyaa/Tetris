import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const CAT_STATES = {
  // Durum 1: Her şey yolunda (< %50 doluluk)
  relaxed: {
    art: `     |\\_/|\n     | o.o |\n     |> ^ <|`,
    animation: styles.bobbing,
  },
  // Durum 2: Su yükseliyor, endişe başlıyor (%50+)
  worried: {
    art: `     |\\_/|\n     | O.O |\n     |> ~ <|\n~≈~≈~≈~≈`,
    animation: styles.bobbing,
  },
  // Durum 3: Panik artıyor! (%75+)
  panicked: {
    art: `   ' |\\_/| \n   ' |>.<| \n     |> o <|\n≈≈≈≈≈≈≈≈`,
    animation: styles.panicked,
  },
  // Durum 4: Oyun Bitti
  gameOver: {
    art: `\n\n    x x\n   _____\n  ≈≈≈≈≈≈≈`,
    animation: '',
  },
};

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

  // [MASKOT] Kedinin mevcut durumunu tutan state
  const [mascotStatus, setMascotStatus] = useState('relaxed');

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
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      matrix: newPiece.shape,
      collided: false,
    });
  }, [nextPiece]);

  // [MASKOT GÜNCELLEMESİ] Doluluk oranına göre kedi durumunu güncelleyen useEffect
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
    // KİLİT KONTROLÜ EKLENDİ
    if (gameOver || !player || actionLock.current) return;

    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  useEffect(() => {
    if (player?.collided) {
      // YENİ EKLENEN KONTROL:
      // Parça, oyun alanının tepesine değer değmez kilitlenirse oyunu bitir.
      // Bu, parçanın tahtaya yerleşip bir sonraki parçanın doğmasını beklemeden,
      // "imkansız" bir kilitlenme durumunu anında yakalar.
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return; // Diğer işlemleri yapmadan useEffect'ten çık
      }

      // --- Buradan sonrası önceki düzeltmeyle aynı kalıyor ---

      // 1. Parçayı tahtaya yerleştir
      const newBoard = JSON.parse(JSON.stringify(board));
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
          }
        });
      });

      // 2. Dolu sıraları temizle
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

      // 3. Tahtayı güncelle
      setBoard(sweptBoard);

      // Bir sonraki parçayı al
      const nextPieceToSpawn = nextPiece || randomShape();
      const nextPlayerState = {
        pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
        matrix: nextPieceToSpawn.shape,
        collided: false,
      };

      // 4. Yeni parça, güncellenmiş tahtaya sığıyor mu diye kontrol et
      if (checkCollision(nextPlayerState, sweptBoard, { x: 0, y: 0 })) {
        setGameOver(true);
        setDropTime(null);
      } else {
        setPlayer(nextPlayerState);
        setNextPiece(randomShape());
      }

      actionLock.current = false;
    }
    // Bağımlılıkları kontrol etmeyi unutmayın
  }, [player?.collided, board, nextPiece]);

  const dropPlayer = () => { if (gameOver || actionLock.current) return; setDropTime(null); drop(); };

  const hardDrop = () => {
    if (gameOver || !player || actionLock.current) return;
    // [DÜZELTME] Hard drop başlar başlamaz diğer tüm kontrolleri kilitle
    actionLock.current = true;
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
            <AnimatedMascot status={mascotStatus} />
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