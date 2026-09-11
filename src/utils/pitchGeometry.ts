import { PitchType, PitchView } from '../types/tactics';
import { getPitchSpec, getVisiblePitchDimensions } from './pitchConfig';

export { getPitchSpec, getVisiblePitchDimensions };

export interface PitchLayout {
  containerWidth: number;
  containerHeight: number;
  pitchRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  benchRectHome: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  benchRectAway: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scale: number;
  aspectRatio: number;
}

export function getPitchRealDimensions(pitchType: PitchType): {
  lengthMeters: number;
  widthMeters: number;
} {
  const spec = getPitchSpec(pitchType);
  return { lengthMeters: spec.lengthMeters, widthMeters: spec.widthMeters };
}

export function calculatePitchLayout(
  width: number,
  height: number,
  pitchType: PitchType,
  pitchView: PitchView
): PitchLayout {
  const { aspectRatio } = getVisiblePitchDimensions(pitchType, pitchView);

  // Adaptive layout configuration to maximize pitch size between top and bottom bar
  const isShortScreen = height <= 520;
  const isMobile = width < 600 || isShortScreen;

  // Horizontal margins: compact margins to give maximum width while preserving run-off
  const marginX = isShortScreen ? 12 : (width < 500 ? 12 : (isMobile ? 16 : 20));

  // Vertical margins:
  // TopNavbar is directly above container (y=0). Pitch outer run-off extends 12px above pitchY.
  // Setting marginTop = 14px (or 10px on short screen) places run-off edge at y=2px directly under TopNavbar.
  const marginTop = isShortScreen ? 10 : 14;

  // Sideline Bench (Dugout) height & gap below pitch
  const gapPitchToBench = isShortScreen ? 4 : 8;
  const benchH = isShortScreen ? 22 : 28;
  const marginBottomPad = isShortScreen ? 4 : 6;
  const totalBottomArea = gapPitchToBench + benchH + marginBottomPad;

  // Available dimensions for pitch rendering
  const availableWidth = Math.max(120, width - marginX * 2);
  const availableHeight = Math.max(120, height - (marginTop + totalBottomArea));

  // Field size calculation: full 1.0 scale to maximize pitch visibility across all views
  let pitchW = availableWidth;
  let pitchH = pitchW / aspectRatio;

  if (pitchH > availableHeight) {
    pitchH = availableHeight;
    pitchW = pitchH * aspectRatio;
  }

  // Center horizontally within container
  const pitchX = (width - pitchW) / 2;

  // If height allows, keep pitch neatly aligned with tight top margin or subtly centered
  const pitchY = marginTop + Math.max(0, (availableHeight - pitchH) * 0.5);

  // Bench dugouts underneath the pitch
  const gapBetweenBenches = 8;
  const maxSingleBenchW = Math.max(100, Math.min(220, (pitchW - gapBetweenBenches) / 2));
  const benchW = Math.min(pitchW * 0.48, maxSingleBenchW);
  const benchY = pitchY + pitchH + gapPitchToBench;

  const benchRectHome = {
    x: pitchX,
    y: benchY,
    width: benchW,
    height: benchH,
  };

  const benchRectAway = {
    x: pitchX + pitchW - benchW,
    y: benchY,
    width: benchW,
    height: benchH,
  };

  return {
    containerWidth: width,
    containerHeight: height,
    pitchRect: {
      x: pitchX,
      y: pitchY,
      width: pitchW,
      height: pitchH,
    },
    benchRectHome,
    benchRectAway,
    scale: pitchW / 1000,
    aspectRatio,
  };
}

export function normToCanvas(
  normX: number,
  normY: number,
  isBench: boolean,
  team: 'home' | 'away' | 'neutral',
  layout: PitchLayout
): { x: number; y: number } {
  if (isBench) {
    const bench = team === 'home' ? layout.benchRectHome : layout.benchRectAway;
    // Map normalized bench coordinates or place sequentially
    // normX between 0 and 100 inside bench width
    const bx = bench.x + (normX / 100) * bench.width;
    const by = bench.y + bench.height / 2;
    return { x: bx, y: by };
  }

  const { pitchRect } = layout;
  return {
    x: pitchRect.x + (normX / 100) * pitchRect.width,
    y: pitchRect.y + (normY / 100) * pitchRect.height,
  };
}

export function canvasToNorm(
  canvasX: number,
  canvasY: number,
  layout: PitchLayout
): { normX: number; normY: number; isBench: boolean; teamBench?: 'home' | 'away' } {
  const { pitchRect, benchRectHome, benchRectAway } = layout;

  // Check if inside home bench
  if (
    canvasX >= benchRectHome.x &&
    canvasX <= benchRectHome.x + benchRectHome.width &&
    canvasY >= benchRectHome.y &&
    canvasY <= benchRectHome.y + benchRectHome.height
  ) {
    const normX = Math.max(
      10,
      Math.min(90, ((canvasX - benchRectHome.x) / benchRectHome.width) * 100)
    );
    return { normX, normY: 106, isBench: true, teamBench: 'home' };
  }

  // Check if inside away bench
  if (
    canvasX >= benchRectAway.x &&
    canvasX <= benchRectAway.x + benchRectAway.width &&
    canvasY >= benchRectAway.y &&
    canvasY <= benchRectAway.y + benchRectAway.height
  ) {
    const normX = Math.max(
      10,
      Math.min(90, ((canvasX - benchRectAway.x) / benchRectAway.width) * 100)
    );
    return { normX, normY: 106, isBench: true, teamBench: 'away' };
  }

  // Otherwise pitch area
  const normX = Math.max(
    0,
    Math.min(100, ((canvasX - pitchRect.x) / pitchRect.width) * 100)
  );
  const normY = Math.max(
    0,
    Math.min(100, ((canvasY - pitchRect.y) / pitchRect.height) * 100)
  );

  return { normX, normY, isBench: false };
}
