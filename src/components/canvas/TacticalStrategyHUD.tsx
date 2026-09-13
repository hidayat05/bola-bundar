import React, { useState } from 'react';
import { Shield, Swords, Zap, Target, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { TacticalPhase } from '../../types/tactics';

interface PhaseConfig {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ReactNode;
}

const PHASE_CONFIGS: Record<TacticalPhase, PhaseConfig> = {
  attacking: {
    label: 'MENYERANG',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/50',
    badgeText: 'text-emerald-400',
    icon: <Swords className="w-3 h-3" />,
  },
  defending: {
    label: 'BERTAHAN',
    badgeBg: 'bg-rose-950/80',
    badgeBorder: 'border-rose-500/50',
    badgeText: 'text-rose-400',
    icon: <Shield className="w-3 h-3" />,
  },
  'trans-attack': {
    label: 'TRANSISI',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/50',
    badgeText: 'text-amber-400',
    icon: <Zap className="w-3 h-3" />,
  },
  'trans-defend': {
    label: 'TRANSISI',
    badgeBg: 'bg-orange-950/80',
    badgeBorder: 'border-orange-500/50',
    badgeText: 'text-orange-400',
    icon: <Zap className="w-3 h-3" />,
  },
  setpiece: {
    label: 'BOLA MATI',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-500/50',
    badgeText: 'text-purple-400',
    icon: <Target className="w-3 h-3" />,
  },
};

export const TacticalStrategyHUD: React.FC = () => {
  const {
    showStrategyHUD,
    isPlaying,
    interpolatedFrame,
    frames,
    activeFrameIndex,
    setIsStrategyModalOpen,
    pingBall,
    pitchType,
    positionalGridMode,
    setPositionalGridMode,
    showRestDefense,
    setShowRestDefense,
    showPassingLanes,
    setShowPassingLanes,
    futsalRule4Sec,
    setFutsalRule4Sec,
  } = useTacticsStore(
    useShallow((s) => ({
      showStrategyHUD: s.showStrategyHUD,
      isPlaying: s.isPlaying,
      interpolatedFrame: s.interpolatedFrame,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      setIsStrategyModalOpen: s.setIsStrategyModalOpen,
      pingBall: s.pingBall,
      pitchType: s.pitchType,
      positionalGridMode: s.positionalGridMode,
      setPositionalGridMode: s.setPositionalGridMode,
      showRestDefense: s.showRestDefense,
      setShowRestDefense: s.setShowRestDefense,
      showPassingLanes: s.showPassingLanes,
      setShowPassingLanes: s.setShowPassingLanes,
      futsalRule4Sec: s.futsalRule4Sec,
      setFutsalRule4Sec: s.setFutsalRule4Sec,
    }))
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!showStrategyHUD) return null;

  // Active frame or interpolated frame during playback
  const currentFrame = isPlaying && interpolatedFrame
    ? interpolatedFrame
    : frames[activeFrameIndex] || frames[0];

  const phase: TacticalPhase = currentFrame?.phase || 'attacking';
  const phaseConfig = PHASE_CONFIGS[phase] || PHASE_CONFIGS.attacking;
  const strategyName = currentFrame?.strategyName || 'Pola Bebas';
  const strategyInstruction = currentFrame?.strategyInstruction || '';

  const frameLabel = isPlaying && interpolatedFrame
    ? (currentFrame.name.includes('Tween') ? 'Animasi' : `F${activeFrameIndex + 1}`)
    : `${activeFrameIndex + 1}/${frames.length}`;

  // Collapsed ultra-compact view: minimal micro-chip at top edge taking zero pitch space
  if (isCollapsed) {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md bg-slate-950/75 border ${phaseConfig.badgeBorder} ${phaseConfig.badgeText} shadow-lg hover:bg-slate-900 transition-all opacity-85 hover:opacity-100`}
          title="Klik untuk membuka detail HUD strategi"
        >
          {phaseConfig.icon}
          <span className="font-semibold text-slate-200 truncate max-w-[120px]">{strategyName}</span>
          <span className="font-mono text-[9px] text-slate-400 bg-slate-900 px-1 rounded">
            {frameLabel}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        <button
          onClick={pingBall}
          className="p-1 px-2 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold shadow-lg flex items-center gap-1 transition-all active:scale-95"
          title="Sorot / Temukan Posisi Bola"
        >
          <span>⚽</span>
          <span className="hidden sm:inline">Bola</span>
        </button>
      </div>
    );
  }

  // Expanded streamlined single-line broadcast pill
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[68vw] sm:max-w-xl w-auto px-1 sm:px-2 transition-all">
      <div
        data-tour="strategy-hud"
        onClick={() => !isPlaying && setIsStrategyModalOpen(true)}
        className="pointer-events-auto backdrop-blur-md bg-slate-950/85 border border-slate-700/60 hover:border-slate-500 rounded-full px-2 sm:px-2.5 py-1 shadow-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none"
        title="Klik untuk membuka pilihan pola taktik"
      >
        {/* Phase Pill */}
        <div
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase border ${phaseConfig.badgeBg} ${phaseConfig.badgeBorder} ${phaseConfig.badgeText}`}
        >
          {phaseConfig.icon}
          <span className="hidden xs:inline tracking-wider">{phaseConfig.label}</span>
        </div>

        {/* Strategy Name & Short Instruction (Single line ticker) */}
        <div className="flex items-center gap-1.5 min-w-0 text-left">
          <span className="text-xs font-bold text-slate-100 whitespace-nowrap truncate max-w-[95px] xs:max-w-[130px] sm:max-w-[180px]">
            {strategyName}
          </span>

          {strategyInstruction && (
            <span className="hidden md:inline text-[11px] text-amber-300/85 truncate max-w-[190px] font-medium border-l border-slate-700/80 pl-1.5">
              💡 {strategyInstruction}
            </span>
          )}
        </div>

        {/* Frame index badge */}
        <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 bg-slate-900/90 px-1 sm:px-1.5 py-0.5 rounded-md border border-slate-800 flex-shrink-0">
          {frameLabel}
        </span>

        {/* Edit & Collapse Icons */}
        <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1">
          {/* Find Ball Ping Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              pingBall();
            }}
            className="p-1 rounded-md text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition-colors text-xs"
            title="Sorot / Temukan Posisi Bola (Ping)"
          >
            ⚽
          </button>

          {/* Positional Grid (Juego de Posicion) Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = positionalGridMode === 'none' ? '5-corridors' : positionalGridMode === '5-corridors' ? '20-zones' : 'none';
              setPositionalGridMode(next);
            }}
            className={`p-1 rounded-md transition-colors text-xs ${
              positionalGridMode !== 'none' ? 'bg-sky-500/30 text-sky-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={`Grid Posisi: ${positionalGridMode === 'none' ? 'Mati' : positionalGridMode === '5-corridors' ? '5 Koridor Vertikal' : '20 Zona Juego de Posicion'}`}
          >
            📐
          </button>

          {/* Rest Defense Analyzer Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRestDefense(!showRestDefense);
            }}
            className={`p-1 rounded-md transition-colors text-xs ${
              showRestDefense ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={`Rest Defense Analyzer (3+2/2+3): ${showRestDefense ? 'Aktif' : 'Nonaktif'}`}
          >
            🛡️
          </button>

          {/* Passing Lanes Analyzer (Open Green vs Blocked Red) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPassingLanes(!showPassingLanes);
            }}
            className={`p-1 rounded-md transition-colors text-xs ${
              showPassingLanes ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={`Passing Lanes (Jalur Umpan Terbuka/Terblokir): ${showPassingLanes ? 'Aktif' : 'Nonaktif'}`}
          >
            ⚡
          </button>

          {/* Futsal 4s Rule Clock */}
          {pitchType === 'futsal' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFutsalRule4Sec(!futsalRule4Sec);
              }}
              className={`p-1 rounded-md transition-colors text-xs ${
                futsalRule4Sec ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={`Aturan 4 Detik Futsal: ${futsalRule4Sec ? 'Aktif' : 'Nonaktif'}`}
            >
              ⏱️
            </button>
          )}

          {!isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsStrategyModalOpen(true);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Ganti Pola Strategi & Posisi Pemain"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(true);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Kecilkan HUD agar lapangan lebih leluasa"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
