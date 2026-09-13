import React, { useState } from 'react';
import { ClipboardList, Plus, Trash2, X, Check, Clock, Users, Maximize } from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { useTranslation } from '../../i18n/useTranslation';
import { DrillMetadata } from '../../types/tactics';

export const DrillNotesModal: React.FC = () => {
  const { t } = useTranslation();
  const { isDrillNotesModalOpen, setIsDrillNotesModalOpen, drillNotes, setDrillNotes } =
    useTacticsStore();

  const [title, setTitle] = useState(drillNotes.title);
  const [phase, setPhase] = useState(drillNotes.phase);
  const [dimensions, setDimensions] = useState(drillNotes.dimensions || '');
  const [duration, setDuration] = useState(drillNotes.duration || '');
  const [playerCount, setPlayerCount] = useState(drillNotes.playerCount || '');
  const [objective, setObjective] = useState(drillNotes.objective || '');
  const [coachingPoints, setCoachingPoints] = useState<string[]>(drillNotes.coachingPoints || []);
  const [newPoint, setNewPoint] = useState('');

  if (!isDrillNotesModalOpen) return null;

  const handleSave = () => {
    setDrillNotes({
      title,
      phase,
      dimensions,
      duration,
      playerCount,
      objective,
      coachingPoints,
    });
    setIsDrillNotesModalOpen(false);
  };

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    setCoachingPoints([...coachingPoints, newPoint.trim()]);
    setNewPoint('');
  };

  const handleRemovePoint = (index: number) => {
    setCoachingPoints(coachingPoints.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t('drillModalTitle')}</h2>
              <p className="text-xs text-slate-400">{t('drillModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsDrillNotesModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Title & Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('drillTitleLabel')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('drillTitlePlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('drillPhaseLabel')}
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as DrillMetadata['phase'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="in-possession">{t('phaseInPossession')}</option>
                <option value="out-of-possession">{t('phaseOutOfPossession')}</option>
                <option value="trans-attack">{t('phaseTransAttack')}</option>
                <option value="trans-defend">{t('phaseTransDefend')}</option>
                <option value="setpiece">{t('phaseSetpiece')}</option>
                <option value="all">{t('phaseAll')}</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics (Dimensions, Duration, Players) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1">
                <Maximize className="w-3.5 h-3.5" /> {t('drillDimensionsLabel')}
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder={t('drillDimensionsPlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" /> {t('drillDurationLabel')}
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t('drillDurationPlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5" /> {t('drillPlayerCountLabel')}
              </label>
              <input
                type="text"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                placeholder={t('drillPlayerCountPlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('drillObjectiveLabel')}
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              placeholder={t('drillObjectivePlaceholder')}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Coaching Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('drillCoachingPointsLabel')}
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
              {coachingPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 group"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span>{pt}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePoint(idx)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Coaching Point Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
                placeholder={t('drillPointPlaceholder')}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPoint}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('addPoint')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-800 bg-slate-850/50">
          <button
            onClick={() => setIsDrillNotesModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{t('saveNotes')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
