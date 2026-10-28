import React from 'react';
import { RotateCcw, Trophy, Award, Zap } from 'lucide-react';
import { GameStats } from '../types/game';

interface GameOverModalProps {
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewHighScore,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 bg-[#07080d]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[#0d101e] border border-pink-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_40px_rgba(255,0,119,0.25)]">
        {/* Title */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-pink-400 font-semibold font-mono-nums">
            SYSTEM CRITICAL
          </div>
          <h2 className="font-arcade text-3xl sm:text-4xl font-black tracking-wider text-pink-500 drop-shadow-[0_0_20px_rgba(255,0,119,0.8)]">
            GAME OVER
          </h2>
        </div>

        {/* Score & High Score */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 uppercase font-semibold">Final Score</div>
          <div className="font-arcade text-3xl font-black text-white font-mono-nums tracking-wide">
            {stats.score.toLocaleString()}
          </div>

          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-bounce mt-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              NEW HIGH SCORE RECORD!
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono-nums flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-500" />
              Best: {stats.highScore.toLocaleString()} pts
            </div>
          )}
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono-nums">
          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Sector</div>
            <div className="text-base font-bold text-cyan-400">{stats.level}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Bricks</div>
            <div className="text-base font-bold text-pink-400">{stats.bricksDestroyed}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">Max Combo</div>
            <div className="text-base font-bold text-amber-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              {stats.maxCombo}x
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-pink-500 hover:bg-pink-400 text-slate-950 font-arcade text-xs font-bold tracking-wider rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,0,119,0.5)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
