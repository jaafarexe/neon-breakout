import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, ActivePowerUp } from './types/game';
import { getLevelConfig, LEVELS } from './utils/levels';
import { soundFx } from './utils/audio';
import { HUD } from './components/HUD';
import { NeonCanvas } from './components/NeonCanvas';
import { StartScreen } from './components/StartScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelTransitionModal } from './components/LevelTransitionModal';

const INITIAL_LIVES = 3;
const MAX_LIVES = 5;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [levelBonus, setLevelBonus] = useState<number>(0);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    maxLives: MAX_LIVES,
    level: 1,
    combo: 0,
    maxCombo: 0,
    bricksDestroyed: 0,
    powerupsCollected: 0,
  });

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neon_breakout_high_score');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) {
          setHighScore(val);
          setStats((prev) => ({ ...prev, highScore: val }));
        }
      }
    } catch {
      // localStorage may fail in restricted sandbox
    }
  }, []);

  // Update high score whenever score changes
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      setStats((prev) => ({ ...prev, highScore: stats.score }));
      try {
        localStorage.setItem('neon_breakout_high_score', String(stats.score));
      } catch {
        // ignore
      }
    }
  }, [stats.score, highScore]);

  // Start new game
  const handleStartGame = useCallback(() => {
    soundFx.playUiClick();
    setIsNewHighScore(false);
    setActivePowerUps([]);
    setStats((prev) => ({
      score: 0,
      highScore: Math.max(prev.highScore, highScore),
      lives: INITIAL_LIVES,
      maxLives: MAX_LIVES,
      level: 1,
      combo: 0,
      maxCombo: 0,
      bricksDestroyed: 0,
      powerupsCollected: 0,
    }));
    setGameState('PLAYING');
  }, [highScore]);

  // Toggle Pause
  const handleTogglePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      soundFx.playUiClick();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      soundFx.playUiClick();
      setGameState('PLAYING');
    }
  }, [gameState]);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  }, []);

  // Level cleared handler
  const handleLevelCleared = useCallback(() => {
    const bonus = stats.lives * 500;
    setLevelBonus(bonus);
    setStats((prev) => ({
      ...prev,
      score: prev.score + bonus,
    }));
    setGameState('LEVEL_TRANSITION');
  }, [stats.lives]);

  // Proceed to next level
  const handleNextLevel = useCallback(() => {
    soundFx.playUiClick();
    setStats((prev) => ({
      ...prev,
      level: prev.level + 1,
      combo: 0,
    }));
    setActivePowerUps([]);
    setGameState('PLAYING');
  }, []);

  // Game over handler
  const handleGameOver = useCallback(() => {
    const isNew = stats.score > highScore;
    setIsNewHighScore(isNew);
    setGameState('GAME_OVER');
  }, [stats.score, highScore]);

  const currentLevelConfig = getLevelConfig(stats.level - 1);
  const hasShield = activePowerUps.some((p) => p.type === 'shield');
  const isCampaignCompleted = stats.level >= LEVELS.length;

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Arcade HUD */}
      <HUD
        score={stats.score}
        highScore={stats.highScore}
        level={stats.level}
        levelName={currentLevelConfig.name}
        lives={stats.lives}
        maxLives={stats.maxLives}
        combo={stats.combo}
        isPaused={gameState === 'PAUSED'}
        isMuted={isMuted}
        activePowerUps={activePowerUps}
        hasShield={hasShield}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        onRestart={handleStartGame}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full px-2">
        <NeonCanvas
          gameState={gameState}
          stats={stats}
          activePowerUps={activePowerUps}
          onStatsChange={setStats}
          onActivePowerUpsChange={setActivePowerUps}
          onLevelCleared={handleLevelCleared}
          onGameOver={handleGameOver}
          onTogglePause={handleTogglePause}
        />

        {/* Start Screen Overlay */}
        {gameState === 'START' && (
          <StartScreen
            highScore={highScore}
            onStart={handleStartGame}
          />
        )}

        {/* Pause Modal Overlay */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleTogglePause}
            onRestart={handleStartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Level Cleared / Victory Overlay */}
        {gameState === 'LEVEL_TRANSITION' && (
          <LevelTransitionModal
            level={stats.level}
            levelName={currentLevelConfig.name}
            score={stats.score}
            bonusPoints={levelBonus}
            livesRemaining={stats.lives}
            isAllClear={isCampaignCompleted}
            onNextLevel={handleNextLevel}
          />
        )}

        {/* Game Over Modal Overlay */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            stats={stats}
            isNewHighScore={isNewHighScore}
            onRestart={handleStartGame}
          />
        )}
      </main>

      {/* Footer Controls & Arcade Telemetry Bar */}
      <footer className="w-full border-t border-slate-900 bg-[#090b14]/90 py-2.5 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-mono-nums">
          <div className="flex items-center gap-3">
            <span>Mouse / Touch to steer</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Arrow Keys / A & D</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Spacebar: Launch & Fire</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>ESC / P: Pause</span>
          </div>
          <div className="text-slate-400">
            Neon Breakout Arcade © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
