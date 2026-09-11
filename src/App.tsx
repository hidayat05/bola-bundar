import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { TacticalCanvas } from './components/canvas/TacticalCanvas';
import { SquadManager } from './components/sidebar/SquadManager';
import { PlayerInspector } from './components/sidebar/PlayerInspector';
import { TimelineBar } from './components/timeline/TimelineBar';
import { useTacticsStore } from './store/useTacticsStore';
import { useTacticalPlayback } from './hooks/useTacticalPlayback';
import { Users, Sliders, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GuidedTour } from './components/ui/GuidedTour';
import { SplashScreen } from './components/ui/SplashScreen';
import { SetpiecePresetsModal } from './components/setpiece/SetpiecePresetsModal';

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

  // Height-aware compact detection (width < 1024 or height <= 520 for mobile landscape)
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

      {/* 0. Setpiece Routine Presets Modal */}
      <SetpiecePresetsModal />

      {/* 1. Top Navbar Controls */}
      <TopNavbar
        stageRef={stageRef}
        onOpenTour={() => setIsTourOpen(true)}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* 2. Middle Main Workspace (Canvas + Responsive Sidebar / Mobile Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <main data-tour="pitch-canvas" className="flex-1 h-full relative overflow-hidden flex flex-col">
          <TacticalCanvas stageRef={stageRef} />

          {/* Floating Drawer Trigger Button (Visible when screen is compact, but hidden in setpiece mode) */}
          {isCompact && !isSetpieceMode && (
            <div className="absolute bottom-3 right-3 z-20">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700/90 shadow-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-bold text-xs flex items-center gap-2 backdrop-blur-md active:scale-95 transition-all"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>Squad / Tokens</span>
                {selectedPlayerId && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            </div>
          )}
        </main>

        {/* Desktop Sidebar Collapse Toggle Button (Hidden when compact or in setpiece mode) */}
        {!isCompact && !isSetpieceMode && (
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

        {/* Desktop Docked Sidebar (Hidden when compact or in setpiece mode) */}
        {!isCompact && !isSetpieceMode && (
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
        {isCompact && mobileDrawerOpen && !isSetpieceMode && (
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

      {/* 3. Bottom Timeline Bar */}
      <TimelineBar />
    </div>
  );
};

export default App;
