import React, { useState } from 'react';
import { Shield, Target, Flag, CircleDot, Trash2, X } from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';
import { EquipmentType } from '../../types/tactics';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../i18n/useTranslation';

export const EquipmentToolbar: React.FC = () => {
  const { t } = useTranslation();
  const {
    isEquipmentToolbarOpen,
    setIsEquipmentToolbarOpen,
    addEquipment,
    clearEquipment,
    equipment,
  } = useTacticsStore();

  const [activeColor, setActiveColor] = useState('#f59e0b');

  if (!isEquipmentToolbarOpen) return null;

  const equipmentItems: {
    type: EquipmentType;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      type: 'cone',
      label: t('coneName'),
      description: t('coneDesc'),
      icon: CircleDot,
    },
    {
      type: 'mannequin',
      label: t('mannequinName'),
      description: t('mannequinDesc'),
      icon: Shield,
    },
    {
      type: 'pole',
      label: t('poleName'),
      description: t('poleDesc'),
      icon: Flag,
    },
    {
      type: 'mini-goal',
      label: t('miniGoalName'),
      description: t('miniGoalDesc'),
      icon: Target,
    },
  ];

  const colors = [
    { color: '#f59e0b', name: t('colorAmber') },
    { color: '#ffffff', name: t('colorWhite') },
    { color: '#ef4444', name: t('colorRed') },
    { color: '#3b82f6', name: t('colorBlue') },
    { color: '#10b981', name: t('colorGreen') },
  ];

  return (
    <div className="absolute top-14 left-3 sm:top-16 sm:left-4 z-30 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col space-y-2.5 animate-in fade-in zoom-in-95 duration-150 select-none w-64">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs px-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Target className="w-4 h-4 text-amber-400" />
          <span>{t('equipmentTitle')}</span>
        </div>
        <button
          onClick={() => setIsEquipmentToolbarOpen(false)}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Equipment Spawn Buttons */}
      <div className="grid grid-cols-2 gap-1.5">
        {equipmentItems.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip
              key={item.type}
              content={`+ ${item.label}`}
              description={item.description}
              position="bottom"
            >
              <button
                onClick={() => addEquipment(item.type, 50, 50, activeColor)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 text-slate-200 text-xs font-semibold transition-all active:scale-95 text-left"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shadow-inner shrink-0"
                  style={{ backgroundColor: `${activeColor}22`, color: activeColor }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] leading-tight font-bold truncate">{item.label}</span>
                  <span className="text-[9px] text-slate-400">+ Add</span>
                </div>
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Color Palette for Equipment */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800 px-1">
        <span className="text-[10px] text-slate-400 font-medium">Color:</span>
        <div className="flex items-center gap-1.5">
          {colors.map((c) => (
            <button
              key={c.color}
              onClick={() => setActiveColor(c.color)}
              className={`w-4 h-4 rounded-full border transition-all ${
                activeColor === c.color
                  ? 'scale-125 border-white ring-1 ring-white/60 shadow'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Clear Equipment if any exists */}
      {equipment.length > 0 && (
        <button
          onClick={() => {
            if (window.confirm(t('clearEquipmentConfirm'))) {
              clearEquipment();
            }
          }}
          className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>{t('clearEquipment')} ({equipment.length})</span>
        </button>
      )}
    </div>
  );
};
