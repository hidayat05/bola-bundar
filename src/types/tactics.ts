export type PitchType = 'football' | 'mini-soccer' | 'futsal';
export type PitchView = 'full' | 'half' | 'third';
export type PitchSurface = 'grass' | 'full-green' | 'turf' | 'wood' | 'blue' | 'dark-board';
export type TeamSide = 'home' | 'away' | 'neutral';
export type TeamDisplayMode = 'both' | 'single';
export type TokenStyle = 'jersey' | 'circle';
export type TargetZoneKey = 'near-post' | 'far-post' | 'penalty-spot' | 'edge-of-box' | 'cutback';

export type TacticalActionZoneType =
  | 'base'          // Posisi Dasar
  | 'overlap'       // Overlap Sayap
  | 'underlap'      // Underlap Half-Space
  | 'cover'         // Pelapis Pertahanan / Rest Defense
  | 'press'         // Step-Out Pressing
  | 'drop-in'       // Turun Menjemput Bola / Bentuk 3 Bek
  | 'channel-run'   // Tusukan Celah Bek
  | 'cut-inside'    // Potong ke Kotak Penalti
  | 'box-finish'    // Kotak Penalti Finishing
  | 'width'         // Melebar Menyusur Garis
  | 'paralela'      // Futsal Paralela
  | 'diagonal';     // Futsal Diagonal Cut

export interface PlayerActionZone {
  type: TacticalActionZoneType;
  label: string;
  bounds: {
    x: number;      // 0 - 100 (% lebar lapangan)
    y: number;      // 0 - 100 (% tinggi lapangan)
    width: number;
    height: number;
  };
  color: string;
}

export interface PlayerToken {
  id: string;
  team: TeamSide;
  number: number;
  name: string;
  x: number; // 0 - 100 percentage of pitch width
  y: number; // 0 - 100 percentage of pitch height
  rotation: number; // 0 - 360 degrees facing angle
  isBench: boolean;
  isGoalkeeper?: boolean;
  customColor?: string;
  customTextColor?: string;
  role?: string;
  isWall?: boolean;
  subStatus?: 'in' | 'out';
  activeActionZone?: PlayerActionZone | null;
  delay?: number; // Start delay in seconds (e.g. 0.0 - 2.0s) for realistic staggered/decoy runs
  sprintDuration?: number; // Optional duration in seconds for this player's run within the frame
}

export interface BallToken {
  id: string;
  x: number; // 0 - 100 percentage of pitch width
  y: number; // 0 - 100 percentage of pitch height
  rotation?: number; // rotation in degrees for rolling/spinning animation
  rotationAxis?: [number, number, number]; // 3D rolling axis [x, y, z]
  elevation?: number; // 0 (grounded) to 1 (max lofted height)
}

export type PositionalGridMode = 'none' | '5-corridors' | '20-zones';

export interface TeamConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  goalkeeperColor: string;
}

export type DrawingType = 'pass' | 'curved-pass' | 'lofted-pass' | 'run' | 'dribble' | 'zone';
export type ActiveTool = 'select' | 'pass' | 'curved-pass' | 'lofted-pass' | 'run' | 'dribble' | 'zone' | 'eraser';

export interface DrawingElement {
  id: string;
  type: DrawingType;
  points: number[]; // [x1, y1, x2, y2, ...] in normalized 0-100 coordinates
  color: string;
  dashed?: boolean;
  opacity?: number;
  width?: number;
  curveDepth?: number;
}

export type EquipmentType = 'cone' | 'mannequin' | 'pole' | 'mini-goal';

export interface EquipmentItem {
  id: string;
  type: EquipmentType;
  x: number; // 0 - 100 percentage of pitch width
  y: number; // 0 - 100 percentage of pitch height
  rotation: number; // 0 - 360 degrees
  color: string;
  label?: string;
}

export interface DrillMetadata {
  title: string;
  phase: 'all' | 'in-possession' | 'out-of-possession' | 'trans-attack' | 'trans-defend' | 'setpiece';
  dimensions?: string;
  duration?: string;
  playerCount?: string;
  objective?: string;
  coachingPoints: string[];
}

export type TacticalPhase =
  | 'attacking'
  | 'defending'
  | 'trans-attack'
  | 'trans-defend'
  | 'setpiece';

export interface TacticalKeyframe {
  id: string;
  name: string;
  phase?: TacticalPhase;
  strategyName?: string;
  strategyInstruction?: string;
  strategyPresetId?: string;
  players: PlayerToken[];
  ball: BallToken;
  drawings?: DrawingElement[];
  equipment?: EquipmentItem[];
  duration: number; // in seconds (for animation interpolation)
  activeSegmentIndex?: number; // active tweening segment during playback
  rawProgress?: number; // 0-1 progress within the active segment
}

export interface PitchDimensions {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  pitchRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  benchArea: {
    home: { x: number; y: number; width: number; height: number };
    away: { x: number; y: number; width: number; height: number };
  };
}

export interface FormationPreset {
  name: string;
  category?: string;
  description?: string;
  pitchType: PitchType;
  playerCount: number; // e.g. 5, 7, 8, 11
  positions: { x: number; y: number; role: string; number: number }[];
}

export interface TacticsExportData {
  version: string;
  exportedAt: string;
  appName: string;
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  gridColor?: string;
  showZones: boolean;
  zoneColor?: string;
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  frames: TacticalKeyframe[];
  equipment?: EquipmentItem[];
  drillNotes?: DrillMetadata;
}
