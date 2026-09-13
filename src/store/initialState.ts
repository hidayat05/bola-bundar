import {
  DrillMetadata,
  PitchType,
  TacticalKeyframe,
  TeamConfig,
} from '../types/tactics';
import { generateInitialSquad } from '../utils/formations';

export const DEFAULT_DRILL_NOTES: DrillMetadata = {
  title: 'Sesi Taktik & Latihan',
  phase: 'in-possession',
  dimensions: '105m x 68m',
  duration: '20 Menit',
  playerCount: '11 vs 11',
  objective: 'Membangun serangan dari lini belakang (Deep Build-up) & sirkulasi bola vertikal.',
  coachingPoints: [
    'Buka lebar posisi bek sayap dan sudut tubuh terbuka (open body shape).',
    'Gelandang bertahan turun membentuk segitiga passing (passing triangle).',
    'Scanning situasi dan opsi rekan sebelum menerima bola.',
  ],
};

export const DEFAULT_HOME_TEAM: TeamConfig = {
  name: 'Home Red',
  primaryColor: '#ef4444',
  secondaryColor: '#ffffff',
  textColor: '#ffffff',
  goalkeeperColor: '#eab308',
};

export const DEFAULT_AWAY_TEAM: TeamConfig = {
  name: 'Away Blue',
  primaryColor: '#2563eb',
  secondaryColor: '#ffffff',
  textColor: '#ffffff',
  goalkeeperColor: '#10b981',
};

export function createInitialKeyframe(pitchType: PitchType): TacticalKeyframe {
  const homeSquad = generateInitialSquad('home', pitchType, undefined, 3);
  const awaySquad = generateInitialSquad('away', pitchType, undefined, 3);

  return {
    id: `frame-${Date.now()}-1`,
    name: 'Frame 1',
    phase: 'attacking',
    strategyName: 'Build-up 3-2-4-1 (Inverted Full-back)',
    strategyInstruction: 'LB masuk ke pivot ganda samping #6, bek tengah melebar, winger membuka garis sentuh lebar!',
    strategyPresetId: 'build-up-3241',
    players: [...homeSquad, ...awaySquad],
    ball: {
      id: 'ball-1',
      x: 50,
      y: 50,
    },
    duration: 1.5,
  };
}
