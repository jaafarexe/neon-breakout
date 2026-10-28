import React from 'react';
import { ArrowRight, Trophy, Heart, Sparkles } from 'lucide-react';

interface LevelTransitionModalProps {
  level: number;
  levelName: string;
  score: number;
  bonusPoints: number;
  livesRemaining: number;
  isAllClear: boolean;
  onNextLevel: () => void;
}

export const LevelTransitionModal: React.FC<LevelTransitionModalProps> = ({
  level,
  levelName,
  score,
  bonusPoints,
  livesRemaining,
  isAllClear,
  onNextLevel,
}) => {
  return (
    <div className="absolute inset-0 bg-[#07080d]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[#0d101e] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_40px_rgba(0,240,255,0.25)]">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-cyan-400 font-semibold font-mono-nums">
            <Sparkles className="w-3.5 h-3.5" />
            {isAllClear ? 'GRID DOMINATION' : 'SECTOR SECURED'}
          </div>
          <h2 className="font-arcade text-2xl sm:text-3xl font-black tracking-wider text-cyan-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">
            {isAllClear ? 'CAMPAIGN VICTORY!' : `SECTOR ${level} CLEARED`}
          </h2>
          <div className="text-xs text-slate-400">{levelName}</div>
        </div>

        {/* Bonus calculations */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono-nums">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              Lives Bonus ({livesRemaining} × 500)
            </span>
            <span className="font-bold text-pink-300">+{bonusPoints.toLocaleString()}</span>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Accumulated Score</span>
            <span className="font-arcade text-lg font-bold text-white">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onNextLevel}
          className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade text-xs font-bold tracking-wider rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAllClear ? (
            <>
              <Trophy className="w-4 h-4 fill-slate-950" />
              ENTER ENDLESS OVERDRIVE
            </>
          ) : (
            <>
              PROCEED TO SECTOR {level + 1}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
