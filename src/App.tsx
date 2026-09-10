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

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [sidebarTab, setSidebarTab] = useState<'squad' | 'inspector'>('squad');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { selectedPlayerId } = useTacticsStore();

  // Activate playback interpolation loop hook
  useTacticalPlayback();

  // Automatically switch tab to inspector when a player is selected and open drawer on mobile
  useEffect(() => {
    if (selectedPlayerId) {
      setSidebarTab('inspector');
      setMobileDrawerOpen(true);
    }
  }, [selectedPlayerId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Top Navbar Controls */}
      <TopNavbar stageRef={stageRef} />

      {/* 2. Middle Main Workspace (Canvas + Responsive Sidebar / Mobile Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <main className="flex-1 h-full relative overflow-hidden flex flex-col">
          <TacticalCanvas stageRef={stageRef} />

          {/* Mobile Floating Drawer Trigger Button */}
          <div className="md:hidden absolute bottom-3 right-3 z-20">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-slate-700/90 shadow-2xl px-3.5 py-2 rounded-full font-bold text-xs flex items-center gap-2 backdrop-blur-md active:scale-95 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Squad / Tokens</span>
              {selectedPlayerId && (
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              )}
            </button>
          </div>
        </main>

        {/* Desktop Sidebar Collapse Toggle Button */}
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

        {/* Desktop Docked Sidebar */}
        <aside
          className={`hidden md:flex w-80 h-full flex-col bg-slate-900 border-l border-slate-800 shadow-xl z-10 transition-all ${
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

        {/* Mobile Slide-Over Drawer with Backdrop Scrim */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
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
