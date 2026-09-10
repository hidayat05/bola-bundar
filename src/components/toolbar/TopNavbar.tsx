import React, { useRef, useState } from 'react';
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
} from 'lucide-react';
import Konva from 'konva';
import { useTacticsStore } from '../../store/useTacticsStore';
import { PitchSurface } from '../../types/tactics';
import {
  exportSnapshotToPng,
  exportTacticsToJson,
  parseTacticsJson,
  CanvasVideoRecorder,
} from '../../utils/exportUtils';

interface TopNavbarProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ stageRef }) => {
  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    showZones,
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
    resetTactics,
    setIsRecording,
    setIsPlaying,
    loadProjectData,
  } = useTacticsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<CanvasVideoRecorder | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<number | null>(null);

  const currentFrame = frames[activeFrameIndex] || frames[0];

  // 1. Snapshot PNG Export
  const handleSnapshot = () => {
    if (!stageRef.current) return;
    exportSnapshotToPng(stageRef.current, currentFrame.name);
  };

  // 2. Export JSON
  const handleExportJson = () => {
    exportTacticsToJson({
      pitchType,
      pitchView,
      pitchSurface,
      showGrid,
      showZones,
      homeTeam,
      awayTeam,
      frames,
    });
  };

  // 3. Import JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseTacticsJson(file);
      loadProjectData(data);
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
      // Stop recording
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
      // Start recording
      if (!stageRef.current) return;
      const recorder = new CanvasVideoRecorder();
      const started = recorder.startRecording(stageRef.current, 30);
      if (started) {
        recorderRef.current = recorder;
        setIsRecording(true);
        setRecordDuration(0);

        // Start playback across all frames
        setIsPlaying(true);

        // Timer
        recordTimerRef.current = window.setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Preset Selector */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm shadow-inner">
          ⚽
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
            Bola Bundar
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Pro Tactics
            </span>
          </h1>
        </div>

        {/* Sport Type Segmented Control */}
        <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
          <button
            onClick={() => setPitchType('football')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'football'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            11v11
          </button>
          <button
            onClick={() => setPitchType('mini-soccer')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'mini-soccer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7v7 / 8v8
          </button>
          <button
            onClick={() => setPitchType('futsal')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
              pitchType === 'futsal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Futsal
          </button>
        </div>
      </div>

      {/* Center Controls: View & Pitch Overlays */}
      <div className="hidden md:flex items-center space-x-2">
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

        {/* Tactical 18 Zones */}
        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-1.5 px-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showZones
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Tactical 18-Zones & Half-spaces"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px]">18 Zones</span>
        </button>

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

      {/* Right Controls: Video Recording, PNG Snapshot, JSON Import/Export, Reset */}
      <div className="flex items-center space-x-1.5">
        {/* In-Browser Video Recorder */}
        <button
          onClick={handleToggleRecord}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isRecording
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
              : 'bg-slate-800/80 border-slate-700 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40'
          }`}
          title={isRecording ? 'Stop Recording & Download .webm' : 'Record Canvas Playback (.webm)'}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Rec {recordDuration}s</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Record .webm</span>
            </>
          )}
        </button>

        {/* Snapshot PNG */}
        <button
          onClick={handleSnapshot}
          className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs flex items-center gap-1 transition-colors"
          title="Take High-Res PNG Snapshot"
        >
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xl:inline">PNG</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJson}
          className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs flex items-center gap-1 transition-colors"
          title="Export Tactics to JSON"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline">Export</span>
        </button>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 px-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs flex items-center gap-1 transition-colors"
          title="Import Tactics from JSON"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Reset Formation */}
        <button
          onClick={resetTactics}
          className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
          title="Reset Pitch to Default Formation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
