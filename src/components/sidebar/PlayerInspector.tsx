import React, { useState } from 'react';
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
  RefreshCw,
  Move,
  Square,
  Eye,
  Timer,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { Tooltip } from '../ui/Tooltip';
import { getAvailableActionZones } from '../../utils/tacticalZones';

const TACTICAL_ROLES = [
  { code: 'GK', label: 'Goalkeeper' },
  { code: 'CB', label: 'Center Back' },
  { code: 'BPD', label: 'Ball-Playing Defender' },
  { code: 'IFB', label: 'Inverted Fullback' },
  { code: 'WB', label: 'Wing Back' },
  { code: 'DM', label: 'Defensive Midfielder' },
  { code: 'B2B', label: 'Box-to-Box' },
  { code: 'DLP', label: 'Deep-Lying Playmaker' },
  { code: 'MEZ', label: 'Mezzala' },
  { code: 'AM', label: 'Attacking Midfielder' },
  { code: 'W', label: 'Winger' },
  { code: 'IF', label: 'Inside Forward' },
  { code: 'F9', label: 'False Nine' },
  { code: 'ST', label: 'Striker' },
  { code: 'FIX', label: 'Fixo (Futsal)' },
  { code: 'ALA', label: 'Ala (Futsal)' },
  { code: 'PIV', label: 'Pivot (Futsal)' },
] as const;

export const PlayerInspector: React.FC = React.memo(() => {
  const {
    pitchType,
    frames,
    activeFrameIndex,
    selectedPlayerId,
    homeTeam,
    awayTeam,
    updatePlayer,
    updatePlayerRotation,
    shiftPlayers,
    toggleBenchPlayer,
    removePlayer,
    selectPlayer,
    substitutePlayer,
    setPlayerActionZone,
    showAllActionZones,
    setShowAllActionZones,
  } = useTacticsStore(
    useShallow((s) => ({
      pitchType: s.pitchType,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      selectedPlayerId: s.selectedPlayerId,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      updatePlayer: s.updatePlayer,
      updatePlayerRotation: s.updatePlayerRotation,
      shiftPlayers: s.shiftPlayers,
      toggleBenchPlayer: s.toggleBenchPlayer,
      removePlayer: s.removePlayer,
      selectPlayer: s.selectPlayer,
      substitutePlayer: s.substitutePlayer,
      setPlayerActionZone: s.setPlayerActionZone,
      showAllActionZones: s.showAllActionZones,
      setShowAllActionZones: s.setShowAllActionZones,
    }))
  );

  const [shiftTarget, setShiftTarget] = useState<'current' | 'defense' | 'midfield' | 'attack' | 'team'>('current');

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

  const getTargetPlayerIds = (): string[] => {
    if (shiftTarget === 'current') return [selectedPlayer.id];

    const teammates = (currentFrame?.players || []).filter(
      (p) => p.team === selectedPlayer.team && !p.isBench && !p.isGoalkeeper
    );
    if (shiftTarget === 'team') return teammates.map((p) => p.id);

    // Sort outfield teammates by distance from own goal:
    // Home attacks right (higher X), so lowest X = defense, highest X = attack
    // Away attacks left (lower X), so highest X = defense, lowest X = attack
    const sorted = [...teammates].sort((a, b) => {
      return selectedPlayer.team === 'home' ? a.x - b.x : b.x - a.x;
    });

    const count = sorted.length;
    if (count <= 3) {
      if (shiftTarget === 'defense') return [sorted[0]?.id].filter(Boolean) as string[];
      if (shiftTarget === 'midfield') return [sorted[1]?.id].filter(Boolean) as string[];
      return [sorted[2]?.id || sorted[count - 1]?.id].filter(Boolean) as string[];
    }

    const defEnd = Math.max(1, Math.round(count * 0.38));
    const midEnd = Math.max(defEnd + 1, Math.round(count * 0.72));

    if (shiftTarget === 'defense') return sorted.slice(0, defEnd).map((p) => p.id);
    if (shiftTarget === 'midfield') return sorted.slice(defEnd, midEnd).map((p) => p.id);
    return sorted.slice(midEnd).map((p) => p.id);
  };

  const handleShift = (dir: 'forward' | 'backward' | 'left' | 'right') => {
    const ids = getTargetPlayerIds();
    const step = 3.5;
    const isHome = selectedPlayer.team === 'home';

    let deltaX = 0;
    let deltaY = 0;

    if (dir === 'forward') deltaX = isHome ? step : -step;
    else if (dir === 'backward') deltaX = isHome ? -step : step;
    else if (dir === 'left') deltaY = -step;
    else if (dir === 'right') deltaY = step;

    shiftPlayers(ids, deltaX, deltaY);
  };

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

      {/* Quick Tactical Role Chips */}
      <div>
        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
          Preset Peran Taktis
        </label>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-none p-1 bg-slate-900/40 rounded-lg border border-slate-800/80">
          {TACTICAL_ROLES.map((r) => {
            const isMatch = selectedPlayer.role === r.code;
            return (
              <button
                key={r.code}
                type="button"
                onClick={() => updatePlayer(selectedPlayer.id, { role: isMatch ? '' : r.code })}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                  isMatch
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={r.label}
              >
                {r.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Action & Coverage Zones */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Square className="w-3.5 h-3.5 text-amber-400" />
            Area Tanggung Jawab & Aksi
          </label>
          <button
            type="button"
            onClick={() => setShowAllActionZones(!showAllActionZones)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors flex items-center gap-1 ${
              showAllActionZones
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilkan tanda kotak area untuk semua pemain di lapangan"
          >
            <Eye className="w-2.5 h-2.5" />
            <span>Semua Tim</span>
          </button>
        </div>

        {/* Action Zone Preset Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {getAvailableActionZones(selectedPlayer, pitchType).map((z) => {
            const isCurrent = selectedPlayer.activeActionZone?.type === z.type;
            return (
              <button
                key={z.type}
                type="button"
                onClick={() => {
                  const next = isCurrent ? null : z;
                  setPlayerActionZone(selectedPlayer.id, next);
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                }}
                style={isCurrent ? { borderColor: z.color, backgroundColor: `${z.color}25`, color: z.color } : {}}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-left truncate flex items-center gap-1.5 ${
                  isCurrent
                    ? 'shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
                title={z.label}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: z.color }} />
                <span className="truncate">{z.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear Zone Button if active */}
        {selectedPlayer.activeActionZone && (
          <button
            type="button"
            onClick={() => setPlayerActionZone(selectedPlayer.id, null)}
            className="w-full mt-1 py-1 px-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <span>✕ Hapus Tanda Kotak</span>
          </button>
        )}
      </div>

      {/* Staggered Run / Start Delay (0.0s - 2.0s) */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-emerald-400" />
            Waktu Mulai Lari / Start Delay
          </label>
          <span className="text-[11px] font-mono text-emerald-300 font-bold">
            {selectedPlayer.delay && selectedPlayer.delay > 0
              ? `+${selectedPlayer.delay.toFixed(1)}s`
              : '0.0s (Serentak)'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="2.0"
          step="0.1"
          value={selectedPlayer.delay || 0}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updatePlayer(selectedPlayer.id, { delay: val > 0 ? val : undefined });
          }}
          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />

        {/* Quick Timing Presets */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {[
            { label: '0.0s', desc: 'Serentak', val: 0 },
            { label: '+0.3s', desc: 'Cepat', val: 0.3 },
            { label: '+0.6s', desc: 'Decoy', val: 0.6 },
            { label: '+1.0s', desc: 'Late Run', val: 1.0 },
          ].map((preset) => {
            const isActive = (selectedPlayer.delay || 0) === preset.val;
            return (
              <button
                key={preset.val}
                type="button"
                onClick={() => {
                  updatePlayer(selectedPlayer.id, { delay: preset.val > 0 ? preset.val : undefined });
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                }}
                className={`py-1 px-1 rounded text-center border text-[9px] font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600/30 border-emerald-500/70 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={preset.desc}
              >
                <div>{preset.label}</div>
                <div className="text-[8px] font-normal opacity-70 truncate">{preset.desc}</div>
              </button>
            );
          })}
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

      {/* Unit Line Shift Controls (Coaching Tactical Shift) */}
      {!selectedPlayer.isBench && (
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              Geser Lini / Unit Shift
            </label>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ±3.5m Step
            </span>
          </div>

          {/* Unit Selector Tabs */}
          <div className="grid grid-cols-5 gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold">
            <button
              type="button"
              onClick={() => setShiftTarget('current')}
              className={`py-1 rounded text-center transition-all ${
                shiftTarget === 'current' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geser Pemain Ini Saja"
            >
              Pemain
            </button>
            <button
              type="button"
              onClick={() => setShiftTarget('defense')}
              className={`py-1 rounded text-center transition-all ${
                shiftTarget === 'defense' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geser Seluruh Lini Belakang"
            >
              Bek
            </button>
            <button
              type="button"
              onClick={() => setShiftTarget('midfield')}
              className={`py-1 rounded text-center transition-all ${
                shiftTarget === 'midfield' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geser Seluruh Lini Tengah"
            >
              Tengah
            </button>
            <button
              type="button"
              onClick={() => setShiftTarget('attack')}
              className={`py-1 rounded text-center transition-all ${
                shiftTarget === 'attack' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geser Seluruh Lini Depan"
            >
              Depan
            </button>
            <button
              type="button"
              onClick={() => setShiftTarget('team')}
              className={`py-1 rounded text-center transition-all ${
                shiftTarget === 'team' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geser Seluruh Skuad Tim"
            >
              Semua
            </button>
          </div>

          {/* Directional Nudge Pad */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => handleShift('forward')}
              className="px-4 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
              title="Dorong Maju Menyerang (Push Up)"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Maju (+3.5m)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleShift('left')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                title="Geser ke Kiri Lapangan"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Kiri</span>
              </button>

              <button
                type="button"
                onClick={() => handleShift('right')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                title="Geser ke Kanan Lapangan"
              >
                <span>Kanan</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleShift('backward')}
              className="px-4 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
              title="Tarik Mundur Bertahan (Drop Deep)"
            >
              <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Mundur (-3.5m)</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Instant Substitution (Pergantian Pemain) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-sky-400" />
            Pergantian Pemain
          </span>
          {selectedPlayer.subStatus && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                selectedPlayer.subStatus === 'in'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              Sub {selectedPlayer.subStatus}
            </span>
          )}
        </label>

        {(() => {
          const sameTeamPlayers = currentFrame?.players.filter((p) => p.team === selectedPlayer.team && p.id !== selectedPlayer.id) || [];
          const subCandidates = selectedPlayer.isBench
            ? sameTeamPlayers.filter((p) => !p.isBench)
            : sameTeamPlayers.filter((p) => p.isBench);

          if (subCandidates.length === 0) {
            return (
              <div className="text-[11px] text-slate-500 italic">
                {selectedPlayer.isBench
                  ? 'Tidak ada pemain aktif di lapangan untuk diganti.'
                  : 'Tidak ada pemain cadangan di bangku.'}
              </div>
            );
          }

          return (
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400">
                {selectedPlayer.isBench
                  ? 'Tukar dengan pemain di lapangan:'
                  : 'Tukar dengan pemain cadangan:'}
              </div>
              <select
                defaultValue=""
                onChange={(e) => {
                  const targetId = e.target.value;
                  if (!targetId) return;
                  if (selectedPlayer.isBench) {
                    substitutePlayer(selectedPlayer.id, targetId);
                  } else {
                    substitutePlayer(targetId, selectedPlayer.id);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="" disabled>
                  -- Pilih Pemain {selectedPlayer.isBench ? 'di Lapangan' : 'Cadangan'} --
                </option>
                {subCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.number} {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          );
        })()}
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
