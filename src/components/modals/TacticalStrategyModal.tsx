import React, { useState } from 'react';
import {
  X,
  Check,
  Swords,
  Shield,
  Zap,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { TacticalPhase } from '../../types/tactics';
import {
  getTacticalStrategiesForPitch,
  getMasterCycleInfoForPitch,
  TacticalStrategyPreset,
} from '../../utils/tacticalStrategies';

export const TacticalStrategyModal: React.FC = () => {
  const {
    isStrategyModalOpen,
    setIsStrategyModalOpen,
    pitchType,
    frames,
    activeFrameIndex,
    applyStrategyPresetToFrame,
    applyStrategyAsNextFrame,
    updateFrameStrategy,
    loadMasterTacticalSequence,
  } = useTacticsStore();

  const currentFrame = frames[activeFrameIndex];

  const [selectedTab, setSelectedTab] = useState<TacticalPhase | 'all'>('all');
  const [customName, setCustomName] = useState(currentFrame?.strategyName || '');
  const [customInstruction, setCustomInstruction] = useState(currentFrame?.strategyInstruction || '');
  const [customPhase, setCustomPhase] = useState<TacticalPhase>(currentFrame?.phase || 'attacking');
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);

  // Sync state if frame changes
  React.useEffect(() => {
    if (currentFrame) {
      setCustomName(currentFrame.strategyName || '');
      setCustomInstruction(currentFrame.strategyInstruction || '');
      setCustomPhase(currentFrame.phase || 'attacking');
    }
  }, [currentFrame]);

  if (!isStrategyModalOpen || !currentFrame) return null;

  const pitchPresets = getTacticalStrategiesForPitch(pitchType);
  const filteredPresets = selectedTab === 'all'
    ? pitchPresets
    : pitchPresets.filter((p) => p.phase === selectedTab);

  const cycleInfo = getMasterCycleInfoForPitch(pitchType);

  const handleApplyAsNextFrame = (preset: TacticalStrategyPreset) => {
    applyStrategyAsNextFrame(preset.id, true);
    setIsStrategyModalOpen(false);
  };

  const handleApplyAsCurrentFrame = (preset: TacticalStrategyPreset) => {
    applyStrategyPresetToFrame(activeFrameIndex, preset.id);
    setIsStrategyModalOpen(false);
  };

  const handleSaveCustom = () => {
    updateFrameStrategy(activeFrameIndex, {
      phase: customPhase,
      strategyName: customName.trim() || 'Strategi Kustom',
      strategyInstruction: customInstruction.trim() || 'Ikuti instruksi pelatih.',
    });
    setIsStrategyModalOpen(false);
  };

  const handleLoadFullCycle = () => {
    loadMasterTacticalSequence(true);
    setIsStrategyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[94vh] sm:h-auto sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Strategi & Pola Pergerakan
                </h2>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pitchType === 'futsal'
                    ? 'Futsal 5v5'
                    : pitchType === 'mini-soccer'
                    ? 'Mini Soccer 7v7'
                    : '11 vs 11'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Frame {activeFrameIndex + 1}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
                Pola taktis khusus {pitchType === 'futsal' ? 'futsal 5 pemain' : pitchType === 'mini-soccer' ? 'mini soccer 7 pemain' : 'lapangan besar 11 pemain'}: posisi pemain otomatis presisi mengikuti formasi!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStrategyModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Cycle One-Click Banner */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/60 border-b border-slate-800 px-3 sm:px-5 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <div className="text-[11px] sm:text-xs text-slate-200 leading-snug">
              <strong className="text-emerald-400">{cycleInfo.title}</strong>{' '}
              <span className="text-slate-300">{cycleInfo.flow}</span>
            </div>
          </div>
          <button
            onClick={handleLoadFullCycle}
            className="w-full sm:w-auto justify-center px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0 active:scale-95"
          >
            <span>{cycleInfo.buttonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Phase Filter Tabs */}
        <div className="px-3 sm:px-5 pt-2.5 pb-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Semua ({pitchPresets.length})
          </button>
          <button
            onClick={() => setSelectedTab('attacking')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              selectedTab === 'attacking'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Menyerang</span>
          </button>
          <button
            onClick={() => setSelectedTab('trans-defend')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              selectedTab === 'trans-defend'
                ? 'bg-orange-950 text-orange-300 border border-orange-500/60 shadow-sm'
                : 'text-slate-400 hover:text-orange-300 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Transisi Bertahan</span>
          </button>
          <button
            onClick={() => setSelectedTab('defending')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              selectedTab === 'defending'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/60 shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Bertahan</span>
          </button>
          <button
            onClick={() => setSelectedTab('trans-attack')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              selectedTab === 'trans-attack'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-sm'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Transisi Menyerang</span>
          </button>
          <button
            onClick={() => setSelectedTab('setpiece')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              selectedTab === 'setpiece'
                ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-sm'
                : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Bola Mati</span>
          </button>
        </div>

        {/* Modal Body: Cards of Presets */}
        <div className="flex-1 p-3 sm:p-5 space-y-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPresets.map((preset) => {
              const isSelected = currentFrame.strategyPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>{preset.badge}</span>
                        <span>{preset.name}</span>
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>

                    <div className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-amber-200/90 font-medium">
                      💡 <strong>Instruksi:</strong> {preset.instruction}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleApplyAsCurrentFrame(preset)}
                        className="px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1 text-center"
                        title="Terapkan pola ke frame yang sedang aktif tanpa animasi"
                      >
                        <span>✏️ Frame Ini</span>
                      </button>
                      <button
                        onClick={() => handleApplyAsNextFrame(preset)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1 transition-all active:scale-95 text-center"
                        title="Buat keyframe baru & otomatis putar transisi animasi pergerakan pemain dan bola"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300 flex-shrink-0" />
                        <span>Animasikan ▶</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Strategy Editor Footer (Collapsible Accordion) */}
        <div className="p-3 sm:p-3.5 border-t border-slate-800 bg-slate-950/90 flex-shrink-0 transition-all">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsCustomExpanded(!isCustomExpanded)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <span>✏️ Label & Instruksi Kustom (Opsional)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCustomExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isCustomExpanded && (
              <button
                onClick={handleSaveCustom}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simpan Label</span>
              </button>
            )}
          </div>

          {isCustomExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Fase Permainan
                </label>
                <select
                  value={customPhase}
                  onChange={(e) => setCustomPhase(e.target.value as TacticalPhase)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="attacking">⚔️ Menyerang</option>
                  <option value="trans-defend">⚡ Transisi Bertahan</option>
                  <option value="defending">🛡️ Bertahan</option>
                  <option value="trans-attack">⚡ Transisi Menyerang</option>
                  <option value="setpiece">🎯 Bola Mati</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Nama Strategi
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Overload Kiri & Isolasi Kanan"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Instruksi untuk Pemain di Layar
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Contoh: Tekan CB lawan, tutup ruang tengah!"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
