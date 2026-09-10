import { PitchType, PitchView } from '../types/tactics';

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

export function calculatePitchLayout(
  width: number,
  height: number,
  pitchType: PitchType,
  pitchView: PitchView
): PitchLayout {
  // Real-world aspect ratios
  let aspectRatio = 1.54; // Football 105m x 68m (~1.544)
  if (pitchType === 'mini-soccer') {
    aspectRatio = 1.5; // Mini-soccer 60m x 40m
  } else if (pitchType === 'futsal') {
    aspectRatio = 2.0; // Futsal 40m x 20m
  }

  if (pitchView === 'half') {
    // Half pitch aspect ratio (length is halved)
    aspectRatio = aspectRatio / 2; // e.g. 0.77 for football half pitch
    // If container is wider than tall, half pitch can be oriented horizontally or vertically
    // In horizontal mode, 1:1 or 1.2:1
    aspectRatio = 1.2;
  }

  // Margin allocation adaptive for mobile screens
  const isMobile = width < 600;
  const marginX = isMobile ? (width < 400 ? 10 : 16) : 36;
  const marginTop = isMobile ? 12 : 20;
  const marginBottom = isMobile ? 62 : 76; // Space for bench dock

  const availableWidth = Math.max(160, width - marginX * 2);
  const availableHeight = Math.max(120, height - (marginTop + marginBottom));

  let pitchW = availableWidth;
  let pitchH = pitchW / aspectRatio;

  if (pitchH > availableHeight) {
    pitchH = availableHeight;
    pitchW = pitchH * aspectRatio;
  }

  const pitchX = (width - pitchW) / 2;
  const pitchY = marginTop + (availableHeight - pitchH) / 2;

  // Bench dugouts underneath the pitch
  const benchW = pitchW * 0.47;
  const benchH = isMobile ? 44 : 50;
  const benchY = pitchY + pitchH + (isMobile ? 8 : 12);

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
