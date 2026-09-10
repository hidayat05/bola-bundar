import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { getTacticalPlayPresets } from '../../utils/tacticalPlays';
import { Tooltip } from '../ui/Tooltip';

const PlaybackProgressBar: React.FC = React.memo(() => {
  const isPlaying = useTacticsStore((s) => s.isPlaying);
  const playbackProgress = useTacticsStore((s) => s.playbackProgress);

  if (!isPlaying) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-75 ease-linear shadow-sm shadow-emerald-500"
        style={{ width: `${Math.min(100, Math.max(0, playbackProgress * 100))}%` }}
      />
    </div>
  );
});

export const TimelineBar: React.FC = React.memo(() => {
  const {
    pitchType,
    frames,
    activeFrameIndex,
    isPlaying,
    playbackSpeed,
    setActiveFrame,
    addFrame,
    duplicateFrame,
    removeFrame,
    updateFrameDuration,
    loadPlayPreset,
    setIsPlaying,
    setPlaybackSpeed,
  } = useTacticsStore();

  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const playMenuRef = useRef<HTMLDivElement>(null);
  const plays = getTacticalPlayPresets(pitchType);

  // Close plays menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        playMenuRef.current &&
        !playMenuRef.current.contains(e.target as Node)
      ) {
        setPlayMenuOpen(false);
      }
    };
    if (playMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [playMenuOpen]);

  const currentFrame = frames[activeFrameIndex];

  const handleTogglePlay = () => {
    if (frames.length <= 1) {
      // If only 1 frame, automatically create Frame 2 so user can see movement!
      addFrame();
      setTimeout(() => {
        setIsPlaying(true);
      }, 50);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative h-16 bg-slate-900 border-t border-slate-800 px-3 sm:px-4 flex items-center justify-between select-none z-20">
      {/* Top Playback Scrubbing Progress Bar */}
      <PlaybackProgressBar />

      {/* Left: Playback Controls */}
      <div data-tour="timeline-controls" className="flex items-center space-x-2">
        <Tooltip
          content={isPlaying ? 'Jeda Animasi' : 'Putar Animasi (Play)'}
          description="Interpolasi pergerakan halus posisi pemain & bola antar-frame"
          position="top"
        >
          <button
            onClick={handleTogglePlay}
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
                <span>Play</span>
              </>
            )}
          </button>
        </Tooltip>

        {/* Speed Selector */}
        <Tooltip content="Kecepatan Animasi" description="Pilih kecepatan putar 0.5x s/d 2.0x" position="top">
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
        </Tooltip>
      </div>

      {/* Center: Keyframe Timeline Cards */}
      <div className="flex-1 flex items-center justify-center space-x-2 px-3 overflow-x-auto">
        <div className="flex items-center space-x-2 py-1">
          {frames.map((frame, index) => {
            const isActive = index === activeFrameIndex;
            return (
              <div
                key={frame.id}
                onClick={() => !isPlaying && setActiveFrame(index)}
                className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800 border-emerald-500/80 text-white shadow-sm ring-1 ring-emerald-500/30'
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
                {isActive && !isPlaying && (
                  <div className="flex items-center space-x-0.5 pl-1 border-l border-slate-700/60">
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
          <Tooltip
            content="Tambah Frame Baru"
            description="Buat frame baru untuk melanjutkan alur gerakan animasi"
            position="top"
          >
            <button
              onClick={addFrame}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 bg-slate-950/40 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Frame</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right: Tactical Play Templates & Active Frame Settings */}
      <div className="flex items-center space-x-2">
        {plays.length > 0 && (
          <div data-tour="tactical-plays" className="relative" ref={playMenuRef}>
            <Tooltip
              content="Pola Lari & Umpan ⚡"
              description="Pilih simulasi taktik nyata: One-Two, Overlap, atau Third-Man"
              position="top"
            >
              <button
                onClick={() => setPlayMenuOpen(!playMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pola Lari & Umpan</span>
                <span className="sm:hidden">Pola</span>
              </button>
            </Tooltip>

            {playMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 z-50 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl w-80 animate-in fade-in">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-800">
                  ⚡ Simulasi Pola Operan & Buka Ruang
                </div>
                <div className="space-y-1">
                  {plays.map((play) => (
                    <button
                      key={play.id}
                      onClick={() => {
                        loadPlayPreset(play.frames);
                        setPlayMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {play.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {play.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transition Duration */}
        {currentFrame && (
          <Tooltip
            content="Durasi Transisi"
            description="Waktu yang dibutuhkan untuk berpindah ke frame ini saat Play"
            position="top"
          >
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Transition:</span>
              <select
                value={currentFrame.duration || 1.5}
                disabled={isPlaying}
                onChange={(e) =>
                  updateFrameDuration(activeFrameIndex, parseFloat(e.target.value))
                }
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value={0.5} className="bg-slate-900">
                  0.5s
                </option>
                <option value={1.0} className="bg-slate-900">
                  1.0s
                </option>
                <option value={1.5} className="bg-slate-900">
                  1.5s
                </option>
                <option value={2.0} className="bg-slate-900">
                  2.0s
                </option>
                <option value={3.0} className="bg-slate-900">
                  3.0s
                </option>
              </select>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
});
