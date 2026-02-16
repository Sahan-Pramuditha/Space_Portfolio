import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gamepad2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [[10, 10], [10, 11], [10, 12]]; // Initial length 3
const INITIAL_DIRECTION = { x: 0, y: -1 };

const DIFFICULTIES = {
  EASY: { label: 'Easy', speed: 180, transition: '0.18s' },
  MEDIUM: { label: 'Medium', speed: 120, transition: '0.12s' },
  HARD: { label: 'Hard', speed: 80, transition: '0.08s' },
};

// Simple Audio Synthesizer (Unchanged)
const playSound = (type, muted) => {
  if (muted) return;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === 'eat') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'gameover') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  }
};

const SnakeGame = ({ isOpen, onClose }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([5, 5]);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snakeHighScore')) || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [muted, setMuted] = useState(false);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  
  const gameLoopRef = useRef();
  const touchStartRef = useRef(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
      const isOnSnake = snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    setIsPaused(false);
    setShake(false);
    setParticles([]);
    generateFood();
  };

  const togglePause = () => {
    if (gameOver || !isPlaying) return;
    setIsPaused(prev => !prev);
  };

  const spawnParticles = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: `${Date.now()}-${Math.random()}-${i}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1.0,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying || isPaused) return;

    setDirection(nextDirection);

    setParticles(prev => prev
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.1 }))
      .filter(p => p.life > 0)
    );

    setSnake(prevSnake => {
      const newHead = [
        prevSnake[0][0] + nextDirection.x,
        prevSnake[0][1] + nextDirection.y
      ];

      if (
        newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE ||
        prevSnake.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])
      ) {
        setGameOver(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        playSound('gameover', muted);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        playSound('eat', muted);
        spawnParticles(newHead[0], newHead[1], '#ef4444');
        setScore(prev => {
          const newScore = prev + (difficulty === 'HARD' ? 20 : difficulty === 'MEDIUM' ? 10 : 5);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
          }
          return newScore;
        });
        generateFood();
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [nextDirection, food, gameOver, isPlaying, isPaused, generateFood, highScore, difficulty, muted]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, DIFFICULTIES[difficulty].speed);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake, difficulty]);

  const handleInput = useCallback((key) => {
    if (!isPlaying) return;
    switch (key) {
      case 'ArrowUp': if (direction.y === 0) setNextDirection({ x: 0, y: -1 }); break;
      case 'ArrowDown': if (direction.y === 0) setNextDirection({ x: 0, y: 1 }); break;
      case 'ArrowLeft': if (direction.x === 0) setNextDirection({ x: -1, y: 0 }); break;
      case 'ArrowRight': if (direction.x === 0) setNextDirection({ x: 1, y: 0 }); break;
    }
  }, [isPlaying, direction]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      if (e.key === ' ' && isPlaying) { togglePause(); return; }
      handleInput(e.key);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, handleInput, isPlaying, isPaused]);

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;
    const diffY = touchStartRef.current.y - e.changedTouches[0].clientY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) handleInput(diffX > 0 ? 'ArrowLeft' : 'ArrowRight');
    } else {
      if (Math.abs(diffY) > 30) handleInput(diffY > 0 ? 'ArrowUp' : 'ArrowDown');
    }
    touchStartRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="snake-game-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`bg-gray-900 p-6 rounded-2xl shadow-[0_0_50px_rgb(var(--color-accent-rgb)_/_0.2)] max-w-lg w-full border border-gray-800 relative overflow-hidden ${shake ? 'animate-shake' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {/* CRT Overlay */}
          <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 relative z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg shadow-inner">
                <Gamepad2 className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wider">NEON SNAKE</h3>
                <p className="text-xs text-gray-400 font-mono">Use arrow keys or swipe</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMuted(!muted)} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Game Board */}
          <div 
            className="relative aspect-square bg-black rounded-xl overflow-hidden border border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] mb-6 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Grid Lines */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`
              }}
            />

            {/* Render Snake Absolutely for Smoothness */}
            {snake.map((segment, i) => {
              const isHead = i === 0;
              return (
                <div
                  key={`${i}-${segment[0]}-${segment[1]}`} // Key ensures smooth transition when position changes
                  className="absolute"
                  style={{
                    left: `${(segment[0] / GRID_SIZE) * 100}%`,
                    top: `${(segment[1] / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    transition: `all ${DIFFICULTIES[difficulty].transition} linear`
                  }}
                >
                  <div 
                    className={`w-full h-full rounded-sm ${isHead ? 'bg-accent shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.8)] z-10' : 'bg-accent/80 shadow-[0_0_10px_rgb(var(--color-accent-rgb)_/_0.4)]'}`}
                    style={{ transform: 'scale(0.92)' }}
                  >
                    {isHead && (
                      <div className="absolute inset-0 flex items-center justify-center gap-[2px]"
                        style={{
                          transform: `rotate(${
                            direction.x === 1 ? 90 : direction.x === -1 ? -90 : direction.y === 1 ? 180 : 0
                          }deg)`
                        }}
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Food */}
            <div
              className="absolute transition-all duration-300"
              style={{
                left: `${(food[0] / GRID_SIZE) * 100}%`,
                top: `${(food[1] / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`
              }}
            >
              <div className="w-full h-full p-1">
                <div className="w-full h-full bg-red-500 rounded-full animate-pulse shadow-[0_0_20px_#ef4444] relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1 h-1 rounded-full pointer-events-none z-20"
                style={{
                  left: `${(p.x + 0.5) * (100/GRID_SIZE)}%`,
                  top: `${(p.y + 0.5) * (100/GRID_SIZE)}%`,
                  backgroundColor: p.color,
                  opacity: p.life,
                  transform: `scale(${p.life})`,
                  boxShadow: `0 0 10px ${p.color}`
                }}
              />
            ))}

            {/* UI Overlays (Start/Pause/Game Over) */}
            {(!isPlaying || isPaused || gameOver) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 gap-6">
                {!isPlaying && !gameOver && (
                  <>
                    <div className="flex gap-2 bg-gray-800 p-1.5 rounded-xl shadow-lg">
                      {Object.keys(DIFFICULTIES).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            difficulty === d 
                              ? 'bg-accent text-white shadow-[0_0_15px_rgb(var(--color-accent-rgb)_/_0.5)]' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {DIFFICULTIES[d].label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={resetGame}
                      className="px-8 py-3 bg-accent text-white rounded-full font-bold shadow-[0_0_20px_rgb(var(--color-accent-rgb)_/_0.4)] hover:shadow-[0_0_30px_rgb(var(--color-accent-rgb)_/_0.6)] hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Play size={20} fill="currentColor" /> Start Game
                    </button>
                  </>
                )}
                {isPlaying && isPaused && (
                  <>
                    <h3 className="text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Paused</h3>
                    <button onClick={togglePause} className="px-8 py-3 bg-accent text-white rounded-full font-bold shadow-lg hover:bg-accent-glow transition-all hover:scale-105 flex items-center gap-2">
                      <Play size={20} fill="currentColor" /> Resume
                    </button>
                  </>
                )}
                {gameOver && (
                  <>
                    <Trophy className="text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={64} />
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-white mb-1">GAME OVER</h3>
                      <p className="text-gray-300">Score: <span className="text-accent font-bold">{score}</span></p>
                    </div>
                    <button onClick={resetGame} className="mt-4 flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent-glow transition-all hover:scale-105 shadow-lg">
                      <RefreshCw size={20} /> Play Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="flex justify-between items-end relative z-20">
            <div className="flex gap-4">
               <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Score</p>
                <p className="text-2xl font-mono text-accent font-bold leading-none">{score}</p>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Best</p>
                <p className="text-2xl font-mono text-white font-bold leading-none">{highScore}</p>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-1 md:hidden">
              <div></div>
              <button className="p-3 bg-gray-800 rounded-lg active:bg-accent/20 text-white" onClick={() => handleInput('ArrowUp')}><ChevronUp size={24} /></button>
              <div></div>
              <button className="p-3 bg-gray-800 rounded-lg active:bg-accent/20 text-white" onClick={() => handleInput('ArrowLeft')}><ChevronLeft size={24} /></button>
              <button className="p-3 bg-gray-800 rounded-lg active:bg-accent/20 text-white" onClick={() => handleInput('ArrowDown')}><ChevronDown size={24} /></button>
              <button className="p-3 bg-gray-800 rounded-lg active:bg-accent/20 text-white" onClick={() => handleInput('ArrowRight')}><ChevronRight size={24} /></button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          75% { transform: translateX(5px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default SnakeGame;
