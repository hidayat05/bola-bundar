import React from 'react';
import {
  Layers,
  Grid,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { PitchSurface } from '../../types/tactics';

export const TopNavbar: React.FC = () => {
  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    showZones,
    setPitchType,
    setPitchView,
    setPitchSurface,
    setShowGrid,
    setShowZones,
    resetTactics,
  } = useTacticsStore();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-10">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
          ⚽
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
            Bola Bundar
            <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
              Tactics Pro
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Football • Mini Soccer • Futsal Tactical Board
          </p>
        </div>
      </div>

      {/* Middle Controls: Sport Type, View Mode, Pitch Surface */}
      <div className="flex items-center space-x-2">
        {/* Sport Type Segmented Control */}
        <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
          <button
            onClick={() => setPitchType('football')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'football'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Football (11v11)
          </button>
          <button
            onClick={() => setPitchType('mini-soccer')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'mini-soccer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mini Soccer (7v7/8v8)
          </button>
          <button
            onClick={() => setPitchType('futsal')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'futsal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Futsal (5v5)
          </button>
        </div>

        {/* Full vs Half Pitch Toggle */}
        <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
          <button
            onClick={() => setPitchView('full')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-all ${
              pitchView === 'full'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Pitch"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Full</span>
          </button>
          <button
            onClick={() => setPitchView('half')}
            className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-all ${
              pitchView === 'half'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Half Pitch / Set Piece Drill"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Half Pitch</span>
          </button>
        </div>

        {/* Pitch Surface Dropdown */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400">Surface:</span>
          <select
            value={pitchSurface}
            onChange={(e) => setPitchSurface(e.target.value as PitchSurface)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="grass" className="bg-slate-900">
              Grass Turf
            </option>
            <option value="turf" className="bg-slate-900">
              Dark Green Turf
            </option>
            <option value="blue" className="bg-slate-900">
              Futsal Blue Court
            </option>
            <option value="wood" className="bg-slate-900">
              Parquet Wood
            </option>
          </select>
        </div>
      </div>

      {/* Right Controls: Grid, Zones, Reset */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showZones
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Tactical 18-Zones & Half-spaces"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden xl:inline">18 Zones</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showGrid
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Grid Lines"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden xl:inline">Grid</span>
        </button>

        <button
          onClick={resetTactics}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
          title="Reset Pitch to Default Formation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
