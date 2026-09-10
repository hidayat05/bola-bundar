import { TacticalKeyframe, PitchType } from '../types/tactics';
import { generateInitialSquad } from './formations';

export interface TacticalPlayPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  frames: TacticalKeyframe[];
}

export function getTacticalPlayPresets(pitchType: PitchType): TacticalPlayPreset[] {
  if (pitchType !== 'football') {
    return [];
  }

  const baseHome = generateInitialSquad('home', 'football', 11, 3);
  const baseAway = generateInitialSquad('away', 'football', 11, 3);

  // 1. Give and Go (One-Two Wall Pass)
  const giveAndGoPlay: TacticalPlayPreset = {
    id: 'give-and-go',
    name: 'Give & Go (One-Two Pass)',
    subtitle: 'Kombinasi Umpan 1-2 Cepat & Sprint Menembus Bek',
    description:
      'Gelandang No. 8 mengoper ke Striker No. 9, langsung sprint mengejar ruang kosong, dan menerima bola pantulan terobosan di kotak penalti.',
    frames: [
      {
        id: 'gng-frame-1',
        name: 'Frame 1: Inisiasi & Penjemputan',
        duration: 1.5,
        ball: { id: 'ball-1', x: 38, y: 34 },
        drawings: [
          {
            id: 'draw-pass-1',
            type: 'pass',
            points: [38, 34, 52, 45],
            color: '#f59e0b',
          },
          {
            id: 'draw-run-1',
            type: 'run',
            points: [36, 32, 54, 38],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 8) return { ...p, x: 36, y: 32, rotation: 15 };
            if (p.number === 9) return { ...p, x: 55, y: 48, rotation: 195 }; // check back toward ball
            if (p.number === 7) return { ...p, x: 48, y: 86, rotation: 0 }; // pull wide
            if (p.number === 10) return { ...p, x: 42, y: 65, rotation: 20 };
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 4) return { ...p, x: 62, y: 42, rotation: 180 };
            if (p.number === 5) return { ...p, x: 60, y: 56, rotation: 180 };
            return p;
          }),
        ],
      },
      {
        id: 'gng-frame-2',
        name: 'Frame 2: Umpan Kaki & Sprint Lari',
        duration: 1.3,
        ball: { id: 'ball-1', x: 52, y: 46 }, // ball arrives at ST #9
        drawings: [
          {
            id: 'draw-pass-2',
            type: 'pass',
            points: [52, 46, 68, 40],
            color: '#f59e0b',
          },
          {
            id: 'draw-run-2',
            type: 'run',
            points: [54, 38, 70, 41],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 8) return { ...p, x: 54, y: 38, rotation: 10 }; // sprinting past CB
            if (p.number === 9) return { ...p, x: 51, y: 46, rotation: 180 }; // receives ball, prepares 1-touch
            if (p.number === 7) return { ...p, x: 58, y: 88, rotation: 10 };
            if (p.number === 10) return { ...p, x: 52, y: 62, rotation: 15 };
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 4) return { ...p, x: 57, y: 44, rotation: 200 }; // drawn out to press #9
            if (p.number === 5) return { ...p, x: 64, y: 55, rotation: 160 };
            return p;
          }),
        ],
      },
      {
        id: 'gng-frame-3',
        name: 'Frame 3: Through Ball & Finishing',
        duration: 1.4,
        ball: { id: 'ball-1', x: 72, y: 41 }, // through ball into box
        drawings: [],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 8) return { ...p, x: 70, y: 41, rotation: 0 }; // meets through ball to strike
            if (p.number === 9) return { ...p, x: 56, y: 47, rotation: 20 }; // follows into box
            if (p.number === 7) return { ...p, x: 68, y: 82, rotation: 340 };
            if (p.number === 10) return { ...p, x: 60, y: 58, rotation: 15 };
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 4) return { ...p, x: 61, y: 42, rotation: 0 }; // beaten defender turning around
            if (p.number === 5) return { ...p, x: 68, y: 50, rotation: 270 }; // scrambling
            if (p.number === 1) return { ...p, x: 86, y: 48, rotation: 190 }; // keeper closing down
            return p;
          }),
        ],
      },
    ],
  };

  // 2. Overlapping Fullback & Box Cross
  const overlapPlay: TacticalPlayPreset = {
    id: 'overlap-cross',
    name: 'Overlapping Wing Play & Cross',
    subtitle: 'Winger Cut-Inside, Bek Sayap Sprint Overlap & Umpan Silang',
    description:
      'Winger No. 7 menggiring bola ke dalam menarik perhatian bek, Bek Sayap No. 2 melakukan overlap menyisir sayap untuk melepas umpan silang ke kotak penalti.',
    frames: [
      {
        id: 'overlap-frame-1',
        name: 'Frame 1: Isolasi Sayap & Mulai Overlap',
        duration: 1.5,
        ball: { id: 'ball-1', x: 50, y: 84 },
        drawings: [
          {
            id: 'draw-dribble-1',
            type: 'dribble',
            points: [50, 84, 60, 72],
            color: '#f59e0b',
          },
          {
            id: 'draw-run-overlap',
            type: 'run',
            points: [30, 86, 68, 88],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 7) return { ...p, x: 48, y: 83, rotation: 350 };
            if (p.number === 2) return { ...p, x: 30, y: 86, rotation: 0 }; // initiating sprint
            if (p.number === 9) return { ...p, x: 54, y: 48, rotation: 10 };
            if (p.number === 11) return { ...p, x: 50, y: 22, rotation: 10 };
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 3) return { ...p, x: 58, y: 82, rotation: 180 }; // LB defending winger
            if (p.number === 5) return { ...p, x: 68, y: 60, rotation: 180 };
            return p;
          }),
        ],
      },
      {
        id: 'overlap-frame-2',
        name: 'Frame 2: Cut-Inside & Sprint Membuka Ruang',
        duration: 1.4,
        ball: { id: 'ball-1', x: 60, y: 72 }, // winger dribbles inside
        drawings: [
          {
            id: 'draw-pass-overlap',
            type: 'pass',
            points: [60, 72, 75, 87],
            color: '#f59e0b',
          },
          {
            id: 'draw-box-run-9',
            type: 'run',
            points: [54, 48, 76, 44],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 7) return { ...p, x: 58, y: 72, rotation: 320 }; // commits defender inside
            if (p.number === 2) return { ...p, x: 56, y: 87, rotation: 0 }; // sprinting past on outside!
            if (p.number === 9) return { ...p, x: 65, y: 46, rotation: 10 }; // making near-post run
            if (p.number === 11) return { ...p, x: 62, y: 26, rotation: 20 }; // far post arrival
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 3) return { ...p, x: 62, y: 74, rotation: 210 }; // pulled inside
            if (p.number === 5) return { ...p, x: 70, y: 55, rotation: 180 };
            return p;
          }),
        ],
      },
      {
        id: 'overlap-frame-3',
        name: 'Frame 3: Through Ball ke Sayap & Crossing',
        duration: 1.5,
        ball: { id: 'ball-1', x: 78, y: 86 }, // ball at fullback's feet ready to cross
        drawings: [
          {
            id: 'draw-cross-pass',
            type: 'pass',
            points: [78, 86, 80, 48],
            color: '#f59e0b',
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 7) return { ...p, x: 64, y: 68, rotation: 330 };
            if (p.number === 2) return { ...p, x: 76, y: 86, rotation: 270 }; // receives through ball, crossing
            if (p.number === 9) return { ...p, x: 79, y: 46, rotation: 340 }; // arrives in 6-yard box
            if (p.number === 11) return { ...p, x: 76, y: 32, rotation: 350 }; // far post tap-in position
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 3) return { ...p, x: 68, y: 76, rotation: 300 }; // tracking back late
            if (p.number === 5) return { ...p, x: 78, y: 54, rotation: 280 };
            if (p.number === 4) return { ...p, x: 76, y: 40, rotation: 270 };
            return p;
          }),
        ],
      },
    ],
  };

  // 3. Third-Man Run (Build-Up Combination)
  const thirdManPlay: TacticalPlayPreset = {
    id: 'third-man',
    name: 'Third-Man Run (Tiki-Taka Build-Up)',
    subtitle: 'Pancing Pressing Lawan, Wall-Pass & Umpan Terobosan Tajam',
    description:
      'Bek No. 4 oper vertikal ke Midfielder No. 6, lalu dipantulkan ke Pemain Ketiga (No. 10) yang langsung mengirim umpan terobosan ke jalur sprint sayap No. 11.',
    frames: [
      {
        id: 'tm-frame-1',
        name: 'Frame 1: Memancing Pressing & Buka Opsi',
        duration: 1.5,
        ball: { id: 'ball-1', x: 26, y: 40 },
        drawings: [
          {
            id: 'draw-pass-tm1',
            type: 'pass',
            points: [26, 40, 38, 48],
            color: '#f59e0b',
          },
          {
            id: 'draw-run-tm-wing',
            type: 'run',
            points: [44, 16, 65, 18],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 4) return { ...p, x: 24, y: 40, rotation: 25 }; // CB on ball
            if (p.number === 6) return { ...p, x: 38, y: 50, rotation: 190 }; // DM checks deep
            if (p.number === 10) return { ...p, x: 42, y: 68, rotation: 340 }; // AM finding pocket
            if (p.number === 11) return { ...p, x: 44, y: 16, rotation: 0 }; // LW preparing blindside sprint
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 9) return { ...p, x: 34, y: 42, rotation: 195 }; // ST pressing CB
            if (p.number === 10) return { ...p, x: 46, y: 52, rotation: 190 }; // AM stepping up to press DM
            return p;
          }),
        ],
      },
      {
        id: 'tm-frame-2',
        name: 'Frame 2: Wall Pass ke Pemain Ketiga (#10)',
        duration: 1.3,
        ball: { id: 'ball-1', x: 48, y: 66 }, // passed from #6 to #10 (third man)
        drawings: [
          {
            id: 'draw-killer-pass',
            type: 'pass',
            points: [48, 66, 72, 22],
            color: '#f59e0b',
          },
          {
            id: 'draw-sprint-wing',
            type: 'run',
            points: [56, 17, 74, 23],
            color: '#38bdf8',
            dashed: true,
          },
        ],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 4) return { ...p, x: 28, y: 41, rotation: 10 };
            if (p.number === 6) return { ...p, x: 38, y: 49, rotation: 50 }; // 1-touch deflection
            if (p.number === 10) return { ...p, x: 46, y: 66, rotation: 320 }; // the third man receives facing forward!
            if (p.number === 11) return { ...p, x: 58, y: 17, rotation: 10 }; // sprinting past high defensive line
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 9) return { ...p, x: 36, y: 44, rotation: 180 };
            if (p.number === 10) return { ...p, x: 44, y: 52, rotation: 160 }; // bypassed!
            if (p.number === 2) return { ...p, x: 58, y: 22, rotation: 180 }; // RB caught flat-footed
            return p;
          }),
        ],
      },
      {
        id: 'tm-frame-3',
        name: 'Frame 3: Killer Through Ball ke Ruang Kosong',
        duration: 1.5,
        ball: { id: 'ball-1', x: 74, y: 24 }, // through ball meets sprinting winger in stride!
        drawings: [],
        players: [
          ...baseHome.map((p) => {
            if (p.number === 10) return { ...p, x: 50, y: 64, rotation: 320 };
            if (p.number === 11) return { ...p, x: 72, y: 24, rotation: 0 }; // 1-on-1 on the run!
            if (p.number === 9) return { ...p, x: 68, y: 46, rotation: 10 }; // box support
            return p;
          }),
          ...baseAway.map((p) => {
            if (p.number === 2) return { ...p, x: 66, y: 25, rotation: 350 }; // chasing desperately
            if (p.number === 4) return { ...p, x: 72, y: 38, rotation: 320 };
            if (p.number === 1) return { ...p, x: 86, y: 36, rotation: 220 }; // GK rushing out
            return p;
          }),
        ],
      },
    ],
  };

  return [giveAndGoPlay, overlapPlay, thirdManPlay];
}
