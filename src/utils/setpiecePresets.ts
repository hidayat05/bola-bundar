import { PitchType, PitchView, TacticalKeyframe, TargetZoneKey } from '../types/tactics';

export interface SetpiecePreset {
  id: string;
  name: string;
  category: PitchType;
  categoryLabel: string;
  type: 'corner' | 'free-kick' | 'throw-in';
  typeLabel: string;
  difficulty: 'Mudah' | 'Menengah' | 'Lanjutan';
  subtitle: string;
  description: string;
  tacticalObjectives: string[];
  recommendedPitchView: PitchView;
  barrierDistance: number;
  targetZoneHighlight: TargetZoneKey;
  wallCount?: number;
  frames: TacticalKeyframe[];
}

/**
 * Tactical Setpiece Routine Presets Library
 */
export const SETPIECE_PRESETS: SetpiecePreset[] = [
  // 1. FUTSAL: CORNER TIANG 2 (2nd Post Tap-in)
  {
    id: 'futsal-corner-tiang-2',
    name: 'Futsal Corner Tiang 2',
    category: 'futsal',
    categoryLabel: 'Futsal (5v5)',
    type: 'corner',
    typeLabel: 'Tendangan Sudut',
    difficulty: 'Menengah',
    subtitle: 'Lari Tarik Dekoy Tiang Dekat & Tap-In Cepat Tiang Jauh',
    description:
      'Skema klasik futsal modern: Ala #7 melakukan sprint memotong ke tiang dekat untuk menarik perhatian bek dan kiper lawan, membuka ruang kosong di tiang 2 bagi Pivot #9 untuk menyontek bola mendatar ke gawang yang kosong.',
    tacticalObjectives: [
      'Menarik 1-2 pemain bertahan lawan keluar dari tiang 2',
      'Memanfaatkan blind spot bek lawan di tiang jauh',
      'Umpan datar kencang dan presisi langsung ke target tap-in',
    ],
    recommendedPitchView: 'third',
    barrierDistance: 5.0,
    targetZoneHighlight: 'far-post',
    frames: [
      {
        id: 'fc2-frame-1',
        name: 'Langkah 1: Setup & Inisiasi Lari Palsu',
        duration: 1.4,
        ball: { id: 'ball-1', x: 99, y: 98 },
        drawings: [
          {
            id: 'draw-fc2-run-near',
            type: 'run',
            points: [62, 70, 86, 64],
            color: '#38bdf8',
            dashed: true,
          },
          {
            id: 'draw-fc2-run-far',
            type: 'run',
            points: [52, 45, 92, 38],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          // HOME TEAM (Attacking)
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 99, y: 97, rotation: 310, isBench: false, role: 'Taker' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala L', x: 62, y: 70, rotation: 320, isBench: false, role: 'Ala' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 52, y: 45, rotation: 0, isBench: false, role: 'Pivot' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 35, y: 60, rotation: 20, isBench: false, role: 'Fixo' },
          // AWAY TEAM (Defending)
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 50, rotation: 240, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 86, y: 84, rotation: 135, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 72, y: 62, rotation: 160, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 3', x: 70, y: 42, rotation: 180, isBench: false },
        ],
      },
      {
        id: 'fc2-frame-2',
        name: 'Langkah 2: Umpan Silang Kencang Menembus Box',
        duration: 1.2,
        ball: { id: 'ball-1', x: 92, y: 40 },
        drawings: [
          {
            id: 'draw-fc2-pass',
            type: 'pass',
            points: [99, 97, 92, 40],
            color: '#f59e0b',
          },
          {
            id: 'draw-fc2-shot',
            type: 'pass',
            points: [92, 40, 99, 44],
            color: '#10b981',
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 97, y: 92, rotation: 300, isBench: false, role: 'Taker' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala L', x: 86, y: 64, rotation: 340, isBench: false, role: 'Ala' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 92, y: 40, rotation: 20, isBench: false, role: 'Pivot' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 38, y: 58, rotation: 15, isBench: false, role: 'Fixo' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 94, y: 55, rotation: 270, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 88, y: 78, rotation: 160, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 84, y: 63, rotation: 220, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 3', x: 75, y: 44, rotation: 150, isBench: false },
        ],
      },
      {
        id: 'fc2-frame-3',
        name: 'Langkah 3: Tap-In Gol di Tiang 2!',
        duration: 1.3,
        ball: { id: 'ball-1', x: 100, y: 46 },
        drawings: [],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 92, y: 86, rotation: 290, isBench: false, role: 'Taker' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala L', x: 89, y: 60, rotation: 350, isBench: false, role: 'Ala' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 95, y: 43, rotation: 60, isBench: false, role: 'Pivot' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 42, y: 56, rotation: 10, isBench: false, role: 'Fixo' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 52, rotation: 290, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 89, y: 72, rotation: 200, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 85, y: 60, rotation: 250, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 3', x: 80, y: 45, rotation: 220, isBench: false },
        ],
      },
    ],
  },

  // 2. MINI SOCCER: SHORT CORNER (Overlap & Cutback)
  {
    id: 'mini-soccer-short-corner',
    name: 'Mini Soccer Short Corner Routine',
    category: 'mini-soccer',
    categoryLabel: 'Mini Soccer (7v7)',
    type: 'corner',
    typeLabel: 'Tendangan Sudut Pendek',
    difficulty: 'Menengah',
    subtitle: 'Kombinasi 2v1 di Sudut, Overlap Garis Akhir, & Tarik Cutback',
    description:
      'Membuat keunggulan jumlah pemain (2v1) di area sudut lapangan. Taker #7 mengoper pendek ke Winger #11, lalu melakukan overlapping sprint ke belakang menuju byline, menerima kembali umpan terobosan, dan melepaskan cutback ke titik penalti untuk dieksekusi striker #9.',
    tacticalObjectives: [
      'Memancing 1 bek keluar dan membongkar garis pertahanan kotak penalti',
      'Overlapping cepat memanfaatkan sudut sempit garis akhir (byline)',
      'Umpan tarik mendatar (cutback) mematikan ke titik penalti',
    ],
    recommendedPitchView: 'third',
    barrierDistance: 7.0,
    targetZoneHighlight: 'cutback',
    frames: [
      {
        id: 'mssc-frame-1',
        name: 'Langkah 1: Opsi Umpan Pendek 2v1',
        duration: 1.5,
        ball: { id: 'ball-1', x: 99, y: 2 },
        drawings: [
          {
            id: 'draw-mssc-pass-1',
            type: 'pass',
            points: [99, 2, 88, 14],
            color: '#f59e0b',
          },
          {
            id: 'draw-mssc-run-overlap',
            type: 'run',
            points: [98, 4, 96, 22],
            color: '#38bdf8',
            dashed: true,
          },
          {
            id: 'draw-mssc-run-box',
            type: 'run',
            points: [56, 48, 68, 50],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          // HOME
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-7', team: 'home', number: 7, name: 'Taker', x: 98, y: 4, rotation: 120, isBench: false, role: 'Taker' },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 88, y: 14, rotation: 45, isBench: false, role: 'Winger' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 56, y: 48, rotation: 20, isBench: false, role: 'Striker' },
          { id: 'home-10', team: 'home', number: 10, name: 'CAM', x: 50, y: 32, rotation: 30, isBench: false, role: 'Playmaker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 36, y: 55, rotation: 0, isBench: false, role: 'Defender' },
          // AWAY
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 96, y: 50, rotation: 270, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 84, y: 22, rotation: 40, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 78, y: 38, rotation: 100, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 80, y: 58, rotation: 140, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 88, y: 64, rotation: 180, isBench: false },
        ],
      },
      {
        id: 'mssc-frame-2',
        name: 'Langkah 2: Overlap Garis Akhir & Through-Pass',
        duration: 1.3,
        ball: { id: 'ball-1', x: 96, y: 22 },
        drawings: [
          {
            id: 'draw-mssc-pass-2',
            type: 'pass',
            points: [86, 15, 96, 22],
            color: '#f59e0b',
          },
          {
            id: 'draw-mssc-cutback',
            type: 'pass',
            points: [96, 22, 68, 50],
            color: '#f43f5e',
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-7', team: 'home', number: 7, name: 'Taker', x: 96, y: 22, rotation: 150, isBench: false, role: 'Taker' },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 86, y: 15, rotation: 90, isBench: false, role: 'Winger' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 68, y: 50, rotation: 45, isBench: false, role: 'Striker' },
          { id: 'home-10', team: 'home', number: 10, name: 'CAM', x: 58, y: 38, rotation: 30, isBench: false, role: 'Playmaker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 38, y: 53, rotation: 5, isBench: false, role: 'Defender' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 46, rotation: 290, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 88, y: 20, rotation: 80, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 76, y: 42, rotation: 90, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 76, y: 56, rotation: 120, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 84, y: 62, rotation: 160, isBench: false },
        ],
      },
      {
        id: 'mssc-frame-3',
        name: 'Langkah 3: Finishing First-Time Menghujam Gawang!',
        duration: 1.4,
        ball: { id: 'ball-1', x: 99, y: 54 },
        drawings: [],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-7', team: 'home', number: 7, name: 'Taker', x: 94, y: 25, rotation: 160, isBench: false, role: 'Taker' },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 85, y: 18, rotation: 110, isBench: false, role: 'Winger' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 74, y: 52, rotation: 15, isBench: false, role: 'Striker' },
          { id: 'home-10', team: 'home', number: 10, name: 'CAM', x: 62, y: 42, rotation: 20, isBench: false, role: 'Playmaker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 42, y: 52, rotation: 5, isBench: false, role: 'Defender' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 94, y: 48, rotation: 320, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 90, y: 24, rotation: 140, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 78, y: 46, rotation: 70, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 76, y: 55, rotation: 90, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 82, y: 60, rotation: 120, isBench: false },
        ],
      },
    ],
  },

  // 3. SEPAK BOLA: FREE-KICK DUMMY RUN (Decoy Runner + Direct Strike)
  {
    id: 'football-freekick-dummy-run',
    name: 'Free-Kick Dummy Run Routine',
    category: 'football',
    categoryLabel: 'Sepak Bola (11v11)',
    type: 'free-kick',
    typeLabel: 'Tendangan Bebas Langsung',
    difficulty: 'Lanjutan',
    subtitle: 'Dua Eksekutor, Gerakan Tipuan (Decoy), & Sepakan Melengkung',
    description:
      'Tendangan bebas 23 meter depan kotak penalti. Pemain #8 berlari kencang melewati bola sebagai decoy untuk membuat pagar betis dan kiper lawan salah antisipasi/melompat lebih awal, disusul tembakan melengkung akurat dari Playmaker #10 ke sudut tiang jauh.',
    tacticalObjectives: [
      'Mengacaukan timing lompatan pagar betis (defensive wall)',
      'Memancing kiper mengambil langkah antisipasi yang salah',
      'Eksekutor kedua melepaskan tembakan presisi melewati celah pagar',
    ],
    recommendedPitchView: 'third',
    barrierDistance: 9.15,
    targetZoneHighlight: 'edge-of-box',
    wallCount: 4,
    frames: [
      {
        id: 'fkdr-frame-1',
        name: 'Langkah 1: Dual Taker & Wall Setup (9.15m)',
        duration: 1.5,
        ball: { id: 'ball-1', x: 56, y: 48 },
        drawings: [
          {
            id: 'draw-fkdr-run-decoy',
            type: 'run',
            points: [53, 44, 76, 42],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          // HOME ATTACKERS
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-8', team: 'home', number: 8, name: 'Decoy', x: 53, y: 44, rotation: 10, isBench: false, role: 'Decoy' },
          { id: 'home-10', team: 'home', number: 10, name: 'Striker', x: 51, y: 52, rotation: 0, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Screen', x: 74, y: 56, rotation: 190, isBench: false, role: 'Screener' },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 62, y: 78, rotation: 350, isBench: false },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 62, y: 22, rotation: 10, isBench: false },
          // AWAY DEFENDERS (4-MAN WALL ON 9.15m BARRIER)
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 46, rotation: 190, isBench: false, isGoalkeeper: true },
          { id: 'away-3', team: 'away', number: 3, name: 'Wall 1', x: 74, y: 41, rotation: 195, isBench: false, isWall: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 2', x: 74, y: 45, rotation: 190, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 3', x: 74, y: 49, rotation: 185, isBench: false, isWall: true },
          { id: 'away-6', team: 'away', number: 6, name: 'Wall 4', x: 74, y: 53, rotation: 180, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 82, y: 34, rotation: 180, isBench: false },
        ],
      },
      {
        id: 'fkdr-frame-2',
        name: 'Langkah 2: Decoy Melompati Bola & Merusak Pagar',
        duration: 1.2,
        ball: { id: 'ball-1', x: 56, y: 48 },
        drawings: [
          {
            id: 'draw-fkdr-shot-curve',
            type: 'pass',
            points: [56, 48, 72, 38, 98, 42],
            color: '#f59e0b',
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-8', team: 'home', number: 8, name: 'Decoy', x: 67, y: 43, rotation: 10, isBench: false, role: 'Decoy' },
          { id: 'home-10', team: 'home', number: 10, name: 'Striker', x: 55, y: 49, rotation: 350, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Screen', x: 76, y: 58, rotation: 220, isBench: false, role: 'Screener' },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 68, y: 76, rotation: 350, isBench: false },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 68, y: 24, rotation: 10, isBench: false },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 94, y: 49, rotation: 180, isBench: false, isGoalkeeper: true },
          { id: 'away-3', team: 'away', number: 3, name: 'Wall 1', x: 74, y: 41, rotation: 210, isBench: false, isWall: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 2', x: 74, y: 45, rotation: 205, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 3', x: 74, y: 49, rotation: 200, isBench: false, isWall: true },
          { id: 'away-6', team: 'away', number: 6, name: 'Wall 4', x: 74, y: 53, rotation: 195, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 84, y: 35, rotation: 180, isBench: false },
        ],
      },
      {
        id: 'fkdr-frame-3',
        name: 'Langkah 3: Bola Melengkung Masuk ke Pojok Atas!',
        duration: 1.4,
        ball: { id: 'ball-1', x: 99, y: 43 },
        drawings: [],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-8', team: 'home', number: 8, name: 'Decoy', x: 78, y: 42, rotation: 15, isBench: false, role: 'Decoy' },
          { id: 'home-10', team: 'home', number: 10, name: 'Striker', x: 59, y: 48, rotation: 350, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Screen', x: 80, y: 59, rotation: 240, isBench: false, role: 'Screener' },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 74, y: 74, rotation: 340, isBench: false },
          { id: 'home-11', team: 'home', number: 11, name: 'LW', x: 75, y: 26, rotation: 20, isBench: false },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 96, y: 44, rotation: 260, isBench: false, isGoalkeeper: true },
          { id: 'away-3', team: 'away', number: 3, name: 'Wall 1', x: 74, y: 41, rotation: 220, isBench: false, isWall: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 2', x: 74, y: 45, rotation: 215, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 3', x: 74, y: 49, rotation: 210, isBench: false, isWall: true },
          { id: 'away-6', team: 'away', number: 6, name: 'Wall 4', x: 74, y: 53, rotation: 205, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 86, y: 36, rotation: 200, isBench: false },
        ],
      },
    ],
  },

  // 4. SEPAK BOLA: CORNER OUTSWING (Near-Post Flick & Far-Post Overload)
  {
    id: 'football-outswing-corner',
    name: 'Football Outswing Corner Routine',
    category: 'football',
    categoryLabel: 'Sepak Bola (11v11)',
    type: 'corner',
    typeLabel: 'Tendangan Sudut Melengkung Keluar',
    difficulty: 'Lanjutan',
    subtitle: 'Flick-On Tiang Dekat Disambut Sundulan Keras Tiang Jauh',
    description:
      'Pola tendangan sudut profesional: Bek jangkung #4 melakukan sprint agresif dari titik penalti ke tiang dekat untuk membelokkan bola dengan sundulan (flick-on), sementara Striker #9 dan Winger #7 menyelinap ke tiang jauh untuk menyambut bola pantulan ke gawang terbuka.',
    tacticalObjectives: [
      'Memaksimalkan keunggulan duel udara di sudut sempit tiang dekat',
      'Membelokkan arah bola yang sulit diantisipasi kiper lawan',
      'Overload 2 pemain di tiang jauh untuk memastikan gol tap-in/header',
    ],
    recommendedPitchView: 'third',
    barrierDistance: 9.15,
    targetZoneHighlight: 'near-post',
    frames: [
      {
        id: 'foc-frame-1',
        name: 'Langkah 1: Tumpukan Pemain di Titik Penalti',
        duration: 1.5,
        ball: { id: 'ball-1', x: 99, y: 98 },
        drawings: [
          {
            id: 'draw-foc-run-near',
            type: 'run',
            points: [66, 56, 88, 62],
            color: '#38bdf8',
            dashed: true,
          },
          {
            id: 'draw-foc-run-far',
            type: 'run',
            points: [64, 46, 92, 40],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-11', team: 'home', number: 11, name: 'Taker', x: 99, y: 96, rotation: 315, isBench: false, role: 'Taker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 66, y: 56, rotation: 340, isBench: false, role: 'Target 1' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 64, y: 46, rotation: 350, isBench: false, role: 'Target 2' },
          { id: 'home-5', team: 'home', number: 5, name: 'CB', x: 62, y: 64, rotation: 330, isBench: false },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 58, y: 38, rotation: 10, isBench: false },
          { id: 'home-8', team: 'home', number: 8, name: 'CM', x: 42, y: 50, rotation: 15, isBench: false, role: 'Rest Defense' },
          // AWAY DEFENDERS
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 50, rotation: 260, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 86, y: 78, rotation: 160, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 84, y: 62, rotation: 210, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 82, y: 48, rotation: 200, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 86, y: 38, rotation: 180, isBench: false },
        ],
      },
      {
        id: 'foc-frame-2',
        name: 'Langkah 2: Outswing Cross & Flick-On Header di Tiang Dekat',
        duration: 1.3,
        ball: { id: 'ball-1', x: 88, y: 62 },
        drawings: [
          {
            id: 'draw-foc-cross',
            type: 'pass',
            points: [99, 96, 88, 62],
            color: '#f59e0b',
          },
          {
            id: 'draw-foc-flick',
            type: 'pass',
            points: [88, 62, 94, 40],
            color: '#10b981',
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-11', team: 'home', number: 11, name: 'Taker', x: 96, y: 92, rotation: 300, isBench: false, role: 'Taker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 88, y: 62, rotation: 320, isBench: false, role: 'Target 1' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 92, y: 40, rotation: 15, isBench: false, role: 'Target 2' },
          { id: 'home-5', team: 'home', number: 5, name: 'CB', x: 74, y: 60, rotation: 340, isBench: false },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 82, y: 36, rotation: 30, isBench: false },
          { id: 'home-8', team: 'home', number: 8, name: 'CM', x: 45, y: 50, rotation: 15, isBench: false, role: 'Rest Defense' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 94, y: 53, rotation: 280, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 88, y: 72, rotation: 200, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 87, y: 64, rotation: 240, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 84, y: 50, rotation: 210, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 88, y: 42, rotation: 190, isBench: false },
        ],
      },
      {
        id: 'foc-frame-3',
        name: 'Langkah 3: Sundulan Penentu Gol di Tiang Jauh!',
        duration: 1.4,
        ball: { id: 'ball-1', x: 100, y: 42 },
        drawings: [],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-11', team: 'home', number: 11, name: 'Taker', x: 93, y: 88, rotation: 290, isBench: false, role: 'Taker' },
          { id: 'home-4', team: 'home', number: 4, name: 'CB', x: 90, y: 62, rotation: 330, isBench: false, role: 'Target 1' },
          { id: 'home-9', team: 'home', number: 9, name: 'ST', x: 96, y: 41, rotation: 50, isBench: false, role: 'Target 2' },
          { id: 'home-5', team: 'home', number: 5, name: 'CB', x: 78, y: 58, rotation: 350, isBench: false },
          { id: 'home-7', team: 'home', number: 7, name: 'RW', x: 88, y: 35, rotation: 45, isBench: false },
          { id: 'home-8', team: 'home', number: 8, name: 'CM', x: 48, y: 50, rotation: 15, isBench: false, role: 'Rest Defense' },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 49, rotation: 310, isBench: false, isGoalkeeper: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def 1', x: 89, y: 68, rotation: 220, isBench: false },
          { id: 'away-4', team: 'away', number: 4, name: 'Def 2', x: 88, y: 63, rotation: 260, isBench: false },
          { id: 'away-5', team: 'away', number: 5, name: 'Def 3', x: 87, y: 48, rotation: 230, isBench: false },
          { id: 'away-3', team: 'away', number: 3, name: 'Def 4', x: 91, y: 42, rotation: 210, isBench: false },
        ],
      },
    ],
  },

  // 5. FUTSAL: FREE-KICK BLOCK & SLIP (Screening Wall Routine)
  {
    id: 'futsal-freekick-screen',
    name: 'Futsal Free-Kick Block & Slip',
    category: 'futsal',
    categoryLabel: 'Futsal (5v5)',
    type: 'free-kick',
    typeLabel: 'Tendangan Bebas Taktikal',
    difficulty: 'Menengah',
    subtitle: 'Screening Pagar Lawan & Tembakan Roket Mendatar',
    description:
      'Free kick 10 meter. Pivot #9 bertugas memblok pergerakan pagar lawan (body screen), sementara Taker #10 menggeser umpan pendek ke Fixo #4 yang datang dari lini kedua tanpa kawalan untuk menembak keras ke sudut bawah tiang jauh.',
    tacticalObjectives: [
      'Memblok sudut pandang dan pergerakan pagar betis lawan dengan legal screen',
      'Mengalihkan bola cepat ke penembak kedua yang memiliki ruang tembak terbuka',
      'Tembakan keras mendatar melewati celah badan yang diblok',
    ],
    recommendedPitchView: 'third',
    barrierDistance: 5.0,
    targetZoneHighlight: 'edge-of-box',
    wallCount: 2,
    frames: [
      {
        id: 'fkbs-frame-1',
        name: 'Langkah 1: Pivot Mengunci Sisi Pagar Betis (Screen)',
        duration: 1.4,
        ball: { id: 'ball-1', x: 62, y: 38 },
        drawings: [
          {
            id: 'draw-fkbs-pass-lateral',
            type: 'pass',
            points: [62, 38, 54, 55],
            color: '#f59e0b',
          },
          {
            id: 'draw-fkbs-run-fixo',
            type: 'run',
            points: [42, 58, 54, 55],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 60, y: 36, rotation: 30, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 78, y: 34, rotation: 180, isBench: false, role: 'Screener' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 42, y: 58, rotation: 15, isBench: false, role: 'Shooter' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala', x: 70, y: 72, rotation: 350, isBench: false },
          // AWAY
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 50, rotation: 220, isBench: false, isGoalkeeper: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 1', x: 78, y: 38, rotation: 210, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 2', x: 78, y: 44, rotation: 200, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 84, y: 62, rotation: 190, isBench: false },
        ],
      },
      {
        id: 'fkbs-frame-2',
        name: 'Langkah 2: Umpan Lateral & Tembakan Keras Menghujam',
        duration: 1.2,
        ball: { id: 'ball-1', x: 54, y: 55 },
        drawings: [
          {
            id: 'draw-fkbs-rocket',
            type: 'pass',
            points: [54, 55, 99, 58],
            color: '#10b981',
          },
        ],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 62, y: 37, rotation: 40, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 79, y: 34, rotation: 170, isBench: false, role: 'Screener' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 54, y: 55, rotation: 5, isBench: false, role: 'Shooter' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala', x: 78, y: 70, rotation: 10, isBench: false },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 94, y: 51, rotation: 250, isBench: false, isGoalkeeper: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 1', x: 78, y: 38, rotation: 210, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 2', x: 78, y: 44, rotation: 200, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 84, y: 62, rotation: 190, isBench: false },
        ],
      },
      {
        id: 'fkbs-frame-3',
        name: 'Langkah 3: Gol Menembus Sudut Bawah Gawang!',
        duration: 1.3,
        ball: { id: 'ball-1', x: 100, y: 58 },
        drawings: [],
        players: [
          { id: 'home-1', team: 'home', number: 1, name: 'GK', x: 7, y: 50, rotation: 0, isBench: true, isGoalkeeper: true },
          { id: 'home-10', team: 'home', number: 10, name: 'Taker', x: 64, y: 39, rotation: 45, isBench: false, role: 'Taker' },
          { id: 'home-9', team: 'home', number: 9, name: 'Pivot', x: 81, y: 35, rotation: 150, isBench: false, role: 'Screener' },
          { id: 'home-4', team: 'home', number: 4, name: 'Fixo', x: 58, y: 55, rotation: 10, isBench: false, role: 'Shooter' },
          { id: 'home-7', team: 'home', number: 7, name: 'Ala', x: 82, y: 68, rotation: 20, isBench: false },
          { id: 'away-1', team: 'away', number: 1, name: 'GK', x: 95, y: 54, rotation: 290, isBench: false, isGoalkeeper: true },
          { id: 'away-4', team: 'away', number: 4, name: 'Wall 1', x: 78, y: 38, rotation: 230, isBench: false, isWall: true },
          { id: 'away-5', team: 'away', number: 5, name: 'Wall 2', x: 78, y: 44, rotation: 220, isBench: false, isWall: true },
          { id: 'away-2', team: 'away', number: 2, name: 'Def', x: 86, y: 61, rotation: 200, isBench: false },
        ],
      },
    ],
  },
];

export function getSetpiecePresets(category?: PitchType): SetpiecePreset[] {
  if (!category) return SETPIECE_PRESETS;
  return SETPIECE_PRESETS.filter((p) => p.category === category);
}
