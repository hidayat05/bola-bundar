import React, { useRef, useState } from 'react';
import Konva from 'konva';
import { TopNavbar } from './components/toolbar/TopNavbar';
import { TacticalCanvas } from './components/canvas/TacticalCanvas';
import { SquadManager } from './components/sidebar/SquadManager';
import { PlayerInspector } from './components/sidebar/PlayerInspector';
import { TimelineBar } from './components/timeline/TimelineBar';
import { useTacticsStore } from './store/useTacticsStore';
import { Users, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

export const App: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [sidebarTab, setSidebarTab] = useState<'squad' | 'inspector'>('squad');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { selectedPlayerId } = useTacticsStore();

  // Automatically switch tab to inspector when a player is selected
  React.useEffect(() => {
    if (selectedPlayerId) {
      setSidebarTab('inspector');
    }
  }, [selectedPlayerId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Top Navbar Controls */}
      <TopNavbar />

      {/* 2. Middle Main Workspace (Canvas + Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <main className="flex-1 h-full relative overflow-hidden flex flex-col">
          <TacticalCanvas stageRef={stageRef} />
        </main>

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded-l-md border-l border-y border-slate-700 shadow-md transition-all"
          style={{ right: sidebarCollapsed ? 0 : '320px' }}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Right Sidebar: Squad & Player Inspector */}
        {!sidebarCollapsed && (
          <aside className="w-80 h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-xl z-10 transition-all">
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
      </div>

      {/* 3. Bottom Timeline Bar */}
      <TimelineBar />
    </div>
  );
};

export default App;
