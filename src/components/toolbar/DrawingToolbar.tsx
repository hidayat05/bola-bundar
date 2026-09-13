import React, { useState, useEffect } from 'react';
import {
  MousePointer,
  ArrowRight,
  MoveRight,
  Spline,
  Square,
  Eraser,
  Trash,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Target,
  X,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { ActiveTool } from '../../types/tactics';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../i18n/useTranslation';

export const DrawingToolbar: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeTool,
    activeDrawingColor,
    setActiveTool,
    setActiveDrawingColor,
    clearDrawings,
    frames,
    activeFrameIndex,
    isEquipmentToolbarOpen,
    setIsEquipmentToolbarOpen,
  } = useTacticsStore(
    useShallow((s) => ({
      activeTool: s.activeTool,
      activeDrawingColor: s.activeDrawingColor,
      setActiveTool: s.setActiveTool,
      setActiveDrawingColor: s.setActiveDrawingColor,
      clearDrawings: s.clearDrawings,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      isEquipmentToolbarOpen: s.isEquipmentToolbarOpen,
      setIsEquipmentToolbarOpen: s.setIsEquipmentToolbarOpen,
    }))
  );

  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || window.innerHeight <= 520;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || window.innerHeight <= 520;
  });

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 1024 || window.innerHeight <= 520;
      setIsCompact(compact);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      label: t('toolSelect'),
      description: t('toolSelectDesc'),
      icon: MousePointer,
    },
    {
      id: 'pass',
      label: t('toolPass'),
      description: t('toolPassDesc'),
      icon: ArrowRight,
    },
    {
      id: 'run',
      label: t('toolRun'),
      description: t('toolRunDesc'),
      icon: MoveRight,
    },
    {
      id: 'dribble',
      label: t('toolDribble'),
      description: t('toolDribbleDesc'),
      icon: Spline,
    },
    {
      id: 'zone',
      label: t('toolZone'),
      description: t('toolZoneDesc'),
      icon: Square,
    },
    {
      id: 'eraser',
      label: t('toolEraser'),
      description: t('toolEraserDesc'),
      icon: Eraser,
    },
  ];

  const colors = [
    { color: '#f59e0b', name: t('colorAmber') },
    { color: '#ffffff', name: t('colorWhite') },
    { color: '#ef4444', name: t('colorRed') },
    { color: '#3b82f6', name: t('colorBlue') },
    { color: '#06b6d4', name: t('colorCyan') },
    { color: '#10b981', name: t('colorGreen') },
  ];

  if (isCollapsed) {
    return (
      <div data-tour="drawing-toolbar" className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-slate-900/95 hover:bg-slate-850 text-slate-200 border border-slate-700/80 shadow-xl p-2 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl font-semibold text-xs flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition-all"
          title="Buka Bilah Alat Gambar"
        >
          <PenTool className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline text-[11px] font-bold">Draw</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      data-tour="drawing-toolbar"
      className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-30 flex flex-col sm:flex-row items-center ${
        isCompact ? 'space-y-1 sm:space-y-0 sm:space-x-1' : 'space-y-1.5 sm:space-y-0 sm:space-x-1.5'
      } bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl sm:rounded-xl border border-slate-700/80 shadow-2xl select-none max-h-[85vh] overflow-y-auto sm:overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-left-2 duration-150`}
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        title="Sembunyikan Bilah Gambar"
      >
        <ChevronLeft className="hidden sm:block w-3.5 h-3.5" />
        <X className="sm:hidden w-3.5 h-3.5" />
      </button>

      {/* Tool Buttons */}
      <div className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-1 pb-1 sm:pb-0 pr-0 sm:pr-1 border-b sm:border-b-0 sm:border-r border-slate-700/70">
        {tools.map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;
          return (
            <Tooltip
              key={item.id}
              content={item.label}
              description={item.description}
              position="right"
            >
              <button
                onClick={() => setActiveTool(item.id)}
                className={`p-1.5 sm:p-2 rounded-lg text-xs flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Equipment Toolbar Toggle */}
      <div className="pb-1 sm:pb-0 pr-0 sm:pr-1 border-b sm:border-b-0 sm:border-r border-slate-700/70">
        <Tooltip
          content={t('equipmentTitle')}
          description={t('equipmentToolbarDesc')}
          position="right"
        >
          <button
            onClick={() => setIsEquipmentToolbarOpen(!isEquipmentToolbarOpen)}
            className={`p-1.5 sm:p-2 rounded-lg text-xs flex items-center justify-center transition-all ${
              isEquipmentToolbarOpen
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-[11px] font-semibold">Alat</span>
          </button>
        </Tooltip>
      </div>

      {/* Color Palette (visible when drawing tool is active) */}
      {activeTool !== 'select' && activeTool !== 'eraser' && (
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1.5 py-1 sm:py-0 px-0 sm:px-1.5 pr-0 sm:pr-1.5 border-b sm:border-b-0 sm:border-r border-slate-700/70">
          {colors.map((c) => (
            <Tooltip key={c.color} content={c.name} position="right">
              <button
                onClick={() => setActiveDrawingColor(c.color)}
                className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full transition-transform ${
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
          content={t('clearDrawings')}
          description={`${drawingCount} items`}
          position="right"
        >
          <button
            onClick={clearDrawings}
            className="p-1 sm:p-1.5 px-1.5 sm:px-2 rounded-lg text-[10px] sm:text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center gap-1 transition-colors"
          >
            <Trash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Clear ({drawingCount})</span>
          </button>
        </Tooltip>
      )}
    </div>
  );
};
