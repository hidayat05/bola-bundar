import React from 'react';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  Clock,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';

export const TimelineBar: React.FC = () => {
  const {
    frames,
    activeFrameIndex,
    isPlaying,
    playbackSpeed,
    setActiveFrame,
    addFrame,
    duplicateFrame,
    removeFrame,
    updateFrameDuration,
    setIsPlaying,
    setPlaybackSpeed,
  } = useTacticsStore();

  const currentFrame = frames[activeFrameIndex];

  return (
    <div className="h-16 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between select-none z-10">
      {/* Left: Playback Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Play Animation</span>
            </>
          )}
        </button>

        {/* Speed Selector */}
        <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-[11px] font-semibold">
          {[0.5, 1, 1.5, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-1 rounded transition-colors ${
                playbackSpeed === spd
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Center: Keyframe Cards */}
      <div className="flex-1 flex items-center justify-center space-x-2 px-4 overflow-x-auto">
        <div className="flex items-center space-x-2 py-1">
          {frames.map((frame, index) => {
            const isActive = index === activeFrameIndex;
            return (
              <div
                key={frame.id}
                onClick={() => setActiveFrame(index)}
                className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800 border-emerald-500/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {frame.name || `Frame ${index + 1}`}
                </span>

                {/* Duration indicator */}
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                  {frame.duration || 1.5}s
                </span>

                {/* Duplicate / Delete mini buttons */}
                {isActive && (
                  <div className="flex items-center space-x-1 pl-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateFrame(index);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded"
                      title="Duplicate Frame"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {frames.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFrame(index);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        title="Delete Frame"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Frame Button */}
          <button
            onClick={addFrame}
            className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 bg-slate-950/40 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Frame</span>
          </button>
        </div>
      </div>

      {/* Right: Active Frame Settings */}
      {currentFrame && (
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">Transition:</span>
          <select
            value={currentFrame.duration || 1.5}
            onChange={(e) =>
              updateFrameDuration(activeFrameIndex, parseFloat(e.target.value))
            }
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value={0.5} className="bg-slate-900">
              0.5s (Fast)
            </option>
            <option value={1.0} className="bg-slate-900">
              1.0s (Normal)
            </option>
            <option value={1.5} className="bg-slate-900">
              1.5s (Standard)
            </option>
            <option value={2.0} className="bg-slate-900">
              2.0s (Smooth)
            </option>
            <option value={3.0} className="bg-slate-900">
              3.0s (Slow)
            </option>
          </select>
        </div>
      )}
    </div>
  );
};
