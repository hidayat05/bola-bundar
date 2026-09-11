import { PitchType, PitchView, PlayerToken, BallToken, TargetZoneKey } from '../types/tactics';
import { PitchLayout, normToCanvas, getPitchRealDimensions } from './pitchGeometry';

export { getPitchRealDimensions };
export type PitchRealDimensions = ReturnType<typeof getPitchRealDimensions>;

import { getPitchSpec, getVisiblePitchDimensions } from './pitchConfig';

/**
 * Real-world length (in meters) represented by the canvas pitch width depending on view mode
 */
export function getVisiblePitchLengthMeters(pitchType: PitchType, pitchView: PitchView): number {
  return getVisiblePitchDimensions(pitchType, pitchView).visibleLength;
}

/**
 * Real-world width (in meters) of the pitch
 */
export function getVisiblePitchWidthMeters(pitchType: PitchType): number {
  return getPitchSpec(pitchType).widthMeters;
}

/**
 * Default official distance barrier (in meters) strictly per sport:
 * - Football (11v11): 9.15m (10 yards)
 * - Mini-Soccer: 7.0m
 * - Futsal: 5.0m
 */
export function getDefaultBarrierDistance(pitchType: PitchType): number {
  return getPitchSpec(pitchType).barrier.defaultDistanceMeters;
}

/**
 * Returns horizontal and vertical pixels per physical meter (X and Y)
 */
export function getPixelsPerMeter2D(
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView
): { ppmX: number; ppmY: number } {
  const { visibleLength, visibleWidth } = getVisiblePitchDimensions(pitchType, pitchView);
  const ppmX = layout.pitchRect.width / Math.max(1, visibleLength);
  const ppmY = layout.pitchRect.height / Math.max(1, visibleWidth);
  return { ppmX, ppmY };
}

/**
 * Calculates canvas pixels per physical meter horizontally
 */
export function getPixelsPerMeter(
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView
): number {
  return getPixelsPerMeter2D(layout, pitchType, pitchView).ppmX;
}

export interface SportPitchMarkings {
  goalWidth: number; // Height on canvas (post-to-post)
  goalDepth: number; // Width on canvas (net depth behind goal line)
  hasGoalArea: boolean;
  goalAreaWidth: number;
  goalAreaDepth: number;
  penaltyBoxWidth: number;
  penaltyBoxDepth: number;
  isFutsalPenaltyArea: boolean;
  penaltySpotDist: number; // Distance from goal line
  hasSecondPenaltySpot: boolean;
  secondPenaltyDist: number; // Futsal 10m
  centerRadius: number;
  hasPenaltyArc: boolean;
  penaltyArcDistRatio: number; // (5.5 / 9.15 or 4.0 / 7.0)
  cornerArcRadius: number;
}

/**
 * Calculates official, sport-specific pitch markings strictly based on real IFAB/FIFA/WMF regulations:
 * Uses SPORT_PITCH_SPECS common settings module as single source of truth.
 */
export function getSportPitchMarkings(
  pitchType: PitchType,
  pitchView: PitchView,
  w: number,
  h: number
): SportPitchMarkings {
  const spec = getPitchSpec(pitchType);
  const { visibleLength, visibleWidth } = getVisiblePitchDimensions(pitchType, pitchView);

  const ppmX = w / Math.max(1, visibleLength);
  const ppmY = h / Math.max(1, visibleWidth);

  const goalWidth = spec.goal.widthMeters * ppmY;
  const goalDepth = spec.goal.depthMeters * ppmX;

  const penaltyBoxWidth = spec.penaltyArea.widthMeters * ppmY;
  const penaltyBoxDepth = spec.penaltyArea.depthMeters * ppmX;

  const hasGoalArea = spec.goalArea?.hasGoalArea ?? false;
  const goalAreaWidth = (spec.goalArea?.widthMeters ?? 0) * ppmY;
  const goalAreaDepth = (spec.goalArea?.depthMeters ?? 0) * ppmX;

  const penaltySpotDist = spec.penaltySpots.primaryDistMeters * ppmX;
  const hasSecondPenaltySpot = spec.penaltySpots.hasSecondSpot;
  const secondPenaltyDist = (spec.penaltySpots.secondDistMeters ?? 0) * ppmX;

  const centerRadius = spec.centerCircle.radiusMeters * ppmY;
  const hasPenaltyArc = spec.penaltyArc?.hasArc ?? false;
  const penaltyArcDistRatio = spec.penaltyArc?.distRatio ?? 1.0;

  const cornerArcRadius = Math.max(
    pitchType === 'futsal' ? 7 : 10,
    Math.round(spec.cornerArc.radiusMeters * ppmY)
  );

  return {
    goalWidth,
    goalDepth,
    hasGoalArea,
    goalAreaWidth,
    goalAreaDepth,
    penaltyBoxWidth,
    penaltyBoxDepth,
    isFutsalPenaltyArea: spec.penaltyArea.isCurvedFutsalD,
    penaltySpotDist,
    hasSecondPenaltySpot,
    secondPenaltyDist,
    centerRadius,
    hasPenaltyArc,
    penaltyArcDistRatio,
    cornerArcRadius,
  };
}

/**
 * Calculates circular barrier radius in canvas pixels.
 * Strictly maintains the true ratio between the barrier circle area and the real original pitch area:
 * - Sepak Bola (11v11): 105m x 68m (7,140 m²) -> Barrier 9.15m (area 263.0 m², ratio = 3.68% of pitch area)
 * - Mini Soccer: 60m x 40m (2,400 m²) -> Barrier 7.0m (area 153.9 m², ratio = 6.41% of pitch area)
 * - Futsal: 40m x 20m (800 m²) -> Barrier 5.0m (area 78.5 m², ratio = 9.82% of pitch area)
 *
 * Linear pixel radius formula based on visible field area:
 * radiusPixels = distanceMeters * sqrt((pitchW * pitchH) / visiblePitchAreaMeters)
 */
export function getBarrierRadiusPixels(
  distanceMeters: number,
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView
): number {
  const { widthMeters } = getPitchRealDimensions(pitchType);
  const visibleLength = getVisiblePitchLengthMeters(pitchType, pitchView);
  const visibleAreaMeters = visibleLength * widthMeters;
  const canvasArea = layout.pitchRect.width * layout.pitchRect.height;
  const pixelsPerMeter = Math.sqrt(canvasArea / Math.max(1, visibleAreaMeters));
  return distanceMeters * pixelsPerMeter;
}

export interface PlayerDistanceCheck {
  player: PlayerToken;
  canvasX: number;
  canvasY: number;
  distanceMeters: number;
  distancePixels: number;
  isViolating: boolean;
}

/**
 * Checks all active defending players against the distance barrier centered at the ball.
 * Uses Euclidean canvas distance against the circular barrier radius, ensuring that
 * what the user sees on screen matches the violation status 1:1.
 */
export function calculatePlayerDistancesToBall(
  players: PlayerToken[],
  ball: BallToken,
  barrierDistanceMeters: number,
  attackingTeam: 'home' | 'away',
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView
): {
  violatingDefenders: PlayerDistanceCheck[];
  legalDefenders: PlayerDistanceCheck[];
  allDefenders: PlayerDistanceCheck[];
} {
  const radius = getBarrierRadiusPixels(barrierDistanceMeters, layout, pitchType, pitchView);
  const ballCanvas = normToCanvas(ball.x, ball.y, false, 'neutral', layout);

  const defendingTeam = attackingTeam === 'home' ? 'away' : 'home';
  // Exclude bench players
  const activeDefenders = players.filter((p) => p.team === defendingTeam && !p.isBench);

  const violatingDefenders: PlayerDistanceCheck[] = [];
  const legalDefenders: PlayerDistanceCheck[] = [];
  const allDefenders: PlayerDistanceCheck[] = [];

  for (const player of activeDefenders) {
    const playerCanvas = normToCanvas(player.x, player.y, false, player.team, layout);

    // Canvas Euclidean distance from ball to player
    const distPx = Math.hypot(playerCanvas.x - ballCanvas.x, playerCanvas.y - ballCanvas.y);

    // Distance in physical meters directly relative to the circle radius
    const distMeters =
      radius > 0
        ? Math.round((distPx / radius) * barrierDistanceMeters * 10) / 10
        : barrierDistanceMeters;

    // A defender inside the visual circle perimeter violates the distance rule
    const isViolating = distPx < radius - 2;

    const check: PlayerDistanceCheck = {
      player,
      canvasX: playerCanvas.x,
      canvasY: playerCanvas.y,
      distanceMeters: distMeters,
      distancePixels: distPx,
      isViolating,
    };

    allDefenders.push(check);
    if (isViolating) {
      violatingDefenders.push(check);
    } else {
      legalDefenders.push(check);
    }
  }

  // Sort violating defenders from closest to farthest
  violatingDefenders.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return { violatingDefenders, legalDefenders, allDefenders };
}

/**
 * Calculates defensive wall positions standing shoulder-to-shoulder on the circular legal distance barrier
 * perpendicular to the ball-to-goal vector, facing the ball.
 */
export function calculateDefensiveWall(
  ball: BallToken,
  defenders: PlayerToken[],
  playerCount: number,
  barrierDistanceMeters: number,
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView,
  defendingTeam: 'home' | 'away'
): PlayerToken[] {
  if (defenders.length === 0 || playerCount <= 0) return [];

  const radius = getBarrierRadiusPixels(barrierDistanceMeters, layout, pitchType, pitchView);
  const B = normToCanvas(ball.x, ball.y, false, 'neutral', layout);

  // Goal position being defended
  let Gx = layout.pitchRect.x + layout.pitchRect.width;
  const Gy = layout.pitchRect.y + layout.pitchRect.height / 2;

  if (pitchView === 'full' && defendingTeam === 'home') {
    Gx = layout.pitchRect.x;
  }

  // Unit vector from ball to goal
  const dx = Gx - B.x;
  const dy = Gy - B.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  // Perpendicular vector for the wall line (shoulder line)
  const nx = -uy;
  const ny = ux;

  // Center of the wall stands exactly on the circular distance barrier
  const wallCenterX = B.x + ux * radius;
  const wallCenterY = B.y + uy * radius;

  // Player shoulder-to-shoulder spacing in canvas pixels (~0.75m)
  const { widthMeters } = getPitchRealDimensions(pitchType);
  const visibleLength = getVisiblePitchLengthMeters(pitchType, pitchView);
  const visibleAreaMeters = visibleLength * widthMeters;
  const canvasArea = layout.pitchRect.width * layout.pitchRect.height;
  const ppm = Math.sqrt(canvasArea / Math.max(1, visibleAreaMeters));
  const spacingMeters = pitchType === 'futsal' ? 0.65 : 0.75;
  const spacingPixels = Math.max(16, Math.min(32, spacingMeters * ppm));

  const N = Math.min(playerCount, defenders.length);
  const selectedDefenders = defenders.slice(0, N);

  return selectedDefenders.map((player, i) => {
    const offset = (i - (N - 1) / 2) * spacingPixels;
    const px = wallCenterX + nx * offset;
    const py = wallCenterY + ny * offset;

    // Convert canvas coordinates back to normalized (0-100)
    const normX = ((px - layout.pitchRect.x) / layout.pitchRect.width) * 100;
    const normY = ((py - layout.pitchRect.y) / layout.pitchRect.height) * 100;

    // Facing angle towards the ball
    const rad = Math.atan2(B.y - py, B.x - px);
    const deg = ((rad * 180) / Math.PI + 360) % 360;

    return {
      ...player,
      x: Math.max(1, Math.min(99, Math.round(normX * 10) / 10)),
      y: Math.max(1, Math.min(99, Math.round(normY * 10) / 10)),
      rotation: Math.round(deg),
      isBench: false,
      isWall: true,
    };
  });
}

export interface TargetZone {
  id: TargetZoneKey;
  name: string;
  shortName: string;
  description: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Calculates landing target zones in the attacking penalty box
 * (Near Post, Far Post, Penalty Spot, Edge of Box / D-Arc, Cutback Zone)
 */
export function calculateTargetZones(
  layout: PitchLayout,
  pitchType: PitchType,
  pitchView: PitchView,
  ball: BallToken
): TargetZone[] {
  const { pitchRect } = layout;
  const { x, y, width: w, height: h } = pitchRect;

  const markings = getSportPitchMarkings(pitchType, pitchView, w, h);
  const penSpotY = y + h / 2;
  const goalLineX = x + w;

  const dArcRadius = getBarrierRadiusPixels(pitchType === 'mini-soccer' ? 7.0 : 9.15, layout, pitchType, pitchView);
  const dRatio = markings.penaltyArcDistRatio;
  const boxLineX = x + w - markings.penaltyBoxDepth;
  const penSpotX = pitchType === 'futsal' ? x + w - markings.penaltySpotDist : boxLineX + dArcRadius * dRatio;

  const goalAreaDepth = markings.hasGoalArea ? markings.goalAreaDepth : markings.penaltyBoxDepth * 0.4;
  const goalAreaHeight = markings.hasGoalArea ? markings.goalAreaWidth : markings.penaltyBoxWidth * 0.5;
  const penaltyBoxDepth = markings.penaltyBoxDepth;
  const penaltyBoxHeight = markings.penaltyBoxWidth;

  // Determine near post vs far post based on real goal post positions
  const isBallTop = ball.y <= 50;
  const topPostY = penSpotY - markings.goalWidth * 0.5;
  const btmPostY = penSpotY + markings.goalWidth * 0.5;

  const nearPostY = isBallTop ? topPostY : btmPostY;
  const farPostY = isBallTop ? btmPostY : topPostY;

  const postWidth = Math.max(26, markings.hasGoalArea ? markings.goalAreaDepth * 1.1 : markings.penaltyBoxDepth * 0.35);
  const postHeight = Math.max(22, markings.goalWidth * 0.65);
  const postsX = goalLineX - postWidth * 0.95;

  const zones: TargetZone[] = [
    {
      id: 'near-post',
      name: 'Tiang Dekat (Near Post)',
      shortName: 'Near Post',
      description: 'Area tiang dekat untuk flick-on header, sontekan kilat, atau lari tarik bek lawan.',
      color: '#10b981',
      x: postsX,
      y: nearPostY - postHeight / 2,
      width: postWidth,
      height: postHeight,
      centerX: postsX + postWidth / 2,
      centerY: nearPostY,
    },
    {
      id: 'far-post',
      name: 'Tiang Jauh (Far Post / Tiang 2)',
      shortName: 'Far Post (Tiang 2)',
      description: 'Area tiang kedua untuk tap-in bebas, back-post header, atau second ball.',
      color: '#06b6d4',
      x: postsX,
      y: farPostY - postHeight / 2,
      width: postWidth,
      height: postHeight,
      centerX: postsX + postWidth / 2,
      centerY: farPostY,
    },
    {
      id: 'penalty-spot',
      name: 'Titik Penalti (Central Box)',
      shortName: 'Titik Penalti',
      description: 'Titik penalti tengah kotak penalti untuk tembakan first-time atau cutback.',
      color: '#f59e0b',
      x: penSpotX - Math.max(30, goalAreaDepth * 0.9) / 2,
      y: penSpotY - Math.max(28, goalAreaHeight * 0.55) / 2,
      width: Math.max(30, goalAreaDepth * 0.9),
      height: Math.max(28, goalAreaHeight * 0.55),
      centerX: penSpotX,
      centerY: penSpotY,
    },
    {
      id: 'edge-of-box',
      name: 'Luar Kotak (Edge of Box / D-Arc)',
      shortName: 'Luar Kotak (D-Arc)',
      description: 'Area D-busur kotak penalti untuk second ball rebound atau tendangan keras jarak jauh.',
      color: '#a855f7',
      x:
        (pitchType === 'futsal'
          ? penSpotX - penaltyBoxDepth * 0.42
          : (x + w - penaltyBoxDepth) - (dArcRadius * (1 - dRatio)) / 2) -
        (pitchType === 'futsal' ? Math.max(32, goalAreaDepth * 1.1) : Math.max(34, dArcRadius * (1 - dRatio) * 1.3)) / 2,
      y: penSpotY - (pitchType === 'futsal' ? Math.max(34, penaltyBoxHeight * 0.45) : Math.max(34, dArcRadius * 1.4)) / 2,
      width: pitchType === 'futsal' ? Math.max(32, goalAreaDepth * 1.1) : Math.max(34, dArcRadius * (1 - dRatio) * 1.3),
      height: pitchType === 'futsal' ? Math.max(34, penaltyBoxHeight * 0.45) : Math.max(34, dArcRadius * 1.4),
      centerX:
        pitchType === 'futsal'
          ? penSpotX - penaltyBoxDepth * 0.42
          : (x + w - penaltyBoxDepth) - (dArcRadius * (1 - dRatio)) / 2,
      centerY: penSpotY,
    },
    {
      id: 'cutback',
      name: 'Zona Cutback (Tarik Mendatar)',
      shortName: 'Zona Cutback',
      description: 'Ruang tarik umpan silang mendatar menyusur tanah dari garis akhir (byline).',
      color: '#f43f5e',
      x: (penSpotX + (goalLineX - goalAreaDepth)) / 2 - Math.max(28, goalAreaDepth * 0.85) / 2,
      y: (isBallTop ? penSpotY - goalAreaHeight * 0.15 : penSpotY + goalAreaHeight * 0.15) - Math.max(28, goalAreaHeight * 0.6) / 2,
      width: Math.max(28, goalAreaDepth * 0.85),
      height: Math.max(28, goalAreaHeight * 0.6),
      centerX: (penSpotX + (goalLineX - goalAreaDepth)) / 2,
      centerY: isBallTop ? penSpotY - goalAreaHeight * 0.15 : penSpotY + goalAreaHeight * 0.15,
    },
  ];

  return zones;
}

