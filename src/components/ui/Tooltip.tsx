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
  const [effectivePosition, setEffectivePosition] = useState<'top' | 'bottom' | 'left' | 'right'>(position);
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const calculateCollision = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let targetPos = position;

    // 1. Vertical collision: If placed on top but too close to screen top (< 85px), flip to bottom!
    if (targetPos === 'top' && rect.top < 85) {
      targetPos = 'bottom';
    } else if (targetPos === 'bottom' && window.innerHeight - rect.bottom < 85) {
      targetPos = 'top';
    }

    // 2. Horizontal collision: Prevent tooltip from cutting off on left or right screen edges
    let hAlign: 'center' | 'left' | 'right' = 'center';
    if (targetPos === 'top' || targetPos === 'bottom') {
      if (rect.left < 90) {
        hAlign = 'left';
      } else if (window.innerWidth - rect.right < 140) {
        hAlign = 'right';
      }
    }

    setEffectivePosition(targetPos);
    setHorizontalAlign(hAlign);
  };

  const showTooltip = () => {
    if (!showTooltips) return;
    timeoutRef.current = window.setTimeout(() => {
      calculateCollision();
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

  // Smart Positioning classes based on effectivePosition and horizontalAlign
  let positionClasses = '';
  let arrowPositionClasses = '';

  if (effectivePosition === 'top') {
    if (horizontalAlign === 'left') {
      positionClasses = 'bottom-full left-0 mb-2.5';
      arrowPositionClasses = 'left-4 top-full -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent';
    } else if (horizontalAlign === 'right') {
      positionClasses = 'bottom-full right-0 mb-2.5';
      arrowPositionClasses = 'right-4 top-full translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent';
    } else {
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2.5';
      arrowPositionClasses = 'left-1/2 -translate-x-1/2 top-full border-t-slate-800 border-x-transparent border-b-transparent';
    }
  } else if (effectivePosition === 'bottom') {
    if (horizontalAlign === 'left') {
      positionClasses = 'top-full left-0 mt-2.5';
      arrowPositionClasses = 'left-4 bottom-full -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent';
    } else if (horizontalAlign === 'right') {
      positionClasses = 'top-full right-0 mt-2.5';
      arrowPositionClasses = 'right-4 bottom-full translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent';
    } else {
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2.5';
      arrowPositionClasses = 'left-1/2 -translate-x-1/2 bottom-full border-b-slate-800 border-x-transparent border-t-transparent';
    }
  } else if (effectivePosition === 'left') {
    positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2.5';
    arrowPositionClasses = 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent';
  } else if (effectivePosition === 'right') {
    positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2.5';
    arrowPositionClasses = 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent';
  }

  return (
    <div
      ref={containerRef}
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
          className={`absolute ${positionClasses} z-[70] pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150`}
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
              <span className="text-[10px] text-slate-400 font-normal leading-tight whitespace-normal">
                {description}
              </span>
            )}
          </div>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowPositionClasses}`}
          />
        </div>
      )}
    </div>
  );
};
