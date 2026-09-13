import { BallToken, DrawingElement, PitchType, PlayerToken, TacticalKeyframe, TacticalPhase } from '../types/tactics';
import { generateInitialSquad } from './formations';

export interface TacticalStrategyPreset {
  id: string;
  name: string;
  phase: TacticalPhase;
  category: string;
  badge: string; // Emoji
  shortName: string;
  instruction: string;
  description: string;
  pitchType?: PitchType;
  generatePositions: (
    currentPlayers: PlayerToken[],
    pitchType: PitchType,
    ball?: BallToken
  ) => {
    players: PlayerToken[];
    ball: BallToken;
    drawings?: DrawingElement[];
  };
}

/**
 * Helper to sort active players (non-bench), ensuring Goalkeepers come first,
 * followed by outfield players sorted by number.
 */
export function getOrderedActiveSquad(players: PlayerToken[], team: 'home' | 'away'): PlayerToken[] {
  const active = players.filter((p) => p.team === team && !p.isBench);
  return [...active].sort((a, b) => {
    if (a.isGoalkeeper && !b.isGoalkeeper) return -1;
    if (!a.isGoalkeeper && b.isGoalkeeper) return 1;
    return a.number - b.number;
  });
}

/**
 * Maps active players onto designated target positions without ever adding,
 * removing, or modifying bench players.
 */
export function mapActiveSquadPositions(
  currentPlayers: PlayerToken[],
  homeTargets: { x: number; y: number; rotation?: number }[],
  awayTargets: { x: number; y: number; rotation?: number }[]
): PlayerToken[] {
  const homeOrdered = getOrderedActiveSquad(currentPlayers, 'home');
  const awayOrdered = getOrderedActiveSquad(currentPlayers, 'away');

  const homeMap = new Map<string, { x: number; y: number; rotation?: number }>();
  homeOrdered.forEach((p, idx) => {
    if (idx < homeTargets.length) {
      homeMap.set(p.id, homeTargets[idx]);
    }
  });

  const awayMap = new Map<string, { x: number; y: number; rotation?: number }>();
  awayOrdered.forEach((p, idx) => {
    if (idx < awayTargets.length) {
      awayMap.set(p.id, awayTargets[idx]);
    }
  });

  return currentPlayers.map((p) => {
    if (p.isBench) return p;

    if (p.team === 'home' && homeMap.has(p.id)) {
      const t = homeMap.get(p.id)!;
      return { ...p, x: t.x, y: t.y, rotation: t.rotation ?? p.rotation };
    }
    if (p.team === 'away' && awayMap.has(p.id)) {
      const t = awayMap.get(p.id)!;
      return { ...p, x: t.x, y: t.y, rotation: t.rotation ?? p.rotation };
    }
    return p;
  });
}

export const TACTICAL_STRATEGY_PRESETS: TacticalStrategyPreset[] = [
  // =============================================================
  // FUTSAL (5 vs 5) SPECIALIZED TACTICAL PRESETS
  // =============================================================
  {
    id: 'futsal-rotasi-31',
    name: 'Rotasi 3-1 Diamond (Pivot Target & Wall Pass)',
    phase: 'attacking',
    category: 'Menyerang Futsal',
    badge: '💎',
    shortName: 'Rotasi 3-1',
    instruction: 'Fixo alirkan bola ke Ala kiri, Pivot tahan bola di depan gawang, Ala sprint menyambut wall-pass!',
    description: 'Pola baku futsal: Sirkulasi segitiga di area sendiri dengan Pivot sebagai target man pemantul bola (lay-off) untuk tembakan langsung.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 6, y: 50, rotation: 0 },
          { x: 28, y: 48, rotation: 15 },
          { x: 50, y: 22, rotation: 25 },
          { x: 44, y: 78, rotation: 345 },
          { x: 74, y: 46, rotation: 195 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 78, y: 47, rotation: 180 },
          { x: 53, y: 28, rotation: 200 },
          { x: 48, y: 72, rotation: 160 },
          { x: 34, y: 48, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 50, y: 24 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-futsal-pass-1',
          type: 'pass',
          points: [50, 24, 73, 44],
          color: '#f59e0b',
        },
        {
          id: 'draw-futsal-run-1',
          type: 'run',
          points: [50, 22, 70, 32],
          color: '#38bdf8',
          dashed: true,
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'futsal-sistem-40',
    name: 'Sistem 4-0 In-Line (Total Movement / False 9)',
    phase: 'attacking',
    category: 'Menyerang Futsal',
    badge: '⚡',
    shortName: 'Sistem 4-0',
    instruction: '4 pemain sejajar tinggi tanpa pivot tetap, tarik bek lawan keluar lalu potong diagonal ke ruang kosong!',
    description: 'Taktik modern futsal Spanyol/Brasil: Menghilangkan target man agar bek lawan terpancing maju, lalu mengeksploitasi ruang belakang (back-door cut).',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 12, y: 50, rotation: 0 },
          { x: 58, y: 16, rotation: 20 },
          { x: 54, y: 38, rotation: 10 },
          { x: 54, y: 62, rotation: 350 },
          { x: 58, y: 84, rotation: 340 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 68, y: 22, rotation: 200 },
          { x: 65, y: 40, rotation: 190 },
          { x: 65, y: 60, rotation: 170 },
          { x: 68, y: 78, rotation: 160 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 54, y: 39 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-futsal-40-run',
          type: 'run',
          points: [58, 16, 78, 30],
          color: '#38bdf8',
          dashed: true,
        },
        {
          id: 'draw-futsal-40-pass',
          type: 'pass',
          points: [54, 39, 78, 30],
          color: '#f59e0b',
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'futsal-rotasi-22',
    name: 'Rotasi 2-2 Box (Cross Run & Screen)',
    phase: 'attacking',
    category: 'Menyerang Futsal',
    badge: '📦',
    shortName: 'Rotasi 2-2',
    instruction: 'Dua pemain depan lakukan cross-run saling menyilang, bek lakukan overlap cepat menyusuri flank!',
    description: 'Formasi kotak 2 bek dan 2 penyerang saling tukar posisi diagonal secara terus-menerus untuk membuyarkan penjagaan lawan.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 7, y: 50, rotation: 0 },
          { x: 32, y: 28, rotation: 15 },
          { x: 30, y: 70, rotation: 345 },
          { x: 68, y: 30, rotation: 350 },
          { x: 66, y: 72, rotation: 10 },
        ],
        [
          { x: 93, y: 50, rotation: 180 },
          { x: 74, y: 34, rotation: 180 },
          { x: 74, y: 66, rotation: 180 },
          { x: 50, y: 32, rotation: 190 },
          { x: 50, y: 68, rotation: 170 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 32, y: 30 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'futsal-counter-3v2',
    name: 'Counter-Attack 3v2 Fast Break',
    phase: 'trans-attack',
    category: 'Transisi Menyerang',
    badge: '🚀',
    shortName: 'Counter 3v2',
    instruction: 'Rebut bola, bawa cepat ke tengah, 2 Ala sprint melebar membuka sudut tembak segitiga 3 lawan 2!',
    description: 'Transisi mematikan futsal: Mengeksploitasi 2 bek lawan yang tersisa dengan keunggulan jumlah 3 penyerang sprint.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 34, y: 50, rotation: 0 },
          { x: 58, y: 48, rotation: 0 },
          { x: 66, y: 22, rotation: 15 },
          { x: 66, y: 78, rotation: 345 },
        ],
        [
          { x: 93, y: 50, rotation: 180 },
          { x: 74, y: 38, rotation: 190 },
          { x: 74, y: 62, rotation: 170 },
          { x: 42, y: 30, rotation: 20 },
          { x: 44, y: 68, rotation: 340 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 58, y: 49 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-futsal-run-left',
          type: 'run',
          points: [66, 22, 80, 30],
          color: '#38bdf8',
          dashed: true,
        },
        {
          id: 'draw-futsal-run-right',
          type: 'run',
          points: [66, 78, 80, 70],
          color: '#38bdf8',
          dashed: true,
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'futsal-press-diamond',
    name: 'Diamond Pressing 1-2-1 (Trap Garis Sentuh)',
    phase: 'defending',
    category: 'Bertahan Futsal',
    badge: '🛡️',
    shortName: 'Pressing 1-2-1',
    instruction: 'Pivot arahkan lawan ke sayap, Ala potong jalur operan kembali ke tengah, Fixo kunci umpan direct!',
    description: 'Tekanan garis tinggi agresif: Memaksa kiper/fixo lawan membuang bola atau melakukan salah passing di pinggir lapangan.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 12, y: 50, rotation: 0 },
          { x: 38, y: 50, rotation: 0 },
          { x: 58, y: 26, rotation: 15 },
          { x: 58, y: 74, rotation: 345 },
          { x: 70, y: 46, rotation: 350 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 80, y: 48, rotation: 180 },
          { x: 72, y: 20, rotation: 180 },
          { x: 72, y: 80, rotation: 180 },
          { x: 48, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 80, y: 47 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'futsal-box-defense',
    name: 'Box Defense 2-2 Zona Rendah (D-Zone Protection)',
    phase: 'defending',
    category: 'Bertahan Futsal',
    badge: '🧱',
    shortName: 'Box Rendah 2-2',
    instruction: 'Tutup area lengkungan penalti (D-zone), jangan terpancing keluar, blok semua jalur tembakan langsung!',
    description: 'Pertahanan zona rendah paling kokoh di futsal untuk meredam serangan power-play atau rotasi cepat lawan.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 6, y: 50, rotation: 0 },
          { x: 19, y: 38, rotation: 0 },
          { x: 19, y: 62, rotation: 0 },
          { x: 28, y: 34, rotation: 0 },
          { x: 28, y: 66, rotation: 0 },
        ],
        [
          { x: 93, y: 50, rotation: 180 },
          { x: 48, y: 26, rotation: 180 },
          { x: 45, y: 48, rotation: 180 },
          { x: 48, y: 74, rotation: 180 },
          { x: 60, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 45, y: 48 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'futsal-rest-defense',
    name: 'Rest-Defense 2 Belakang (Anti Counter 2v1)',
    phase: 'trans-defend',
    category: 'Transisi Bertahan',
    badge: '⚖️',
    shortName: 'Rest-Def 2 Stay',
    instruction: 'Fixo dan 1 Ala tetap di belakang garis bola, jaga koridor tengah agar tidak terkena serangan balik kilat!',
    description: 'Keseimbangan transisi futsal: Menjamin selalu ada 2 pemain siap duel bertahan saat 2 pemain lain menyerang di depan gawang.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 36, y: 42, rotation: 10 },
          { x: 38, y: 62, rotation: 350 },
          { x: 74, y: 26, rotation: 20 },
          { x: 76, y: 68, rotation: 340 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 82, y: 35, rotation: 180 },
          { x: 82, y: 65, rotation: 180 },
          { x: 62, y: 45, rotation: 180 },
          { x: 48, y: 55, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 74, y: 28 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'futsal-corner-volley',
    name: 'Corner Kick / Kick-in (Screen & Second Post Volley)',
    phase: 'setpiece',
    category: 'Bola Mati Futsal',
    badge: '🎯',
    shortName: 'Corner Futsal',
    instruction: 'Penendang di sudut, rekan lakukan screen menghalangi bek, oper mendatar kencang ke tiang kedua untuk tap-in!',
    description: 'Skema bola mati futsal terpopuler: Block run melepaskan rekan di tiang jauh (second post) tanpa kawalan.',
    pitchType: 'futsal',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 42, y: 50, rotation: 0 },
          { x: 88, y: 45, rotation: 180 },
          { x: 92, y: 65, rotation: 320 },
          { x: 98, y: 96, rotation: 290 },
        ],
        [
          { x: 94, y: 50, rotation: 270 },
          { x: 89, y: 47, rotation: 270 },
          { x: 86, y: 58, rotation: 270 },
          { x: 85, y: 72, rotation: 270 },
          { x: 60, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 98, y: 96 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-futsal-corner-pass',
          type: 'pass',
          points: [98, 96, 92, 65],
          color: '#f59e0b',
        },
        {
          id: 'draw-futsal-corner-run',
          type: 'run',
          points: [82, 75, 92, 65],
          color: '#38bdf8',
          dashed: true,
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },

  // =============================================================
  // MINI SOCCER (7 vs 7) SPECIALIZED TACTICAL PRESETS
  // =============================================================
  {
    id: 'mini-bu-231',
    name: 'Build-up 2-3-1 (Segitiga Sayap & Overload)',
    phase: 'attacking',
    category: 'Menyerang 7v7',
    badge: '⚔️',
    shortName: 'Build-up 2-3-1',
    instruction: '2 bek mengalirkan bola, 3 gelandang membuka segitiga lebar, Striker menarik bek tengah lawan!',
    description: 'Pola 7v7 paling dominan: Poros 2 bek dan 3 gelandang fleksibel menguasai lini tengah dan membongkar pertahanan lawan lewat koridor sayap.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 7, y: 50, rotation: 0 },
          { x: 24, y: 30, rotation: 10 },
          { x: 24, y: 70, rotation: 350 },
          { x: 48, y: 16, rotation: 20 },
          { x: 42, y: 50, rotation: 0 },
          { x: 48, y: 84, rotation: 340 },
          { x: 68, y: 50, rotation: 0 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 76, y: 24, rotation: 190 },
          { x: 74, y: 50, rotation: 180 },
          { x: 76, y: 76, rotation: 170 },
          { x: 58, y: 38, rotation: 185 },
          { x: 58, y: 62, rotation: 175 },
          { x: 36, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 42, y: 51 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-mini-pass-1',
          type: 'pass',
          points: [42, 51, 48, 16],
          color: '#f59e0b',
        },
        {
          id: 'draw-mini-run-1',
          type: 'run',
          points: [48, 16, 64, 16],
          color: '#38bdf8',
          dashed: true,
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'mini-overload-flank',
    name: 'Flank Overload 2-3-1 (Tusukan Sayap & Cutback)',
    phase: 'attacking',
    category: 'Menyerang 7v7',
    badge: '⚡',
    shortName: 'Overload Sayap',
    instruction: 'LM dan CM bergerak serentak ke sisi kiri menciptakan keunggulan 2v1, lepas umpan tarik ke kotak penalti!',
    description: 'Memusatkan serangan di satu sisi lapangan hingga bek lawan tertarik, lalu melakukan cutback pass ke striker yang datang dari blind-spot.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 30, y: 36, rotation: 15 },
          { x: 32, y: 68, rotation: 345 },
          { x: 66, y: 15, rotation: 20 },
          { x: 58, y: 38, rotation: 15 },
          { x: 52, y: 78, rotation: 340 },
          { x: 75, y: 46, rotation: 0 },
        ],
        [
          { x: 94, y: 50, rotation: 200 },
          { x: 84, y: 20, rotation: 200 },
          { x: 78, y: 45, rotation: 180 },
          { x: 78, y: 72, rotation: 170 },
          { x: 65, y: 30, rotation: 190 },
          { x: 62, y: 62, rotation: 180 },
          { x: 40, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 66, y: 16 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-mini-cutback',
          type: 'pass',
          points: [66, 16, 75, 46],
          color: '#f59e0b',
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'mini-direct-counter',
    name: 'Direct Counter-Attack via Target Man #9',
    phase: 'trans-attack',
    category: 'Transisi Menyerang',
    badge: '🚀',
    shortName: 'Counter 7v7',
    instruction: 'Rebut bola, CB langsung lepas through-ball diagonal ke Striker, kedua gelandang sayap sprint menusuk ke kotak penalti!',
    description: 'Transisi kilat 7v7: Menghukum lawan yang sedang maju dengan umpan langsung ke target man dan dukungan cepat dari lini kedua.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 7, y: 50, rotation: 0 },
          { x: 22, y: 42, rotation: 10 },
          { x: 26, y: 62, rotation: 0 },
          { x: 58, y: 20, rotation: 15 },
          { x: 46, y: 50, rotation: 0 },
          { x: 58, y: 80, rotation: 345 },
          { x: 76, y: 50, rotation: 0 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 78, y: 42, rotation: 180 },
          { x: 78, y: 58, rotation: 180 },
          { x: 48, y: 25, rotation: 10 },
          { x: 48, y: 75, rotation: 350 },
          { x: 42, y: 50, rotation: 0 },
          { x: 30, y: 50, rotation: 0 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 26, y: 63 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-mini-direct-pass',
          type: 'pass',
          points: [26, 63, 76, 50],
          color: '#f59e0b',
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },
  {
    id: 'mini-midblock-321',
    name: 'Mid-Block 3-2-1 (Rapat & Kompak)',
    phase: 'defending',
    category: 'Bertahan 7v7',
    badge: '🛡️',
    shortName: 'Mid-Block 3-2-1',
    instruction: 'Bentuk dua lapis pertahanan padat (3 bek + 2 gelandang) di tengah lapangan, paksa lawan bermain melebar!',
    description: 'Struktur pertahanan standar 7-a-side: Mengunci celah tengah lapangan dan mengeliminasi jalur tembakan langsung.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 28, y: 24, rotation: 0 },
          { x: 25, y: 50, rotation: 0 },
          { x: 28, y: 76, rotation: 0 },
          { x: 40, y: 38, rotation: 0 },
          { x: 40, y: 62, rotation: 0 },
          { x: 54, y: 50, rotation: 0 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 78, y: 26, rotation: 180 },
          { x: 75, y: 50, rotation: 180 },
          { x: 78, y: 74, rotation: 180 },
          { x: 62, y: 38, rotation: 180 },
          { x: 62, y: 62, rotation: 180 },
          { x: 46, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 62, y: 39 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'mini-highpress-231',
    name: 'High Pressing 2-3-1 (Jepit Build-up Lawan)',
    phase: 'defending',
    category: 'Bertahan 7v7',
    badge: '🔥',
    shortName: 'High Press 7v7',
    instruction: 'Striker dan trio gelandang naik menekan kotak penalti lawan, paksa kiper lawan melakukan tendangan jauh terburu-buru!',
    description: 'Tekanan garis tinggi untuk merebut bola secepatnya di sepertiga akhir lapangan lawan.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 16, y: 50, rotation: 0 },
          { x: 40, y: 35, rotation: 0 },
          { x: 40, y: 65, rotation: 0 },
          { x: 64, y: 22, rotation: 10 },
          { x: 62, y: 50, rotation: 0 },
          { x: 64, y: 78, rotation: 350 },
          { x: 78, y: 50, rotation: 0 },
        ],
        [
          { x: 95, y: 50, rotation: 180 },
          { x: 88, y: 30, rotation: 180 },
          { x: 88, y: 70, rotation: 180 },
          { x: 78, y: 50, rotation: 180 },
          { x: 72, y: 20, rotation: 180 },
          { x: 72, y: 80, rotation: 180 },
          { x: 52, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 88, y: 30 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'mini-rest-defense-21',
    name: 'Rest-Defense 2+1 (Keseimbangan Transisi)',
    phase: 'trans-defend',
    category: 'Transisi Bertahan',
    badge: '⚖️',
    shortName: 'Rest-Defense 2+1',
    instruction: '2 bek bersama gelandang tengah membentuk segitiga pengaman saat tim menyerang, cegah counter 3v2!',
    description: 'Pondasi keseimbangan pertahanan mini-soccer: Selalu menjaga 3 pemain di belakang garis bola agar tidak mudah ditembus saat kehilangan bola.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 32, y: 36, rotation: 0 },
          { x: 32, y: 64, rotation: 0 },
          { x: 44, y: 50, rotation: 0 },
          { x: 72, y: 22, rotation: 10 },
          { x: 70, y: 78, rotation: 350 },
          { x: 78, y: 48, rotation: 0 },
        ],
        [
          { x: 94, y: 50, rotation: 180 },
          { x: 84, y: 25, rotation: 180 },
          { x: 82, y: 50, rotation: 180 },
          { x: 84, y: 75, rotation: 180 },
          { x: 60, y: 40, rotation: 180 },
          { x: 60, y: 60, rotation: 180 },
          { x: 46, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 72, y: 24 };
      return { players: updatedPlayers, ball };
    },
  },
  {
    id: 'mini-corner-farpost',
    name: 'Sepak Pojok Mini Soccer (Far-Post Overload)',
    phase: 'setpiece',
    category: 'Bola Mati 7v7',
    badge: '🎯',
    shortName: 'Corner Far-Post',
    instruction: 'Penendang arahkan bola lambung melengkung ke tiang jauh, 2 pemain menusuk bersamaan menyambut sundulan!',
    description: 'Skema sepak pojok 7v7: Memanfaatkan ruang tiang jauh yang sulit dijangkau kiper mini-soccer.',
    pitchType: 'mini-soccer',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = mapActiveSquadPositions(
        currentPlayers,
        [
          { x: 8, y: 50, rotation: 0 },
          { x: 38, y: 40, rotation: 0 },
          { x: 38, y: 60, rotation: 0 },
          { x: 72, y: 55, rotation: 330 },
          { x: 88, y: 68, rotation: 310 },
          { x: 88, y: 44, rotation: 300 },
          { x: 98, y: 96, rotation: 290 },
        ],
        [
          { x: 94, y: 50, rotation: 270 },
          { x: 92, y: 45, rotation: 270 },
          { x: 92, y: 55, rotation: 270 },
          { x: 91, y: 65, rotation: 270 },
          { x: 87, y: 46, rotation: 270 },
          { x: 86, y: 66, rotation: 270 },
          { x: 50, y: 50, rotation: 180 },
        ]
      );
      const ball: BallToken = { id: 'ball-1', x: 98, y: 96 };
      const drawings: DrawingElement[] = [
        {
          id: 'draw-mini-corner-cross',
          type: 'pass',
          points: [98, 96, 88, 44],
          color: '#f59e0b',
        },
      ];
      return { players: updatedPlayers, ball, drawings };
    },
  },

  // =============================================================
  // 11v11 FOOTBALL TACTICAL PRESETS
  // =============================================================
  // -------------------------------------------------------------
  // 1. MENYERANG (IN POSSESSION)
  // -------------------------------------------------------------
  {
    id: 'build-up-3241',
    name: 'Build-up 3-2-4-1 (Inverted Full-back)',
    phase: 'attacking',
    category: 'Menyerang',
    badge: '⚔️',
    shortName: '3-2-4-1 Inverted',
    pitchType: 'football',
    instruction: 'LB masuk ke pivot ganda samping #6, bek tengah melebar, winger membuka garis sentuh lebar!',
    description: 'Rotasi Guardiola/Arteta: Bek sayap bergeser ke tengah membentuk poros ganda 3-2 di belakang 4 gelandang serang, mengontrol sirkulasi bola dan mencegah serangan balik.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1: // GK
              return { ...p, x: 8, y: 50, rotation: 0 };
            case 3: // LB -> Wide LCB
              return { ...p, x: 26, y: 22, rotation: 10 };
            case 4: // Central CB
              return { ...p, x: 22, y: 50, rotation: 0 };
            case 5: // RCB
              return { ...p, x: 26, y: 78, rotation: 350 };
            case 6: // CDM pivot 1
              return { ...p, x: 38, y: 40, rotation: 15 };
            case 2: // RB -> Inverted into pivot 2!
              return { ...p, x: 38, y: 60, rotation: 345 };
            case 8: // LAM in left half-space
              return { ...p, x: 56, y: 32, rotation: 10 };
            case 10: // RAM in right half-space
              return { ...p, x: 56, y: 68, rotation: 350 };
            case 11: // LW hugging touchline
              return { ...p, x: 62, y: 12, rotation: 20 };
            case 7: // RW hugging touchline
              return { ...p, x: 62, y: 88, rotation: 340 };
            case 9: // ST pinning CBs
              return { ...p, x: 74, y: 50, rotation: 0 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team in synchronized mid-block 4-4-2
          switch (p.number) {
            case 1: // GK
              return { ...p, x: 93, y: 50, rotation: 180 };
            case 2: // LB
              return { ...p, x: 74, y: 18, rotation: 190 };
            case 4: // CB
              return { ...p, x: 73, y: 38, rotation: 180 };
            case 5: // CB
              return { ...p, x: 73, y: 62, rotation: 180 };
            case 3: // RB
              return { ...p, x: 74, y: 82, rotation: 170 };
            case 7: // LM
              return { ...p, x: 58, y: 22, rotation: 185 };
            case 6: // CM
              return { ...p, x: 57, y: 40, rotation: 185 };
            case 8: // CM
              return { ...p, x: 57, y: 60, rotation: 175 };
            case 11: // RM
              return { ...p, x: 58, y: 78, rotation: 175 };
            case 10: // ST screening #6
              return { ...p, x: 45, y: 42, rotation: 195 };
            case 9: // ST screening #2
              return { ...p, x: 45, y: 58, rotation: 165 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 39,
        y: 41,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-bu-1',
          type: 'pass',
          points: [22, 50, 39, 41],
          color: '#10b981',
        },
        {
          id: 'draw-bu-2',
          type: 'run',
          points: [22, 85, 38, 60],
          color: '#38bdf8',
          dashed: true,
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },

  {
    id: 'overload-to-isolate',
    name: 'Overload to Isolate (Sirkulasi Sisi Jauh)',
    phase: 'attacking',
    category: 'Menyerang',
    badge: '⚔️',
    shortName: 'Overload & Switch',
    pitchType: 'football',
    instruction: 'Tumpuk 5 pemain di sayap kiri, alirkan bola cepat diagonal ke winger kanan untuk duel 1v1!',
    description: 'Menarik seluruh struktur bertahan lawan ke satu sisi lapangan (overload), lalu memindahkan bola secara cepat (*switch play*) ke pemain sayap sisi berlawanan yang terisolasi dalam situasi 1v1 menguntungkan.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 10, y: 50, rotation: 0 };
            case 4:
              return { ...p, x: 32, y: 38, rotation: 10 };
            case 5:
              return { ...p, x: 34, y: 62, rotation: 355 };
            case 3: // LB pushed high left
              return { ...p, x: 58, y: 16, rotation: 25 };
            case 6: // CDM supporting left
              return { ...p, x: 48, y: 32, rotation: 15 };
            case 8: // CM left half-space on ball
              return { ...p, x: 62, y: 26, rotation: 20 };
            case 11: // LW left overload
              return { ...p, x: 72, y: 14, rotation: 15 };
            case 10: // CAM left pocket
              return { ...p, x: 66, y: 36, rotation: 10 };
            case 9: // ST central pin
              return { ...p, x: 78, y: 44, rotation: 350 };
            case 2: // RB holding balance
              return { ...p, x: 45, y: 76, rotation: 340 };
            case 7: // RW isolated in vast open space!
              return { ...p, x: 72, y: 88, rotation: 330 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team shifted heavily towards their right (Home's left)
          switch (p.number) {
            case 1:
              return { ...p, x: 92, y: 48, rotation: 180 };
            case 2: // LB drawn inwards
              return { ...p, x: 76, y: 16, rotation: 180 };
            case 4: // CB shifted left
              return { ...p, x: 74, y: 28, rotation: 180 };
            case 5: // CB shifted left
              return { ...p, x: 73, y: 44, rotation: 180 };
            case 3: // RB drawn to central space, leaving Home #7 isolated!
              return { ...p, x: 72, y: 68, rotation: 160 };
            case 7: // LM
              return { ...p, x: 62, y: 18, rotation: 190 };
            case 6: // CM
              return { ...p, x: 58, y: 30, rotation: 190 };
            case 8: // CM
              return { ...p, x: 58, y: 46, rotation: 180 };
            case 11: // RM
              return { ...p, x: 58, y: 64, rotation: 170 };
            case 10:
              return { ...p, x: 48, y: 32, rotation: 190 };
            case 9:
              return { ...p, x: 48, y: 46, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 63,
        y: 26,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-diag-switch',
          type: 'pass',
          points: [63, 26, 72, 88],
          color: '#f59e0b',
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },

  // -------------------------------------------------------------
  // 2. TRANSISI DARI PERMAINAN KE BOLA MATI (SEAMLESS SET-PIECE TRANSITION)
  // -------------------------------------------------------------
  {
    id: 'openplay-to-corner',
    name: 'Transisi ke Sepak Pojok (Set-Piece Setup)',
    phase: 'setpiece',
    category: 'Bola Mati',
    badge: '🎯',
    shortName: 'Transisi Corner',
    pitchType: 'football',
    instruction: 'Umpan dibelokkan keluar! Winger melangkah ke sudut, bek tengah naik ke kotak penalti, lawan menata pagar!',
    description: 'Jembatan alami dari permainan terbuka ke bola mati. Menghilangkan loncatan gerakan aneh: penyerang sayap bergeser ke sudut bendera, bek tengah maju teratur menyambut bola, dan lawan bersiap dalam posisi zonal pertahanan.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1: // GK stays back
              return { ...p, x: 12, y: 50, rotation: 0 };
            case 3: // LB rest defense
              return { ...p, x: 44, y: 34, rotation: 10 };
            case 6: // CDM rest defense
              return { ...p, x: 46, y: 64, rotation: 350 };
            case 7: // RW corner taker walking to flag
              return { ...p, x: 99, y: 97, rotation: 315 };
            case 2: // RB supporting short corner
              return { ...p, x: 91, y: 84, rotation: 330 };
            case 8: // CM jogging to near post
              return { ...p, x: 88, y: 62, rotation: 350 };
            case 9: // ST taking position on penalty spot
              return { ...p, x: 87, y: 50, rotation: 0 };
            case 4: // CB advancing from midfield to box
              return { ...p, x: 88, y: 42, rotation: 340 };
            case 5: // CB advancing from midfield to far post
              return { ...p, x: 86, y: 36, rotation: 330 };
            case 10: // CAM at edge of box
              return { ...p, x: 77, y: 50, rotation: 0 };
            case 11: // LW near keeper
              return { ...p, x: 94, y: 48, rotation: 300 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team dropping smoothly into set-piece defense
          switch (p.number) {
            case 1: // GK in goalmouth
              return { ...p, x: 96, y: 50, rotation: 270 };
            case 2: // Zonal near post
              return { ...p, x: 94, y: 62, rotation: 270 };
            case 4: // Zonal center
              return { ...p, x: 94, y: 50, rotation: 270 };
            case 5: // Zonal far post
              return { ...p, x: 94, y: 38, rotation: 270 };
            case 3: // Man marking Home #4
              return { ...p, x: 89, y: 43, rotation: 260 };
            case 6: // Man marking Home #5
              return { ...p, x: 87, y: 37, rotation: 260 };
            case 7: // Marking Home #8
              return { ...p, x: 89, y: 63, rotation: 270 };
            case 8: // Marking Home #9
              return { ...p, x: 88, y: 51, rotation: 270 };
            case 11: // Edge blocker
              return { ...p, x: 79, y: 50, rotation: 270 };
            case 10: // Short corner blocker
              return { ...p, x: 93, y: 84, rotation: 290 };
            case 9: // Lone counter-attack runner waiting at midfield
              return { ...p, x: 50, y: 50, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 99,
        y: 97,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-corner-setup',
          type: 'run',
          points: [62, 88, 99, 97],
          color: '#38bdf8',
          dashed: true,
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },

  {
    id: 'corner-near-post',
    name: 'Sepak Pojok Tiang Dekat (Near-Post Flick)',
    phase: 'setpiece',
    category: 'Bola Mati',
    badge: '🎯',
    shortName: 'Eksekusi Corner',
    pitchType: 'football',
    instruction: 'Sepak pojok melengkung ke tiang dekat! #8 sundul flick ke tiang jauh, 2 bek tengah sambut bola muntah!',
    description: 'Eksekusi skema bola mati terencana: Umpan melengkung ke tiang dekat disundul flick-on oleh nomor 8 mengarah ke tiang jauh yang diserbu para bek berpostur jangkung.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 12, y: 50, rotation: 0 };
            case 3: // Rest defense
              return { ...p, x: 44, y: 34, rotation: 0 };
            case 6: // Rest defense
              return { ...p, x: 46, y: 64, rotation: 0 };
            case 7: // Corner Taker after kicking
              return { ...p, x: 98, y: 96, rotation: 315 };
            case 2: // Short corner decoy
              return { ...p, x: 92, y: 86, rotation: 320 };
            case 8: // Near post flick runner meeting ball!
              return { ...p, x: 93, y: 58, rotation: 340 };
            case 9: // Penalty spot runner
              return { ...p, x: 90, y: 50, rotation: 0 };
            case 4: // Far post attacker rushing in
              return { ...p, x: 95, y: 42, rotation: 330 };
            case 5: // Far post attacker rushing in
              return { ...p, x: 93, y: 36, rotation: 320 };
            case 10: // Edge of box rebound recycler
              return { ...p, x: 78, y: 50, rotation: 0 };
            case 11: // Keeper disturber
              return { ...p, x: 95, y: 50, rotation: 270 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Defending team reacting to ball trajectory
          switch (p.number) {
            case 1: // GK tracking near-post flight
              return { ...p, x: 96, y: 52, rotation: 290 };
            case 2: // Near post defender jumping
              return { ...p, x: 94, y: 60, rotation: 290 };
            case 4: // Central defender
              return { ...p, x: 94, y: 48, rotation: 280 };
            case 5: // Far post defender
              return { ...p, x: 94, y: 38, rotation: 270 };
            case 3: // Tracking #4
              return { ...p, x: 93, y: 43, rotation: 270 };
            case 6: // Tracking #5
              return { ...p, x: 91, y: 37, rotation: 270 };
            case 7: // Challenging #8
              return { ...p, x: 92, y: 60, rotation: 290 };
            case 8: // Tracking #9
              return { ...p, x: 89, y: 51, rotation: 270 };
            case 11: // Edge recycler
              return { ...p, x: 80, y: 50, rotation: 270 };
            case 10: // Blocker
              return { ...p, x: 93, y: 85, rotation: 300 };
            case 9: // Outlet runner
              return { ...p, x: 50, y: 50, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 93,
        y: 58,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-corner-flick',
          type: 'pass',
          points: [93, 58, 95, 42],
          color: '#f59e0b',
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },

  // -------------------------------------------------------------
  // 3. TRANSISI BERTAHAN (DEFENSIVE TRANSITION)
  // -------------------------------------------------------------
  {
    id: 'gegenpress-5s',
    name: 'Gegenpress 5 Detik & Kunci Bola',
    phase: 'trans-defend',
    category: 'Transisi Bertahan',
    badge: '⚡',
    shortName: 'Gegenpress 5s',
    pitchType: 'football',
    instruction: 'BOLA HILANG! 3 pemain terdekat segera kepung perebut bola dalam 5 detik, lini belakang melangkah maju!',
    description: 'Reaksi kilat saat kehilangan penguasaan bola di area serang. Pemain terdekat langsung menutup sudut operan dan menekan pembawa bola lawan sebelum lawan sempat mengarahkan pandangannya ke depan.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 16, y: 50, rotation: 0 }; // high sweeper GK
            case 4:
              return { ...p, x: 40, y: 40, rotation: 10 }; // pushed up to squeeze
            case 5:
              return { ...p, x: 40, y: 60, rotation: 350 };
            case 3:
              return { ...p, x: 46, y: 22, rotation: 15 };
            case 2:
              return { ...p, x: 46, y: 72, rotation: 345 };
            case 6:
              return { ...p, x: 50, y: 45, rotation: 10 };
            case 8: // pressing hound 1
              return { ...p, x: 58, y: 38, rotation: 25 };
            case 9: // pressing hound 2
              return { ...p, x: 63, y: 42, rotation: 220 };
            case 10: // pressing hound 3
              return { ...p, x: 60, y: 52, rotation: 320 };
            case 11:
              return { ...p, x: 58, y: 20, rotation: 15 };
            case 7:
              return { ...p, x: 55, y: 78, rotation: 340 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team won ball at x: 61, y: 42 under severe pressure
          switch (p.number) {
            case 1:
              return { ...p, x: 92, y: 50, rotation: 180 };
            case 4: // Opponent CB who just intercepted ball
              return { ...p, x: 61, y: 42, rotation: 180 };
            case 5: // Away CB dropping deep to support
              return { ...p, x: 74, y: 58, rotation: 180 };
            case 2: // Away LB showing wide
              return { ...p, x: 68, y: 18, rotation: 180 };
            case 3: // Away RB
              return { ...p, x: 72, y: 80, rotation: 175 };
            case 6: // Away CM in cover shadow
              return { ...p, x: 64, y: 50, rotation: 185 };
            case 8: // Away CM
              return { ...p, x: 58, y: 62, rotation: 175 };
            case 7: // Away LM
              return { ...p, x: 50, y: 22, rotation: 180 };
            case 11: // Away RM
              return { ...p, x: 50, y: 78, rotation: 180 };
            case 10: // Away ST preparing counter run
              return { ...p, x: 38, y: 44, rotation: 180 };
            case 9: // Away ST preparing counter run
              return { ...p, x: 38, y: 56, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 61,
        y: 42,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-gp-1',
          type: 'run',
          points: [56, 36, 60, 42],
          color: '#f43f5e',
          dashed: true,
        },
        {
          id: 'draw-gp-2',
          type: 'run',
          points: [65, 43, 62, 44],
          color: '#f43f5e',
          dashed: true,
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },

  {
    id: 'rest-defense-32',
    name: 'Rest-Defense 3+2 (Kunci Ruang Balik)',
    phase: 'trans-defend',
    category: 'Transisi Bertahan',
    badge: '🛡️⚡',
    shortName: 'Rest-Defense 3+2',
    pitchType: 'football',
    instruction: '3 bek sejajar + 2 gelandang pivot mengunci ruang sentral, tahan laju serangan balik penyerang lawan!',
    description: 'Pondasi keamanan saat tim menyerang. Lima pemain (3 bek + 2 pivot) mempertahankan posisi sentral untuk langsung meredam upaya serangan balik kilat lawan ketika bola terlepas.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 12, y: 50, rotation: 0 };
            case 3: // LCB
              return { ...p, x: 36, y: 26, rotation: 0 };
            case 4: // CCB
              return { ...p, x: 33, y: 50, rotation: 0 };
            case 5: // RCB
              return { ...p, x: 36, y: 74, rotation: 0 };
            case 6: // CDM 1
              return { ...p, x: 48, y: 40, rotation: 10 };
            case 2: // Inverted RB / CDM 2
              return { ...p, x: 48, y: 60, rotation: 350 };
            case 8:
              return { ...p, x: 68, y: 32, rotation: 15 };
            case 10:
              return { ...p, x: 68, y: 65, rotation: 345 };
            case 11:
              return { ...p, x: 74, y: 15, rotation: 20 };
            case 7:
              return { ...p, x: 74, y: 85, rotation: 340 };
            case 9:
              return { ...p, x: 80, y: 50, rotation: 0 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team defending in a compact block with 2 counter outlets
          switch (p.number) {
            case 1:
              return { ...p, x: 92, y: 50, rotation: 180 };
            case 2:
              return { ...p, x: 78, y: 18, rotation: 180 };
            case 4:
              return { ...p, x: 76, y: 38, rotation: 180 };
            case 5:
              return { ...p, x: 76, y: 62, rotation: 180 };
            case 3:
              return { ...p, x: 78, y: 82, rotation: 180 };
            case 7:
              return { ...p, x: 65, y: 22, rotation: 180 };
            case 6:
              return { ...p, x: 64, y: 40, rotation: 180 };
            case 8:
              return { ...p, x: 64, y: 60, rotation: 180 };
            case 11:
              return { ...p, x: 65, y: 78, rotation: 180 };
            case 10: // Outlet striker 1
              return { ...p, x: 44, y: 46, rotation: 180 };
            case 9: // Outlet striker 2
              return { ...p, x: 46, y: 62, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 69,
        y: 33,
        rotation: 0,
      };

      return { players: updatedPlayers, ball };
    },
  },

  // -------------------------------------------------------------
  // 4. BERTAHAN (OUT OF POSSESSION)
  // -------------------------------------------------------------
  {
    id: 'low-block-541',
    name: 'Low Block 5-4-1 (Dinding Kotak Penalti)',
    phase: 'defending',
    category: 'Bertahan',
    badge: '🛡️',
    shortName: 'Low Block 5-4-1',
    pitchType: 'football',
    instruction: 'Semua pemain turun di belakang garis bola! Rapatkan kotak penalti, tutup opsi tembakan & sapu crossing!',
    description: 'Struktur bertahan rendah ultra kompak. Membentuk barisan 5 bek tepat di depan garis penalti 16m dan 4 gelandang rapat di depan kotak D, memaksa lawan memutar bola tanpa celah tembak.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1: // GK
              return { ...p, x: 6, y: 50, rotation: 0 };
            // Back 5 line (x: ~16-18)
            case 3: // LWB
              return { ...p, x: 18, y: 16, rotation: 15 };
            case 4: // LCB
              return { ...p, x: 16, y: 33, rotation: 5 };
            case 6: // Sweeper/Central CB
              return { ...p, x: 15, y: 50, rotation: 0 };
            case 5: // RCB
              return { ...p, x: 16, y: 67, rotation: 355 };
            case 2: // RWB
              return { ...p, x: 18, y: 84, rotation: 345 };
            // Midfield 4 line (x: ~26-28)
            case 11: // LM
              return { ...p, x: 28, y: 22, rotation: 10 };
            case 8: // LCM
              return { ...p, x: 26, y: 40, rotation: 5 };
            case 10: // RCM
              return { ...p, x: 26, y: 60, rotation: 355 };
            case 7: // RM
              return { ...p, x: 28, y: 78, rotation: 350 };
            // Lone Striker outlet (x: 42)
            case 9: // ST
              return { ...p, x: 42, y: 50, rotation: 0 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away attacking team in advanced 2-3-5 territorial dominance
          switch (p.number) {
            case 1: // Sweeper keeper
              return { ...p, x: 65, y: 50, rotation: 180 };
            case 4: // CB on halfway line
              return { ...p, x: 46, y: 38, rotation: 180 };
            case 5: // CB on halfway line
              return { ...p, x: 46, y: 62, rotation: 180 };
            case 6: // CDM controlling tempo
              return { ...p, x: 38, y: 50, rotation: 180 };
            case 2: // Fullback high wide
              return { ...p, x: 32, y: 16, rotation: 180 };
            case 3: // Fullback high wide
              return { ...p, x: 32, y: 84, rotation: 180 };
            case 8: // Playmaker left half-space
              return { ...p, x: 30, y: 38, rotation: 180 };
            case 10: // Playmaker right half-space
              return { ...p, x: 30, y: 62, rotation: 180 };
            case 7: // Winger
              return { ...p, x: 22, y: 14, rotation: 180 };
            case 11: // Winger
              return { ...p, x: 22, y: 86, rotation: 180 };
            case 9: // Central striker probing line
              return { ...p, x: 20, y: 50, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 37,
        y: 49,
        rotation: 0,
      };

      return { players: updatedPlayers, ball };
    },
  },

  {
    id: 'high-press-442',
    name: 'High Pressing 4-4-2 (Jebakan Sayap)',
    phase: 'defending',
    category: 'Bertahan',
    badge: '🛡️',
    shortName: 'High Press 4-4-2',
    pitchType: 'football',
    instruction: 'Tutup opsi poros tengah lawan! Paksa mereka oper ke bek sayap, lalu kunci serentak di garis sentuh!',
    description: 'Sistem pressing agresif garis tinggi. Dua striker memotong jalur umpan ke gelandang tengah lawan, memprovokasi operan ke sisi luar lapangan di mana tim melakukan jebakan kolektif.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 20, y: 50, rotation: 0 };
            case 3:
              return { ...p, x: 50, y: 18, rotation: 10 };
            case 4:
              return { ...p, x: 48, y: 38, rotation: 0 };
            case 5:
              return { ...p, x: 48, y: 62, rotation: 0 };
            case 2:
              return { ...p, x: 50, y: 82, rotation: 350 };
            case 11: // LM stepping high
              return { ...p, x: 68, y: 22, rotation: 20 };
            case 6: // CM
              return { ...p, x: 62, y: 38, rotation: 10 };
            case 8: // CM
              return { ...p, x: 62, y: 62, rotation: 350 };
            case 7: // RM stepping high
              return { ...p, x: 68, y: 78, rotation: 340 };
            case 9: // ST 1 cutting pivot
              return { ...p, x: 76, y: 40, rotation: 25 };
            case 10: // ST 2 cutting pivot
              return { ...p, x: 76, y: 60, rotation: 335 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away is build-up team trapped near own box
          switch (p.number) {
            case 1: // GK on 6-yard line
              return { ...p, x: 95, y: 50, rotation: 180 };
            case 4: // Split CB on left box edge
              return { ...p, x: 85, y: 34, rotation: 180 };
            case 5: // Split CB on right box edge
              return { ...p, x: 85, y: 66, rotation: 180 };
            case 2: // LB pushed wide
              return { ...p, x: 80, y: 15, rotation: 180 };
            case 3: // RB pushed wide
              return { ...p, x: 80, y: 85, rotation: 180 };
            case 6: // CDM dropping deep to receive, shadowed
              return { ...p, x: 74, y: 48, rotation: 180 };
            case 8: // CM
              return { ...p, x: 70, y: 60, rotation: 180 };
            case 7: // LM
              return { ...p, x: 58, y: 22, rotation: 180 };
            case 11: // RM
              return { ...p, x: 58, y: 78, rotation: 180 };
            case 9: // ST
              return { ...p, x: 45, y: 44, rotation: 180 };
            case 10: // ST
              return { ...p, x: 45, y: 56, rotation: 180 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 85,
        y: 34,
        rotation: 0,
      };

      return { players: updatedPlayers, ball };
    },
  },

  // -------------------------------------------------------------
  // 5. TRANSISI MENYERANG (ATTACKING TRANSITION)
  // -------------------------------------------------------------
  {
    id: 'counter-attack-direct',
    name: 'Serangan Balik Kilat (Counter-Flank Rush)',
    phase: 'trans-attack',
    category: 'Transisi Menyerang',
    badge: '⚡',
    shortName: 'Counter-Attack',
    pitchType: 'football',
    instruction: 'REBUT BOLA! Segera lepas umpan terobosan vertikal ke penyerang sayap yang sprint di ruang kosong!',
    description: 'Transisi menyerang cepat setelah merebut bola di area pertahanan. Dalam 2-3 sentuhan, bola langsung dialirkan ke belakang garis pertahanan tinggi lawan memanfaatkan kecepatan penyerang sayap.',
    generatePositions: (currentPlayers) => {
      const updatedPlayers = currentPlayers.map((p) => {
        if (p.isBench) return p;

        if (p.team === 'home') {
          switch (p.number) {
            case 1:
              return { ...p, x: 8, y: 50, rotation: 0 };
            case 4:
              return { ...p, x: 22, y: 40, rotation: 0 };
            case 5:
              return { ...p, x: 22, y: 60, rotation: 0 };
            case 3:
              return { ...p, x: 26, y: 18, rotation: 10 };
            case 2:
              return { ...p, x: 26, y: 82, rotation: 350 };
            case 6: // Ball interceptor releasing pass
              return { ...p, x: 34, y: 46, rotation: 20 };
            case 8: // Support runner
              return { ...p, x: 44, y: 35, rotation: 20 };
            case 10: // Central runner
              return { ...p, x: 50, y: 58, rotation: 15 };
            case 9: // ST diagonal sprint
              return { ...p, x: 65, y: 48, rotation: 15 };
            case 11: // LW vertical rocket sprint!
              return { ...p, x: 68, y: 16, rotation: 20 };
            case 7: // RW vertical sprint
              return { ...p, x: 66, y: 84, rotation: 340 };
            default:
              return p;
          }
        } else if (p.team === 'away') {
          // Away team caught in high line turning back frantically
          switch (p.number) {
            case 1: // GK
              return { ...p, x: 88, y: 50, rotation: 180 };
            case 4: // CB turning around and chasing back
              return { ...p, x: 58, y: 38, rotation: 20 };
            case 5: // CB turning around and chasing back
              return { ...p, x: 58, y: 62, rotation: 340 };
            case 2: // LB caught high up
              return { ...p, x: 50, y: 18, rotation: 10 };
            case 3: // RB caught high up
              return { ...p, x: 50, y: 82, rotation: 350 };
            case 6: // CM bypassed
              return { ...p, x: 42, y: 46, rotation: 20 };
            case 8: // CM bypassed
              return { ...p, x: 44, y: 60, rotation: 340 };
            case 7: // LM stranded forward
              return { ...p, x: 32, y: 22, rotation: 45 };
            case 11: // RM stranded forward
              return { ...p, x: 32, y: 78, rotation: 315 };
            case 10: // ST stranded forward
              return { ...p, x: 26, y: 44, rotation: 0 };
            case 9: // ST stranded forward
              return { ...p, x: 26, y: 56, rotation: 0 };
            default:
              return p;
          }
        }
        return p;
      });

      const ball: BallToken = {
        id: 'ball-1',
        x: 35,
        y: 46,
        rotation: 0,
      };

      const drawings: DrawingElement[] = [
        {
          id: 'draw-counter-pass',
          type: 'pass',
          points: [35, 46, 68, 16],
          color: '#f59e0b',
        },
        {
          id: 'draw-counter-run',
          type: 'run',
          points: [50, 18, 70, 16],
          color: '#38bdf8',
          dashed: true,
        },
      ];

      return { players: updatedPlayers, ball, drawings };
    },
  },
];

/**
 * Returns tactical strategies filtered for the specified pitch type (football, mini-soccer, futsal).
 */
export function getTacticalStrategiesForPitch(pitchType: PitchType): TacticalStrategyPreset[] {
  return TACTICAL_STRATEGY_PRESETS.filter((p) => !p.pitchType || p.pitchType === pitchType);
}

export function getTacticalStrategyById(id: string): TacticalStrategyPreset | undefined {
  return TACTICAL_STRATEGY_PRESETS.find((p) => p.id === id);
}

/**
 * Returns user-friendly summary metadata of the master 4-frame tactical cycle for each sport format.
 */
export function getMasterCycleInfoForPitch(pitchType: PitchType = 'football'): {
  title: string;
  flow: string;
  buttonLabel: string;
} {
  switch (pitchType) {
    case 'futsal':
      return {
        title: 'Siklus 4-Frame Futsal (5v5):',
        flow: 'Rotasi 3-1 ➔ Penetrasi Flank ➔ Corner Kick ➔ Pressing 1-2-1',
        buttonLabel: 'Muat & Putar Siklus Futsal ▶',
      };
    case 'mini-soccer':
      return {
        title: 'Siklus 4-Frame Mini Soccer (7v7):',
        flow: 'Build-up 2-3-1 ➔ Penetrasi Sayap ➔ Corner Kick ➔ Mid-Block 3-2-1',
        buttonLabel: 'Muat & Putar Siklus Mini ▶',
      };
    case 'football':
    default:
      return {
        title: 'Siklus 4-Frame Lengkap (11v11):',
        flow: 'Menyerang ➔ Tusukan Sayap ➔ Corner Kick ➔ Rest-Defense 3+2',
        buttonLabel: 'Muat & Putar Siklus Lengkap ▶',
      };
  }
}

/**
 * Creates a master 4-frame tactical cycle specifically adapted to the selected pitch format
 * (futsal: 5v5, mini-soccer: 7v7, football: 11v11).
 * Bench players are preserved on the sideline, and on-field player counts strictly match the game format!
 */
export function createMasterTacticalSequence(pitchType: PitchType = 'football'): TacticalKeyframe[] {
  const baseHome = generateInitialSquad('home', pitchType, undefined, 3);
  const baseAway = generateInitialSquad('away', pitchType, undefined, 3);
  const allInitial = [...baseHome, ...baseAway];

  // 1. FUTSAL 5v5 MASTER SEQUENCE
  if (pitchType === 'futsal') {
    const p1 = getTacticalStrategyById('futsal-rotasi-31')!;
    const pCorner = getTacticalStrategyById('futsal-corner-volley')!;
    const pPress = getTacticalStrategyById('futsal-press-diamond')!;

    const s1 = p1.generatePositions(allInitial, 'futsal');

    // Intermediate frame 2: Ala tusuk ke garis sudut berbuah kick-in / corner
    const s2Players = mapActiveSquadPositions(
      s1.players,
      [
        { x: 7, y: 50, rotation: 0 },
        { x: 34, y: 48, rotation: 10 },
        { x: 88, y: 22, rotation: 30 },
        { x: 50, y: 72, rotation: 345 },
        { x: 84, y: 46, rotation: 0 },
      ],
      [
        { x: 94, y: 46, rotation: 220 },
        { x: 86, y: 38, rotation: 210 },
        { x: 65, y: 25, rotation: 180 },
        { x: 55, y: 68, rotation: 180 },
        { x: 40, y: 48, rotation: 180 },
      ]
    );
    const s2 = {
      players: s2Players,
      ball: { id: 'ball-1', x: 96, y: 20 },
      drawings: [
        {
          id: 'draw-futsal-deflect',
          type: 'pass' as const,
          points: [88, 22, 96, 20],
          color: '#f59e0b',
        },
      ],
    };

    const s3 = pCorner.generatePositions(allInitial, 'futsal');
    const s4 = pPress.generatePositions(allInitial, 'futsal');

    return [
      {
        id: 'frame-seq-futsal-1',
        name: 'Fase 1: Menyerang (Rotasi 3-1 Diamond)',
        phase: 'attacking',
        strategyName: p1.name,
        strategyInstruction: p1.instruction,
        strategyPresetId: p1.id,
        duration: 2.0,
        players: s1.players,
        ball: s1.ball,
        drawings: s1.drawings,
      },
      {
        id: 'frame-seq-futsal-2',
        name: 'Fase 2: Penetrasi Flank ke Garis Sudut',
        phase: 'setpiece',
        strategyName: 'Tusukan Flank Berbuah Corner/Kick-in',
        strategyInstruction: 'Ala menusuk tajam ke garis akhir, tembakan diblok keluar lapangan menghasilkan corner kick!',
        strategyPresetId: 'futsal-corner-volley',
        duration: 2.2,
        players: s2.players,
        ball: s2.ball,
        drawings: s2.drawings,
      },
      {
        id: 'frame-seq-futsal-3',
        name: 'Fase 3: Eksekusi Corner Kick Futsal',
        phase: 'setpiece',
        strategyName: pCorner.name,
        strategyInstruction: pCorner.instruction,
        strategyPresetId: pCorner.id,
        duration: 1.8,
        players: s3.players,
        ball: s3.ball,
        drawings: s3.drawings,
      },
      {
        id: 'frame-seq-futsal-4',
        name: 'Fase 4: Transisi Bertahan (Diamond 1-2-1)',
        phase: 'defending',
        strategyName: pPress.name,
        strategyInstruction: pPress.instruction,
        strategyPresetId: pPress.id,
        duration: 2.0,
        players: s4.players,
        ball: s4.ball,
        drawings: s4.drawings,
      },
    ];
  }

  // 2. MINI SOCCER 7v7 MASTER SEQUENCE
  if (pitchType === 'mini-soccer') {
    const p1 = getTacticalStrategyById('mini-bu-231')!;
    const pCorner = getTacticalStrategyById('mini-corner-farpost')!;
    const pMidblock = getTacticalStrategyById('mini-midblock-321')!;

    const s1 = p1.generatePositions(allInitial, 'mini-soccer');

    // Intermediate frame 2: Tusukan sayap berbuah sepak pojok
    const s2Players = mapActiveSquadPositions(
      s1.players,
      [
        { x: 8, y: 50, rotation: 0 },
        { x: 28, y: 34, rotation: 10 },
        { x: 30, y: 68, rotation: 350 },
        { x: 86, y: 18, rotation: 30 },
        { x: 52, y: 44, rotation: 15 },
        { x: 50, y: 76, rotation: 345 },
        { x: 78, y: 46, rotation: 0 },
      ],
      [
        { x: 94, y: 48, rotation: 220 },
        { x: 86, y: 26, rotation: 220 },
        { x: 80, y: 48, rotation: 180 },
        { x: 82, y: 74, rotation: 180 },
        { x: 62, y: 38, rotation: 180 },
        { x: 60, y: 62, rotation: 180 },
        { x: 40, y: 50, rotation: 180 },
      ]
    );
    const s2 = {
      players: s2Players,
      ball: { id: 'ball-1', x: 96, y: 14 },
      drawings: [
        {
          id: 'draw-mini-deflect',
          type: 'pass' as const,
          points: [86, 18, 96, 14],
          color: '#f59e0b',
        },
      ],
    };

    const s3 = pCorner.generatePositions(allInitial, 'mini-soccer');
    const s4 = pMidblock.generatePositions(allInitial, 'mini-soccer');

    return [
      {
        id: 'frame-seq-mini-1',
        name: 'Fase 1: Menyerang (Build-up 2-3-1)',
        phase: 'attacking',
        strategyName: p1.name,
        strategyInstruction: p1.instruction,
        strategyPresetId: p1.id,
        duration: 2.0,
        players: s1.players,
        ball: s1.ball,
        drawings: s1.drawings,
      },
      {
        id: 'frame-seq-mini-2',
        name: 'Fase 2: Penetrasi Sayap ke Sepak Pojok',
        phase: 'setpiece',
        strategyName: 'Tusukan Sayap Berbuah Sepak Pojok',
        strategyInstruction: 'Umpan terobosan menusuk garis akhir lapangan dihalau bek ke luar berbuah corner kick!',
        strategyPresetId: 'mini-corner-farpost',
        duration: 2.2,
        players: s2.players,
        ball: s2.ball,
        drawings: s2.drawings,
      },
      {
        id: 'frame-seq-mini-3',
        name: 'Fase 3: Eksekusi Sepak Pojok Far-Post',
        phase: 'setpiece',
        strategyName: pCorner.name,
        strategyInstruction: pCorner.instruction,
        strategyPresetId: pCorner.id,
        duration: 1.8,
        players: s3.players,
        ball: s3.ball,
        drawings: s3.drawings,
      },
      {
        id: 'frame-seq-mini-4',
        name: 'Fase 4: Transisi Bertahan (Mid-Block 3-2-1)',
        phase: 'defending',
        strategyName: pMidblock.name,
        strategyInstruction: pMidblock.instruction,
        strategyPresetId: pMidblock.id,
        duration: 2.0,
        players: s4.players,
        ball: s4.ball,
        drawings: s4.drawings,
      },
    ];
  }

  // 3. FOOTBALL 11v11 MASTER SEQUENCE
  const presetAttack = getTacticalStrategyById('build-up-3241')!;
  const presetCornerSetup = getTacticalStrategyById('openplay-to-corner')!;
  const presetCornerKick = getTacticalStrategyById('corner-near-post')!;
  const presetGegenpress = getTacticalStrategyById('gegenpress-5s')!;

  const state1 = presetAttack.generatePositions(allInitial, pitchType);
  const state2 = presetCornerSetup.generatePositions(allInitial, pitchType);
  const state3 = presetCornerKick.generatePositions(allInitial, pitchType);
  const state4 = presetGegenpress.generatePositions(allInitial, pitchType);

  return [
    {
      id: 'frame-seq-1',
      name: 'Fase 1: Menyerang Terbuka',
      phase: 'attacking',
      strategyName: presetAttack.name,
      strategyInstruction: presetAttack.instruction,
      strategyPresetId: presetAttack.id,
      duration: 2.0,
      players: state1.players,
      ball: state1.ball,
      drawings: state1.drawings,
    },
    {
      id: 'frame-seq-2',
      name: 'Fase 2: Transisi ke Bola Mati',
      phase: 'setpiece',
      strategyName: presetCornerSetup.name,
      strategyInstruction: presetCornerSetup.instruction,
      strategyPresetId: presetCornerSetup.id,
      duration: 2.4,
      players: state2.players,
      ball: state2.ball,
      drawings: state2.drawings,
    },
    {
      id: 'frame-seq-3',
      name: 'Fase 3: Eksekusi Sepak Pojok',
      phase: 'setpiece',
      strategyName: presetCornerKick.name,
      strategyInstruction: presetCornerKick.instruction,
      strategyPresetId: presetCornerKick.id,
      duration: 1.8,
      players: state3.players,
      ball: state3.ball,
      drawings: state3.drawings,
    },
    {
      id: 'frame-seq-4',
      name: 'Fase 4: Transisi Bertahan',
      phase: 'trans-defend',
      strategyName: presetGegenpress.name,
      strategyInstruction: presetGegenpress.instruction,
      strategyPresetId: presetGegenpress.id,
      duration: 2.0,
      players: state4.players,
      ball: state4.ball,
      drawings: state4.drawings,
    },
  ];
}
