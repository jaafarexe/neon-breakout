import React from 'react';
import { Play, Sparkles, Zap, Shield, Flame, Disc, Heart, Maximize2 } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 bg-[#07080d]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
      <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
        {/* Game Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            Arcade Brick Breaker
          </div>
          <h1 className="font-arcade text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,240,255,0.7)]">
            NEON <span className="text-pink-500 drop-shadow-[0_0_25px_rgba(255,0,119,0.7)]">BREAKOUT</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto">
            Shatter neon grids, harness cascading power-ups, and keep the ball in play with hyper-responsive controls.
          </p>
        </div>

        {/* High score callout if exists */}
        {highScore > 0 && (
          <div className="px-4 py-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs font-mono-nums flex items-center gap-2 text-amber-300">
            <span>HIGH SCORE RECORD</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-sm text-amber-200">{highScore.toLocaleString()} PTS</span>
          </div>
        )}

        {/* Power-up Guide Grid */}
        <div className="w-full bg-[#0d101e]/80 border border-slate-800 rounded-xl p-4 text-left">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Power-Ups & Ordnance
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Disc className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-cyan-300">Multi-Ball</div>
                <div className="text-[11px] text-slate-400">+2 extra balls</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Zap className="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <div className="font-semibold text-pink-300">Laser Blaster</div>
                <div className="text-[11px] text-slate-400">Twin cannons</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <div className="font-semibold text-orange-300">Fireball</div>
                <div className="text-[11px] text-slate-400">Pierces bricks</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-emerald-300">Safety Net</div>
                <div className="text-[11px] text-slate-400">Bottom shield</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Maximize2 className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-semibold text-purple-300">Wide Paddle</div>
                <div className="text-[11px] text-slate-400">+50% width</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <Heart className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="font-semibold text-red-300">Life Core</div>
                <div className="text-[11px] text-slate-400">+1 extra life</div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">
                <span className="text-amber-400 font-semibold">Special Bricks:</span> Purple (2 HP), Steel (3 HP), Bomb (Chain blast)
              </div>
            </div>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono-nums">Mouse / Touch</kbd>
            <span>Track paddle</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono-nums">← → or A / D</kbd>
            <span>Move keys</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono-nums">SPACE</kbd>
            <span>Launch / Laser</span>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={onStart}
          className="w-full sm:w-auto px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade text-sm font-bold tracking-wider rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          START GAME
        </button>
      </div>
    </div>
  );
};
