import { FormationPreset, PitchType, PlayerToken, TeamSide } from '../types/tactics';

// -------------------------------------------------------------
// 11v11 FOOTBALL FORMATIONS
// -------------------------------------------------------------
export const FORMATIONS_11V11: FormationPreset[] = [
  // 4 AT THE BACK
  {
    name: '4-3-3 Holding (Single Pivot)',
    category: '4 at the Back',
    description: 'Balanced possession system with single defensive anchor (CDM)',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 29, y: 50, role: 'CDM', number: 6 },
      { x: 36, y: 32, role: 'CM', number: 8 },
      { x: 36, y: 68, role: 'CM', number: 10 },
      { x: 44, y: 16, role: 'LW', number: 11 },
      { x: 46, y: 50, role: 'ST', number: 9 },
      { x: 44, y: 84, role: 'RW', number: 7 },
    ],
  },
  {
    name: '4-3-3 Attacking (Double 10s)',
    category: '4 at the Back',
    description: 'High offensive output with two advanced playmakers',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 14, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 86, role: 'RB', number: 2 },
      { x: 28, y: 50, role: 'CDM', number: 6 },
      { x: 38, y: 30, role: 'CAM', number: 8 },
      { x: 38, y: 70, role: 'CAM', number: 10 },
      { x: 45, y: 16, role: 'LW', number: 11 },
      { x: 47, y: 50, role: 'ST', number: 9 },
      { x: 45, y: 84, role: 'RW', number: 7 },
    ],
  },
  {
    name: '4-2-3-1 (Double Pivot)',
    category: '4 at the Back',
    description: 'Solid central control with double CDM shield and creative CAM',
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
      { x: 38, y: 20, role: 'LAM', number: 11 },
      { x: 38, y: 50, role: 'CAM', number: 10 },
      { x: 38, y: 80, role: 'RAM', number: 7 },
      { x: 46, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '4-4-2 Flat',
    category: '4 at the Back',
    description: 'Classic compact two banks of four with dual striker partnership',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 34, y: 16, role: 'LM', number: 11 },
      { x: 32, y: 38, role: 'CM', number: 6 },
      { x: 32, y: 62, role: 'CM', number: 8 },
      { x: 34, y: 84, role: 'RM', number: 7 },
      { x: 45, y: 38, role: 'ST', number: 9 },
      { x: 45, y: 62, role: 'ST', number: 10 },
    ],
  },
  {
    name: '4-4-2 Diamond (4-1-2-1-2)',
    category: '4 at the Back',
    description: 'Central dominance with CDM anchor, wide CMs, and CAM',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 27, y: 50, role: 'CDM', number: 6 },
      { x: 34, y: 28, role: 'LCM', number: 8 },
      { x: 34, y: 72, role: 'RCM', number: 7 },
      { x: 40, y: 50, role: 'CAM', number: 10 },
      { x: 46, y: 38, role: 'ST', number: 9 },
      { x: 46, y: 62, role: 'ST', number: 11 },
    ],
  },
  {
    name: '4-1-4-1 (Midfield Overload)',
    category: '4 at the Back',
    description: 'High pressing with five across midfield when defending',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 14, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 86, role: 'RB', number: 2 },
      { x: 28, y: 50, role: 'CDM', number: 6 },
      { x: 37, y: 16, role: 'LM', number: 11 },
      { x: 36, y: 38, role: 'CM', number: 8 },
      { x: 36, y: 62, role: 'CM', number: 10 },
      { x: 37, y: 84, role: 'RM', number: 7 },
      { x: 46, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '4-2-4 (High Press Overload)',
    category: '4 at the Back',
    description: 'Aggressive front line with four attackers to pin opponent backline',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 15, role: 'LB', number: 3 },
      { x: 18, y: 38, role: 'CB', number: 4 },
      { x: 18, y: 62, role: 'CB', number: 5 },
      { x: 22, y: 85, role: 'RB', number: 2 },
      { x: 32, y: 40, role: 'CM', number: 6 },
      { x: 32, y: 60, role: 'CM', number: 8 },
      { x: 45, y: 14, role: 'LW', number: 11 },
      { x: 46, y: 38, role: 'ST', number: 9 },
      { x: 46, y: 62, role: 'ST', number: 10 },
      { x: 45, y: 86, role: 'RW', number: 7 },
    ],
  },

  // 3 AT THE BACK
  {
    name: '3-4-3 Wide Attack',
    category: '3 at the Back',
    description: 'Fluid wing-backs providing width with front three pressing',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 18, y: 25, role: 'LCB', number: 3 },
      { x: 16, y: 50, role: 'CB', number: 4 },
      { x: 18, y: 75, role: 'RCB', number: 5 },
      { x: 32, y: 12, role: 'LWB', number: 6 },
      { x: 30, y: 38, role: 'CM', number: 8 },
      { x: 30, y: 62, role: 'CM', number: 16 },
      { x: 32, y: 88, role: 'RWB', number: 2 },
      { x: 44, y: 22, role: 'LW', number: 11 },
      { x: 46, y: 50, role: 'ST', number: 9 },
      { x: 44, y: 78, role: 'RW', number: 7 },
    ],
  },
  {
    name: '3-4-2-1 (Box Midfield)',
    category: '3 at the Back',
    description: 'Double 6s and double 10s creating a numerical overload centrally',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 18, y: 25, role: 'LCB', number: 3 },
      { x: 16, y: 50, role: 'CB', number: 4 },
      { x: 18, y: 75, role: 'RCB', number: 5 },
      { x: 32, y: 12, role: 'LWB', number: 6 },
      { x: 29, y: 38, role: 'CDM', number: 8 },
      { x: 29, y: 62, role: 'CDM', number: 16 },
      { x: 32, y: 88, role: 'RWB', number: 2 },
      { x: 39, y: 35, role: 'LAM', number: 10 },
      { x: 39, y: 65, role: 'RAM', number: 11 },
      { x: 46, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '3-5-2 (Wing-backs & Dual Strikers)',
    category: '3 at the Back',
    description: 'Dynamic central trio with two strikers and high wing-backs',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 18, y: 26, role: 'LCB', number: 3 },
      { x: 16, y: 50, role: 'CB', number: 4 },
      { x: 18, y: 74, role: 'RCB', number: 5 },
      { x: 31, y: 14, role: 'LWB', number: 6 },
      { x: 28, y: 50, role: 'CDM', number: 8 },
      { x: 36, y: 35, role: 'CAM', number: 10 },
      { x: 36, y: 65, role: 'CM', number: 16 },
      { x: 31, y: 86, role: 'RWB', number: 2 },
      { x: 45, y: 38, role: 'ST', number: 9 },
      { x: 45, y: 62, role: 'ST', number: 11 },
    ],
  },
  {
    name: '3-2-4-1 (Inverted Fullback / Box Midfield)',
    category: '3 at the Back',
    description: 'Modern in-possession structure with 3 defenders, 2 pivots, 4 creative line, 1 striker',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 24, role: 'LCB', number: 3 },
      { x: 17, y: 50, role: 'CB', number: 4 },
      { x: 19, y: 76, role: 'RCB', number: 5 },
      { x: 28, y: 38, role: 'DM', number: 6 },
      { x: 28, y: 62, role: 'DM', number: 8 },
      { x: 40, y: 14, role: 'LW', number: 11 },
      { x: 38, y: 37, role: 'AM', number: 10 },
      { x: 38, y: 63, role: 'AM', number: 17 },
      { x: 40, y: 86, role: 'RW', number: 7 },
      { x: 46, y: 50, role: 'ST', number: 9 },
    ],
  },

  // 5 AT THE BACK
  {
    name: '5-3-2 Solid Low Block',
    category: '5 at the Back',
    description: 'Impenetrable defensive wall with fast counter-attacking duos',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 15, role: 'LWB', number: 3 },
      { x: 16, y: 32, role: 'LCB', number: 4 },
      { x: 15, y: 50, role: 'CB', number: 5 },
      { x: 16, y: 68, role: 'RCB', number: 12 },
      { x: 19, y: 85, role: 'RWB', number: 2 },
      { x: 30, y: 30, role: 'LCM', number: 8 },
      { x: 28, y: 50, role: 'CDM', number: 6 },
      { x: 30, y: 70, role: 'RCM', number: 10 },
      { x: 44, y: 38, role: 'ST', number: 9 },
      { x: 44, y: 62, role: 'ST', number: 11 },
    ],
  },
  {
    name: '5-2-3 Fast Counter',
    category: '5 at the Back',
    description: 'Five defenders with explosive front three on the transition',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 14, role: 'LWB', number: 3 },
      { x: 16, y: 32, role: 'LCB', number: 4 },
      { x: 15, y: 50, role: 'CB', number: 5 },
      { x: 16, y: 68, role: 'RCB', number: 14 },
      { x: 19, y: 86, role: 'RWB', number: 2 },
      { x: 29, y: 40, role: 'CM', number: 6 },
      { x: 29, y: 60, role: 'CM', number: 8 },
      { x: 44, y: 18, role: 'LW', number: 11 },
      { x: 46, y: 50, role: 'ST', number: 9 },
      { x: 44, y: 82, role: 'RW', number: 7 },
    ],
  },
  {
    name: '5-4-1 Defensive Fortress',
    category: '5 at the Back',
    description: 'Maximum resilience and denial of spaces between lines',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 7, y: 50, role: 'GK', number: 1 },
      { x: 18, y: 14, role: 'LWB', number: 3 },
      { x: 16, y: 32, role: 'LCB', number: 4 },
      { x: 15, y: 50, role: 'CB', number: 5 },
      { x: 16, y: 68, role: 'RCB', number: 15 },
      { x: 18, y: 86, role: 'RWB', number: 2 },
      { x: 30, y: 18, role: 'LM', number: 11 },
      { x: 28, y: 40, role: 'CM', number: 6 },
      { x: 28, y: 60, role: 'CM', number: 8 },
      { x: 30, y: 82, role: 'RM', number: 7 },
      { x: 45, y: 50, role: 'ST', number: 9 },
    ],
  },
];

// -------------------------------------------------------------
// 7v7 MINI SOCCER FORMATIONS
// -------------------------------------------------------------
export const FORMATIONS_MINI_SOCCER_7: FormationPreset[] = [
  {
    name: '2-3-1 (Balanced Standard)',
    category: '7v7 Mini Soccer',
    description: 'Most popular 7v7 setup, provides natural triangles across pitch',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 30, role: 'CB', number: 4 },
      { x: 22, y: 70, role: 'CB', number: 5 },
      { x: 34, y: 18, role: 'LM', number: 11 },
      { x: 32, y: 50, role: 'CM', number: 8 },
      { x: 34, y: 82, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '3-2-1 (Solid Defense / Counter)',
    category: '7v7 Mini Soccer',
    description: 'Back three prevents wide exploitation, attacks via target striker',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 20, role: 'LB', number: 3 },
      { x: 19, y: 50, role: 'CB', number: 4 },
      { x: 22, y: 80, role: 'RB', number: 2 },
      { x: 33, y: 36, role: 'CM', number: 8 },
      { x: 33, y: 64, role: 'CM', number: 10 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '2-1-2-1 (Diamond Midfield)',
    category: '7v7 Mini Soccer',
    description: 'Central diamond structure ensures constant passing angles',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 21, y: 32, role: 'CB', number: 4 },
      { x: 21, y: 68, role: 'CB', number: 5 },
      { x: 29, y: 50, role: 'CDM', number: 6 },
      { x: 36, y: 28, role: 'LAM', number: 11 },
      { x: 36, y: 72, role: 'RAM', number: 7 },
      { x: 45, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '1-4-1 (Midfield Overload)',
    category: '7v7 Mini Soccer',
    description: 'Dominate possession with four midfielders working as a unit',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 50, role: 'CB', number: 4 },
      { x: 31, y: 16, role: 'LM', number: 11 },
      { x: 30, y: 38, role: 'CM', number: 6 },
      { x: 30, y: 62, role: 'CM', number: 8 },
      { x: 31, y: 84, role: 'RM', number: 7 },
      { x: 45, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '2-2-2 (Dual Flank Attack)',
    category: '7v7 Mini Soccer',
    description: 'Two defenders, two box-to-box midfielders, two clinical strikers',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 21, y: 30, role: 'CB', number: 4 },
      { x: 21, y: 70, role: 'CB', number: 5 },
      { x: 32, y: 35, role: 'CM', number: 6 },
      { x: 32, y: 65, role: 'CM', number: 8 },
      { x: 44, y: 35, role: 'ST', number: 9 },
      { x: 44, y: 65, role: 'ST', number: 10 },
    ],
  },
  {
    name: '3-1-2 (Direct Play)',
    category: '7v7 Mini Soccer',
    description: 'Anchor in central midfield with two mobile front runners',
    pitchType: 'mini-soccer',
    playerCount: 7,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 22, role: 'LB', number: 3 },
      { x: 18, y: 50, role: 'CB', number: 4 },
      { x: 20, y: 78, role: 'RB', number: 2 },
      { x: 31, y: 50, role: 'CM', number: 8 },
      { x: 44, y: 35, role: 'ST', number: 9 },
      { x: 44, y: 65, role: 'ST', number: 11 },
    ],
  },
];

// -------------------------------------------------------------
// 8v8 MINI SOCCER FORMATIONS
// -------------------------------------------------------------
export const FORMATIONS_MINI_SOCCER_8: FormationPreset[] = [
  {
    name: '3-3-1 (Balanced 8v8)',
    category: '8v8 Mini Soccer',
    description: 'Standard 8-a-side setup with solid backline and energetic wings',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 22, role: 'LB', number: 3 },
      { x: 18, y: 50, role: 'CB', number: 4 },
      { x: 20, y: 78, role: 'RB', number: 2 },
      { x: 32, y: 22, role: 'LM', number: 11 },
      { x: 30, y: 50, role: 'CM', number: 8 },
      { x: 32, y: 78, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '2-4-1 (Midfield Dominance)',
    category: '8v8 Mini Soccer',
    description: 'Four across midfield suffocates the pitch and controls tempo',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 35, role: 'CB', number: 4 },
      { x: 20, y: 65, role: 'CB', number: 5 },
      { x: 32, y: 16, role: 'LM', number: 11 },
      { x: 30, y: 38, role: 'CM', number: 6 },
      { x: 30, y: 62, role: 'CM', number: 8 },
      { x: 32, y: 84, role: 'RM', number: 7 },
      { x: 44, y: 50, role: 'ST', number: 9 },
    ],
  },
  {
    name: '3-2-2 (Dual Striker Threat)',
    category: '8v8 Mini Soccer',
    description: 'Solid defense with two lethal forwards hunting in pairs',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 22, role: 'LB', number: 3 },
      { x: 17, y: 50, role: 'CB', number: 4 },
      { x: 19, y: 78, role: 'RB', number: 2 },
      { x: 31, y: 38, role: 'CM', number: 8 },
      { x: 31, y: 62, role: 'CM', number: 10 },
      { x: 44, y: 36, role: 'ST', number: 9 },
      { x: 44, y: 64, role: 'ST', number: 11 },
    ],
  },
  {
    name: '2-3-2 (Aggressive Flank Play)',
    category: '8v8 Mini Soccer',
    description: 'Attacking wingers combined with two central focal strikers',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 32, role: 'CB', number: 4 },
      { x: 20, y: 68, role: 'CB', number: 5 },
      { x: 32, y: 20, role: 'LM', number: 11 },
      { x: 30, y: 50, role: 'CM', number: 8 },
      { x: 32, y: 80, role: 'RM', number: 7 },
      { x: 44, y: 36, role: 'ST', number: 9 },
      { x: 44, y: 64, role: 'ST', number: 10 },
    ],
  },
  {
    name: '3-1-2-1 (Diamond 8s)',
    category: '8v8 Mini Soccer',
    description: 'Diamond midfield with deep anchor and attacking playmaker',
    pitchType: 'mini-soccer',
    playerCount: 8,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 19, y: 22, role: 'LB', number: 3 },
      { x: 17, y: 50, role: 'CB', number: 4 },
      { x: 19, y: 78, role: 'RB', number: 2 },
      { x: 26, y: 50, role: 'CDM', number: 6 },
      { x: 34, y: 30, role: 'LAM', number: 8 },
      { x: 34, y: 70, role: 'RAM', number: 11 },
      { x: 45, y: 50, role: 'ST', number: 9 },
    ],
  },
];

// -------------------------------------------------------------
// 5v5 FUTSAL FORMATIONS & ROTATIONS
// -------------------------------------------------------------
export const FORMATIONS_FUTSAL: FormationPreset[] = [
  {
    name: '1-2-1 Diamond (Standard Pivot)',
    category: 'Futsal 5v5',
    description: 'Classic futsal diamond with Fixo anchor, two active Alas, and central Pivot',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 50, role: 'Fixo', number: 4 },
      { x: 32, y: 20, role: 'Ala L', number: 7 },
      { x: 32, y: 80, role: 'Ala R', number: 11 },
      { x: 43, y: 50, role: 'Pivot', number: 9 },
    ],
  },
  {
    name: '2-2 Box / Square (Continuous Rotation)',
    category: 'Futsal 5v5',
    description: 'Equal two defenders and two forwards for high pressing and quick diagonal rotations',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 23, y: 30, role: 'Def L', number: 4 },
      { x: 23, y: 70, role: 'Def R', number: 5 },
      { x: 41, y: 30, role: 'Fwd L', number: 10 },
      { x: 41, y: 70, role: 'Fwd R', number: 9 },
    ],
  },
  {
    name: '3-1 Pyramid (Deep Build-up)',
    category: 'Futsal 5v5',
    description: 'Three deep players create overloads in own half, releasing long ball to Pivot',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 22, role: 'Ala L', number: 7 },
      { x: 19, y: 50, role: 'Fixo', number: 4 },
      { x: 22, y: 78, role: 'Ala R', number: 11 },
      { x: 44, y: 50, role: 'Pivot', number: 9 },
    ],
  },
  {
    name: '4-0 In-Line / False 9 (Fly-GK / Total Movement)',
    category: 'Futsal 5v5',
    description: 'Pivot-less rotation pulling opponent fixos out of position for back-door cuts',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 28, y: 18, role: 'Rot 1', number: 7 },
      { x: 27, y: 39, role: 'Rot 2', number: 4 },
      { x: 27, y: 61, role: 'Rot 3', number: 8 },
      { x: 28, y: 82, role: 'Rot 4', number: 10 },
    ],
  },
  {
    name: '1-1-2 (High Pressing Trap)',
    category: 'Futsal 5v5',
    description: 'Aggressive front two forcing opponent goalkeeper into mistakes',
    pitchType: 'futsal',
    playerCount: 5,
    positions: [
      { x: 9, y: 50, role: 'GK', number: 1 },
      { x: 20, y: 50, role: 'Fixo', number: 4 },
      { x: 30, y: 50, role: 'Center', number: 8 },
      { x: 42, y: 28, role: 'Press L', number: 11 },
      { x: 42, y: 72, role: 'Press R', number: 9 },
    ],
  },
];

// -------------------------------------------------------------
// SET PIECES & TACTICAL DRILLS (CRUCIAL FOR COACHES!)
// -------------------------------------------------------------
export const FORMATIONS_DRILLS: FormationPreset[] = [
  {
    name: 'Corner Kick Attack (Far Post Overload)',
    category: 'Set Pieces & Drills',
    description: 'Taker at corner arc, near post decoy, 3 far-post runners, and edge shooter',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 8, y: 50, role: 'GK', number: 1 },
      { x: 22, y: 40, role: 'Rest Def', number: 4 },
      { x: 22, y: 60, role: 'Rest Def', number: 5 },
      { x: 34, y: 50, role: 'Cover', number: 6 },
      { x: 40, y: 35, role: 'Edge', number: 8 },
      { x: 41, y: 65, role: 'Edge', number: 10 },
      { x: 47, y: 42, role: 'Near Post', number: 9 },
      { x: 48, y: 52, role: 'Far Post', number: 3 },
      { x: 48, y: 60, role: 'Far Post', number: 14 },
      { x: 46, y: 56, role: 'GK Blocker', number: 11 },
      { x: 49, y: 96, role: 'Taker', number: 7 }, // at corner arc
    ],
  },
  {
    name: 'Corner Kick Defend (Hybrid Zonal)',
    category: 'Set Pieces & Drills',
    description: '3 zonal blockers along 6-yard box, 4 man-markers, 1 near-post guard, 1 edge clearer',
    pitchType: 'football',
    playerCount: 11,
    positions: [
      { x: 6, y: 50, role: 'GK', number: 1 },
      { x: 8, y: 42, role: 'Near Post', number: 2 },
      { x: 9, y: 48, role: 'Zone 1', number: 4 },
      { x: 9, y: 53, role: 'Zone 2', number: 5 },
      { x: 10, y: 58, role: 'Zone 3', number: 6 },
      { x: 13, y: 44, role: 'Mark 1', number: 3 },
      { x: 14, y: 50, role: 'Mark 2', number: 8 },
      { x: 14, y: 56, role: 'Mark 3', number: 10 },
      { x: 15, y: 62, role: 'Mark 4', number: 11 },
      { x: 20, y: 50, role: 'Edge Box', number: 7 },
      { x: 32, y: 50, role: 'Counter Target', number: 9 },
    ],
  },
  {
    name: '8v7 Attacking Overload Drill',
    category: 'Set Pieces & Drills',
    description: 'Asymmetrical training setup: 8 attackers building up vs 7 defenders in a compact block',
    pitchType: 'football',
    playerCount: 8,
    positions: [
      { x: 20, y: 20, role: 'LWB', number: 3 },
      { x: 18, y: 40, role: 'CB', number: 4 },
      { x: 18, y: 60, role: 'CB', number: 5 },
      { x: 20, y: 80, role: 'RWB', number: 2 },
      { x: 29, y: 38, role: 'CM', number: 6 },
      { x: 29, y: 62, role: 'CM', number: 8 },
      { x: 42, y: 36, role: 'ST', number: 9 },
      { x: 42, y: 64, role: 'ST', number: 10 },
    ],
  },
  {
    name: '6v5 Box Finishing Drill',
    category: 'Set Pieces & Drills',
    description: '6 attackers circulating around the 18-yard box against 5 defenders + GK',
    pitchType: 'mini-soccer',
    playerCount: 6,
    positions: [
      { x: 24, y: 20, role: 'Winger L', number: 11 },
      { x: 23, y: 40, role: 'Mid In', number: 8 },
      { x: 23, y: 60, role: 'Mid In', number: 10 },
      { x: 24, y: 80, role: 'Winger R', number: 7 },
      { x: 38, y: 38, role: 'Striker 1', number: 9 },
      { x: 38, y: 62, role: 'Striker 2', number: 14 },
    ],
  },
];

export function getFormationsForPitch(pitchType: PitchType): FormationPreset[] {
  switch (pitchType) {
    case 'football':
      return [...FORMATIONS_11V11, ...FORMATIONS_DRILLS];
    case 'mini-soccer':
      return [
        ...FORMATIONS_MINI_SOCCER_7,
        ...FORMATIONS_MINI_SOCCER_8,
        ...FORMATIONS_DRILLS.filter((d) => d.playerCount <= 8),
      ];
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
