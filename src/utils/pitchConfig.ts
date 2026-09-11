import { PitchType, PitchView } from '../types/tactics';

/**
 * Common Pitch Specification for a sport category.
 * Serves as the Single Source of Truth for all pitch dimensions, markings, rules, and ratios.
 */
export interface SportPitchSpec {
  id: PitchType;
  name: string;
  category: 'football' | 'mini-soccer' | 'futsal';
  lengthMeters: number;
  widthMeters: number;
  goal: {
    widthMeters: number; // Post-to-post distance (vertical axis on canvas)
    depthMeters: number; // Net depth behind goal line (horizontal axis on canvas)
  };
  penaltyArea: {
    isCurvedFutsalD: boolean;
    depthMeters: number;
    widthMeters: number;
  };
  goalArea?: {
    hasGoalArea: boolean;
    depthMeters: number;
    widthMeters: number;
  };
  penaltySpots: {
    primaryDistMeters: number;
    hasSecondSpot: boolean;
    secondDistMeters?: number;
  };
  centerCircle: {
    radiusMeters: number;
  };
  penaltyArc?: {
    hasArc: boolean;
    radiusMeters: number;
    distRatio: number; // (depth - penaltySpot) / radius e.g. 5.5 / 9.15 or 4.0 / 7.0
  };
  cornerArc: {
    radiusMeters: number;
  };
  barrier: {
    defaultDistanceMeters: number;
  };
  lawnStripes: {
    fullCount: number;
    halfCount: number;
    thirdCount: number;
  };
  scaleRelative: {
    desktop: number;
    mobile: number;
  };
}

/**
 * Central Registry of Official Pitch Specifications:
 * - Sepak Bola (11v11): IFAB/FIFA standard (105m x 68m, Gawang 7.32m x 2.44m, Kotak 16.5m, Penalti 11m, Barrier 9.15m)
 * - Mini Soccer: WMF standard (60m x 40m, Gawang 5.0m x 1.8m, Kotak 12m, Penalti 8m, Barrier 7.0m)
 * - Futsal: FIFA Futsal standard (40m x 20m, Gawang 3.0m x 1.0m, D-Area 6m, Penalti 6m & 10m, Barrier 5.0m)
 */
export const SPORT_PITCH_SPECS: Record<PitchType, SportPitchSpec> = {
  football: {
    id: 'football',
    name: 'Sepak Bola (11 vs 11)',
    category: 'football',
    lengthMeters: 105,
    widthMeters: 68,
    goal: {
      widthMeters: 7.32,
      depthMeters: 2.44,
    },
    penaltyArea: {
      isCurvedFutsalD: false,
      depthMeters: 16.5,
      widthMeters: 40.32,
    },
    goalArea: {
      hasGoalArea: true,
      depthMeters: 5.5,
      widthMeters: 18.32,
    },
    penaltySpots: {
      primaryDistMeters: 11.0,
      hasSecondSpot: false,
    },
    centerCircle: {
      radiusMeters: 9.15,
    },
    penaltyArc: {
      hasArc: true,
      radiusMeters: 9.15,
      distRatio: 5.5 / 9.15,
    },
    cornerArc: {
      radiusMeters: 1.0,
    },
    barrier: {
      defaultDistanceMeters: 9.15,
    },
    lawnStripes: {
      fullCount: 12,
      halfCount: 6,
      thirdCount: 4,
    },
    scaleRelative: {
      desktop: 1.0,
      mobile: 1.0,
    },
  },

  'mini-soccer': {
    id: 'mini-soccer',
    name: 'Mini Soccer (7v7 / 8v8)',
    category: 'mini-soccer',
    lengthMeters: 60,
    widthMeters: 40,
    goal: {
      widthMeters: 5.0,
      depthMeters: 1.8,
    },
    penaltyArea: {
      isCurvedFutsalD: false,
      depthMeters: 12.0,
      widthMeters: 25.0,
    },
    goalArea: {
      hasGoalArea: true,
      depthMeters: 4.0,
      widthMeters: 13.0,
    },
    penaltySpots: {
      primaryDistMeters: 8.0,
      hasSecondSpot: false,
    },
    centerCircle: {
      radiusMeters: 7.0,
    },
    penaltyArc: {
      hasArc: true,
      radiusMeters: 7.0,
      distRatio: 4.0 / 7.0,
    },
    cornerArc: {
      radiusMeters: 1.0,
    },
    barrier: {
      defaultDistanceMeters: 7.0,
    },
    lawnStripes: {
      fullCount: 8,
      halfCount: 4,
      thirdCount: 3,
    },
    scaleRelative: {
      desktop: 1.0,
      mobile: 1.0,
    },
  },

  futsal: {
    id: 'futsal',
    name: 'Futsal (5 vs 5)',
    category: 'futsal',
    lengthMeters: 40,
    widthMeters: 20,
    goal: {
      widthMeters: 3.0,
      depthMeters: 1.0,
    },
    penaltyArea: {
      isCurvedFutsalD: true,
      depthMeters: 6.0,
      widthMeters: 15.0,
    },
    goalArea: {
      hasGoalArea: false,
      depthMeters: 0,
      widthMeters: 0,
    },
    penaltySpots: {
      primaryDistMeters: 6.0,
      hasSecondSpot: true,
      secondDistMeters: 10.0,
    },
    centerCircle: {
      radiusMeters: 3.0,
    },
    penaltyArc: {
      hasArc: false,
      radiusMeters: 0,
      distRatio: 1.0,
    },
    cornerArc: {
      radiusMeters: 0.25,
    },
    barrier: {
      defaultDistanceMeters: 5.0,
    },
    lawnStripes: {
      fullCount: 6,
      halfCount: 4,
      thirdCount: 2,
    },
    scaleRelative: {
      desktop: 1.0,
      mobile: 1.0,
    },
  },
};

/**
 * View configuration defining visible length fraction and normalized span.
 */
export interface PitchViewSpec {
  id: PitchView;
  label: string;
  lengthFraction: number; // 1 for full, 1/2 for half, 1/3 for third
  startFraction: number;  // Normalized start (0 for full, 0.5 for half, 0.6667 for third)
  endFraction: number;    // Normalized end (always 1.0 - attacking goal end)
  zoneColumnsVisible: number; // 6 for full, 3 for half, 2 for third
  zoneStartColIndex: number;  // 0 for full, 3 for half, 4 for third
}

export const PITCH_VIEW_SPECS: Record<PitchView, PitchViewSpec> = {
  full: {
    id: 'full',
    label: 'Full Pitch',
    lengthFraction: 1.0,
    startFraction: 0.0,
    endFraction: 1.0,
    zoneColumnsVisible: 6,
    zoneStartColIndex: 0,
  },
  half: {
    id: 'half',
    label: 'Half Pitch',
    lengthFraction: 0.5,
    startFraction: 0.5,
    endFraction: 1.0,
    zoneColumnsVisible: 3,
    zoneStartColIndex: 3, // Columns 3, 4, 5 (Zones 10 to 18)
  },
  third: {
    id: 'third',
    label: '1/3 Box Zoom',
    lengthFraction: 1 / 3,
    startFraction: 2 / 3,
    endFraction: 1.0,
    zoneColumnsVisible: 2,
    zoneStartColIndex: 4, // Columns 4, 5 (Zones 13 to 18, including Zone 14)
  },
};

/**
 * Returns sport specification by pitch type
 */
export function getPitchSpec(pitchType: PitchType): SportPitchSpec {
  return SPORT_PITCH_SPECS[pitchType] || SPORT_PITCH_SPECS.football;
}

/**
 * Returns visible pitch dimensions and true physical aspect ratio (Length / Width)
 */
export function getVisiblePitchDimensions(
  pitchType: PitchType,
  pitchView: PitchView
): {
  visibleLength: number;
  visibleWidth: number;
  aspectRatio: number;
  startMeter: number;
  endMeter: number;
} {
  const spec = getPitchSpec(pitchType);
  const viewSpec = PITCH_VIEW_SPECS[pitchView];

  const visibleLength = spec.lengthMeters * viewSpec.lengthFraction;
  const visibleWidth = spec.widthMeters;
  const aspectRatio = visibleLength / visibleWidth;

  const startMeter = spec.lengthMeters * viewSpec.startFraction;
  const endMeter = spec.lengthMeters * viewSpec.endFraction;

  return {
    visibleLength,
    visibleWidth,
    aspectRatio,
    startMeter,
    endMeter,
  };
}

/**
 * Tactical Zone Cell in the 18-Zone grid.
 * Maintains absolute real-world positions across Full, Half, and 1/3 Box views.
 * Zone 14 is always the Golden Playmaker Zone in front of the penalty box.
 */
export interface TacticalZoneCell {
  zoneNum: number;
  colIndex: number;
  rowIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isZone14: boolean;
  label: string;
}

/**
 * Calculates 18 Tactical Zones Grid adapted accurately for Full, Half, and 1/3 Box views.
 * - Full View: Shows all 6 columns (Zone 1 to 18).
 * - Half View: Shows the 3 attacking columns (Zone 10 to 18).
 * - 1/3 Box View: Shows the 2 final-third columns (Zone 13 to 18, with Zone 14 centrally positioned).
 */
export function calculateTacticalZones(
  pitchView: PitchView,
  pitchX: number,
  pitchY: number,
  pitchW: number,
  pitchH: number
): {
  cells: TacticalZoneCell[];
  colLines: number[]; // X coordinates for vertical dividing lines
  rowLines: number[]; // Y coordinates for horizontal dividing lines
} {
  const viewSpec = PITCH_VIEW_SPECS[pitchView];
  const numCols = viewSpec.zoneColumnsVisible;
  const startCol = viewSpec.zoneStartColIndex;
  const colW = pitchW / numCols;
  const rowH = pitchH / 3;

  const cells: TacticalZoneCell[] = [];

  for (let c = 0; c < numCols; c++) {
    const globalCol = startCol + c;
    for (let r = 0; r < 3; r++) {
      // 1-indexed zone number: columns 0-5, rows 0-2 -> zoneNum = globalCol * 3 + r + 1
      const zoneNum = globalCol * 3 + r + 1;
      const isZone14 = zoneNum === 14;
      const cellX = pitchX + c * colW;
      const cellY = pitchY + r * rowH;

      cells.push({
        zoneNum,
        colIndex: c,
        rowIndex: r,
        x: cellX,
        y: cellY,
        width: colW,
        height: rowH,
        isZone14,
        label: isZone14 ? '14 ★' : `${zoneNum}`,
      });
    }
  }

  // Vertical dividing lines inside the view
  const colLines: number[] = [];
  for (let i = 1; i < numCols; i++) {
    colLines.push(pitchX + i * colW);
  }

  // Horizontal dividing lines (always 2 lines for 3 rows)
  const rowLines: number[] = [pitchY + rowH, pitchY + 2 * rowH];

  return { cells, colLines, rowLines };
}
