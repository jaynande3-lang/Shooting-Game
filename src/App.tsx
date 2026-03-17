import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEngine } from './game/Engine';
import { GameState } from './types';
import { Trophy, Heart, Zap, Play, RotateCcw, Pause, Shield } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const engine = new GameEngine(canvas);
      engineRef.current = engine;

      const updateState = () => {
        setGameState({ ...engine.getState() });
        requestAnimationFrame(updateState);
      };
      updateState();

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      return () => {
        engine.stop();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const startGame = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      engineRef.current.start();
      setGameStarted(true);
    }
  };

  const togglePause = () => {
    if (engineRef.current && gameState) {
      const newPaused = !gameState.isPaused;
      engineRef.current.setPaused(newPaused);
    }
  };

  const restartGame = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setGameStarted(true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* HUD */}
      {gameStarted && gameState && !gameState.isGameOver && (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-bold">Vitality</span>
                  <div className="w-48 h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-400"
                      initial={{ width: '100%' }}
                      animate={{ width: `${gameState.player.health}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400/60 font-bold">Wave Status</span>
                  <span className="text-xl font-display text-white">SECTOR {gameState.wave}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Score</span>
                  <div className="text-3xl font-display text-white tracking-wider">
                    {gameState.player.score.toLocaleString().padStart(6, '0')}
                  </div>
                </div>
                <div className="p-2 bg-white/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <button 
                onClick={togglePause}
                className="pointer-events-auto p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              >
                {gameState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="px-6 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
              WASD to Move • Click to Shoot
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      <AnimatePresence>
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="text-center max-w-2xl px-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-8xl md:text-[12rem] font-display leading-[0.8] tracking-tighter text-white uppercase mb-4">
                  Neon<br />Strike
                </h1>
                <p className="text-emerald-400 font-mono text-sm tracking-[0.5em] uppercase mb-12">
                  System Protocol: Survival
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="group relative px-12 py-6 bg-emerald-500 text-black font-display text-2xl uppercase tracking-widest rounded-full overflow-hidden transition-all hover:bg-emerald-400"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Initialize <Play className="w-6 h-6 fill-current" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>

              <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Shield className="w-6 h-6 text-white/60" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Defend</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Zap className="w-6 h-6 text-white/60" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Survive</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Trophy className="w-6 h-6 text-white/60" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Conquer</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState?.isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/40 backdrop-blur-2xl"
          >
            <div className="text-center bg-black/40 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <h2 className="text-7xl font-display text-white uppercase mb-2">Protocol Terminated</h2>
                <p className="text-red-400 font-mono text-xs tracking-[0.4em] uppercase mb-12">
                  Critical System Failure • Sector {gameState.wave}
                </p>

                <div className="flex justify-center gap-12 mb-12">
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Final Score</span>
                    <div className="text-5xl font-display text-white">{gameState.player.score.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Waves Cleared</span>
                    <div className="text-5xl font-display text-white">{gameState.wave}</div>
                  </div>
                </div>

                <button
                  onClick={restartGame}
                  className="px-10 py-5 bg-white text-black font-display text-xl uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-colors flex items-center gap-3 mx-auto"
                >
                  Reboot System <RotateCcw className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Screen */}
      <AnimatePresence>
        {gameState?.isPaused && !gameState.isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="text-center">
              <h2 className="text-6xl font-display text-white uppercase mb-8 tracking-widest">System Paused</h2>
              <button
                onClick={togglePause}
                className="px-10 py-5 bg-emerald-500 text-black font-display text-xl uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-colors flex items-center gap-3 mx-auto"
              >
                Resume Protocol <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

