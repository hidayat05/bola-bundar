import React, { useState } from 'react';
import {
  Printer,
  Clipboard,
  Check,
  X,
  Shield,
  Users,
  Target,
  FileText,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';

export const MatchdaySheetModal: React.FC = () => {
  const {
    isMatchdayModalOpen,
    setIsMatchdayModalOpen,
    homeTeam,
    awayTeam,
    frames,
    activeFrameIndex,
    pitchType,
    drillNotes,
  } = useTacticsStore();

  const [copied, setCopied] = useState(false);

  if (!isMatchdayModalOpen) return null;

  const currentFrame = frames[activeFrameIndex] || frames[0];
  const homePitchPlayers = currentFrame.players
    .filter((p) => p.team === 'home' && !p.isBench)
    .sort((a, b) => a.number - b.number);
  const homeBenchPlayers = currentFrame.players
    .filter((p) => p.team === 'home' && p.isBench)
    .sort((a, b) => a.number - b.number);

  // Set-piece role assignments deduction
  const cornerTakers = homePitchPlayers.filter((p) =>
    ['W', 'AM', 'RB', 'LB', 'WB'].includes(p.role || '')
  ).slice(0, 2);

  const aerialThreats = homePitchPlayers.filter((p) =>
    ['CB', 'ST', 'CF'].includes(p.role || '')
  );

  const nearPostRunner = aerialThreats[0] || homePitchPlayers[1];
  const farPostRunner = aerialThreats[1] || homePitchPlayers[2];
  const screener = aerialThreats[2] || homePitchPlayers.find((p) => p.role === 'ST') || homePitchPlayers[3];

  const edgeBoxLurkers = homePitchPlayers.filter((p) =>
    ['DM', 'CM', 'B2B', 'DLP'].includes(p.role || '')
  ).slice(0, 2);

  const restDefenseAnchors = homePitchPlayers.filter((p) =>
    ['CB', 'DM', 'IFB', 'FIX'].includes(p.role || '') &&
    p.id !== nearPostRunner?.id &&
    p.id !== farPostRunner?.id
  ).slice(0, 3);

  const wallPlayers = homePitchPlayers.filter((p) => p.isWall);

  const handlePrint = () => {
    window.print();
  };

  const generatePlainTextSummary = () => {
    return `=== BOLA BUNDAR MATCHDAY TACTICAL SHEET ===
Format: ${pitchType.toUpperCase()} | Sesi: ${drillNotes.title || currentFrame.strategyName || 'Match Strategy'}
Fase: ${(currentFrame.phase || 'attacking').toUpperCase()} - ${currentFrame.strategyName || 'Taktik Tim'}
Instruksi: ${currentFrame.strategyInstruction || drillNotes.objective}

[STARTING LINEUP]
${homePitchPlayers.map((p) => `#${p.number} ${p.name} (${p.role || 'Player'})`).join('\n')}

[CADANGAN / BENCH]
${homeBenchPlayers.length > 0 ? homeBenchPlayers.map((p) => `#${p.number} ${p.name} (${p.role || 'SUB'})`).join('\n') : '-'}

[SET-PIECE ASSIGNMENTS]
• Penendang Corner: ${cornerTakers.map((p) => `#${p.number} ${p.name}`).join(', ') || 'Ditentukan di lapangan'}
• Tiang Dekat (Near Post): ${nearPostRunner ? `#${nearPostRunner.number} ${nearPostRunner.name}` : '-'}
• Tiang Jauh (Far Post): ${farPostRunner ? `#${farPostRunner.number} ${farPostRunner.name}` : '-'}
• Skrining Kiper: ${screener ? `#${screener.number} ${screener.name}` : '-'}
• Rebound Edge of Box: ${edgeBoxLurkers.map((p) => `#${p.number} ${p.name}`).join(', ') || '-'}
• Rest Defense (Sisa Bertahan): ${restDefenseAnchors.map((p) => `#${p.number} ${p.name}`).join(', ') || '-'}

[POIN KUNCI PELATIH]
${(drillNotes.coachingPoints || []).map((cp, idx) => `${idx + 1}. ${cp}`).join('\n')}
`;
  };

  const handleCopyText = () => {
    const text = generatePlainTextSummary();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* Header (Screen View) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:bg-transparent print:border-b-2 print:border-black print:px-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:hidden">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide print:text-black print:text-2xl">
                Matchday Tactical Sheet & Set-Piece Card
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-700">
                {homeTeam.name} • {pitchType.toUpperCase()} • Frame: {currentFrame.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-200"
              title="Salin ringkasan teks untuk WA/Pesan Tim"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={() => setIsMatchdayModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm print:p-0 print:overflow-visible print:space-y-4">
          
          {/* Top Tactical Briefing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 print:bg-white print:border print:border-slate-300">
            <div className="md:col-span-2 space-y-1">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1 print:text-emerald-700">
                <Target className="w-3 h-3" />
                <span>Strategi & Rencana Utama</span>
              </div>
              <div className="text-base font-bold text-slate-100 print:text-black">
                {currentFrame.strategyName || drillNotes.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed print:text-slate-800">
                {currentFrame.strategyInstruction || drillNotes.objective}
              </p>
            </div>

            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4 print:border-slate-300">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 print:text-slate-600">
                <Clock className="w-3 h-3" />
                <span>Format & Fase</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 print:text-black">
                Fase: <span className="capitalize font-bold text-emerald-400 print:text-black">{currentFrame.phase || 'Attacking'}</span>
              </div>
              <div className="text-xs text-slate-400 print:text-slate-700">
                Lawan: <span className="font-medium text-slate-300 print:text-black">{awayTeam.name}</span>
              </div>
            </div>
          </div>

          {/* Skuad: Starting XI & Bench */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Starting Lineup */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 print:text-emerald-800">
                <Users className="w-3.5 h-3.5" />
                <span>Starting Lineup ({homePitchPlayers.length} Pemain)</span>
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 print:bg-slate-100 print:text-black print:border-slate-300">
                      <th className="py-2 px-3 w-12 text-center">No</th>
                      <th className="py-2 px-3">Nama Pemain</th>
                      <th className="py-2 px-3 w-20 text-center">Peran</th>
                      <th className="py-2 px-3 w-28 text-right">Aksi Area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                    {homePitchPlayers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="py-1.5 px-3 font-mono font-bold text-center text-emerald-400 print:text-black">
                          {p.number}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-slate-200 print:text-black">
                          {p.name}
                          {p.isGoalkeeper && (
                            <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 print:border-black print:text-black">
                              GK
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-center font-mono text-slate-400 print:text-slate-800">
                          {p.role || '-'}
                        </td>
                        <td className="py-1.5 px-3 text-right text-[10px] text-amber-400/90 font-medium print:text-black truncate">
                          {p.activeActionZone ? p.activeActionZone.label : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bench Substitutes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 print:text-sky-800">
                <Shield className="w-3.5 h-3.5" />
                <span>Pemain Cadangan / Bench ({homeBenchPlayers.length})</span>
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
                {homeBenchPlayers.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 print:bg-slate-100 print:text-black print:border-slate-300">
                        <th className="py-2 px-3 w-12 text-center">No</th>
                        <th className="py-2 px-3">Nama Pemain</th>
                        <th className="py-2 px-3 w-20 text-center">Peran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                      {homeBenchPlayers.map((p) => (
                        <tr key={p.id}>
                          <td className="py-1.5 px-3 font-mono font-bold text-center text-slate-400 print:text-black">
                            {p.number}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-slate-300 print:text-black">
                            {p.name}
                          </td>
                          <td className="py-1.5 px-3 text-center font-mono text-slate-400 print:text-slate-800">
                            {p.role || 'SUB'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    Semua pemain terdaftar di lapangan utama.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Set-Piece Duties Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 print:text-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matriks Penugasan Bola Mati (Set-Piece Protocol)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  🎯 Eksekutor Corner 1 & 2
                </div>
                <div className="text-xs font-bold text-emerald-400 print:text-black">
                  {cornerTakers.map((p) => `#${p.number} ${p.name}`).join(' / ') || 'Ditentukan Pelatih'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  ⚡ Pelari Tiang Dekat (Near Post)
                </div>
                <div className="text-xs font-bold text-sky-400 print:text-black">
                  {nearPostRunner ? `#${nearPostRunner.number} ${nearPostRunner.name}` : '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  🚀 Pelari Tiang Jauh (Far Post)
                </div>
                <div className="text-xs font-bold text-sky-400 print:text-black">
                  {farPostRunner ? `#${farPostRunner.number} ${farPostRunner.name}` : '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  🛡️ Skrining Kiper / Blocker
                </div>
                <div className="text-xs font-bold text-amber-400 print:text-black">
                  {screener ? `#${screener.number} ${screener.name}` : '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  🔄 Rebound Kotak Penalti (2nd Ball)
                </div>
                <div className="text-xs font-bold text-purple-400 print:text-black truncate">
                  {edgeBoxLurkers.map((p) => `#${p.number} ${p.name}`).join(', ') || '-'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
                  ⚓ Rest Defense (Anti Counter)
                </div>
                <div className="text-xs font-bold text-rose-400 print:text-black truncate">
                  {restDefenseAnchors.map((p) => `#${p.number} ${p.name}`).join(', ') || '-'}
                </div>
              </div>
            </div>

            {wallPlayers.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 print:border-slate-400 print:text-black">
                <span className="font-bold">🧱 Komposisi Pagar Hidup:</span>
                <span>{wallPlayers.map((p) => `#${p.number} ${p.name}`).join(', ')} ({wallPlayers.length} Pemain)</span>
              </div>
            )}
          </div>

          {/* Coaching Points / Poin Kunci Pelatih */}
          {drillNotes.coachingPoints && drillNotes.coachingPoints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 print:text-black">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Poin Kunci Instruksi Pelatih (Coaching Reminders)</span>
              </h3>
              <ul className="list-disc list-inside bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 space-y-1 text-xs text-slate-300 print:bg-white print:border-slate-300 print:text-black">
                {drillNotes.coachingPoints.map((cp, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {cp}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>💡 Tips: Gunakan tombol Cetak untuk menyimpan PDF atau mencetak lembar A4 sebelum pertandingan.</span>
          <button
            onClick={() => setIsMatchdayModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
