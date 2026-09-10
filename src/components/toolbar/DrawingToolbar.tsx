import React from 'react';
import {
  MousePointer,
  ArrowRight,
  MoveRight,
  Spline,
  Square,
  Eraser,
  Trash,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { ActiveTool } from '../../types/tactics';
import { Tooltip } from '../ui/Tooltip';

export const DrawingToolbar: React.FC = () => {
  const {
    activeTool,
    activeDrawingColor,
    setActiveTool,
    setActiveDrawingColor,
    clearDrawings,
    frames,
    activeFrameIndex,
  } = useTacticsStore();

  const currentFrame = frames[activeFrameIndex];
  const drawingCount = currentFrame?.drawings?.length || 0;

  const tools: {
    id: ActiveTool;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'select',
      label: 'Pilih & Geser',
      description: 'Pindahkan token pemain/bola & putar arah hadap',
      icon: MousePointer,
    },
    {
      id: 'pass',
      label: 'Panah Operan',
      description: 'Garis panah solid penunjuk arah operan bola',
      icon: ArrowRight,
    },
    {
      id: 'run',
      label: 'Jalur Lari (Sprint)',
      description: 'Garis putus-putus pergerakan pemain tanpa bola',
      icon: MoveRight,
    },
    {
      id: 'dribble',
      label: 'Dribbling',
      description: 'Garis gelombang gerakan liukan menggiring bola',
      icon: Spline,
    },
    {
      id: 'zone',
      label: 'Area Taktis',
      description: 'Blok persegi penanda zona strategi penting',
      icon: Square,
    },
    {
      id: 'eraser',
      label: 'Penghapus',
      description: 'Klik anotasi gambar untuk menghapusnya',
      icon: Eraser,
    },
  ];

  const colors = [
    { color: '#f59e0b', name: 'Amber Yellow' },
    { color: '#ffffff', name: 'Pure White' },
    { color: '#ef4444', name: 'Crimson Red' },
    { color: '#3b82f6', name: 'Royal Blue' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#10b981', name: 'Emerald Green' },
  ];

  return (
    <div data-tour="drawing-toolbar" className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center space-x-1.5 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl select-none max-w-[calc(100vw-24px)] overflow-x-auto scrollbar-none">
      {/* Tool Buttons */}
      <div className="flex items-center space-x-1 pr-1.5 border-r border-slate-700/70">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <Tooltip
              key={t.id}
              content={t.label}
              description={t.description}
              position="bottom"
            >
              <button
                onClick={() => setActiveTool(t.id)}
                className={`p-2 rounded-lg text-xs flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Color Palette (visible when drawing tool is active) */}
      {activeTool !== 'select' && activeTool !== 'eraser' && (
        <div className="flex items-center space-x-1.5 px-1.5 pr-2 border-r border-slate-700/70">
          {colors.map((c) => (
            <Tooltip key={c.color} content={c.name} position="bottom">
              <button
                onClick={() => setActiveDrawingColor(c.color)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  activeDrawingColor === c.color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c.color }}
              />
            </Tooltip>
          ))}
        </div>
      )}

      {/* Clear Current Frame Drawings */}
      {drawingCount > 0 && (
        <Tooltip
          content="Hapus Semua Gambar"
          description={`Menghapus ${drawingCount} gambar di frame ini`}
          position="bottom"
        >
          <button
            onClick={clearDrawings}
            className="p-1.5 px-2 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1 transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear ({drawingCount})</span>
          </button>
        </Tooltip>
      )}
    </div>
  );
};
