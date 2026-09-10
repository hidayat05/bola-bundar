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

  const tools: { id: ActiveTool; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'select', label: 'Select & Move', icon: MousePointer },
    { id: 'pass', label: 'Passing Arrow (Solid)', icon: ArrowRight },
    { id: 'run', label: 'Player Run (Dashed)', icon: MoveRight },
    { id: 'dribble', label: 'Dribbling (Wavy)', icon: Spline },
    { id: 'zone', label: 'Tactical Zone', icon: Square },
    { id: 'eraser', label: 'Eraser', icon: Eraser },
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
    <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl select-none">
      {/* Tool Buttons */}
      <div className="flex items-center space-x-1 pr-1.5 border-r border-slate-700/70">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`p-2 rounded-lg text-xs flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={t.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Color Palette (visible when drawing tool is active) */}
      {activeTool !== 'select' && activeTool !== 'eraser' && (
        <div className="flex items-center space-x-1.5 px-1.5 pr-2 border-r border-slate-700/70">
          {colors.map((c) => (
            <button
              key={c.color}
              onClick={() => setActiveDrawingColor(c.color)}
              className={`w-5 h-5 rounded-full transition-transform ${
                activeDrawingColor === c.color
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {/* Clear Current Frame Drawings */}
      {drawingCount > 0 && (
        <button
          onClick={clearDrawings}
          className="p-1.5 px-2 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1 transition-colors"
          title="Clear all drawings in this frame"
        >
          <Trash className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear ({drawingCount})</span>
        </button>
      )}
    </div>
  );
};
