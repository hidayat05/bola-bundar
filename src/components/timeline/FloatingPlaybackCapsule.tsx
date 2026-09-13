import React, { useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import {
  computeInterpolatedFrame,
  getTotalAnimationDuration,
} from '../../utils/interpolation';

export const FloatingPlaybackCapsule: React.FC = () => {
  const {
    frames,
    activeFrameIndex,
    isPlaying,
    playbackSpeed,
    isLooping,
    soundEnabled,
    playbackProgress,
    isPresentationMode,
    setIsPlaying,
    setPlaybackSpeed,
    toggleLooping,
    toggleSound,
    setActiveFrame,
    setInterpolatedFrame,
    setPlaybackProgress,
  } = useTacticsStore();

  const isScrubbingRef = useRef(false);

  const totalDuration = useMemo(() => getTotalAnimationDuration(frames), [frames]);

  if (frames.length <= 1) return null;

  // Format seconds to mm:ss.s or ss.s
  const formatTime = (secs: number) => {
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const remainingS = (s % 60).toFixed(1);
    return m > 0 ? `${m}:${remainingS.padStart(4, '0')}s` : `${remainingS}s`;
  };

  const currentSeconds = (playbackProgress || 0) * totalDuration;

  // Handle interactive scrubber changes
  const handleScrub = (val0to1: number) => {
    const clamped = Math.min(1, Math.max(0, val0to1));
    setPlaybackProgress(clamped);

    // Compute preview keyframe at this exact millisecond
    const previewFrame = computeInterpolatedFrame(frames, clamped);
    if (previewFrame) {
      setInterpolatedFrame(previewFrame);
    }
  };

  const handleStepPrev = () => {
    if (isPlaying) setIsPlaying(false);
    const prev = Math.max(0, activeFrameIndex - 1);
    setActiveFrame(prev);
    setInterpolatedFrame(null);
    setPlaybackProgress(prev / Math.max(1, frames.length - 1));
  };

  const handleStepNext = () => {
    if (isPlaying) setIsPlaying(false);
    const next = Math.min(frames.length - 1, activeFrameIndex + 1);
    setActiveFrame(next);
    setInterpolatedFrame(null);
    setPlaybackProgress(next / Math.max(1, frames.length - 1));
  };

  return (
    <div
      className={`select-none transition-all z-40 ${
        isPresentationMode
          ? 'fixed bottom-6 left-1/2 -translate-x-1/2 w-[92vw] max-w-xl'
          : 'relative w-full max-w-2xl mx-auto px-2 pt-1 pb-2'
      }`}
    >
      <div className="backdrop-blur-xl bg-slate-950/85 border border-slate-800/90 shadow-2xl rounded-2xl px-3.5 py-2 flex flex-col gap-1.5 text-slate-200">
        
        {/* Top Row: Time Scrubber Slider */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold text-emerald-400 w-11 text-right tabular-nums">
            {formatTime(currentSeconds)}
          </span>

          {/* Interactive Scrub Range Input */}
          <div className="relative flex-1 flex items-center h-4 group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={playbackProgress || 0}
              onMouseDown={() => {
                isScrubbingRef.current = true;
                if (isPlaying) setIsPlaying(false);
              }}
              onMouseUp={() => {
                isScrubbingRef.current = false;
              }}
              onTouchStart={() => {
                isScrubbingRef.current = true;
                if (isPlaying) setIsPlaying(false);
              }}
              onTouchEnd={() => {
                isScrubbingRef.current = false;
              }}
              onChange={(e) => {
                handleScrub(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all group-hover:h-2"
              title="Geser scrubber untuk memutar frame demi frame secara presisi"
            />
          </div>

          <span className="text-[10px] font-mono text-slate-400 w-11 tabular-nums">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Bottom Row: Unified Playback Controls */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          
          {/* Left: Step Frame buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleStepPrev}
              disabled={activeFrameIndex === 0 && !playbackProgress}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all active:scale-95"
              title="Frame Sebelumnya (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Big Play / Pause Pill */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/30'
              }`}
              title="Putar / Jeda Animasi (Spasi)"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Putar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleStepNext}
              disabled={activeFrameIndex === frames.length - 1 && playbackProgress >= 0.99}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-all active:scale-95"
              title="Frame Selanjutnya (→)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Frame indicator badge */}
          <div className="text-[10px] font-semibold text-slate-400 font-mono hidden sm:inline">
            Frame <span className="text-emerald-400">{activeFrameIndex + 1}</span> / {frames.length}
          </div>

          {/* Right: Speed, Loop, Sound */}
          <div className="flex items-center gap-1">
            {/* Speed Pills */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    playbackSpeed === spd
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Loop button */}
            <button
              type="button"
              onClick={toggleLooping}
              className={`p-1 rounded-lg border text-xs transition-all ${
                isLooping
                  ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={isLooping ? 'Looping Aktif 🔁' : 'Putar Sekali'}
            >
              <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'text-emerald-400' : ''}`} />
            </button>

            {/* Audio Whistle button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-1 rounded-lg border text-xs transition-all ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Peluit Aktif 🔊' : 'Audio Senyap'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
