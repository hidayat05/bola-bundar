import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  Grid,
  RotateCcw,
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
} from 'lucide-react';

const ZONE_COLORS = [
  { name: 'Amber', color: '#fbbf24' },
  { name: 'White', color: '#ffffff' },
  { name: 'Cyan', color: '#38bdf8' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Pink', color: '#f43f5e' },
  { name: 'Blue', color: '#3b82f6' },
];
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
import { Tooltip } from '../ui/Tooltip';

interface TopNavbarProps {
  stageRef: React.RefObject<Konva.Stage>;
  onOpenTour?: () => void;
  onReplaySplash?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = React.memo(({ stageRef, onOpenTour, onReplaySplash }) => {
  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    showZones,
    zoneColor,
    teamDisplayMode,
    soloTeamSide,
    homeTeam,
    awayTeam,
    frames,
    activeFrameIndex,
    isRecording,
    setPitchType,
    setPitchView,
    setPitchSurface,
    setShowGrid,
    setShowZones,
    setZoneColor,
    setTeamDisplayMode,
    setSoloTeamSide,
    resetTactics,
    setIsRecording,
    setIsPlaying,
    loadProjectData,
  } = useTacticsStore(
    useShallow((s) => ({
      pitchType: s.pitchType,
      pitchView: s.pitchView,
      pitchSurface: s.pitchSurface,
      showGrid: s.showGrid,
      showZones: s.showZones,
      zoneColor: s.zoneColor,
      teamDisplayMode: s.teamDisplayMode,
      soloTeamSide: s.soloTeamSide,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      isRecording: s.isRecording,
      setPitchType: s.setPitchType,
      setPitchView: s.setPitchView,
      setPitchSurface: s.setPitchSurface,
      setShowGrid: s.setShowGrid,
      setShowZones: s.setShowZones,
      setZoneColor: s.setZoneColor,
      setTeamDisplayMode: s.setTeamDisplayMode,
      setSoloTeamSide: s.setSoloTeamSide,
      resetTactics: s.resetTactics,
      setIsRecording: s.setIsRecording,
      setIsPlaying: s.setIsPlaying,
      loadProjectData: s.loadProjectData,
    }))
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zoneColorMenuOpen, setZoneColorMenuOpen] = useState(false);
  const zoneColorMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<CanvasVideoRecorder | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  // Close zone color popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        zoneColorMenuRef.current &&
        !zoneColorMenuRef.current.contains(e.target as Node)
      ) {
        setZoneColorMenuOpen(false);
      }
    };
    if (zoneColorMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [zoneColorMenuOpen]);

  // Height-aware compact detection
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
            await (screen.orientation as any).lock('landscape');
          } catch (_) {
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

  // 1. Snapshot PNG Export
  const handleSnapshot = () => {
    if (!stageRef.current) return;
    exportSnapshotToPng(stageRef.current, currentFrame.name);
    setMobileMenuOpen(false);
  };

  // 2. Export JSON
  const handleExportJson = () => {
    exportTacticsToJson({
      pitchType,
      pitchView,
      pitchSurface,
      showGrid,
      showZones,
      zoneColor,
      homeTeam,
      awayTeam,
      frames,
    });
    setMobileMenuOpen(false);
  };

  // 3. Import JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseTacticsJson(file);
      loadProjectData(data);
      setMobileMenuOpen(false);
    } catch (err: unknown) {
      alert(`Failed to load tactics file: ${(err as Error).message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 4. Video Recording (.webm)
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
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`bg-slate-900 border-b border-slate-800 px-2.5 sm:px-4 flex items-center justify-between select-none z-30 relative transition-all ${isCompact ? 'h-11' : 'h-14'}`}>
        {/* Left: Brand & Sport Type Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Tooltip content="Putar Animasi Intro ⚽" description="Tonton kembali animasi bola berputar dan membesar" position="bottom">
            <button
              onClick={onReplaySplash}
              className="flex items-center space-x-2 hover:opacity-85 transition-opacity cursor-pointer group"
              title="Putar Animasi Intro"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs sm:text-sm shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                ⚽
              </div>

              <div className="hidden lg:block text-left">
                <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                  Bola Bundar
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Pro
                  </span>
                </h1>
              </div>
            </button>
          </Tooltip>

          {/* Sport Type Segmented Control */}
          <div data-tour="pitch-controls" className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setPitchType('football')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium text-xs transition-all ${
                pitchType === 'football'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              11v11
            </button>
            <button
              onClick={() => setPitchType('mini-soccer')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium text-xs transition-all ${
                pitchType === 'mini-soccer'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mini
            </button>
            <button
              onClick={() => setPitchType('futsal')}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium text-xs transition-all ${
                pitchType === 'futsal'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Futsal
            </button>
          </div>
        </div>

        {/* 1 Tim (Solo) vs 2 Tim (Lawan) Toggle Button - Visible on both desktop & mobile */}
        <div data-tour="solo-mode" className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs shrink-0 items-center">
          <button
            onClick={() => setTeamDisplayMode('both')}
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium text-xs flex items-center gap-1 transition-all ${
              teamDisplayMode === 'both'
                ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilkan 2 Tim (Home vs Away)"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2 Tim</span>
          </button>
          <button
            onClick={() => setTeamDisplayMode('single')}
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md font-medium text-xs flex items-center gap-1 transition-all ${
              teamDisplayMode === 'single'
                ? 'bg-emerald-600 text-white shadow-sm font-bold ring-1 ring-emerald-400/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Hanya 1 Tim (Solo Shape / Build-up tanpa lawan)"
          >
            <User className="w-3.5 h-3.5" />
            <span>1 Tim</span>
          </button>

          {teamDisplayMode === 'single' && (
            <button
              onClick={() => setSoloTeamSide(soloTeamSide === 'home' ? 'away' : 'home')}
              className="ml-1 px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 transition-colors"
              title="Ganti tim yang tampil solo"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    soloTeamSide === 'home'
                      ? homeTeam.primaryColor
                      : awayTeam.primaryColor,
                }}
              />
              <span className="hidden sm:inline">{soloTeamSide === 'home' ? 'Home' : 'Away'}</span>
            </button>
          )}
        </div>

        {/* Center Controls (Desktop & Large Screen Only): View & Pitch Overlays */}
        {!isCompact && (
          <div className="flex items-center space-x-2">
          {/* Full vs Half Pitch Toggle */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setPitchView('full')}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-all ${
                pitchView === 'full'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Pitch"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full</span>
            </button>
            <button
              onClick={() => setPitchView('half')}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-all ${
                pitchView === 'half'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Half Pitch / Set Piece Mode"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Half</span>
            </button>
          </div>

          {/* Pitch Surface Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400">Surface:</span>
            <select
              value={pitchSurface}
              onChange={(e) => setPitchSurface(e.target.value as PitchSurface)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="grass" className="bg-slate-900">
                Grass Turf
              </option>
              <option value="full-green" className="bg-slate-900">
                Full Green Grass
              </option>
              <option value="turf" className="bg-slate-900">
                Dark Green Turf
              </option>
              <option value="blue" className="bg-slate-900">
                Futsal Blue Court
              </option>
              <option value="wood" className="bg-slate-900">
                Parquet Wood
              </option>
            </select>
          </div>

          {/* Tactical 18 Zones with Integrated Color Changer */}
          <div data-tour="zones-grid" className="relative flex items-center">
            <button
              onClick={() => setShowZones(!showZones)}
              className={`p-1.5 px-2 text-xs flex items-center gap-1.5 transition-colors border ${
                showZones
                  ? 'rounded-l-lg border-r-0 bg-slate-800 border-slate-700 text-slate-100 font-medium'
                  : 'rounded-lg bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Tactical 18-Zones & Half-spaces"
            >
              <Layers
                className="w-3.5 h-3.5 transition-colors"
                style={{ color: showZones ? zoneColor : undefined }}
              />
              <span className="text-[11px]">18 Zones</span>
            </button>

            {/* Color Changer Trigger & Popover */}
            {showZones && (
              <div className="relative" ref={zoneColorMenuRef}>
                <button
                  type="button"
                  onClick={() => setZoneColorMenuOpen(!zoneColorMenuOpen)}
                  className="p-1.5 px-1.5 rounded-r-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs flex items-center gap-1 transition-colors"
                  title="Change 18-Zone Color"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/60 shadow-sm"
                    style={{ backgroundColor: zoneColor }}
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {zoneColorMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-60 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Palette className="w-3.5 h-3.5" style={{ color: zoneColor }} />
                        <span>18 Zones Color</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setZoneColorMenuOpen(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs px-1 rounded"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Preset Swatches */}
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {ZONE_COLORS.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setZoneColor(c.color)}
                          className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                            zoneColor.toLowerCase() === c.color.toLowerCase()
                              ? 'border-white bg-slate-800 shadow-md scale-105'
                              : 'border-transparent hover:bg-slate-800/60'
                          }`}
                          title={c.name}
                        >
                          <span
                            className="w-5 h-5 rounded-full border border-white/30 shadow-inner"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-[10px] text-slate-300 mt-1 font-medium truncate w-full text-center">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Hex Color Picker */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Custom:</span>
                      <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 cursor-pointer hover:border-slate-700">
                        <input
                          type="color"
                          value={zoneColor}
                          onChange={(e) => setZoneColor(e.target.value)}
                          className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        <span className="text-[11px] font-mono text-slate-200 uppercase font-semibold">
                          {zoneColor}
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 px-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              showGrid
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Pitch Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[11px]">Grid</span>
          </button>
        </div>
        )}

        {/* Right Controls: Fullscreen, Record, Desktop buttons & Mobile hamburger */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Fullscreen Mode Toggle Button */}
          <Tooltip content={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Mode Layar Penuh (Fullscreen)'} position="bottom">
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 flex items-center justify-center transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>

          {/* Panduan / Help Tour Button */}
          <Tooltip content="Panduan Tutorial" description="Buka alur panduan langkah demi langkah interaktif" position="bottom">
            <button
              onClick={onOpenTour}
              className="p-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs flex items-center gap-1 font-semibold transition-colors"
              title="Buka Panduan Tutorial"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Panduan</span>
            </button>
          </Tooltip>

          {/* Record Video Button */}
          <Tooltip content={isRecording ? 'Hentikan Rekaman' : 'Rekam Video'} description="Rekam pergerakan taktik ke format video .webm" position="bottom">
            <button
              onClick={handleToggleRecord}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isRecording
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{recordDuration}s</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Record</span>
                </>
              )}
            </button>
          </Tooltip>

          {/* Desktop Only Export Buttons */}
          {!isCompact && (
            <div data-tour="export-controls" className="flex items-center space-x-1.5">
              {/* Snapshot PNG */}
              <Tooltip content="Ambil Foto PNG" description="Simpan gambar resolusi tinggi papan taktik" position="bottom">
                <button
                  onClick={handleSnapshot}
                  className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden xl:inline">PNG</span>
                </button>
              </Tooltip>

              {/* Export JSON */}
              <Tooltip content="Ekspor Proyek" description="Simpan file taktik .json ke komputer" position="bottom">
                <button
                  onClick={handleExportJson}
                  className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline">Export</span>
                </button>
              </Tooltip>

              {/* Import JSON */}
              <Tooltip content="Impor Proyek" description="Buka file taktik .json yang pernah disimpan" position="bottom">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">Import</span>
                </button>
              </Tooltip>

              {/* Reset Formation */}
              <Tooltip content="Reset Lapangan" description="Kembalikan semua pemain ke posisi awal" position="bottom">
                <button
                  onClick={resetTactics}
                  className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Compact / Mobile Menu Button */}
          {isCompact && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="Buka Menu Pengaturan"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
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

      {/* Mobile / Compact Slide-Down Actions Sheet */}
      {isCompact && mobileMenuOpen && (
        <div className="bg-slate-900/98 backdrop-blur-xl border-b border-slate-800 p-4 space-y-4 shadow-2xl z-20 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          {/* Team Display Mode (2 Teams vs 1 Team) */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Mode Tim (Jumlah Tim di Lapangan)
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setTeamDisplayMode('both');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all ${
                  teamDisplayMode === 'both' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>2 Tim (Lawan)</span>
              </button>
              <button
                onClick={() => {
                  setTeamDisplayMode('single');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all ${
                  teamDisplayMode === 'single' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Hanya 1 Tim (Solo)</span>
              </button>
            </div>
          </div>

          {/* Mode & Surface */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Pitch Mode
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setPitchView('full');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1 rounded font-medium ${
                    pitchView === 'full' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Full
                </button>
                <button
                  onClick={() => {
                    setPitchView('half');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1 rounded font-medium ${
                    pitchView === 'half' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Half
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Pitch Surface
              </label>
              <select
                value={pitchSurface}
                onChange={(e) => {
                  setPitchSurface(e.target.value as PitchSurface);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 font-medium"
              >
                <option value="grass">Grass Turf</option>
                <option value="full-green">Full Green Grass</option>
                <option value="turf">Dark Green</option>
                <option value="blue">Futsal Blue</option>
                <option value="wood">Wood Parquet</option>
              </select>
            </div>
          </div>

          {/* Overlays (Zones & Grid) */}
          <div className="pt-1 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowZones(!showZones)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium ${
                  showZones
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Layers
                  className="w-3.5 h-3.5"
                  style={{ color: showZones ? zoneColor : undefined }}
                />
                <span>18 Zones {showZones ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 font-medium ${
                  showGrid
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid {showGrid ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Mobile 18 Zone Color Picker (visible when 18 zones is active) */}
            {showZones && (
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" style={{ color: zoneColor }} />
                    <span className="text-slate-200 font-semibold">18 Zone Color:</span>
                  </div>
                  <span className="font-mono uppercase text-slate-300 text-[10px] font-bold">
                    {zoneColor}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {ZONE_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setZoneColor(c.color)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border transition-transform ${
                        zoneColor.toLowerCase() === c.color.toLowerCase()
                          ? 'border-white scale-110 ring-2 ring-white/40 shadow-md'
                          : 'border-white/20 opacity-80'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                  {/* Custom color input */}
                  <label
                    className="flex-shrink-0 relative w-7 h-7 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center cursor-pointer overflow-hidden hover:border-slate-500"
                    title="Custom Color"
                  >
                    <input
                      type="color"
                      value={zoneColor}
                      onChange={(e) => setZoneColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Palette className="w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Export & Reset Actions */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={handleSnapshot}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 text-xs flex flex-col items-center gap-1 font-medium"
            >
              <Camera className="w-4 h-4" />
              <span>Snapshot</span>
            </button>

            <button
              onClick={handleExportJson}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 text-xs flex flex-col items-center gap-1 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 text-xs flex flex-col items-center gap-1 font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>

            <button
              onClick={() => {
                resetTactics();
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 text-xs flex flex-col items-center gap-1 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Panduan Tutorial Mobile Button */}
          <button
            onClick={() => {
              if (onOpenTour) onOpenTour();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Buka Panduan Tutorial Interaktif</span>
          </button>
        </div>
      )}
    </>
  );
});
