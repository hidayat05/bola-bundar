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
  // =============================================================
  // 1. FUTSAL (5 vs 5) PLAYS
  // =============================================================
  if (pitchType === 'futsal') {
    const baseHome = generateInitialSquad('home', 'futsal', 5, 3);
    const baseAway = generateInitialSquad('away', 'futsal', 5, 3);

    const futsalWallPass: TacticalPlayPreset = {
      id: 'futsal-wall-pass',
      name: 'Wall-Pass 1-2 Ala & Pivot',
      subtitle: 'Kombinasi Pantulan Cepat Menembus Pertahanan',
      description: 'Ala kiri mengoper bola ke Pivot, langsung sprint menyelinap di belakang bek lawan menyambut umpan pantul di muka gawang.',
      frames: [
        {
          id: 'f-wp-1',
          name: 'Frame 1: Operan Inisiasi ke Pivot',
          duration: 1.4,
          ball: { id: 'ball-1', x: 44, y: 24 },
          drawings: [
            {
              id: 'd-f-pass-1',
              type: 'pass',
              points: [44, 24, 72, 45],
              color: '#f59e0b',
            },
            {
              id: 'd-f-run-1',
              type: 'run',
              points: [44, 22, 68, 30],
              color: '#38bdf8',
              dashed: true,
            },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 6, y: 50, rotation: 0 }; // GK
              if (idx === 1) return { ...p, x: 26, y: 48, rotation: 10 }; // Fixo
              if (idx === 2) return { ...p, x: 44, y: 22, rotation: 25 }; // Ala L (on ball)
              if (idx === 3) return { ...p, x: 40, y: 78, rotation: 350 }; // Ala R
              if (idx === 4) return { ...p, x: 74, y: 46, rotation: 195 }; // Pivot checks back
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 78, y: 48, rotation: 180 }; // Fixo marking Pivot
              if (idx === 2) return { ...p, x: 50, y: 28, rotation: 200 }; // Ala pressing
              if (idx === 3) return { ...p, x: 46, y: 72, rotation: 160 };
              if (idx === 4) return { ...p, x: 32, y: 48, rotation: 180 };
              return p;
            }),
          ],
        },
        {
          id: 'f-wp-2',
          name: 'Frame 2: Wall-Pass Layoff & Finishing',
          duration: 1.5,
          ball: { id: 'ball-1', x: 80, y: 34 },
          drawings: [],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 30, y: 48, rotation: 10 };
              if (idx === 2) return { ...p, x: 78, y: 34, rotation: 10 }; // Ala receives in stride!
              if (idx === 3) return { ...p, x: 52, y: 74, rotation: 345 };
              if (idx === 4) return { ...p, x: 70, y: 54, rotation: 40 }; // Pivot deflects pass
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 92, y: 42, rotation: 220 }; // GK rushes to angle
              if (idx === 1) return { ...p, x: 76, y: 46, rotation: 180 };
              if (idx === 2) return { ...p, x: 62, y: 32, rotation: 10 }; // beaten on sprint
              if (idx === 3) return { ...p, x: 48, y: 70, rotation: 160 };
              if (idx === 4) return { ...p, x: 34, y: 48, rotation: 180 };
              return p;
            }),
          ],
        },
      ],
    };

    const futsalParalela: TacticalPlayPreset = {
      id: 'futsal-paralela',
      name: 'Paralela Futsal (Sideline Run)',
      subtitle: 'Operan Sejajar Garis Tepi Membongkar Flank',
      description: 'Fixo melepas umpan mendatar menyusur garis tepi lapangan, Ala sprint memotong bek lawan untuk menusuk ke gawang.',
      frames: [
        {
          id: 'f-par-1',
          name: 'Frame 1: Inisiasi Umpan Sejajar Garis',
          duration: 1.4,
          ball: { id: 'ball-1', x: 28, y: 16 },
          drawings: [
            {
              id: 'd-f-par-pass',
              type: 'pass',
              points: [28, 16, 70, 16],
              color: '#f59e0b',
            },
            {
              id: 'd-f-par-run',
              type: 'run',
              points: [46, 26, 72, 18],
              color: '#38bdf8',
              dashed: true,
            },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 6, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 26, y: 18, rotation: 15 }; // Fixo on flank
              if (idx === 2) return { ...p, x: 46, y: 26, rotation: 10 }; // Ala preparing sprint
              if (idx === 3) return { ...p, x: 42, y: 76, rotation: 350 };
              if (idx === 4) return { ...p, x: 66, y: 54, rotation: 0 };
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 76, y: 44, rotation: 180 };
              if (idx === 2) return { ...p, x: 54, y: 22, rotation: 190 }; // Ala out of position
              if (idx === 3) return { ...p, x: 46, y: 70, rotation: 170 };
              if (idx === 4) return { ...p, x: 38, y: 32, rotation: 200 };
              return p;
            }),
          ],
        },
        {
          id: 'f-par-2',
          name: 'Frame 2: Penetrasi Garis & Cut-Inside',
          duration: 1.5,
          ball: { id: 'ball-1', x: 74, y: 18 },
          drawings: [],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 32, y: 22, rotation: 10 };
              if (idx === 2) return { ...p, x: 74, y: 18, rotation: 0 }; // Ala carries ball
              if (idx === 3) return { ...p, x: 50, y: 72, rotation: 350 };
              if (idx === 4) return { ...p, x: 78, y: 48, rotation: 0 }; // Pivot ready for tap-in
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 93, y: 42, rotation: 210 };
              if (idx === 1) return { ...p, x: 80, y: 36, rotation: 220 };
              if (idx === 2) return { ...p, x: 64, y: 22, rotation: 0 };
              if (idx === 3) return { ...p, x: 52, y: 68, rotation: 170 };
              if (idx === 4) return { ...p, x: 40, y: 32, rotation: 190 };
              return p;
            }),
          ],
        },
      ],
    };


    // --- Diagonal Rotation ---
    const futsalDiagonal: TacticalPlayPreset = {
      id: 'futsal-diagonal',
      name: 'Diagonal Futsal (Rotasi 45°)',
      subtitle: 'Gerak Diagonal Membuka Ruang di Antara Dua Bek',
      description: 'Pivot turun menarik bek, Ala masuk secara diagonal ke kotak penalti untuk menerima umpan terobosan fixo.',
      frames: [
        {
          id: 'f-diag-1',
          name: 'Frame 1: Pivot Turun — Ciptakan Ruang',
          duration: 1.3,
          ball: { id: 'ball-1', x: 35, y: 50 },
          drawings: [
            { id: 'd-diag-run1', type: 'run', points: [60, 50, 48, 62], color: '#f59e0b', dashed: true },
            { id: 'd-diag-run2', type: 'run', points: [46, 30, 72, 52], color: '#38bdf8', dashed: true },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 6, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 34, y: 50, rotation: 0 }; // Fixo with ball
              if (idx === 2) return { ...p, x: 46, y: 28, rotation: 30 }; // Ala top
              if (idx === 3) return { ...p, x: 46, y: 72, rotation: 330 }; // Ala bottom
              if (idx === 4) return { ...p, x: 60, y: 50, rotation: 0 }; // Pivot dropping
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 76, y: 38, rotation: 195 };
              if (idx === 2) return { ...p, x: 76, y: 62, rotation: 165 };
              if (idx === 3) return { ...p, x: 55, y: 36, rotation: 200 };
              if (idx === 4) return { ...p, x: 55, y: 64, rotation: 160 };
              return p;
            }),
          ],
        },
        {
          id: 'f-diag-2',
          name: 'Frame 2: Umpan Terobosan Diagonal',
          duration: 1.5,
          ball: { id: 'ball-1', x: 72, y: 52 },
          drawings: [
            { id: 'd-diag-pass', type: 'pass', points: [34, 50, 72, 52], color: '#f59e0b' },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 34, y: 50, rotation: 0 };
              if (idx === 2) return { ...p, x: 58, y: 24, rotation: 20 };
              if (idx === 3) return { ...p, x: 66, y: 72, rotation: 340 };
              if (idx === 4) return { ...p, x: 72, y: 52, rotation: 0 }; // Pivot receives diagonal
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 93, y: 44, rotation: 200 };
              if (idx === 1) return { ...p, x: 80, y: 36, rotation: 200 };
              if (idx === 2) return { ...p, x: 80, y: 64, rotation: 160 };
              if (idx === 3) return { ...p, x: 56, y: 30, rotation: 190 };
              if (idx === 4) return { ...p, x: 56, y: 70, rotation: 170 };
              return p;
            }),
          ],
        },
      ],
    };

    // --- Pisada (Step-over / Dummy Run) ---
    const futsalPisada: TacticalPlayPreset = {
      id: 'futsal-pisada',
      name: 'Pisada Futsal (Step-Over Screen)',
      subtitle: 'Pemain Melintas Bola Membingungkan Pressing Lawan',
      description: 'Fixo maju dan melintas di depan bola tanpa menyentuh (pisada), memancing bek ikut, lalu Ala kiri exploit ruang.',
      frames: [
        {
          id: 'f-pis-1',
          name: 'Frame 1: Pisada Decoy Run',
          duration: 1.2,
          ball: { id: 'ball-1', x: 40, y: 50 },
          drawings: [
            { id: 'd-pis-decoy', type: 'run', points: [55, 44, 44, 56], color: '#a78bfa', dashed: true },
            { id: 'd-pis-ala', type: 'run', points: [40, 72, 70, 54], color: '#38bdf8', dashed: true },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 40, y: 50, rotation: 0 }; // Fixo on ball
              if (idx === 2) return { ...p, x: 55, y: 44, rotation: 35 }; // Pisada runner
              if (idx === 3) return { ...p, x: 40, y: 72, rotation: 345 }; // Ala lurking
              if (idx === 4) return { ...p, x: 68, y: 52, rotation: 0 };
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 93, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 72, y: 44, rotation: 195 };
              if (idx === 2) return { ...p, x: 56, y: 38, rotation: 210 };
              if (idx === 3) return { ...p, x: 52, y: 60, rotation: 165 };
              if (idx === 4) return { ...p, x: 38, y: 44, rotation: 200 };
              return p;
            }),
          ],
        },
        {
          id: 'f-pis-2',
          name: 'Frame 2: Exploit Ruang Post-Pisada',
          duration: 1.4,
          ball: { id: 'ball-1', x: 72, y: 56 },
          drawings: [
            { id: 'd-pis-pass', type: 'pass', points: [40, 50, 72, 56], color: '#f59e0b' },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 8, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 40, y: 50, rotation: 0 };
              if (idx === 2) return { ...p, x: 58, y: 40, rotation: 15 };
              if (idx === 3) return { ...p, x: 72, y: 56, rotation: 0 }; // Ala receives
              if (idx === 4) return { ...p, x: 76, y: 38, rotation: 350 };
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 92, y: 46, rotation: 200 };
              if (idx === 1) return { ...p, x: 78, y: 40, rotation: 210 };
              if (idx === 2) return { ...p, x: 60, y: 36, rotation: 220 };
              if (idx === 3) return { ...p, x: 54, y: 62, rotation: 155 };
              if (idx === 4) return { ...p, x: 40, y: 52, rotation: 185 };
              return p;
            }),
          ],
        },
      ],
    };

    // --- Corta-Luz (Cut the Light — Counter-Pressing Trap) ---
    const futsalCortaLuz: TacticalPlayPreset = {
      id: 'futsal-corta-luz',
      name: 'Corta-Luz Futsal (Pressing Trap)',
      subtitle: 'Pemotong Jalur Cahaya — Pressing Terorganisir 4 Detik',
      description: 'Saat lawan inisiasi build-up, dua pemain memotong jalur umpan (corta-luz) sementara pivot naik menutup GK. Rule 4 detik aktif.',
      frames: [
        {
          id: 'f-cl-1',
          name: 'Frame 1: Trigger Pressing Corta-Luz',
          duration: 1.3,
          ball: { id: 'ball-1', x: 78, y: 50 },
          drawings: [
            { id: 'd-cl-press1', type: 'run', points: [64, 42, 78, 46], color: '#ef4444', dashed: true },
            { id: 'd-cl-press2', type: 'run', points: [64, 58, 78, 54], color: '#ef4444', dashed: true },
            { id: 'd-cl-block', type: 'zone', points: [66, 38, 88, 62], color: '#ef4444', opacity: 0.12 },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 8, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 50, y: 50, rotation: 0 };
              if (idx === 2) return { ...p, x: 64, y: 40, rotation: 15 }; // Cuts luz top
              if (idx === 3) return { ...p, x: 64, y: 60, rotation: 345 }; // Cuts luz bottom
              if (idx === 4) return { ...p, x: 76, y: 28, rotation: 350 }; // Closes GK passing lane
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 93, y: 50, rotation: 180 }; // Away GK
              if (idx === 1) return { ...p, x: 78, y: 50, rotation: 180 }; // Ball carrier (trapped!)
              if (idx === 2) return { ...p, x: 82, y: 32, rotation: 165 };
              if (idx === 3) return { ...p, x: 82, y: 68, rotation: 195 };
              if (idx === 4) return { ...p, x: 60, y: 50, rotation: 180 };
              return p;
            }),
          ],
        },
        {
          id: 'f-cl-2',
          name: 'Frame 2: Intercept & Transisi Cepat',
          duration: 1.5,
          ball: { id: 'ball-1', x: 65, y: 44 },
          drawings: [
            { id: 'd-cl-counter', type: 'pass', points: [65, 44, 84, 48], color: '#10b981' },
            { id: 'd-cl-run', type: 'run', points: [51, 50, 80, 50], color: '#10b981', dashed: true },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 8, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 54, y: 50, rotation: 0 };
              if (idx === 2) return { ...p, x: 65, y: 44, rotation: 5 }; // Intercepts
              if (idx === 3) return { ...p, x: 66, y: 58, rotation: 355 };
              if (idx === 4) return { ...p, x: 80, y: 48, rotation: 0 }; // Free run to goal
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 93, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 80, y: 52, rotation: 180 };
              if (idx === 2) return { ...p, x: 78, y: 34, rotation: 175 };
              if (idx === 3) return { ...p, x: 78, y: 66, rotation: 185 };
              if (idx === 4) return { ...p, x: 58, y: 50, rotation: 175 };
              return p;
            }),
          ],
        },
      ],
    };

    return [futsalWallPass, futsalParalela, futsalDiagonal, futsalPisada, futsalCortaLuz];
  }

  // =============================================================
  // 2. MINI SOCCER (7 vs 7) PLAYS
  // =============================================================
  if (pitchType === 'mini-soccer') {
    const baseHome = generateInitialSquad('home', 'mini-soccer', 7, 3);
    const baseAway = generateInitialSquad('away', 'mini-soccer', 7, 3);

    const miniOverlapPlay: TacticalPlayPreset = {
      id: 'mini-overlap-cutback',
      name: 'Overlap Bek Sayap & Cutback 7v7',
      subtitle: 'Kombinasi Sayap Menghasilkan Peluang Terbuka',
      description: 'Winger kiri menahan bola menarik bek kanan lawan, bek kiri melakukan overlap sprint menyusuri flank luar lalu melepas umpan tarik (cutback) ke Striker.',
      frames: [
        {
          id: 'm-ov-1',
          name: 'Frame 1: Penahanan Bola & Overlap Sprint',
          duration: 1.5,
          ball: { id: 'ball-1', x: 52, y: 22 },
          drawings: [
            {
              id: 'd-m-run-lb',
              type: 'run',
              points: [28, 22, 68, 14],
              color: '#38bdf8',
              dashed: true,
            },
            {
              id: 'd-m-pass-through',
              type: 'pass',
              points: [52, 22, 70, 15],
              color: '#f59e0b',
            },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 26, y: 44, rotation: 15 };
              if (idx === 2) return { ...p, x: 28, y: 22, rotation: 15 }; // LB starting overlap sprint
              if (idx === 3) return { ...p, x: 26, y: 72, rotation: 345 };
              if (idx === 4) return { ...p, x: 42, y: 50, rotation: 10 };
              if (idx === 5) return { ...p, x: 52, y: 22, rotation: 20 }; // Winger holding ball
              if (idx === 6) return { ...p, x: 65, y: 50, rotation: 0 }; // Striker
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 76, y: 48, rotation: 180 };
              if (idx === 2) return { ...p, x: 58, y: 24, rotation: 195 }; // RB engaged on winger
              if (idx === 3) return { ...p, x: 74, y: 74, rotation: 170 };
              if (idx === 4) return { ...p, x: 56, y: 45, rotation: 180 };
              if (idx === 5) return { ...p, x: 54, y: 64, rotation: 175 };
              if (idx === 6) return { ...p, x: 38, y: 50, rotation: 180 };
              return p;
            }),
          ],
        },
        {
          id: 'm-ov-2',
          name: 'Frame 2: Cutback Pass ke Kotak Penalti',
          duration: 1.5,
          ball: { id: 'ball-1', x: 72, y: 16 },
          drawings: [
            {
              id: 'd-m-cutback',
              type: 'pass',
              points: [72, 16, 78, 48],
              color: '#f59e0b',
            },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 8, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 30, y: 45, rotation: 10 };
              if (idx === 2) return { ...p, x: 72, y: 16, rotation: 10 }; // LB crosses ball
              if (idx === 3) return { ...p, x: 30, y: 70, rotation: 350 };
              if (idx === 4) return { ...p, x: 54, y: 44, rotation: 15 };
              if (idx === 5) return { ...p, x: 58, y: 26, rotation: 15 };
              if (idx === 6) return { ...p, x: 76, y: 48, rotation: 0 }; // Striker finishing
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 46, rotation: 220 };
              if (idx === 1) return { ...p, x: 78, y: 46, rotation: 180 };
              if (idx === 2) return { ...p, x: 68, y: 24, rotation: 0 };
              if (idx === 3) return { ...p, x: 76, y: 72, rotation: 170 };
              if (idx === 4) return { ...p, x: 60, y: 42, rotation: 180 };
              if (idx === 5) return { ...p, x: 56, y: 62, rotation: 175 };
              if (idx === 6) return { ...p, x: 40, y: 50, rotation: 180 };
              return p;
            }),
          ],
        },
      ],
    };

    const miniTriangleCombo: TacticalPlayPreset = {
      id: 'mini-triangle-combo',
      name: 'Kombinasi Segitiga Cepat (Triangle 1-2)',
      subtitle: 'Sirkulasi Segitiga Lini Tengah',
      description: 'CDM, CM, dan ST saling bertukar operan cepat satu-dua membongkar blok pertahanan tengah lawan.',
      frames: [
        {
          id: 'm-tri-1',
          name: 'Frame 1: Operan Segitiga Pertama',
          duration: 1.4,
          ball: { id: 'ball-1', x: 36, y: 44 },
          drawings: [
            {
              id: 'd-tri-1',
              type: 'pass',
              points: [36, 44, 48, 54],
              color: '#f59e0b',
            },
          ],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 22, y: 34, rotation: 10 };
              if (idx === 2) return { ...p, x: 22, y: 66, rotation: 350 };
              if (idx === 3) return { ...p, x: 36, y: 44, rotation: 15 }; // Passer
              if (idx === 4) return { ...p, x: 48, y: 54, rotation: 195 }; // Receiver
              if (idx === 5) return { ...p, x: 46, y: 22, rotation: 15 };
              if (idx === 6) return { ...p, x: 66, y: 46, rotation: 0 };
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 94, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 74, y: 50, rotation: 180 };
              if (idx === 2) return { ...p, x: 74, y: 26, rotation: 180 };
              if (idx === 3) return { ...p, x: 74, y: 74, rotation: 180 };
              if (idx === 4) return { ...p, x: 54, y: 44, rotation: 180 };
              if (idx === 5) return { ...p, x: 54, y: 60, rotation: 180 };
              if (idx === 6) return { ...p, x: 38, y: 50, rotation: 180 };
              return p;
            }),
          ],
        },
        {
          id: 'm-tri-2',
          name: 'Frame 2: Through Ball Penetrasi',
          duration: 1.5,
          ball: { id: 'ball-1', x: 68, y: 48 },
          drawings: [],
          players: [
            ...baseHome.map((p, idx) => {
              if (idx === 0) return { ...p, x: 7, y: 50, rotation: 0 };
              if (idx === 1) return { ...p, x: 24, y: 34, rotation: 10 };
              if (idx === 2) return { ...p, x: 24, y: 66, rotation: 350 };
              if (idx === 3) return { ...p, x: 44, y: 46, rotation: 15 };
              if (idx === 4) return { ...p, x: 52, y: 52, rotation: 10 };
              if (idx === 5) return { ...p, x: 54, y: 24, rotation: 20 };
              if (idx === 6) return { ...p, x: 68, y: 48, rotation: 0 }; // Striker receives
              return p;
            }),
            ...baseAway.map((p, idx) => {
              if (idx === 0) return { ...p, x: 92, y: 50, rotation: 180 };
              if (idx === 1) return { ...p, x: 72, y: 50, rotation: 180 };
              if (idx === 2) return { ...p, x: 74, y: 26, rotation: 180 };
              if (idx === 3) return { ...p, x: 74, y: 74, rotation: 180 };
              if (idx === 4) return { ...p, x: 56, y: 44, rotation: 180 };
              if (idx === 5) return { ...p, x: 56, y: 60, rotation: 180 };
              if (idx === 6) return { ...p, x: 40, y: 50, rotation: 180 };
              return p;
            }),
          ],
        },
      ],
    };

    return [miniOverlapPlay, miniTriangleCombo];
  }

  // =============================================================
  // 3. FOOTBALL (11 vs 11) PLAYS
  // =============================================================
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
