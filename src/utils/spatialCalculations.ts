import { PitchType, PlayerToken, TeamSide } from '../types/tactics';
import { getPitchSpec } from './pitchConfig';

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Computes the 2D Convex Hull of a set of points using Andrew's Monotone Chain algorithm.
 * Returns vertices in counter-clockwise order.
 */
export function getConvexHull(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return [...points];

  // Sort points lexicographically by x, then by y
  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const cross = (o: Point2D, a: Point2D, b: Point2D) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  // Lower hull
  const lower: Point2D[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Upper hull
  const upper: Point2D[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove the last point of each half because it's repeated
  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

/**
 * Calculates real-world polygon area in square meters (m²) using Shoelace formula.
 * Input coordinates are normalized percentages (0 - 100).
 */
export function calculateMetricPolygonArea(normPoints: Point2D[], pitchType: PitchType): number {
  if (normPoints.length < 3) return 0;

  const spec = getPitchSpec(pitchType);
  const pitchLength = spec.lengthMeters; // e.g. 105, 60, 40
  const pitchWidth = spec.widthMeters;   // e.g. 68, 40, 20

  // Convert percentage points to meters
  const meterPoints = normPoints.map((p) => ({
    x: (p.x / 100) * pitchLength,
    y: (p.y / 100) * pitchWidth,
  }));

  // Shoelace formula
  let area = 0;
  const n = meterPoints.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += meterPoints[i].x * meterPoints[j].y;
    area -= meterPoints[j].x * meterPoints[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Computes polygon centroid in normalized percentage coordinates.
 */
export function getPolygonCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 50, y: 50 };
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

/**
 * Provides a tactical assessment of team compactness based on area (m²).
 */
export function getCompactnessRating(
  areaM2: number,
  pitchType: PitchType
): { rating: 'Sangat Kompak' | 'Kompak Seimbang' | 'Renggang'; color: string; advice: string } {
  const spec = getPitchSpec(pitchType);
  const totalPitchArea = spec.lengthMeters * spec.widthMeters;
  const coverageRatio = areaM2 / totalPitchArea;

  if (coverageRatio < 0.12) {
    return {
      rating: 'Sangat Kompak',
      color: '#10b981', // Emerald
      advice: 'Blok sangat padat, meminimalkan ruang antar lini.',
    };
  } else if (coverageRatio <= 0.22) {
    return {
      rating: 'Kompak Seimbang',
      color: '#38bdf8', // Sky
      advice: 'Jarak antar pemain ideal untuk sirkulasi dan transisi.',
    };
  } else {
    return {
      rating: 'Renggang',
      color: '#f59e0b', // Amber
      advice: 'Tim tersebar lebar. Rawan celah saat transisi bertahan.',
    };
  }
}

/**
 * Extracts defensive chain (backline) for a given team:
 * Filters out Goalkeeper and Bench players, picks the 4 deepest defenders,
 * and orders them from flank to flank (by Y-coordinate).
 */
export function getDefensiveChain(players: PlayerToken[], teamSide: TeamSide): PlayerToken[] {
  const activeOutfield = players.filter(
    (p) => p.team === teamSide && !p.isBench && !p.isGoalkeeper
  );

  if (activeOutfield.length < 2) return [];

  // Determine defending goal direction:
  // Usually Home defends Left (x near 0), Away defends Right (x near 100)
  const isHome = teamSide === 'home';
  const sortedByDepth = [...activeOutfield].sort((a, b) => (isHome ? a.x - b.x : b.x - a.x));

  // Take the 4 deepest defenders (or fewer if fewer outfielders)
  const defenderCount = Math.min(4, Math.max(2, Math.floor(activeOutfield.length / 2)));
  const defenders = sortedByDepth.slice(0, defenderCount);

  // Order from top touchline to bottom touchline (by y coordinate)
  return defenders.sort((a, b) => a.y - b.y);
}
