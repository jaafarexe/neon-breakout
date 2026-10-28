import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Zap, Shield, Flame, Activity } from 'lucide-react';
import { ActivePowerUp } from '../types/game';

interface HUDProps {
  score: number;
  highScore: number;
  level: number;
  levelName: string;
  lives: number;
  maxLives: number;
  combo: number;
  isPaused: boolean;
  isMuted: boolean;
  activePowerUps: ActivePowerUp[];
  hasShield: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  level,
  levelName,
  lives,
  maxLives,
  combo,
  isPaused,
  isMuted,
  activePowerUps,
  hasShield,
  onTogglePause,
  onToggleMute,
  onRestart,
}) => {
  return (
    <header className="w-full bg-[#0d0f1a]/95 border-b border-cyan-500/20 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand title & level */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-lg sm:text-xl font-black tracking-wider text-cyan-400 neon-glow-cyan whitespace-nowrap">
              NEON BREAKOUT
            </span>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-400 gap-1.5 font-mono-nums">
            <span className="text-pink-400 font-semibold font-arcade">LVL {level}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium tracking-wide">{levelName}</span>
          </div>
        </div>

        {/* Center: Score, High Score & Combo */}
        <div className="flex items-center gap-5 sm:gap-8 font-mono-nums">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              Score
            </span>
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              High
            </span>
            <span className="text-base sm:text-lg font-bold text-amber-400 tracking-wide">
              {Math.max(score, highScore).toLocaleString()}
            </span>
          </div>

          {/* Combo Indicator */}
          {combo > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-pink-950/60 border border-pink-500/40 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-arcade text-xs font-bold text-pink-300 neon-glow-pink">
                {combo}X
              </span>
            </div>
          )}
        </div>

        {/* Right: Lives & Utility Actions */}
        <div className="flex items-center gap-4">
          {/* Lives display */}
          <div className="flex items-center gap-1.5" title={`${lives} Lives Remaining`}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < lives
                    ? 'bg-pink-500 shadow-[0_0_8px_#ff0077]'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
            {hasShield && (
              <span
                className="ml-1 text-cyan-400 flex items-center"
                title="Safety Barrier Active"
              >
                <Shield className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_#00f0ff]" />
              </span>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <button
              onClick={onToggleMute}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onTogglePause}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition-colors"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={onRestart}
              className="p-2 text-slate-400 hover:text-pink-400 hover:bg-pink-950/40 rounded-lg transition-colors"
              title="Restart Game"
              aria-label="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Power-up mini status bar if any power-up is active */}
      {activePowerUps.length > 0 && (
        <div className="max-w-6xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Buffs:
          </span>
          {activePowerUps.map((p) => {
            const pct = Math.max(0, Math.min(100, (p.timeLeft / p.totalDuration) * 100));
            return (
              <div
                key={p.type}
                className="flex items-center gap-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300 font-mono-nums"
              >
                {p.type === 'fireball' && <Flame className="w-3 h-3 text-orange-400" />}
                {p.type === 'laser' && <Zap className="w-3 h-3 text-pink-400" />}
                {p.type === 'shield' && <Shield className="w-3 h-3 text-cyan-400" />}
                <span>{p.label}</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 6px ${p.color}`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{Math.ceil(p.timeLeft)}s</span>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};
