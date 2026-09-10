import React, { useState } from 'react';
import {
  Users,
  Plus,
  Armchair,
  Settings2,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { TeamSide } from '../../types/tactics';
import { getFormationsForPitch } from '../../utils/formations';

export const SquadManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TeamSide>('home');
  const [showTeamCustomizer, setShowTeamCustomizer] = useState(false);

  const {
    pitchType,
    frames,
    activeFrameIndex,
    homeTeam,
    awayTeam,
    selectedPlayerId,
    selectPlayer,
    addPlayer,
    applyFormation,
    updateHomeTeam,
    updateAwayTeam,
    toggleBenchPlayer,
    teamDisplayMode,
    soloTeamSide,
    setSoloTeamSide,
  } = useTacticsStore();

  const currentFrame = frames[activeFrameIndex];
  if (!currentFrame) return null;

  const currentTeamConfig = activeTab === 'home' ? homeTeam : awayTeam;
  const updateCurrentTeam = activeTab === 'home' ? updateHomeTeam : updateAwayTeam;

  const teamPlayers = currentFrame.players.filter((p) => p.team === activeTab);
  const activePitchPlayers = teamPlayers.filter((p) => !p.isBench);
  const benchPlayers = teamPlayers.filter((p) => p.isBench);

  // Formations available for current pitch
  const formations = getFormationsForPitch(pitchType);

  // Overall player count comparison (e.g. 8 vs 7)
  const homeCount = currentFrame.players.filter((p) => p.team === 'home' && !p.isBench).length;
  const awayCount = currentFrame.players.filter((p) => p.team === 'away' && !p.isBench).length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-xs select-none">
      {/* Team Tabs & Scoreboard Counter */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
          <span>{teamDisplayMode === 'single' ? 'SOLO TEAM (1 TIM)' : 'SQUAD SIZE (MATCHUP)'}</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-200 font-mono border border-slate-800">
            {teamDisplayMode === 'single' ? (
              <span className="text-emerald-400 font-semibold">{activePitchPlayers.length} di Lapangan</span>
            ) : (
              <>
                {homeCount} vs {awayCount}
                {homeCount !== awayCount && (
                  <span className="text-amber-400 text-[10px] ml-1.5 font-sans">(Asymmetrical)</span>
                )}
              </>
            )}
          </span>
        </div>

        {/* Home / Away Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('home');
              if (teamDisplayMode === 'single') setSoloTeamSide('home');
            }}
            className={`py-1.5 px-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'home'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: homeTeam.primaryColor }}
            />
            <span className="truncate">{homeTeam.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({homeCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('away');
              if (teamDisplayMode === 'single') setSoloTeamSide('away');
            }}
            className={`py-1.5 px-3 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'away'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: awayTeam.primaryColor }}
            />
            <span className="truncate">{awayTeam.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({awayCount})</span>
          </button>
        </div>

        {/* Solo Team Banner */}
        {teamDisplayMode === 'single' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between">
            <span>
              Mode 1 Tim: <strong>{soloTeamSide === 'home' ? homeTeam.name : awayTeam.name}</strong>
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
              Tanpa Lawan
            </span>
          </div>
        )}
      </div>

      {/* Formation Selector & Team Settings Toggle */}
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
            Preset Formation
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                applyFormation(activeTab, e.target.value);
              }
            }}
            defaultValue=""
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="" disabled>
              Choose formation / drill...
            </option>
            {Array.from(new Set(formations.map((f) => f.category || 'Standard'))).map((cat) => (
              <optgroup key={cat} label={cat} className="bg-slate-900 font-semibold text-emerald-400">
                {formations
                  .filter((f) => (f.category || 'Standard') === cat)
                  .map((f) => (
                    <option key={f.name} value={f.name} className="bg-slate-900 text-slate-200">
                      {f.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowTeamCustomizer(!showTeamCustomizer)}
          className={`mt-4 p-1.5 rounded-lg border transition-colors ${
            showTeamCustomizer
              ? 'bg-slate-700 border-slate-600 text-slate-100'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Team Colors & Customization"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Team Customizer Accordion */}
      {showTeamCustomizer && (
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={currentTeamConfig.name}
              onChange={(e) => updateCurrentTeam({ name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Jersey Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTeamConfig.primaryColor}
                  onChange={(e) => updateCurrentTeam({ primaryColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {currentTeamConfig.primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Goalkeeper
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={currentTeamConfig.goalkeeperColor}
                  onChange={(e) => updateCurrentTeam({ goalkeeperColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-300">
                  {currentTeamConfig.goalkeeperColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Lists (Active Pitch & Bench) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Active Pitch Squad */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Active on Pitch ({activePitchPlayers.length})
            </span>
            <button
              onClick={() => addPlayer(activeTab, false)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3 h-3" /> Add Player
            </button>
          </div>

          <div className="space-y-1">
            {activePitchPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => selectPlayer(player.id)}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  player.id === selectedPlayerId
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                    style={{
                      backgroundColor:
                        player.customColor ||
                        (player.isGoalkeeper
                          ? currentTeamConfig.goalkeeperColor
                          : currentTeamConfig.primaryColor),
                    }}
                  >
                    {player.number}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-100">{player.name}</span>
                    {player.role && (
                      <span className="ml-1.5 text-[10px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded font-mono">
                        {player.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBenchPlayer(player.id);
                    }}
                    className="p-1 text-slate-400 hover:text-amber-300 rounded"
                    title="Send to Sideline Bench"
                  >
                    <Armchair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sideline Bench Substitutes */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5" />
              Sideline Bench ({benchPlayers.length})
            </span>
            <button
              onClick={() => addPlayer(activeTab, true)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3 h-3" /> Add Sub
            </button>
          </div>

          <div className="space-y-1">
            {benchPlayers.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">No substitutes on bench.</p>
            ) : (
              benchPlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => selectPlayer(player.id)}
                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    player.id === selectedPlayerId
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white opacity-80"
                      style={{
                        backgroundColor:
                          player.customColor || currentTeamConfig.primaryColor,
                      }}
                    >
                      {player.number}
                    </div>
                    <span className="font-medium text-xs text-slate-200">{player.name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBenchPlayer(player.id);
                    }}
                    className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30"
                    title="Bring onto pitch"
                  >
                    To Pitch
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
