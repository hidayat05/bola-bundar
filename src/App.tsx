import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { TacticalCanvas } from './components/canvas/TacticalCanvas';
import { SquadManager } from './components/sidebar/SquadManager';
import { PlayerInspector } from './components/sidebar/PlayerInspector';
import { TimelineBar } from './components/timeline/TimelineBar';
import { useTacticsStore } from './store/useTacticsStore';
import { useTacticalPlayback } from './hooks/useTacticalPlayback';
import {
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GuidedTour } from './components/ui/GuidedTour';
import { SplashScreen } from './components/ui/SplashScreen';
import * as _shareLinkUtils from './utils/shareLink';
import { useAutoSave } from './hooks/useAutoSave';

import { ActiveTool } from './types/tactics';

const SetpiecePresetsModal = React.lazy(() =>
  import('./components/setpiece/SetpiecePresetsModal').then((m) => ({
    default: m.SetpiecePresetsModal,
  }))
);
const DrillNotesModal = React.lazy(() =>
  import('./components/training/DrillNotesModal').then((m) => ({
    default: m.DrillNotesModal,
  }))
);
const TacticalStrategyModal = React.lazy(() =>
  import('./components/modals/TacticalStrategyModal').then((m) => ({
    default: m.TacticalStrategyModal,
  }))
);
const KeyboardShortcutsModal = React.lazy(() =>
  import('./components/modals/KeyboardShortcutsModal').then((m) => ({
    default: m.KeyboardShortcutsModal,
  }))
);

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [sidebarTab, setSidebarTab] = useState<'squad' | 'inspector'>('squad');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('bola_bundar_splash_played');
    }
    return true;
  });

  const selectedPlayerId = useTacticsStore((s) => s.selectedPlayerId);
  const isSetpieceMode = useTacticsStore((s) => s.isSetpieceMode);
  const isPresentationMode = useTacticsStore((s) => s.isPresentationMode);
  const setIsPresentationMode = useTacticsStore((s) => s.setIsPresentationMode);
  const isPlaying = useTacticsStore((s) => s.isPlaying);
  const setIsPlaying = useTacticsStore((s) => s.setIsPlaying);
  const frames = useTacticsStore((s) => s.frames);
  const activeFrameIndex = useTacticsStore((s) => s.activeFrameIndex);
  const setActiveFrame = useTacticsStore((s) => s.setActiveFrame);
  const isLooping = useTacticsStore((s) => s.isLooping);
  const toggleLooping = useTacticsStore((s) => s.toggleLooping);
  const soundEnabled = useTacticsStore((s) => s.soundEnabled);
  const toggleSound = useTacticsStore((s) => s.toggleSound);
  const pingBall = useTacticsStore((s) => s.pingBall);
  const undo = useTacticsStore((s) => s.undo);
  const redo = useTacticsStore((s) => s.redo);
  const selectedEquipmentId = useTacticsStore((s) => s.selectedEquipmentId);
  const deleteEquipment = useTacticsStore((s) => s.deleteEquipment);
  const { hasRestored, setHasRestored } = useAutoSave();

  // Share Link: auto-load tactics from URL hash on mount
  const [shareLoadedBanner, setShareLoadedBanner] = useState(false);
  useEffect(() => {
    const { readShareUrlPayload, clearShareUrlHash } = _shareLinkUtils;
    const payload = readShareUrlPayload();
    if (payload) {
      useTacticsStore.getState().loadProjectData(payload);
      clearShareUrlHash();
      setShareLoadedBanner(true);
      setTimeout(() => setShareLoadedBanner(false), 6000);
    }
  }, []);

  // Keyboard Shortcuts: Space (Play/Pause), Arrows (Prev/Next), Undo/Redo, Tool switching (1-8), Shortcuts modal (?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }
      // Delete equipment
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEquipmentId) {
        e.preventDefault();
        deleteEquipment(selectedEquipmentId);
        return;
      }
      // Space: Toggle animation play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        const store = useTacticsStore.getState();
        if (store.frames.length <= 1 && !store.isPlaying) {
          store.addFrame();
        }
        store.setIsPlaying(!store.isPlaying);
        return;
      }
      // ArrowLeft: Step to previous frame
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const store = useTacticsStore.getState();
        if (!store.isPlaying && store.activeFrameIndex > 0) {
          store.setActiveFrame(store.activeFrameIndex - 1);
        }
        return;
      }
      // ArrowRight: Step to next frame
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const store = useTacticsStore.getState();
        if (!store.isPlaying && store.activeFrameIndex < store.frames.length - 1) {
          store.setActiveFrame(store.activeFrameIndex + 1);
        }
        return;
      }
      // Duplicate frame: Ctrl+D or Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const store = useTacticsStore.getState();
        if (!store.isPlaying) {
          store.duplicateFrame(store.activeFrameIndex);
        }
        return;
      }
      // Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        const store = useTacticsStore.getState();
        if (store.isShortcutsModalOpen) {
          store.setIsShortcutsModalOpen(false);
        } else if (isPresentationMode) {
          setIsPresentationMode(false);
        } else if (store.selectedPlayerId) {
          store.selectPlayer(null);
        } else if (selectedEquipmentId) {
          store.setSelectedEquipmentId(null);
        }
        return;
      }
      // '?' key: Toggle Keyboard Shortcuts Modal
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        const store = useTacticsStore.getState();
        store.setIsShortcutsModalOpen(!store.isShortcutsModalOpen);
        return;
      }
      // Number keys 1-8 for active drawing tools
      const TOOL_KEYS: Record<string, ActiveTool> = {
        '1': 'select',
        '2': 'pass',
        '3': 'curved-pass',
        '4': 'lofted-pass',
        '5': 'run',
        '6': 'dribble',
        '7': 'zone',
        '8': 'eraser',
      };
      if (!e.ctrlKey && !e.metaKey && !e.altKey && TOOL_KEYS[e.key]) {
        e.preventDefault();
        useTacticsStore.getState().setActiveTool(TOOL_KEYS[e.key]);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedEquipmentId, deleteEquipment, isPresentationMode, setIsPresentationMode]);

  // Height-aware compact detection (width < 1024 or height <= 520 for mobile landscape)
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || window.innerHeight <= 520;
  });

  const [isPortraitMobile, setIsPortraitMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 && window.innerHeight > window.innerWidth;
  });
  const [dismissLandscapeTip, setDismissLandscapeTip] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024 || window.innerHeight <= 520);
      setIsPortraitMobile(window.innerWidth < 768 && window.innerHeight > window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When entering Setpiece mode, close mobile drawer & collapse sidebar to keep screen clean and avoid overlap
  useEffect(() => {
    if (isSetpieceMode) {
      setMobileDrawerOpen(false);
      setSidebarCollapsed(true);
    }
  }, [isSetpieceMode]);

  // Activate playback interpolation loop hook
  useTacticalPlayback();

  // If splash was already played in session, trigger tour check on mount
  useEffect(() => {
    if (!showSplash) {
      const tourDismissed = localStorage.getItem('bola_bundar_tour_dismissed');
      if (!tourDismissed) {
        setIsTourOpen(true);
      }
    }
  }, [showSplash]);

  const handleSplashComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bola_bundar_splash_played', 'true');
    }
    setShowSplash(false);
    const tourDismissed = localStorage.getItem('bola_bundar_tour_dismissed');
    if (!tourDismissed) {
      setIsTourOpen(true);
    }
  };

  // Automatically switch tab to inspector when a player is selected and open drawer on mobile/compact (only when NOT in setpiece mode)
  useEffect(() => {
    if (selectedPlayerId && !isSetpieceMode) {
      setSidebarTab('inspector');
      if (isCompact) {
        setMobileDrawerOpen(true);
      }
    }
  }, [selectedPlayerId, isCompact, isSetpieceMode]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* 0. First Launch Animated 3D Soccer Ball Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* 0. Interactive Guided Tour Walkthrough with Spotlight Button Highlighting */}
      <GuidedTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* 🔗 Share Link — Success Banner */}
      {shareLoadedBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl text-sm font-semibold select-none">
          <span className="text-base">🔗</span>
          <span>Taktik dari share link berhasil dimuat! Klik ▶ untuk putar.</span>
          <button
            onClick={() => setShareLoadedBanner(false)}
            className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 💾 Local Auto-Save Restored Banner */}
      {hasRestored && !shareLoadedBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-slate-900 border border-emerald-500/80 text-slate-100 px-5 py-2.5 rounded-2xl shadow-2xl text-sm font-semibold select-none backdrop-blur-md">
          <span className="text-base">💾</span>
          <span>Sesi kerja taktik terakhir Anda berhasil dipulihkan secara otomatis!</span>
          <button
            onClick={() => setHasRestored(false)}
            className="ml-1 text-slate-400 hover:text-white transition-opacity"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 0. Setpiece Routine Presets, Drill Notes, Strategy, & Shortcuts Modals (Code-Split Lazy Loaded) */}
      <React.Suspense fallback={null}>
        <SetpiecePresetsModal />
        <DrillNotesModal />
        <TacticalStrategyModal />
        <KeyboardShortcutsModal />
      </React.Suspense>

      {/* 1. Top Navbar Controls (Hidden in Presentation Mode) */}
      {!isPresentationMode && (
        <TopNavbar
          stageRef={stageRef}
          onOpenTour={() => setIsTourOpen(true)}
          onReplaySplash={() => setShowSplash(true)}
        />
      )}

      {/* 1.5. Mobile Landscape Orientation Tip Banner */}
      {isPortraitMobile && !dismissLandscapeTip && !isPresentationMode && (
        <div className="bg-slate-900/95 border-b border-amber-500/30 text-amber-300 px-3 py-1.5 text-[11px] font-medium flex items-center justify-between z-20 shrink-0 select-none">
          <span className="flex items-center gap-1.5 truncate">
            <span>📱</span>
            <span>Tips: Putar HP ke mode Landscape untuk ruang taktik lebih luas & nyaman.</span>
          </span>
          <button
            onClick={() => setDismissLandscapeTip(true)}
            className="text-slate-400 hover:text-slate-200 p-0.5 ml-2 shrink-0"
            aria-label="Tutup saran"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Middle Main Workspace (Canvas + Responsive Sidebar / Mobile Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <main data-tour="pitch-canvas" className="flex-1 h-full relative overflow-hidden flex flex-col">
          <TacticalCanvas stageRef={stageRef} />

          {/* Floating Drawer Trigger Button (Visible when screen is compact, but hidden in setpiece or presentation mode) */}
          {isCompact && !isSetpieceMode && !isPresentationMode && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700/90 shadow-2xl p-2 sm:px-3 sm:py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition-all"
                title="Buka Daftar Squad & Token Inspector"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline text-[11px] font-bold">Squad</span>
                {selectedPlayerId && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            </div>
          )}
        </main>

        {/* Desktop Sidebar Collapse Toggle Button (Hidden when compact, in setpiece or presentation mode) */}
        {!isCompact && !isSetpieceMode && !isPresentationMode && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded-l-md border-l border-y border-slate-700 shadow-md transition-all"
            style={{ right: sidebarCollapsed ? 0 : '320px' }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Desktop Docked Sidebar (Hidden when compact, in setpiece or presentation mode) */}
        {!isCompact && !isSetpieceMode && !isPresentationMode && (
          <aside
            data-tour="squad-panel"
            className={`w-80 h-full flex-col bg-slate-900 border-l border-slate-800 shadow-xl z-10 transition-all ${
              sidebarCollapsed ? 'hidden' : 'flex'
            }`}
          >
            {/* Sidebar Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
              <button
                onClick={() => setSidebarTab('squad')}
                className={`py-1.5 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'squad'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Squad & Teams</span>
              </button>

              <button
                onClick={() => setSidebarTab('inspector')}
                className={`py-1.5 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all relative ${
                  sidebarTab === 'inspector'
                    ? 'bg-slate-800 text-sky-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Token Inspector</span>
                {selectedPlayerId && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 absolute top-1.5 right-2" />
                )}
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'squad' ? <SquadManager /> : <PlayerInspector />}
            </div>
          </aside>
        )}

        {/* Mobile / Compact Slide-Over Drawer with Backdrop Scrim */}
        {isCompact && mobileDrawerOpen && !isSetpieceMode && !isPresentationMode && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-over Drawer Panel */}
            <aside className="relative ml-auto w-84 max-w-[88vw] h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl z-10 animate-in slide-in-from-right duration-200">
              {/* Drawer Top Bar with Close Button */}
              <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
                <span className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Tactical Inspector
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Tab Switcher */}
              <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
                <button
                  onClick={() => setSidebarTab('squad')}
                  className={`py-1.5 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    sidebarTab === 'squad'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Squad & Teams</span>
                </button>

                <button
                  onClick={() => setSidebarTab('inspector')}
                  className={`py-1.5 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all relative ${
                    sidebarTab === 'inspector'
                      ? 'bg-slate-800 text-sky-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Token Inspector</span>
                  {selectedPlayerId && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 absolute top-1.5 right-2" />
                  )}
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                {sidebarTab === 'squad' ? <SquadManager /> : <PlayerInspector />}
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* 3. Bottom Timeline Bar (Hidden in Presentation Mode) */}
      {!isPresentationMode && <TimelineBar />}

      {/* 4. Presentation Mode Floating Minimalist Control Pill */}
      {isPresentationMode && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-slate-700/80 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Frame Navigation */}
          <button
            onClick={() => setActiveFrame(Math.max(0, activeFrameIndex - 1))}
            disabled={activeFrameIndex === 0 || isPlaying}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 active:scale-95 transition-all"
            title="Frame Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-xs font-bold text-slate-200 px-1 font-mono whitespace-nowrap">
            F{activeFrameIndex + 1}/{frames.length}
          </div>
          <button
            onClick={() => setActiveFrame(Math.min(frames.length - 1, activeFrameIndex + 1))}
            disabled={activeFrameIndex === frames.length - 1 || isPlaying}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 active:scale-95 transition-all"
            title="Frame Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 sm:mx-1" />

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
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

          {/* Loop Toggle */}
          <button
            onClick={toggleLooping}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
              isLooping
                ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isLooping ? 'Loop Aktif (Putar Terus)' : 'Loop Mati (Putar Sekali)'}
          >
            <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'text-emerald-400' : ''}`} />
            <span className="hidden md:inline text-[11px]">Loop</span>
          </button>

          {/* Audio Whistle Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Suara Peluit Aktif' : 'Suara Mati'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Find Ball Ping Button */}
          <button
            onClick={pingBall}
            className="p-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center transition-all active:scale-95"
            title="Sorot / Temukan Posisi Bola (Ping)"
          >
            <span className="text-xs">⚽</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 sm:mx-1" />

          {/* Exit Presentation Mode */}
          <button
            onClick={() => setIsPresentationMode(false)}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Keluar Mode Presentasi (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
