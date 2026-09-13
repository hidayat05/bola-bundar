import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Grid,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Camera,
  Video,
  Download,
  Upload,
  Square,
  Menu,
  X,
  Users,
  User,
  Palette,
  ChevronDown,
  HelpCircle,
  Shirt,
  Circle,
  Target,
  ZoomIn,
  Sparkles,
  ClipboardList,
  Scan,
  Activity,
  Eye,
  Sliders,
  FolderDown,
  Link2,
  Keyboard,
} from 'lucide-react';
import Konva from 'konva';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { PitchSurface } from '../../types/tactics';
import {
  exportSnapshotToPng,
  exportTacticsToJson,
  parseTacticsJson,
  CanvasVideoRecorder,
} from '../../utils/exportUtils';
import { buildShareUrl } from '../../utils/shareLink';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../i18n/useTranslation';
import { Translations } from '../../i18n/translations';

const ZONE_COLORS = [
  { nameKey: 'colorAmber', color: '#fbbf24' },
  { nameKey: 'colorWhite', color: '#ffffff' },
  { nameKey: 'colorCyan', color: '#38bdf8' },
  { nameKey: 'colorRed', color: '#ef4444' },
  { nameKey: 'colorLime', color: '#84cc16' },
  { nameKey: 'colorOrange', color: '#f97316' },
  { nameKey: 'colorPink', color: '#f43f5e' },
  { nameKey: 'colorBlue', color: '#3b82f6' },
] as const;

const GRID_COLORS = [
  { nameKey: 'colorSlate', color: '#94a3b8' },
  { nameKey: 'colorWhite', color: '#ffffff' },
  { nameKey: 'colorCyan', color: '#38bdf8' },
  { nameKey: 'colorAmber', color: '#fbbf24' },
  { nameKey: 'colorLime', color: '#84cc16' },
  { nameKey: 'colorRed', color: '#ef4444' },
  { nameKey: 'colorPink', color: '#f43f5e' },
  { nameKey: 'colorPurple', color: '#a855f7' },
] as const;

interface TopNavbarProps {
  stageRef: React.RefObject<Konva.Stage>;
  onOpenTour?: () => void;
  onReplaySplash?: () => void;
}

type DropdownMenuKey = 'pitch' | 'analysis' | 'session' | 'file';

export const TopNavbar: React.FC<TopNavbarProps> = React.memo(({ stageRef, onOpenTour, onReplaySplash }) => {
  const { t, language, setLanguage } = useTranslation();

  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    gridColor,
    showZones,
    zoneColor,
    teamDisplayMode,
    soloTeamSide,
    tokenStyle,
    homeTeam,
    awayTeam,
    frames,
    activeFrameIndex,
    isRecording,
    setPitchType,
    setPitchView,
    setPitchSurface,
    setShowGrid,
    setGridColor,
    setShowZones,
    setZoneColor,
    setTeamDisplayMode,
    setSoloTeamSide,
    setTokenStyle,
    resetTactics,
    setIsRecording,
    setIsPlaying,
    loadProjectData,
    isSetpieceMode,
    setIsSetpieceMode,
    setIsSetpiecePresetsModalOpen,
    canUndo,
    canRedo,
    undo,
    redo,
    showCompactness,
    setShowCompactness,
    showDefensiveLines,
    setShowDefensiveLines,
    showPlayerFOV,
    setShowPlayerFOV,
    showActionSpotlight,
    setShowActionSpotlight,
    showStrategyHUD,
    setShowStrategyHUD,
    showBallBeacon,
    setShowBallBeacon,
    pingBall,
    setIsDrillNotesModalOpen,
    setIsShortcutsModalOpen,
    isEquipmentToolbarOpen,
    setIsEquipmentToolbarOpen,
    equipment,
    drillNotes,
  } = useTacticsStore(
    useShallow((s) => ({
      pitchType: s.pitchType,
      pitchView: s.pitchView,
      pitchSurface: s.pitchSurface,
      showGrid: s.showGrid,
      gridColor: s.gridColor,
      showZones: s.showZones,
      zoneColor: s.zoneColor,
      teamDisplayMode: s.teamDisplayMode,
      soloTeamSide: s.soloTeamSide,
      tokenStyle: s.tokenStyle,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      isRecording: s.isRecording,
      setPitchType: s.setPitchType,
      setPitchView: s.setPitchView,
      setPitchSurface: s.setPitchSurface,
      setShowGrid: s.setShowGrid,
      setGridColor: s.setGridColor,
      setShowZones: s.setShowZones,
      setZoneColor: s.setZoneColor,
      setTeamDisplayMode: s.setTeamDisplayMode,
      setSoloTeamSide: s.setSoloTeamSide,
      setTokenStyle: s.setTokenStyle,
      resetTactics: s.resetTactics,
      setIsRecording: s.setIsRecording,
      setIsPlaying: s.setIsPlaying,
      loadProjectData: s.loadProjectData,
      isSetpieceMode: s.isSetpieceMode,
      setIsSetpieceMode: s.setIsSetpieceMode,
      setIsSetpiecePresetsModalOpen: s.setIsSetpiecePresetsModalOpen,
      canUndo: s.canUndo,
      canRedo: s.canRedo,
      undo: s.undo,
      redo: s.redo,
      showCompactness: s.showCompactness,
      setShowCompactness: s.setShowCompactness,
      showDefensiveLines: s.showDefensiveLines,
      setShowDefensiveLines: s.setShowDefensiveLines,
      showPlayerFOV: s.showPlayerFOV,
      setShowPlayerFOV: s.setShowPlayerFOV,
      showActionSpotlight: s.showActionSpotlight,
      setShowActionSpotlight: s.setShowActionSpotlight,
      showStrategyHUD: s.showStrategyHUD,
      setShowStrategyHUD: s.setShowStrategyHUD,
      showBallBeacon: s.showBallBeacon,
      setShowBallBeacon: s.setShowBallBeacon,
      pingBall: s.pingBall,
      setIsDrillNotesModalOpen: s.setIsDrillNotesModalOpen,
      isEquipmentToolbarOpen: s.isEquipmentToolbarOpen,
      setIsEquipmentToolbarOpen: s.setIsEquipmentToolbarOpen,
      equipment: s.equipment,
      drillNotes: s.drillNotes,
      setIsShortcutsModalOpen: s.setIsShortcutsModalOpen,
    }))
  );

  const [openDropdown, setOpenDropdown] = useState<DropdownMenuKey | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<CanvasVideoRecorder | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Responsive Compact Detection
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || window.innerHeight <= 520;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024 || window.innerHeight <= 520);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fullscreen support
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if (screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as unknown as { lock: (orientation: string) => Promise<void> }).lock('landscape');
          } catch {
            // Ignore lock error on unsupported browsers
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const currentFrame = frames[activeFrameIndex] || frames[0];

  // Snapshot PNG
  const handleSnapshot = () => {
    if (!stageRef.current) return;
    exportSnapshotToPng(stageRef.current, currentFrame.name);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Export JSON
  const handleExportJson = () => {
    exportTacticsToJson({
      pitchType,
      pitchView,
      pitchSurface,
      showGrid,
      gridColor,
      showZones,
      zoneColor,
      homeTeam,
      awayTeam,
      frames,
      equipment,
      drillNotes,
    });
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Share Link (LZ-compressed URL) — clipboard only, no new tab
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareLink = async () => {
    const url = buildShareUrl({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Bola Bundar Tactical Board',
      pitchType,
      pitchView,
      pitchSurface,
      showGrid,
      gridColor,
      showZones,
      zoneColor,
      homeTeam,
      awayTeam,
      frames,
      equipment,
      drillNotes,
    });

    // Primary: modern Clipboard API
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      // Fallback: textarea + execCommand (works in WebView, older browsers)
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Import JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseTacticsJson(file);
      loadProjectData(data);
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    } catch (err: unknown) {
      alert(`Failed to load tactics file: ${(err as Error).message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Video Recording (.webm)
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (recorderRef.current) {
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
        const blob = await recorderRef.current.stopRecording();
        if (blob) {
          recorderRef.current.downloadVideo(blob);
        }
        setIsRecording(false);
        setRecordDuration(0);
      }
    } else {
      if (!stageRef.current) return;
      const recorder = new CanvasVideoRecorder();
      const started = recorder.startRecording(stageRef.current, 30);
      if (started) {
        recorderRef.current = recorder;
        setIsRecording(true);
        setRecordDuration(0);
        setIsPlaying(true);
        recordTimerRef.current = window.setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      }
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Active analysis counter badge
  const activeAnalysisCount = [
    showZones,
    showGrid,
    showCompactness !== 'none',
    showDefensiveLines,
    showPlayerFOV,
    showActionSpotlight,
    showStrategyHUD,
  ].filter(Boolean).length;

  const toggleDropdown = (key: DropdownMenuKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <>
      <header className={`bg-slate-900 border-b border-slate-800 px-2 sm:px-4 flex items-center justify-between select-none z-30 relative transition-all ${isCompact ? 'h-12' : 'h-14'}`}>
        {/* ========================================================= */}
        {/* LEFT SECTION: Brand & Sport Segmented Control            */}
        {/* ========================================================= */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
          <Tooltip content={t('replayIntro')} description={t('replayIntroDesc')} position="bottom">
            <button
              onClick={onReplaySplash}
              className="flex items-center space-x-2 hover:opacity-85 transition-opacity cursor-pointer group shrink-0"
              title={t('replayIntro')}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs sm:text-sm shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                ⚽
              </div>

              <div className="hidden md:block text-left">
                <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                  {t('brandTitle')}
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {t('brandSubtitle')}
                  </span>
                </h1>
              </div>
            </button>
          </Tooltip>

          {/* Sport Type Segmented Control */}
          <div data-tour="pitch-controls" className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs shrink-0">
            <button
              onClick={() => setPitchType('football')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1 rounded-md font-medium text-xs transition-all ${
                pitchType === 'football'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sepak Bola 11v11"
            >
              {t('sport11v11')}
            </button>
            <button
              onClick={() => setPitchType('mini-soccer')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1 rounded-md font-medium text-xs transition-all ${
                pitchType === 'mini-soccer'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mini Soccer 7v7 / 8v8"
            >
              Mini
            </button>
            <button
              onClick={() => setPitchType('futsal')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1 rounded-md font-medium text-xs transition-all ${
                pitchType === 'futsal'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Futsal 5v5"
            >
              {t('sportFutsal')}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER SECTION (DESKTOP): 4 Smart Categorized Popovers    */}
        {/* ========================================================= */}
        {!isCompact && (
          <div ref={dropdownRef} className="flex items-center space-x-1.5 lg:space-x-2">
            {/* ---------------- 1. MENU LAPANGAN / PITCH ---------------- */}
            <div className="relative">
              <button
                data-tour="solo-mode"
                onClick={() => toggleDropdown('pitch')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  openDropdown === 'pitch'
                    ? 'bg-slate-800 text-white border-emerald-500/60 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={t('menuPitchDesc')}
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('menuPitch')}</span>
                <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-500/10 px-1 rounded uppercase">
                  {pitchView}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'pitch' ? 'rotate-180' : ''}`} />
              </button>

              {/* Pitch Dropdown Menu */}
              {openDropdown === 'pitch' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      {t('menuPitch')}
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs p-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Zoom View Mode: Full vs Half vs 1/3 Box */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {t('pitchMode')}
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setPitchView('full')}
                        className={`py-1.5 px-1 rounded-lg font-medium text-center flex flex-col items-center gap-0.5 transition-all ${
                          pitchView === 'full' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Full</span>
                      </button>
                      <button
                        onClick={() => setPitchView('half')}
                        className={`py-1.5 px-1 rounded-lg font-medium text-center flex flex-col items-center gap-0.5 transition-all ${
                          pitchView === 'half' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Half</span>
                      </button>
                      <button
                        onClick={() => setPitchView('third')}
                        className={`py-1.5 px-1 rounded-lg font-bold text-center flex flex-col items-center gap-0.5 transition-all ${
                          pitchView === 'third' ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span className="text-[10px]">1/3 Box</span>
                      </button>
                    </div>
                  </div>

                  {/* Surface Selection */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {t('pitchSurface')}
                    </label>
                    <select
                      value={pitchSurface}
                      onChange={(e) => setPitchSurface(e.target.value as PitchSurface)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="grass">{t('surfaceGrass')}</option>
                      <option value="full-green">{t('surfaceFullGreen')}</option>
                      <option value="turf">{t('surfaceTurf')}</option>
                      <option value="blue">{t('surfaceBlue')}</option>
                      <option value="wood">{t('surfaceWood')}</option>
                      <option value="dark-board">{t('surfaceDarkBoard')}</option>
                    </select>
                  </div>

                  {/* Team Display Mode (Both vs Single) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {t('teamDisplayMode')}
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setTeamDisplayMode('both')}
                        className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                          teamDisplayMode === 'both' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{t('teamDisplayBoth')}</span>
                      </button>
                      <button
                        onClick={() => setTeamDisplayMode('single')}
                        className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                          teamDisplayMode === 'single' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[11px]">1 Tim (Solo)</span>
                      </button>
                    </div>

                    {teamDisplayMode === 'single' && (
                      <button
                        onClick={() => setSoloTeamSide(soloTeamSide === 'home' ? 'away' : 'home')}
                        className="mt-1.5 w-full py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-between transition-colors border border-slate-700"
                      >
                        <span className="text-slate-400">Tim Aktif:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                soloTeamSide === 'home' ? homeTeam.primaryColor : awayTeam.primaryColor,
                            }}
                          />
                          <span>{soloTeamSide === 'home' ? homeTeam.name : awayTeam.name}</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Token Style (Jersey vs Circle) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      {t('tokenStyle')}
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setTokenStyle('jersey')}
                        className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                          tokenStyle === 'jersey' ? 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-400/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Shirt className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{t('tokenJersey')}</span>
                      </button>
                      <button
                        onClick={() => setTokenStyle('circle')}
                        className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                          tokenStyle === 'circle' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Circle className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{t('tokenCircle')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- 2. MENU ANALISIS / ANALYSIS ---------------- */}
            <div className="relative">
              <button
                data-tour="zones-grid"
                onClick={() => toggleDropdown('analysis')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  openDropdown === 'analysis'
                    ? 'bg-slate-800 text-white border-sky-500/60 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={t('menuAnalysisDesc')}
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('menuAnalysis')}</span>
                {activeAnalysisCount > 0 && (
                  <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full border border-sky-500/40">
                    {activeAnalysisCount}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'analysis' ? 'rotate-180' : ''}`} />
              </button>

              {/* Analysis Dropdown Menu */}
              {openDropdown === 'analysis' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      {t('analysisHeader')}
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs p-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 18 Tactical Zones */}
                  <div className="space-y-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" style={{ color: showZones ? zoneColor : '#94a3b8' }} />
                        <span className="text-xs font-semibold text-slate-200">18 Zones</span>
                      </div>
                      <button
                        onClick={() => setShowZones(!showZones)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                          showZones ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showZones ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {showZones && (
                      <div className="pt-1.5 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {ZONE_COLORS.map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setZoneColor(c.color)}
                            className={`w-5 h-5 rounded-full border shrink-0 transition-transform ${
                              zoneColor.toLowerCase() === c.color.toLowerCase()
                                ? 'border-white scale-110 ring-2 ring-white/30'
                                : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={t(c.nameKey as keyof Translations)}
                          />
                        ))}
                        <label className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer shrink-0" title={t('customColor')}>
                          <input
                            type="color"
                            value={zoneColor}
                            onChange={(e) => setZoneColor(e.target.value)}
                            className="w-0 h-0 opacity-0 cursor-pointer"
                          />
                          <Palette className="w-3 h-3 text-slate-300" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Tactical Grid */}
                  <div className="space-y-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5" style={{ color: showGrid ? gridColor : '#94a3b8' }} />
                        <span className="text-xs font-semibold text-slate-200">{t('grid')}</span>
                      </div>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                          showGrid ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {showGrid ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {showGrid && (
                      <div className="pt-1.5 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {GRID_COLORS.map((c) => (
                          <button
                            key={c.color}
                            onClick={() => setGridColor(c.color)}
                            className={`w-5 h-5 rounded-full border shrink-0 transition-transform ${
                              gridColor.toLowerCase() === c.color.toLowerCase()
                                ? 'border-white scale-110 ring-2 ring-white/30'
                                : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={t(c.nameKey as keyof Translations)}
                          />
                        ))}
                        <label className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer shrink-0" title={t('customColor')}>
                          <input
                            type="color"
                            value={gridColor}
                            onChange={(e) => setGridColor(e.target.value)}
                            className="w-0 h-0 opacity-0 cursor-pointer"
                          />
                          <Palette className="w-3 h-3 text-slate-300" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Team Compactness (Hull) */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('compactness')}</span>
                        <span className="text-[10px] text-slate-400">Area m² per tim</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const next =
                          showCompactness === 'none'
                            ? 'home'
                            : showCompactness === 'home'
                            ? 'away'
                            : showCompactness === 'away'
                            ? 'both'
                            : 'none';
                        setShowCompactness(next);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        showCompactness !== 'none'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {showCompactness === 'none'
                        ? t('compactnessOff')
                        : showCompactness.toUpperCase()}
                    </button>
                  </div>

                  {/* Defensive Lines */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Scan className="w-3.5 h-3.5 text-sky-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('defensiveLines')}</span>
                        <span className="text-[10px] text-slate-400">Lini bek & offside line</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDefensiveLines(!showDefensiveLines)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        showDefensiveLines
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {showDefensiveLines ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Player FOV */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('playerFOV')}</span>
                        <span className="text-[10px] text-slate-400">Kerucut arah pandang 110°</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlayerFOV(!showPlayerFOV)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        showPlayerFOV
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {showPlayerFOV ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Pass & Movement Action Spotlight */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('actionSpotlight')}</span>
                        <span className="text-[10px] text-slate-400">Penerima umpan & ruang lari</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowActionSpotlight(!showActionSpotlight)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        showActionSpotlight
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {showActionSpotlight ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* 7. Tactical Strategy HUD Banner */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('strategyHUD')}</span>
                        <span className="text-[10px] text-slate-400">Banner taktis & instruksi di layar</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStrategyHUD(!showStrategyHUD)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        showStrategyHUD
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}
                    >
                      {showStrategyHUD ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* 8. Ball Beacon & High-Visibility Aura */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">⚽</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{t('ballBeacon')}</span>
                        <span className="text-[10px] text-slate-400">{t('ballBeaconDesc')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={pingBall}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 shadow-sm"
                        title="Ping gelombang untuk menemukan bola di lapangan"
                      >
                        Ping 🎯
                      </button>
                      <button
                        onClick={() => setShowBallBeacon(!showBallBeacon)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                          showBallBeacon
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        {showBallBeacon ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- 3. MENU SESI & TAKTIK / SESSION ---------------- */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('session')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  openDropdown === 'session'
                    ? 'bg-slate-800 text-white border-amber-500/60 shadow-sm'
                    : isSetpieceMode
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={t('menuSessionDesc')}
              >
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('menuSession')}</span>
                {isSetpieceMode && (
                  <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    SETPIECE
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'session' ? 'rotate-180' : ''}`} />
              </button>

              {/* Session Dropdown Menu */}
              {openDropdown === 'session' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      {t('menuSession')}
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs p-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Setpiece Mode Trigger */}
                  <button
                    onClick={() => {
                      setIsSetpieceMode(!isSetpieceMode);
                    }}
                    className={`w-full p-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isSetpieceMode
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{t('setpieceMode')}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isSetpieceMode ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSetpieceMode ? t('setpieceActive') : t('setpieceInactive')}
                    </span>
                  </button>

                  {/* Setpiece Presets Modal Button */}
                  <button
                    onClick={() => {
                      setIsSetpiecePresetsModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{t('setpiecePreset')}</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      Buka 📚
                    </span>
                  </button>

                  {/* Drill Notes Modal Button */}
                  <button
                    onClick={() => {
                      setIsDrillNotesModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-emerald-400" />
                      <span>{t('drillNotes')}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      Lembar 📝
                    </span>
                  </button>

                  {/* Equipment Toolbar Toggle */}
                  <button
                    onClick={() => {
                      setIsEquipmentToolbarOpen(!isEquipmentToolbarOpen);
                      setOpenDropdown(null);
                    }}
                    className={`w-full p-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isEquipmentToolbarOpen
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span>{t('equipmentToolbar')}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                      {isEquipmentToolbarOpen ? 'Terbuka' : 'Tertutup'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* ---------------- 4. MENU BERKAS / FILE ---------------- */}
            <div className="relative">
              <button
                data-tour="export-controls"
                onClick={() => toggleDropdown('file')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  openDropdown === 'file'
                    ? 'bg-slate-800 text-white border-purple-500/60 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={t('menuFileDesc')}
              >
                <FolderDown className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('menuFile')}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'file' ? 'rotate-180' : ''}`} />
              </button>

              {/* File Dropdown Menu */}
              {openDropdown === 'file' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FolderDown className="w-3.5 h-3.5 text-purple-400" />
                      {t('menuFile')}
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs p-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    onClick={handleSnapshot}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-sky-400" />
                    <span>{t('snapshotPng')}</span>
                  </button>

                  <button
                    onClick={handleToggleRecord}
                    className={`w-full p-2 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-colors ${
                      isRecording
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-rose-500/50 text-slate-200'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Video className="w-4 h-4 text-rose-400" />}
                    <span>{isRecording ? `${t('stopRecord')} (${recordDuration}s)` : t('recordVideo')}</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{t('exportJson')}</span>
                  </button>

                  <button
                    onClick={handleShareLink}
                    className={`w-full p-2 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all duration-300 ${
                      shareCopied
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-cyan-500/50 text-slate-200'
                    }`}
                  >
                    <Link2 className={`w-4 h-4 ${shareCopied ? 'text-white' : 'text-cyan-400'}`} />
                    <span>{shareCopied ? '✅ Link Tersalin!' : '🔗 Share Link'}</span>
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setOpenDropdown(null);
                    }}
                    className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{t('importJson')}</span>
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        resetTactics();
                        setOpenDropdown(null);
                      }}
                      className="w-full p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>{t('resetTactics')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RIGHT SECTION: Quick Actions, Lang, Fullscreen, Hamburger */}
        {/* ========================================================= */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 z-40">
          {/* Undo / Redo Buttons */}
          <div className="flex items-center space-x-0.5 pr-1 border-r border-slate-700/60">
            <Tooltip content={t('undo')} description={t('undoDesc')} position="bottom">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1.5 sm:p-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  canUndo
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <Tooltip content={t('redo')} description={t('redoDesc')} position="bottom">
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1.5 sm:p-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  canRedo
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Record Quick Trigger (if active) */}
          {isRecording && (
            <button
              onClick={handleToggleRecord}
              className="px-2 py-1 rounded-lg bg-rose-600 border border-rose-500 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse shrink-0"
              title={t('stopRecord')}
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{recordDuration}s</span>
            </button>
          )}

          {/* Tutorial Tour Guide Button (Desktop) */}
          <Tooltip content={t('guideTour')} description={t('guideTourDesc')} position="bottom">
            <button
              onClick={onOpenTour}
              className="hidden lg:flex p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs items-center gap-1 font-semibold transition-colors shrink-0"
              title={t('guideTour')}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Panduan</span>
            </button>
          </Tooltip>

          {/* Keyboard Shortcuts Button (Desktop) */}
          <Tooltip content="Pintasan Keyboard" description="Lihat panduan tombol pintasan keyboard (Tekan ?)" shortcut="?" position="bottom">
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="hidden lg:flex p-1.5 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs items-center gap-1 font-semibold transition-colors shrink-0"
              title="Pintasan Keyboard (?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">Pintasan</span>
            </button>
          </Tooltip>

          {/* Language Switcher (ID | EN) - Always visible on desktop & mobile */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs shrink-0 items-center">
            <button
              onClick={() => setLanguage('id')}
              className={`px-1.5 py-1 rounded font-bold text-[10px] transition-all ${
                language === 'id'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bahasa Indonesia (Default)"
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-1 rounded font-bold text-[10px] transition-all ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* FULLSCREEN BUTTON - ALWAYS VISIBLE, NEVER OBSCURED OR OVERLAPPED */}
          <Tooltip
            content={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            position="bottom"
          >
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center transition-colors shrink-0 z-50 shadow-sm"
              title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-200" />
              )}
            </button>
          </Tooltip>

          {/* Mobile / Compact Hamburger Menu Button */}
          {isCompact && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shrink-0 z-50"
              title={mobileMenuOpen ? t('closeMenu') : t('mobileMenuTitle')}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-emerald-400" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* ========================================================= */}
      {/* MOBILE / COMPACT STRUCTURED SLIDE-DOWN DRAWER             */}
      {/* ========================================================= */}
      {isCompact && mobileMenuOpen && (
        <div className="bg-slate-900/98 backdrop-blur-xl border-b border-slate-800 p-4 space-y-4 shadow-2xl z-40 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          {/* Header of Drawer with Title & Close */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              {t('mobileMenuTitle')}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          {/* Card 1: Lapangan / Pitch Settings */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2.5">
            <label className="text-[11px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" />
              {t('menuPitch')}
            </label>

            {/* Pitch Zoom View */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setPitchView('full');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded-lg font-medium text-center ${
                  pitchView === 'full' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Full
              </button>
              <button
                onClick={() => {
                  setPitchView('half');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded-lg font-medium text-center ${
                  pitchView === 'half' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Half
              </button>
              <button
                onClick={() => {
                  setPitchView('third');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 rounded-lg font-bold text-center ${
                  pitchView === 'third' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                1/3 Box
              </button>
            </div>

            {/* Surface Selector */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-medium">{t('pitchSurface')}:</label>
              <select
                value={pitchSurface}
                onChange={(e) => {
                  setPitchSurface(e.target.value as PitchSurface);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-medium"
              >
                <option value="grass">{t('surfaceGrass')}</option>
                <option value="full-green">{t('surfaceFullGreen')}</option>
                <option value="turf">{t('surfaceTurf')}</option>
                <option value="blue">{t('surfaceBlue')}</option>
                <option value="wood">{t('surfaceWood')}</option>
                <option value="dark-board">{t('surfaceDarkBoard')}</option>
              </select>
            </div>

            {/* Team Mode & Token Style */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">{t('teamDisplayMode')}:</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setTeamDisplayMode('both')}
                    className={`py-1 px-1 rounded text-center text-[10px] font-semibold ${
                      teamDisplayMode === 'both' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    2 Tim
                  </button>
                  <button
                    onClick={() => setTeamDisplayMode('single')}
                    className={`py-1 px-1 rounded text-center text-[10px] font-semibold ${
                      teamDisplayMode === 'single' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    1 Tim
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">{t('tokenStyle')}:</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setTokenStyle('jersey')}
                    className={`py-1 px-1 rounded text-center text-[10px] font-semibold ${
                      tokenStyle === 'jersey' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Jersey
                  </button>
                  <button
                    onClick={() => setTokenStyle('circle')}
                    className={`py-1 px-1 rounded text-center text-[10px] font-semibold ${
                      tokenStyle === 'circle' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    Bulat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Analisis Taktis / Analysis */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2.5">
            <label className="text-[11px] uppercase font-bold text-sky-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {t('menuAnalysis')}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowZones(!showZones)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showZones ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>18 Zones</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-950">
                  {showZones ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showGrid ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>{t('grid')}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-950">
                  {showGrid ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const next =
                    showCompactness === 'none'
                      ? 'home'
                      : showCompactness === 'home'
                      ? 'away'
                      : showCompactness === 'away'
                      ? 'both'
                      : 'none';
                  setShowCompactness(next);
                }}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showCompactness !== 'none'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Kompaksi</span>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {showCompactness !== 'none' ? showCompactness.toUpperCase() : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => setShowDefensiveLines(!showDefensiveLines)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showDefensiveLines
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Lini Bek</span>
                </div>
                <span className="text-[10px] font-bold">{showDefensiveLines ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowPlayerFOV(!showPlayerFOV)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showPlayerFOV
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Visi FOV</span>
                </div>
                <span className="text-[10px] font-bold">{showPlayerFOV ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowActionSpotlight(!showActionSpotlight)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold ${
                  showActionSpotlight
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Sorot Umpan</span>
                </div>
                <span className="text-[10px] font-bold">{showActionSpotlight ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowStrategyHUD(!showStrategyHUD)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between font-semibold col-span-2 ${
                  showStrategyHUD
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">HUD Strategi di Layar</span>
                </div>
                <span className="text-[10px] font-bold">{showStrategyHUD ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Sesi & Taktik / Session */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2.5">
            <label className="text-[11px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              {t('menuSession')}
            </label>

            <button
              onClick={() => {
                setIsSetpieceMode(!isSetpieceMode);
                setMobileMenuOpen(false);
              }}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                isSetpieceMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{t('setpieceMode')}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                isSetpieceMode ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {isSetpieceMode ? t('setpieceActive') : t('setpieceInactive')}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsSetpiecePresetsModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('setpiecePreset')}</span>
              </button>

              <button
                onClick={() => {
                  setIsDrillNotesModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>{t('drillNotes')}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Berkas & Ekspor / File */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-[11px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
              <FolderDown className="w-3.5 h-3.5" />
              {t('menuFile')}
            </label>

            <div className="grid grid-cols-5 gap-1.5">
              <button
                onClick={handleSnapshot}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 text-xs flex flex-col items-center gap-1 font-medium hover:border-sky-500/40"
              >
                <Camera className="w-4 h-4" />
                <span className="text-[10px]">PNG</span>
              </button>

              <button
                onClick={handleExportJson}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs flex flex-col items-center gap-1 font-medium hover:border-emerald-500/40"
              >
                <Download className="w-4 h-4" />
                <span className="text-[10px]">Export</span>
              </button>

              <button
                onClick={handleShareLink}
                className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 font-medium transition-all duration-300 ${
                  shareCopied
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500/40'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span className="text-[10px]">{shareCopied ? '✅' : 'Share'}</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs flex flex-col items-center gap-1 font-medium hover:border-amber-500/40"
              >
                <Upload className="w-4 h-4" />
                <span className="text-[10px]">Import</span>
              </button>

              <button
                onClick={() => {
                  resetTactics();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 text-xs flex flex-col items-center gap-1 font-medium hover:border-rose-500/40"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px]">Reset</span>
              </button>
            </div>
          </div>

          {/* Pintasan Keyboard Mobile Button */}
          <button
            onClick={() => {
              setIsShortcutsModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors mb-2"
          >
            <Keyboard className="w-4 h-4 text-sky-400" />
            <span>Pintasan Keyboard</span>
          </button>

          {/* Panduan Tutorial Mobile Button */}
          <button
            onClick={() => {
              if (onOpenTour) onOpenTour();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('guideTour')}</span>
          </button>
        </div>
      )}
    </>
  );
});
