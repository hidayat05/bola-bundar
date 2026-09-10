export type PitchType = 'football' | 'mini-soccer' | 'futsal';
export type PitchView = 'full' | 'half';
export type PitchSurface = 'grass' | 'turf' | 'wood' | 'blue';
export type TeamSide = 'home' | 'away' | 'neutral';

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
}

export interface BallToken {
  id: string;
  x: number; // 0 - 100 percentage of pitch width
  y: number; // 0 - 100 percentage of pitch height
}

export interface TeamConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  goalkeeperColor: string;
}

export type DrawingType = 'pass' | 'run' | 'dribble' | 'zone';

export interface DrawingElement {
  id: string;
  type: DrawingType;
  points: number[]; // [x1, y1, x2, y2, ...]
  color: string;
  dashed?: boolean;
  opacity?: number;
}

export interface TacticalKeyframe {
  id: string;
  name: string;
  players: PlayerToken[];
  ball: BallToken;
  drawings?: DrawingElement[];
  duration: number; // in seconds (for animation interpolation)
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
  pitchType: PitchType;
  playerCount: number; // e.g. 5, 7, 8, 11
  positions: { x: number; y: number; role: string; number: number }[];
}
