import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  Zap,
  X,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
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
    setIsStrategyModalOpen,
  } = useTacticsStore(
    useShallow((s) => ({
      pitchType: s.pitchType,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      isPlaying: s.isPlaying,
      playbackSpeed: s.playbackSpeed,
      setActiveFrame: s.setActiveFrame,
      addFrame: s.addFrame,
      duplicateFrame: s.duplicateFrame,
      removeFrame: s.removeFrame,
      updateFrameDuration: s.updateFrameDuration,
      loadPlayPreset: s.loadPlayPreset,
      setIsPlaying: s.setIsPlaying,
      setPlaybackSpeed: s.setPlaybackSpeed,
      setIsStrategyModalOpen: s.setIsStrategyModalOpen,
    }))
  );

  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const playMenuRef = useRef<HTMLDivElement>(null);
  const [mobileTacticsMenuOpen, setMobileTacticsMenuOpen] = useState(false);
  const mobileTacticsMenuRef = useRef<HTMLDivElement>(null);
  const plays = getTacticalPlayPresets(pitchType);

  // Height-aware compact detection
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || window.innerHeight <= 520;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024 || window.innerHeight <= 520);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        playMenuRef.current &&
        !playMenuRef.current.contains(e.target as Node)
      ) {
        setPlayMenuOpen(false);
      }
      if (
        mobileTacticsMenuRef.current &&
        !mobileTacticsMenuRef.current.contains(e.target as Node)
      ) {
        setMobileTacticsMenuOpen(false);
      }
    };
    if (playMenuOpen || mobileTacticsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [playMenuOpen, mobileTacticsMenuOpen]);

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
    <div className={`relative bg-slate-900 border-t border-slate-800 px-2 sm:px-4 flex items-center justify-between select-none z-20 transition-all ${isCompact ? 'h-11' : 'h-16'}`}>
      {/* Top Playback Scrubbing Progress Bar */}
      <PlaybackProgressBar />

      {/* Left: Playback Controls */}
      <div data-tour="timeline-controls" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        <Tooltip
          content={isPlaying ? 'Jeda Animasi' : 'Putar Animasi (Play)'}
          description="Interpolasi pergerakan halus posisi pemain & bola antar-frame"
          position="top"
        >
          <button
            onClick={handleTogglePlay}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>
        </Tooltip>

        {/* Speed Selector (Desktop: full buttons) */}
        <Tooltip content="Kecepatan Animasi" description="Pilih kecepatan putar 0.5x s/d 2.0x" position="top">
          <div className="hidden sm:flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] font-semibold">
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </Tooltip>

        {/* Speed Selector (Mobile: compact cycle button) */}
        <button
          onClick={() => {
            const speeds = [0.5, 1, 1.5, 2];
            const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
            setPlaybackSpeed(speeds[nextIdx]);
          }}
          className="sm:hidden px-1.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 text-[11px] font-mono font-bold active:scale-95 flex-shrink-0"
          title="Kecepatan putar: ketuk untuk ganti"
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* Center: Keyframe Timeline Cards */}
      <div className="flex-1 flex items-center justify-start sm:justify-center space-x-1 sm:space-x-2 px-1.5 sm:px-3 overflow-x-auto scrollbar-none min-w-0">
        <div className="flex items-center space-x-1 sm:space-x-2 py-1">
          {frames.map((frame, index) => {
            const isActive = index === activeFrameIndex;
            return (
              <div
                key={frame.id}
                onClick={() => !isPlaying && setActiveFrame(index)}
                className={`group relative flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border cursor-pointer transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-800 border-emerald-500/80 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                  <span className="sm:hidden">F{index + 1}</span>
                  <span className="hidden sm:inline">{frame.name || `Frame ${index + 1}`}</span>
                </span>

                {/* Tactical Phase & Strategy Badge */}
                {frame.phase && (
                  <span
                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-black flex items-center gap-1 ${
                      frame.phase === 'attacking'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : frame.phase === 'defending'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        : frame.phase === 'trans-defend'
                        ? 'bg-orange-950/80 text-orange-300 border border-orange-500/40'
                        : frame.phase === 'trans-attack'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                    }`}
                    title={frame.strategyName || frame.phase}
                  >
                    {frame.phase === 'attacking' && '⚔️'}
                    {frame.phase === 'defending' && '🛡️'}
                    {frame.phase === 'trans-defend' && '⚡'}
                    {frame.phase === 'trans-attack' && '⚡'}
                    {frame.phase === 'setpiece' && '🎯'}
                    <span className="hidden xl:inline max-w-[80px] truncate">{frame.strategyName || frame.phase}</span>
                  </span>
                )}

                {/* Duration indicator */}
                <span className="hidden sm:inline text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                  {frame.duration || 1.5}s
                </span>

                {/* Duplicate / Delete mini buttons */}
                {isActive && !isPlaying && (
                  <div className="flex items-center space-x-0.5 pl-0.5 sm:pl-1 border-l border-slate-700/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateFrame(index);
                      }}
                      className="p-0.5 sm:p-1 text-slate-400 hover:text-slate-200 rounded"
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
                        className="p-0.5 sm:p-1 text-slate-400 hover:text-rose-400 rounded"
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
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 bg-slate-950/40 text-[10px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap disabled:opacity-50 flex-shrink-0"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Add Frame</span>
              <span className="sm:hidden">+</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right: Tactical Play Templates & Active Frame Settings */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        {/* Mobile Single Tactics Dropdown Button */}
        <div className="sm:hidden relative" ref={mobileTacticsMenuRef}>
          <button
            onClick={() => setMobileTacticsMenuOpen(!mobileTacticsMenuOpen)}
            className="px-2 py-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
            title="Menu Taktik & Formasi"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Taktik</span>
          </button>

          {mobileTacticsMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 z-50 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl p-2.5 shadow-2xl w-72 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Menu Taktis Frame
                </span>
                <button
                  onClick={() => setMobileTacticsMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Option 1: Pola Strategi Formasi */}
              <button
                onClick={() => {
                  setMobileTacticsMenuOpen(false);
                  setIsStrategyModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/50 transition-all flex items-center gap-2.5 mb-2 group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                    <span>Pola Strategi & Transisi</span>
                    <span className="text-[10px] text-emerald-400 font-mono">11v11</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Build-up, Gegenpress, Rest-Defense, Corner, dll.
                  </div>
                </div>
              </button>

              {/* Option 2: Pola Lari & Umpan */}
              {plays.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                    ⚡ Simulasi Operan & Lari Cepat:
                  </div>
                  <div className="space-y-1">
                    {plays.map((play) => (
                      <button
                        key={play.id}
                        onClick={() => {
                          loadPlayPreset(play.frames);
                          setMobileTacticsMenuOpen(false);
                        }}
                        className="w-full text-left p-1.5 px-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">{play.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{play.frames.length} Frame</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Option 3: Durasi Frame */}
              {currentFrame && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between px-2">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Durasi:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1.0, 1.5, 2.0].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => updateFrameDuration(activeFrameIndex, dur)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          (currentFrame.duration || 1.5) === dur
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {dur}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Buttons: Full Pola Strategi & Pola Lari & Umpan */}
        <div className="hidden sm:flex items-center space-x-2">
          {/* Pola Strategi Frame Button */}
          <Tooltip
            content="Pola Strategi & Fase Permainan"
            description="Pilih strategi (Menyerang, Transisi, Bertahan) dan otomatis atur posisi pemain"
            position="top"
          >
            <button
              onClick={() => setIsStrategyModalOpen(true)}
              disabled={isPlaying}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pola Strategi</span>
            </button>
          </Tooltip>

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
                  <span>Pola Lari & Umpan</span>
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
    </div>
  );
});
