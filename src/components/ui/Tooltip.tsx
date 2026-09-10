import React, { useState, useRef, useEffect } from 'react';
import { useTacticsStore } from '../../store/useTacticsStore';

interface TooltipProps {
  content?: string;
  title?: string;
  description?: string;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  description,
  shortcut,
  position = 'top',
  children,
  delay = 180,
}) => {
  const label = title || content || '';
  const showTooltips = useTacticsStore((s) => s.showTooltips);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (!showTooltips) return;
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!showTooltips) {
    return children;
  }

  // Positioning classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent',
  }[position];

  return (
    <div
      className={`relative inline-flex items-center transition-all duration-200 rounded-lg ${
        isVisible
          ? 'ring-2 ring-emerald-400/90 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
          : ''
      }`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute ${positionClasses} z-50 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="bg-slate-900/98 backdrop-blur-md text-slate-100 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-2xl flex flex-col gap-0.5 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{label}</span>
              {shortcut && (
                <span className="text-[10px] bg-slate-800 border border-slate-700 px-1 py-0.2 rounded font-mono text-slate-300">
                  {shortcut}
                </span>
              )}
            </div>
            {description && (
              <span className="text-[10px] text-slate-400 font-normal leading-tight">
                {description}
              </span>
            )}
          </div>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses}`}
          />
        </div>
      )}
    </div>
  );
};
