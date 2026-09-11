import React, { useState, useEffect } from 'react';
import {
  Target,
  CircleDot,
  X,
  AlertTriangle,
  CheckCircle2,
  ZoomIn,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  RotateCcw,
  Shield,
  Users,
  Sparkles,
  Play,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { calculatePitchLayout } from '../../utils/pitchGeometry';
import {
  calculatePlayerDistancesToBall,
  getDefaultBarrierDistance,
} from '../../utils/setpieceUtils';

type SetpieceTab = 'wall' | 'players' | 'target';

export const SetpieceAssistantBar: React.FC = () => {
  const {
    isSetpieceMode,
    showDistanceBarrier,
    barrierDistance,
    setpieceAttackingTeam,
    pitchType,
    pitchView,
    homeTeam,
    awayTeam,
    frames,
    activeFrameIndex,
    isPlaying,
    showTargetZones,
    activeTargetZone,
    setIsSetpieceMode,
    setShowDistanceBarrier,
    setBarrierDistance,
    setSetpieceAttackingTeam,
    setShowTargetZones,
    setActiveTargetZone,
    setIsSetpiecePresetsModalOpen,
    setPitchView,
    toggleAttackingGk,
    wallPlayerIds,
    createDefensiveWall,
    disbandDefensiveWall,
    setActivePlayerCount,
    restoreFullSquad,
  } = useTacticsStore();

  const [activeTab, setActiveTab] = useState<SetpieceTab>('wall');
  const [wallSize, setWallSize] = useState<number>(3);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || window.innerHeight <= 540;
  });

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 1024 || window.innerHeight <= 540;
      setIsCompact(compact);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isSetpieceMode) {
    return null;
  }

  const currentFrame = frames[activeFrameIndex] || frames[0];
  const effectiveDistance = barrierDistance ?? getDefaultBarrierDistance(pitchType);
  const isBallInPlay = isPlaying || activeFrameIndex > 0;

  // Compute layout approximation to evaluate violations live
  const dummyLayout = calculatePitchLayout(
    typeof window !== 'undefined' ? window.innerWidth : 800,
    typeof window !== 'undefined' ? window.innerHeight : 600,
    pitchType,
    pitchView
  );

  const { violatingDefenders } = calculatePlayerDistancesToBall(
    currentFrame?.players || [],
    currentFrame?.ball || { id: 'ball', x: 50, y: 50 },
    effectiveDistance,
    setpieceAttackingTeam,
    dummyLayout,
    pitchType,
    pitchView
  );

  const hasViolations = violatingDefenders.length > 0;

  const homeGk = currentFrame?.players.find(
    (p) => p.team === 'home' && (p.isGoalkeeper || p.role === 'GK' || p.number === 1)
  );
  const isHomeGkInBox = homeGk ? !homeGk.isBench : false;

  const homeCount = currentFrame?.players.filter((p) => p.team === 'home' && !p.isBench).length || 0;
  const awayCount = currentFrame?.players.filter((p) => p.team === 'away' && !p.isBench).length || 0;

  const handleAdjustDistance = (delta: number) => {
    const current = effectiveDistance;
    const next = Math.max(2, Math.min(25, Math.round((current + delta) * 10) / 10));
    setBarrierDistance(next);
  };

  const handleResetDistance = () => {
    setBarrierDistance(null);
  };

  // Minimized Floating Pill on Compact Screens
  if (isCollapsed) {
    return (
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 animate-in fade-in">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md border transition-all active:scale-95 ${
            isBallInPlay
              ? 'bg-slate-900/95 border-sky-500/70 text-sky-300'
              : hasViolations && showDistanceBarrier
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : 'bg-slate-900/95 border-amber-500/80 text-amber-300'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Setpiece</span>
          {isBallInPlay ? (
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" /> In-Play
            </span>
          ) : hasViolations && showDistanceBarrier ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">
              {effectiveDistance}m
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-2.5 sm:p-3 transition-all select-none animate-in fade-in slide-in-from-top-2 max-h-[calc(100vh-80px)] overflow-y-auto ${
        isCompact ? 'w-[calc(100vw-16px)] max-w-sm text-xs' : 'w-[360px] text-xs'
      }`}
    >
      {/* 1. Header Bar: Mode Badge & Quick Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-100 text-xs tracking-wide">
                Skema Setpiece
              </span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                {pitchType === 'futsal' ? 'Futsal' : pitchType === 'mini-soccer' ? 'Mini' : '11v11'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Kecilkan Panel"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsSetpieceMode(false)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Tutup Mode Setpiece"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Quick Row: Presets Button & Field Zoom Control */}
      <div className="grid grid-cols-12 gap-1.5 mb-2.5">
        {/* Preset Routines Library Button */}
        <button
          onClick={() => setIsSetpiecePresetsModalOpen(true)}
          className="col-span-5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-sky-500/20 hover:from-amber-500/30 hover:via-emerald-500/25 hover:to-sky-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-all group active:scale-[0.98]"
        >
          <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="truncate">Preset Taktik</span>
        </button>

        {/* Pitch View Zoom Segmented Control */}
        <div className="col-span-7 grid grid-cols-3 gap-0.5 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setPitchView('full')}
            className={`py-1 px-1 rounded-lg font-medium text-[10px] flex items-center justify-center gap-1 transition-all ${
              pitchView === 'full'
                ? 'bg-slate-800 text-slate-100 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Full Lapangan"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Full</span>
          </button>

          <button
            onClick={() => setPitchView('half')}
            className={`py-1 px-1 rounded-lg font-medium text-[10px] flex items-center justify-center gap-1 transition-all ${
              pitchView === 'half'
                ? 'bg-slate-800 text-slate-100 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan 1/2 Lapangan"
          >
            <Minimize2 className="w-2.5 h-2.5" />
            <span>1/2</span>
          </button>

          <button
            onClick={() => setPitchView('third')}
            className={`py-1 px-1 rounded-lg font-medium text-[10px] flex items-center justify-center gap-1 transition-all ${
              pitchView === 'third'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Zoom-in ke area 1/3 kotak penalti & corner"
          >
            <ZoomIn className="w-2.5 h-2.5" />
            <span>1/3 Box</span>
          </button>
        </div>
      </div>

      {/* 2.5 Quick Active Players Stepper Bar (Home vs Away count - always accessible across all tabs) */}
      <div className="bg-slate-950/85 border border-slate-800/90 rounded-xl px-2 py-1.5 mb-2.5 flex items-center justify-between text-xs shadow-inner">
        {/* Home Player Stepper */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <span
            className="text-slate-200 font-bold text-[11px] truncate max-w-[65px] sm:max-w-[80px]"
            title={homeTeam.name}
          >
            {homeTeam.name}
          </span>
          <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-0.5">
            <button
              onClick={() => setActivePlayerCount('home', homeCount - 1)}
              disabled={homeCount <= 1}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs disabled:opacity-25 active:scale-95 transition-all"
              title="Kurangi 1 pemain Home di lapangan"
            >
              -
            </button>
            <span className="font-mono font-bold text-emerald-400 text-xs w-5 text-center">
              {homeCount}
            </span>
            <button
              onClick={() => setActivePlayerCount('home', homeCount + 1)}
              disabled={homeCount >= 15}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs disabled:opacity-25 active:scale-95 transition-all"
              title="Tambah 1 pemain Home ke lapangan"
            >
              +
            </button>
          </div>
        </div>

        {/* VS / Divider */}
        <div className="flex items-center px-1">
          <span className="text-[9px] font-black text-amber-400/90 tracking-wider">VS</span>
        </div>

        {/* Away Player Stepper */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-0.5">
            <button
              onClick={() => setActivePlayerCount('away', awayCount - 1)}
              disabled={awayCount <= 1}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs disabled:opacity-25 active:scale-95 transition-all"
              title="Kurangi 1 pemain Away di lapangan"
            >
              -
            </button>
            <span className="font-mono font-bold text-sky-400 text-xs w-5 text-center">
              {awayCount}
            </span>
            <button
              onClick={() => setActivePlayerCount('away', awayCount + 1)}
              disabled={awayCount >= 15}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs disabled:opacity-25 active:scale-95 transition-all"
              title="Tambah 1 pemain Away ke lapangan"
            >
              +
            </button>
          </div>
          <span
            className="text-slate-200 font-bold text-[11px] truncate max-w-[65px] sm:max-w-[80px]"
            title={awayTeam.name}
          >
            {awayTeam.name}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: awayTeam.primaryColor }}
          />
        </div>
      </div>

      {/* 3. Sub-Tab Segmented Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/90 mb-2.5">
        <button
          onClick={() => setActiveTab('wall')}
          className={`py-1.5 px-1 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === 'wall'
              ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span className="truncate">Pagar & Jarak</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`py-1.5 px-1 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === 'players'
              ? 'bg-slate-800 text-emerald-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3 h-3" />
          <span className="truncate">Pemain ({homeCount}v{awayCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('target')}
          className={`py-1.5 px-1 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
            activeTab === 'target'
              ? 'bg-slate-800 text-sky-300 shadow-sm border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-3 h-3" />
          <span className="truncate">Target Zona</span>
        </button>
      </div>

      {/* TAB 1: PAGAR & JARAK (WALL & DISTANCE BARRIER) */}
      {activeTab === 'wall' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Attacking Team Toggle */}
          <div className="bg-slate-950/70 border border-slate-800/90 p-2 rounded-xl flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Tim Penendang:</span>
            <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setSetpieceAttackingTeam('home')}
                className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 transition-all ${
                  setpieceAttackingTeam === 'home'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: homeTeam.primaryColor }}
                />
                <span className="truncate max-w-[65px]">{homeTeam.name}</span>
              </button>

              <button
                onClick={() => setSetpieceAttackingTeam('away')}
                className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 transition-all ${
                  setpieceAttackingTeam === 'away'
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: awayTeam.primaryColor }}
                />
                <span className="truncate max-w-[65px]">{awayTeam.name}</span>
              </button>
            </div>
          </div>

          {/* Circle Distance Barrier Controls */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDot
                  className={`w-3.5 h-3.5 ${
                    showDistanceBarrier
                      ? hasViolations && !isBallInPlay
                        ? 'text-rose-400'
                        : 'text-sky-400'
                      : 'text-slate-500'
                  }`}
                />
                <div>
                  <span className="font-semibold text-slate-200 text-[11px] block leading-tight">
                    Lingkaran Jarak Barrier
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Standar cabor: {pitchType === 'futsal' ? '5.0m' : pitchType === 'mini-soccer' ? '7.0m' : '9.15m'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowDistanceBarrier(!showDistanceBarrier)}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-all border ${
                  showDistanceBarrier
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {showDistanceBarrier ? 'ON' : 'OFF'}
              </button>
            </div>

            {showDistanceBarrier && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Radius Jarak:</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleAdjustDistance(-0.5)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold active:scale-95"
                    title="Kurangi 0.5 meter"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="font-mono font-bold text-slate-100 text-xs px-1 min-w-[42px] text-center">
                    {effectiveDistance}m
                  </span>

                  <button
                    onClick={() => handleAdjustDistance(0.5)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold active:scale-95"
                    title="Tambah 0.5 meter"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  {barrierDistance !== null && (
                    <button
                      onClick={handleResetDistance}
                      className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 ml-1"
                      title="Reset ke jarak standar cabor aktif"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Defensive Wall Generator (Pagar Betis) */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-200 text-[11px]">
                  Pagar Betis (Defensive Wall)
                </span>
              </div>

              {wallPlayerIds.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  {wallPlayerIds.length} Bek Terkunci
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">Belum dibuat</span>
              )}
            </div>

            {/* Wall Size Buttons */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    setWallSize(cnt);
                    createDefensiveWall(cnt);
                  }}
                  className={`py-1 rounded-md text-[10px] font-bold border transition-all ${
                    wallPlayerIds.length === cnt || (wallPlayerIds.length === 0 && wallSize === cnt)
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-sm font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Bentuk ${cnt} pemain bertahan berdiri rapat di jarak legal`}
                >
                  {cnt} Bek
                </button>
              ))}
            </div>

            {/* Wall Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
              <button
                onClick={() => createDefensiveWall(wallSize)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-md transition-all active:scale-95"
                title="Kunci posisi pagar betis tepat di garis barrier legal menghadap bola"
              >
                <Shield className="w-3 h-3 fill-current" />
                <span>{wallPlayerIds.length > 0 ? 'Re-align ke Bola' : `Buat Pagar (${wallSize} Bek)`}</span>
              </button>

              {wallPlayerIds.length > 0 && (
                <button
                  onClick={disbandDefensiveWall}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-[11px] transition-all active:scale-95"
                  title="Bongkar pagar betis agar pemain bebas digerakkan"
                >
                  Bongkar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRILL PEMAIN (PLAYER COUNTS & DRILL PRESETS) */}
      {activeTab === 'players' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Home & Away Independent Steppers */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200 text-[11px]">
                  Pemain di Lapangan
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {homeCount} vs {awayCount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Home Stepper */}
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: homeTeam.primaryColor }}
                  />
                  <span className="text-slate-300 truncate font-medium">{homeTeam.name}:</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setActivePlayerCount('home', homeCount - 1)}
                    disabled={homeCount <= 1}
                    className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold disabled:opacity-30 active:scale-95"
                    title="Kurangi pemain Home"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-slate-100 text-xs w-4 text-center">
                    {homeCount}
                  </span>
                  <button
                    onClick={() => setActivePlayerCount('home', homeCount + 1)}
                    disabled={homeCount >= 15}
                    className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold disabled:opacity-30 active:scale-95"
                    title="Tambah pemain Home"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Away Stepper */}
              <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: awayTeam.primaryColor }}
                  />
                  <span className="text-slate-300 truncate font-medium">{awayTeam.name}:</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setActivePlayerCount('away', awayCount - 1)}
                    disabled={awayCount <= 1}
                    className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold disabled:opacity-30 active:scale-95"
                    title="Kurangi pemain Away"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-slate-100 text-xs w-4 text-center">
                    {awayCount}
                  </span>
                  <button
                    onClick={() => setActivePlayerCount('away', awayCount + 1)}
                    disabled={awayCount >= 15}
                    className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold disabled:opacity-30 active:scale-95"
                    title="Tambah pemain Away"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Drill Presets */}
            <div className="pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                Preset Matchup Latihan ({pitchType === 'futsal' ? 'Futsal 5v5' : pitchType === 'mini-soccer' ? 'Mini Soccer 8v8 / 7v7' : 'Sepak Bola 11v11'}):
              </span>
              <div className="grid grid-cols-4 gap-1">
                {pitchType === 'futsal' ? (
                  <>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 3);
                        setActivePlayerCount('away', 2);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="3 Penyerang vs 1 Bek + 1 GK"
                    >
                      3 vs 2
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 4);
                        setActivePlayerCount('away', 3);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="4 Penyerang vs 2 Bek + 1 GK"
                    >
                      4 vs 3
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 4);
                        setActivePlayerCount('away', 4);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="4 vs 4 Power Play"
                    >
                      4 vs 4
                    </button>
                    <button
                      onClick={() => restoreFullSquad()}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-mono border border-slate-800 text-center transition-all font-bold"
                      title="Kembalikan ke 5 vs 5 Futsal Penuh"
                    >
                      Full 5v5
                    </button>
                  </>
                ) : pitchType === 'mini-soccer' ? (
                  <>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 5);
                        setActivePlayerCount('away', 4);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="5 Penyerang vs 3 Bek + 1 GK"
                    >
                      5 vs 4
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 6);
                        setActivePlayerCount('away', 5);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="6 Penyerang vs 4 Bek + 1 GK"
                    >
                      6 vs 5
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 7);
                        setActivePlayerCount('away', 7);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-mono border border-slate-800 text-center transition-all font-bold"
                      title="Kembalikan ke 7 vs 7 Mini Soccer"
                    >
                      Full 7v7
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 8);
                        setActivePlayerCount('away', 8);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-mono border border-slate-800 text-center transition-all font-bold"
                      title="Kembalikan ke 8 vs 8 Mini Soccer"
                    >
                      Full 8v8
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 6);
                        setActivePlayerCount('away', 5);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="6 Penyerang vs 4 Bek + 1 GK"
                    >
                      6 vs 5
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 8);
                        setActivePlayerCount('away', 6);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="8 Penyerang vs 5 Bek + 1 GK"
                    >
                      8 vs 6
                    </button>
                    <button
                      onClick={() => {
                        setActivePlayerCount('home', 9);
                        setActivePlayerCount('away', 8);
                      }}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-800 text-center transition-all"
                      title="9 vs 8 Match Drill"
                    >
                      9 vs 8
                    </button>
                    <button
                      onClick={() => restoreFullSquad()}
                      className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-400 font-mono border border-slate-800 text-center transition-all font-bold"
                      title="Kembalikan ke 11 vs 11 Sepak Bola Penuh"
                    >
                      Full 11v11
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Goalkeeper Box Position Toggle */}
          {(pitchView === 'half' || pitchView === 'third') && (
            <div className="bg-slate-950/70 border border-slate-800/90 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <span className="text-slate-200 font-medium block leading-tight">
                    Kiper ({homeTeam.name})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Posisi saat zoom 1/2 atau 1/3
                  </span>
                </div>
              </div>

              <button
                onClick={toggleAttackingGk}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all border ${
                  isHomeGkInBox
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={
                  isHomeGkInBox
                    ? 'Kiper ikut maju ke kotak penalti lawan (Skema Menit Akhir 90+)'
                    : 'Kiper tetap di dugout/bench (Standar latihan setpiece)'
                }
              >
                <span>{isHomeGkInBox ? '⚡ Ikut Maju (Box)' : '🪑 Di Dugout/Bench'}</span>
              </button>
            </div>
          )}

          {/* Drill info note */}
          <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
            💡 <span className="text-amber-300 font-bold">Catatan Drill:</span> Penyesuaian jumlah pemain di atas khusus untuk variasi skema latihan. Radius lingkaran legal ({pitchType === 'futsal' ? '5.0m' : pitchType === 'mini-soccer' ? '7.0m' : '9.15m'}) tetap dihitung akurat sesuai aturan resmi cabor.
          </div>
        </div>
      )}

      {/* TAB 3: TARGET ZONA (LANDING MARKERS) */}
      {activeTab === 'target' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className={`w-3.5 h-3.5 ${showTargetZones ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <span className="font-semibold text-slate-200 text-[11px] block leading-tight">
                    Target Zone Markers
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Highlight area pendaratan bola berbahaya
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowTargetZones(!showTargetZones)}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] transition-all border ${
                  showTargetZones
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {showTargetZones ? 'ON' : 'OFF'}
              </button>
            </div>

            {showTargetZones && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setActiveTargetZone('all')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'all' || activeTargetZone === null
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua Zona
                  </button>
                  <button
                    onClick={() => setActiveTargetZone('near-post')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'near-post'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tiang Dekat
                  </button>
                  <button
                    onClick={() => setActiveTargetZone('far-post')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'far-post'
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tiang Jauh (2)
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setActiveTargetZone('penalty-spot')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'penalty-spot'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Titik Penalti
                  </button>
                  <button
                    onClick={() => setActiveTargetZone('edge-of-box')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'edge-of-box'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Luar Kotak (D)
                  </button>
                  <button
                    onClick={() => setActiveTargetZone('cutback')}
                    className={`py-1 px-1 rounded-md text-[10px] font-bold border transition-all truncate ${
                      activeTargetZone === 'cutback'
                        ? 'bg-rose-600/30 border-rose-500 text-rose-200 font-extrabold shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cutback Byline
                  </button>
                </div>

                {/* Tactical explanation for selected zone */}
                <div className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10.5px] text-slate-300 leading-snug">
                  {activeTargetZone === 'near-post' && (
                    <p>🎯 <strong className="text-emerald-300">Tiang Dekat:</strong> Sasaran flick-on sundulan melintas gawang atau sontekan kilat tiang satu sebelum kiper bereaksi.</p>
                  )}
                  {activeTargetZone === 'far-post' && (
                    <p>🎯 <strong className="text-cyan-300">Tiang Jauh (Tiang 2):</strong> Area kosong blind spot bek lawan untuk sundulan tiang jauh atau tap-in bola kedua.</p>
                  )}
                  {activeTargetZone === 'penalty-spot' && (
                    <p>🎯 <strong className="text-amber-300">Titik Penalti:</strong> Area tembakan first-time bersih dari umpan tarik mendatar atau crossing melengkung.</p>
                  )}
                  {activeTargetZone === 'edge-of-box' && (
                    <p>🎯 <strong className="text-purple-300">Luar Kotak Penalti (D):</strong> Posisi penembak jarak jauh (long shot) atau perebutan second ball hasil sapuan lawan.</p>
                  )}
                  {activeTargetZone === 'cutback' && (
                    <p>🎯 <strong className="text-rose-300">Cutback Byline:</strong> Umpan tarik mendatar dari garis ujung lapangan membelakangi lari para bek bertahan.</p>
                  )}
                  {(!activeTargetZone || activeTargetZone === 'all') && (
                    <p>🎯 <strong className="text-slate-200">Semua Zona:</strong> Menampilkan seluruh 5 area pendaratan strategis untuk mempermudah instruksi run pemain.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Dynamic Status Bar Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
        {isBallInPlay ? (
          <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-current" />
            <div className="text-[10.5px] leading-tight">
              <span className="font-bold text-sky-200">Bola Sedang Dimainkan</span>
              <p className="text-[10px] text-sky-400/90 mt-0.5">
                Lingkaran barrier otomatis disembunyikan agar fokus pada skema gerakan passing & lari.
              </p>
            </div>
          </div>
        ) : showDistanceBarrier ? (
          <div
            className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
              hasViolations
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {hasViolations ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}

            <div className="flex-1 text-[10.5px] leading-tight">
              {hasViolations ? (
                <div>
                  <span className="font-bold text-rose-200">
                    {violatingDefenders.length} Bek Terlalu Dekat!
                  </span>
                  <p className="text-[10px] text-rose-400/90 mt-0.5">
                    Lawan terdekat: No. {violatingDefenders[0].player.number} ({violatingDefenders[0].distanceMeters}m dari bola, min. {effectiveDistance}m).
                  </p>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-emerald-200">Jarak Lawan Legal</span>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">
                    Semua pemain bertahan berada di luar radius aman {effectiveDistance}m.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
