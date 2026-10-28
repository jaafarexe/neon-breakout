import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-[#07080d]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
      <div className="max-w-sm w-full bg-[#0d101e] border border-cyan-500/30 rounded-xl p-6 text-center space-y-6 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        <div>
          <h2 className="font-arcade text-2xl font-bold tracking-wider text-cyan-400 neon-glow-cyan">
            GAME PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1">Press ESC or Space to resume</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade text-xs font-bold tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESTART MISSION
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2 bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>Sound: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
