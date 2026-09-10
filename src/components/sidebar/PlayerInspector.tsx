import React from 'react';
import {
  Compass,
  User,
  Shield,
  Trash2,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Armchair,
  Palette,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { Tooltip } from '../ui/Tooltip';

export const PlayerInspector: React.FC = React.memo(() => {
  const {
    frames,
    activeFrameIndex,
    selectedPlayerId,
    homeTeam,
    awayTeam,
    updatePlayer,
    updatePlayerRotation,
    toggleBenchPlayer,
    removePlayer,
    selectPlayer,
  } = useTacticsStore(
    useShallow((s) => ({
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      selectedPlayerId: s.selectedPlayerId,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      updatePlayer: s.updatePlayer,
      updatePlayerRotation: s.updatePlayerRotation,
      toggleBenchPlayer: s.toggleBenchPlayer,
      removePlayer: s.removePlayer,
      selectPlayer: s.selectPlayer,
    }))
  );

  const currentFrame = frames[activeFrameIndex];
  const selectedPlayer = currentFrame?.players.find((p) => p.id === selectedPlayerId);

  if (!selectedPlayer) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs">
        <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="font-medium text-slate-400">No Player Selected</p>
        <p className="mt-1 text-[11px]">Click or drag any player token on the pitch or bench to edit.</p>
      </div>
    );
  }

  const teamConfig = selectedPlayer.team === 'home' ? homeTeam : awayTeam;

  const quickAngles = [
    { label: '0° East', deg: 0, icon: ArrowRight },
    { label: '90° South', deg: 90, icon: ArrowDown },
    { label: '180° West', deg: 180, icon: ArrowLeft },
    { label: '270° North', deg: 270, icon: ArrowUp },
  ];

  return (
    <div className="p-4 space-y-4 text-slate-200 text-xs select-none">
      {/* Header with Close */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full border border-white/40"
            style={{
              backgroundColor: selectedPlayer.customColor || (selectedPlayer.isGoalkeeper ? teamConfig.goalkeeperColor : teamConfig.primaryColor),
            }}
          />
          <span className="font-semibold text-slate-100 text-sm">
            Player #{selectedPlayer.number} ({selectedPlayer.team.toUpperCase()})
          </span>
        </div>
        <button
          onClick={() => selectPlayer(null)}
          className="text-slate-400 hover:text-slate-200 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Jersey Number & Name */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Number
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="99"
              value={selectedPlayer.number}
              onChange={(e) =>
                updatePlayer(selectedPlayer.id, {
                  number: parseInt(e.target.value) || 1,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-center font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Player Name / Label
          </label>
          <input
            type="text"
            value={selectedPlayer.name}
            maxLength={10}
            onChange={(e) =>
              updatePlayer(selectedPlayer.id, { name: e.target.value })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            placeholder="e.g. Messi, CB, 9"
          />
        </div>
      </div>

      {/* Tactical Role & Goalkeeper Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Role
          </label>
          <input
            type="text"
            value={selectedPlayer.role || ''}
            maxLength={6}
            onChange={(e) =>
              updatePlayer(selectedPlayer.id, { role: e.target.value.toUpperCase() })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            placeholder="e.g. GK, CB, ST"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Goalkeeper
          </label>
          <button
            onClick={() =>
              updatePlayer(selectedPlayer.id, {
                isGoalkeeper: !selectedPlayer.isGoalkeeper,
              })
            }
            className={`w-full py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
              selectedPlayer.isGoalkeeper
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{selectedPlayer.isGoalkeeper ? 'Yes (GK)' : 'Outfield'}</span>
          </button>
        </div>
      </div>

      {/* Facing Orientation Angle (0 - 360°) */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Facing Angle ({Math.round(selectedPlayer.rotation)}°)
          </label>
          <span className="text-[11px] font-mono text-sky-300">
            {Math.round(selectedPlayer.rotation)}°
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={Math.round(selectedPlayer.rotation)}
          onChange={(e) =>
            updatePlayerRotation(selectedPlayer.id, parseInt(e.target.value))
          }
          className="w-full accent-sky-500 cursor-pointer"
        />

        {/* Quick Orientation Presets */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          {quickAngles.map((qa) => {
            const Icon = qa.icon;
            const isMatch = Math.abs(selectedPlayer.rotation - qa.deg) < 5;
            return (
              <button
                key={qa.deg}
                onClick={() => updatePlayerRotation(selectedPlayer.id, qa.deg)}
                className={`py-1 rounded flex flex-col items-center justify-center text-[10px] border transition-colors ${
                  isMatch
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={qa.label}
              >
                <Icon className="w-3 h-3" />
                <span>{qa.deg}°</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pitch vs Bench Status */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
          Position Status
        </label>
        <Tooltip
          title={selectedPlayer.isBench ? 'Masukkan ke Lapangan' : 'Pindahkan ke Cadangan'}
          description={selectedPlayer.isBench ? 'Tempatkan pemain di tengah lapangan' : 'Pindahkan ke bangku cadangan pinggir lapangan'}
          position="left"
        >
          <button
            onClick={() => toggleBenchPlayer(selectedPlayer.id)}
            className={`w-full py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition-colors ${
              selectedPlayer.isBench
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Armchair className="w-4 h-4" />
            <span>
              {selectedPlayer.isBench ? 'Bench Substitute (Sideline)' : 'Active on Pitch'}
            </span>
          </button>
        </Tooltip>
      </div>

      {/* Custom Token Color Override */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          Custom Token Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={selectedPlayer.customColor || (selectedPlayer.isGoalkeeper ? teamConfig.goalkeeperColor : teamConfig.primaryColor)}
            onChange={(e) =>
              updatePlayer(selectedPlayer.id, { customColor: e.target.value })
            }
            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
          {selectedPlayer.customColor && (
            <button
              onClick={() =>
                updatePlayer(selectedPlayer.id, { customColor: undefined })
              }
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
            >
              Reset to team color
            </button>
          )}
        </div>
      </div>

      {/* Delete Player */}
      <div className="pt-2 border-t border-slate-800">
        <Tooltip title="Hapus Pemain" description="Hapus pemain ini dari skuad di seluruh frame" position="left">
          <button
            onClick={() => removePlayer(selectedPlayer.id)}
            className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center gap-1.5 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Player</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
});
