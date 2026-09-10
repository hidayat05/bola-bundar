import { FormationPreset, PitchType, PlayerToken, TeamSide } from '../types/tactics';

export const FORMATIONS_11V11: FormationPreset[] = [
  {
    name: '4-3-3',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 30, y: 50, role: 'CDM', number: 6 },
      { x: 36, y: 32, role: 'CM', number: 8 },
      { x: 36, y: 68, role: 'CM', number: 10 },
      { x: 44, y: 18, role: 'LW', number: 11 },
      { x: 46, y: 50, role: 'ST', number: 9 },
      { x: 44, y: 82, role: 'RW', number: 7 },
    ],
  },
  {
    name: '4-4-2',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 34, y: 18, role: 'LM', number: 11 },
      { x: 32, y: 38, role: 'CM', number: 6 },
      { x: 32, y: 62, role: 'CM', number: 8 },
      { x: 34, y: 82, role: 'RM', number: 7 },
      { x: 45, y: 40, role: 'ST', number: 9 },
      { x: 45, y: 60, role: 'ST', number: 10 },
    ],
  },
  {
    name: '3-5-2',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 18, y: 28, role: 'CB', number: 3 },
      { x: 16, y: 50, role: 'CB', number: 4 },
      { x: 18, y: 72, role: 'CB', number: 5 },
      { x: 30, y: 14, role: 'LWB', number: 6 },
      { x: 28, y: 50, role: 'CDM', number: 8 },
      { x: 35, y: 35, role: 'CAM', number: 10 },
      { x: 35, y: 65, role: 'CM', number: 16 },
      { x: 30, y: 86, role: 'RWB', number: 2 },
      { x: 45, y: 40, role: 'ST', number: 9 },
      { x: 45, y: 60, role: 'ST', number: 11 },
    ],
  },
  {
    name: '4-2-3-1',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 28, y: 38, role: 'CDM', number: 6 },
      { x: 28, y: 62, role: 'CDM', number: 8 },
      { x: 38, y: 22, role: 'LAM', number: 11 },
      { x: 37, y: 50, role: 'CAM', number: 10 },
      { x: 38, y: 78, role: 'RAM', number: 7 },
      { x: 46, y: 50, role: 'ST', number: 9 },
    ],
  },
];

export const FORMATIONS_MINI_SOCCER_7: FormationPreset[] = [
  {
    name: '2-3-1 (7v7)',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 30, role: 'CB', number: 4 },
      { x: 22, y: 70, role: 'CB', number: 5 },
      { x: 34, y: 20, role: 'LM', number: 11 },
      { x: 33, y: 50, role: 'CM', number: 8 },
      { x: 34, y: 80, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '3-2-1 (7v7)',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 22, role: 'LB', number: 3 },
      { x: 20, y: 50, role: 'CB', number: 4 },
      { x: 22, y: 78, role: 'RB', number: 2 },
      { x: 33, y: 38, role: 'CM', number: 8 },
      { x: 33, y: 62, role: 'CM', number: 10 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
];

export const FORMATIONS_MINI_SOCCER_8: FormationPreset[] = [
  {
    name: '3-3-1 (8v8)',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 22, role: 'LB', number: 3 },
      { x: 18, y: 50, role: 'CB', number: 4 },
      { x: 20, y: 78, role: 'RB', number: 2 },
      { x: 32, y: 24, role: 'LM', number: 11 },
      { x: 30, y: 50, role: 'CM', number: 8 },
      { x: 32, y: 76, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '2-4-1 (8v8)',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 35, role: 'CB', number: 4 },
      { x: 20, y: 65, role: 'CB', number: 5 },
      { x: 32, y: 18, role: 'LM', number: 11 },
      { x: 31, y: 40, role: 'CM', number: 6 },
      { x: 31, y: 60, role: 'CM', number: 8 },
      { x: 32, y: 82, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
];

export const FORMATIONS_FUTSAL: FormationPreset[] = [
  {
    name: '1-2-1 Diamond (5v5)',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 50, role: 'Fixo', number: 4 },
      { x: 32, y: 22, role: 'Ala E', number: 7 },
      { x: 32, y: 78, role: 'Ala D', number: 11 },
      { x: 43, y: 50, role: 'Pivot', number: 9 },
    ],
  },
  {
    name: '2-2 Box (5v5)',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 24, y: 32, role: 'Def L', number: 4 },
      { x: 24, y: 68, role: 'Def R', number: 5 },
      { x: 40, y: 32, role: 'Fwd L', number: 10 },
      { x: 40, y: 68, role: 'Fwd R', number: 9 },
    ],
  },
  {
    name: '3-1 (5v5)',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 23, y: 24, role: 'Ala', number: 7 },
      { x: 21, y: 50, role: 'Fixo', number: 4 },
      { x: 23, y: 76, role: 'Ala', number: 11 },
      { x: 43, y: 50, role: 'Pivot', number: 9 },
    ],
  },
];

export function getFormationsForPitch(pitchType: PitchType): FormationPreset[] {
  switch (pitchType) {
    case 'football':
      return FORMATIONS_11V11;
    case 'mini-soccer':
      return [...FORMATIONS_MINI_SOCCER_7, ...FORMATIONS_MINI_SOCCER_8];
    case 'futsal':
      return FORMATIONS_FUTSAL;
  }
}

export function generateInitialSquad(
  team: TeamSide,
  pitchType: PitchType,
  squadSize?: number,
  benchCount = 3
): PlayerToken[] {
  const defaultPresets = getFormationsForPitch(pitchType);
  const preset = defaultPresets[0];
  const activeCount = squadSize ?? preset.playerCount;
  const players: PlayerToken[] = [];

  const isHome = team === 'home';
  const facing = isHome ? 0 : 180;

  // Active players
  for (let i = 0; i < activeCount; i++) {
    const posPreset = preset.positions[i] || {
      x: 20 + (i % 3) * 10,
      y: 20 + Math.floor(i / 3) * 20,
      role: 'PL',
      number: i + 1,
    };

    const posX = isHome ? posPreset.x : 100 - posPreset.x;
    const posY = isHome ? posPreset.y : 100 - posPreset.y;

    players.push({
      id: `${team}-p-${i + 1}`,
      team,
      number: posPreset.number || i + 1,
      name: `${isHome ? 'H' : 'A'}${i + 1}`,
      x: posX,
      y: posY,
      rotation: facing,
      isBench: false,
      isGoalkeeper: i === 0,
      role: posPreset.role,
    });
  }

  // Bench players (substitutes)
  for (let b = 0; b < benchCount; b++) {
    const benchNum = activeCount + b + 1;
    players.push({
      id: `${team}-sub-${b + 1}`,
      team,
      number: benchNum,
      name: `Sub ${benchNum}`,
      x: isHome ? 10 + b * 6 : 90 - b * 6,
      y: isHome ? 106 : 106, // positioned in sideline bench slot
      rotation: facing,
      isBench: true,
      role: 'SUB',
    });
  }

  return players;
}
