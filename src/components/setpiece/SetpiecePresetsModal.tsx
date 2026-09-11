import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Shield,
  Target,
  Play,
  Flame,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { SETPIECE_PRESETS, SetpiecePreset } from '../../utils/setpiecePresets';
import { PitchType } from '../../types/tactics';

export const SetpiecePresetsModal: React.FC = () => {
  const {
    isSetpiecePresetsModalOpen,
    setIsSetpiecePresetsModalOpen,
    loadSetpiecePreset,
  } = useTacticsStore();

  const [selectedCategory, setSelectedCategory] = useState<PitchType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'corner' | 'free-kick'>('all');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSetpiecePresetsModalOpen) {
        setIsSetpiecePresetsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSetpiecePresetsModalOpen, setIsSetpiecePresetsModalOpen]);

  if (!isSetpiecePresetsModalOpen) return null;

  const filteredPresets = SETPIECE_PRESETS.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedType !== 'all' && p.type !== selectedType) return false;
    return true;
  });

  const getCategoryColor = (cat: PitchType) => {
    switch (cat) {
      case 'futsal':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'mini-soccer':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'football':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getDifficultyColor = (diff: SetpiecePreset['difficulty']) => {
    switch (diff) {
      case 'Lanjutan':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Menengah':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Mudah':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setIsSetpiecePresetsModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Library Preset Setpiece (Set-Play Routines)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {SETPIECE_PRESETS.length} Taktik
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Skema bola mati resmi (Futsal, Mini Soccer, Sepak Bola) lengkap dengan formasi, garis decoy, zona target, & keyframe animasi.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSetpiecePresetsModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Sport Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
              Cabor:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Semua Cabor
            </button>
            <button
              onClick={() => setSelectedCategory('football')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === 'football'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              ⚽ Sepak Bola
            </button>
            <button
              onClick={() => setSelectedCategory('mini-soccer')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === 'mini-soccer'
                  ? 'bg-sky-600/30 text-sky-300 border-sky-500/60 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              🥅 Mini Soccer
            </button>
            <button
              onClick={() => setSelectedCategory('futsal')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === 'futsal'
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500/60 shadow-sm'
                  : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              ⚡ Futsal
            </button>
          </div>

          {/* Routine Type Filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-amber-400 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Semua Tipe
            </button>
            <button
              onClick={() => setSelectedType('corner')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                selectedType === 'corner'
                  ? 'bg-slate-800 text-amber-400 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Corner Kick
            </button>
            <button
              onClick={() => setSelectedType('free-kick')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                selectedType === 'free-kick'
                  ? 'bg-slate-800 text-amber-400 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Free Kick
            </button>
          </div>
        </div>

        {/* Presets Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Tidak ada preset setpiece yang cocok dengan filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-500/5 group"
                >
                  <div>
                    {/* Badges Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(
                          preset.category
                        )}`}
                      >
                        {preset.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {preset.typeLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDifficultyColor(
                          preset.difficulty
                        )} flex items-center gap-1`}
                      >
                        <Flame className="w-2.5 h-2.5" />
                        {preset.difficulty}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                      {preset.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {preset.description}
                    </p>

                    {/* Tactical Objectives */}
                    <div className="mt-3 space-y-1.5 border-t border-slate-800/70 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Kunci Taktik (Key Steps):
                      </span>
                      {preset.tacticalObjectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{obj}</span>
                        </div>
                      ))}
                    </div>

                    {/* Routine Specs */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Target className="w-3 h-3 text-cyan-400" />
                        <span>Target: {preset.targetZoneHighlight}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>Barrier: {preset.barrierDistance}m</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>{preset.frames.length} Frame Animasi</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => loadSetpiecePreset(preset)}
                      className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Terapkan Skema Ini ke Board</span>
                      <ChevronRight className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>💡 Saat diterapkan, mode Final-Third (1/3 Box) dan keyframe langkah taktik akan otomatis terisi.</span>
          <span className="hidden sm:inline">Tekan Play di timeline untuk melihat simulasi animasi penuh.</span>
        </div>
      </div>
    </div>
  );
};
