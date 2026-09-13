import React, { useState } from 'react';
import { ClipboardList, Plus, Trash2, X, Check, Clock, Users, Maximize, Printer } from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { useTranslation } from '../../i18n/useTranslation';
import { DrillMetadata } from '../../types/tactics';

export const DrillNotesModal: React.FC = () => {
  const { t } = useTranslation();
  const { isDrillNotesModalOpen, setIsDrillNotesModalOpen, drillNotes, setDrillNotes, pitchType } =
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

  const handlePrintSessionSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sportLabel =
      pitchType === 'football'
        ? 'Sepak Bola 11v11'
        : pitchType === 'mini-soccer'
        ? 'Mini Soccer 7v7'
        : 'Futsal 5v5';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title || 'Rancangan Sesi Taktik'} - Bola Bundar</title>
        <style>
          @page { size: A4 portrait; margin: 14mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
          .logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { background: #059669; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .title-block { margin-bottom: 18px; }
          .drill-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
          .grid-item label { display: block; font-size: 9.5px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
          .grid-item span { font-size: 12.5px; font-weight: 700; color: #1e293b; }
          .section { margin-bottom: 18px; }
          .section-title { font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; }
          .objective-box { font-size: 12.5px; margin: 0; background: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 12px; border-radius: 6px; color: #166534; font-weight: 500; }
          .points-list { padding-left: 18px; margin: 0; }
          .points-list li { margin-bottom: 6px; font-size: 12.5px; color: #334155; font-weight: 500; }
          .footer { margin-top: 36px; font-size: 10.5px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">⚽ BOLA BUNDAR — SESSION PLAN</div>
            <div style="font-size: 11px; color: #64748b; font-weight: 500;">Papan Taktik Digital & Lembar Kerja Pelatih</div>
          </div>
          <span class="badge">${sportLabel}</span>
        </div>

        <div class="title-block">
          <h1 class="drill-title">${title || 'Rancangan Sesi Latihan Taktik'}</h1>
          <div style="font-size: 11.5px; color: #64748b;">Fase Taktis: <strong>${phase.toUpperCase()}</strong></div>
        </div>

        <div class="grid">
          <div class="grid-item">
            <label>Tipe Lapangan</label>
            <span>${sportLabel}</span>
          </div>
          <div class="grid-item">
            <label>Dimensi Area</label>
            <span>${dimensions || 'Standar'}</span>
          </div>
          <div class="grid-item">
            <label>Estimasi Durasi</label>
            <span>${duration || '-'}</span>
          </div>
          <div class="grid-item">
            <label>Jumlah Pemain</label>
            <span>${playerCount || '-'}</span>
          </div>
        </div>

        ${objective ? `
        <div class="section">
          <div class="section-title">🎯 Tujuan Utama (Tactical Objective)</div>
          <div class="objective-box">${objective}</div>
        </div>` : ''}

        ${coachingPoints.length > 0 ? `
        <div class="section">
          <div class="section-title">📋 Poin Kunci Pelatih (Key Coaching Points)</div>
          <ul class="points-list">
            ${coachingPoints.map((p) => `<li>${p}</li>`).join('')}
          </ul>
        </div>` : ''}

        <div class="footer">
          Dibuat dengan Bola Bundar Tactical Board • Dicetak pada ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs select-none">
          {/* Title & Phase */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {t('drillTitleLabel')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('drillTitlePlaceholder')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {t('drillPhaseLabel')}
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as DrillMetadata['phase'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
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

          {/* Quick Metrics: Dimensions, Duration, Players */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-sky-400" />
                {t('drillDimensionsLabel')}
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="40 x 30 m"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {t('drillDurationLabel')}
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15 mins"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                {t('drillPlayerCountLabel')}
              </label>
              <input
                type="text"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                placeholder="8 v 8 + 2 GK"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Drill Tactical Objective */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {t('drillObjectiveLabel')}
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={t('drillObjectivePlaceholder')}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-medium"
            />
          </div>

          {/* Coaching Key Points Checklist */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {t('drillCoachingPointsLabel')}
            </label>

            {/* List of existing points */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {coachingPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs gap-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-850/50">
          <button
            type="button"
            onClick={handlePrintSessionSheet}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
            title="Cetak atau Simpan sebagai Dokumen PDF (A4)"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Cetak / PDF</span>
          </button>

          <div className="flex items-center gap-2">
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
    </div>
  );
};
