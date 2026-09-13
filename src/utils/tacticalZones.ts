import { PlayerToken, PitchType, PlayerActionZone } from '../types/tactics';

/**
 * Helper to clamp values within normalized pitch coordinates [0, 100].
 */
function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Helper to create a normalized bounding box.
 */
function makeBounds(x: number, y: number, width: number, height: number, isHome = true) {
  const normW = clamp(width, 10, 35);
  const normH = clamp(height, 10, 40);

  let finalX = x;
  let finalY = y;

  if (!isHome) {
    // Mirror horizontally for away team
    finalX = 100 - (x + normW);
    finalY = 100 - (y + normH);
  }

  return {
    x: clamp(finalX, 1, 99 - normW),
    y: clamp(finalY, 1, 99 - normH),
    width: normW,
    height: normH,
  };
}

/**
 * Generate position-tailored tactical action zones for a given player.
 */
export function getAvailableActionZones(
  player: PlayerToken,
  pitchType: PitchType
): PlayerActionZone[] {
  const isHome = player.team !== 'away';
  const role = (player.role || '').toUpperCase();
  const px = isHome ? player.x : 100 - player.x;
  const py = isHome ? player.y : 100 - player.y;
  const isLeft = py < 50;

  const zones: PlayerActionZone[] = [];

  // 1. BASE OPERATING ZONE (Available for all players)
  zones.push({
    type: 'base',
    label: 'Posisi Dasar',
    bounds: makeBounds(px - 9, py - 11, 18, 22, isHome),
    color: '#10b981', // Emerald
  });

  // FUTSAL SPECIFIC PRESETS
  if (pitchType === 'futsal') {
    zones.push({
      type: 'paralela',
      label: 'Lari Paralela (Garis Samping)',
      bounds: makeBounds(clamp(px + 20, 25, 75), isLeft ? 4 : 76, 20, 20, isHome),
      color: '#f59e0b', // Amber
    });
    zones.push({
      type: 'diagonal',
      label: 'Potong Diagonal 45°',
      bounds: makeBounds(clamp(px + 20, 25, 75), isLeft ? 52 : 28, 20, 20, isHome),
      color: '#06b6d4', // Cyan
    });
    zones.push({
      type: 'cover',
      label: 'Cover Pelapis Fixo',
      bounds: makeBounds(clamp(px - 15, 10, 40), 38, 24, 24, isHome),
      color: '#f43f5e', // Rose
    });
    return zones;
  }

  // GOALKEEPER
  if (player.isGoalkeeper || role === 'GK') {
    zones.push({
      type: 'press',
      label: 'Sweeper Keeper (Keluar Kotak)',
      bounds: makeBounds(18, 36, 18, 28, isHome),
      color: '#38bdf8',
    });
    return zones;
  }

  // FULLBACKS / WINGBACKS (LB, RB, WB, IFB)
  const isFullback =
    role.includes('LB') ||
    role.includes('RB') ||
    role.includes('WB') ||
    role.includes('IFB') ||
    (px < 40 && (py <= 24 || py >= 76));

  if (isFullback) {
    // ⚡ Overlap: Runs high along the touchline
    zones.push({
      type: 'overlap',
      label: 'Overlap Sayap Luar',
      bounds: makeBounds(clamp(px + 28, 45, 82), isLeft ? 2 : 78, 18, 20, isHome),
      color: '#f59e0b', // Amber
    });

    // 🔄 Underlap: Inverted run into the half-space
    zones.push({
      type: 'underlap',
      label: 'Underlap Half-Space',
      bounds: makeBounds(clamp(px + 22, 38, 76), isLeft ? 20 : 60, 20, 20, isHome),
      color: '#38bdf8', // Cyan
    });

    // 🛡️ Cover: Shift inside to protect Center Back
    zones.push({
      type: 'cover',
      label: 'Cover Bek Tengah',
      bounds: makeBounds(clamp(px - 4, 12, 30), isLeft ? 26 : 54, 18, 20, isHome),
      color: '#f43f5e', // Rose
    });

    return zones;
  }

  // CENTER BACKS (CB, BPD)
  const isCenterBack = role.includes('CB') || role.includes('BPD') || (px < 30 && py > 24 && py < 76);
  if (isCenterBack) {
    // 🛡️ Weak-side / Space Cover
    zones.push({
      type: 'cover',
      label: 'Cover Sisi Lemah (Rest Defense)',
      bounds: makeBounds(clamp(px - 5, 8, 26), isLeft ? 48 : 32, 20, 22, isHome),
      color: '#f43f5e', // Rose
    });

    // ⚔️ Step-Out Pressing
    zones.push({
      type: 'press',
      label: 'Step-Out Pressing (Potong Bola)',
      bounds: makeBounds(clamp(px + 16, 26, 48), py - 10, 18, 20, isHome),
      color: '#eab308', // Yellow
    });

    return zones;
  }

  // MIDFIELDERS (DM, CM, B2B, DLP, MEZ)
  const isMidfielder =
    role.includes('DM') ||
    role.includes('CM') ||
    role.includes('B2B') ||
    role.includes('DLP') ||
    role.includes('MEZ') ||
    (px >= 28 && px <= 55 && py >= 20 && py <= 80);

  if (isMidfielder) {
    // 🛡️ Rest Defense Shield (Protect CBs)
    zones.push({
      type: 'cover',
      label: 'Rest Defense Shield (Perisai CB)',
      bounds: makeBounds(clamp(px - 10, 20, 36), 38, 22, 24, isHome),
      color: '#f43f5e', // Rose
    });

    // 🔽 Drop-in (Salida Lavolpiana / Form Back-3)
    zones.push({
      type: 'drop-in',
      label: 'Drop-in Bentuk 3 Bek',
      bounds: makeBounds(14, 40, 18, 20, isHome),
      color: '#8b5cf6', // Purple
    });

    // ⚡ Underlap / Half-Space Pocket
    zones.push({
      type: 'underlap',
      label: 'Tusukan Half-Space Lanjut',
      bounds: makeBounds(clamp(px + 22, 50, 78), isLeft ? 22 : 60, 20, 18, isHome),
      color: '#38bdf8', // Cyan
    });

    return zones;
  }

  // WINGERS & ATTACKING MIDFIELDERS (W, IF, AM, LW, RW)
  const isWingerOrAM =
    role.includes('W') ||
    role.includes('IF') ||
    role.includes('AM') ||
    py <= 22 ||
    py >= 78;

  if (isWingerOrAM) {
    // ↔️ Touchline Width
    zones.push({
      type: 'width',
      label: 'Melebar Garis Sayap (Isolasi)',
      bounds: makeBounds(clamp(px + 10, 50, 85), isLeft ? 2 : 80, 18, 18, isHome),
      color: '#06b6d4', // Cyan
    });

    // ⚡ Cut-Inside
    zones.push({
      type: 'cut-inside',
      label: 'Cut-Inside Kotak Penalti',
      bounds: makeBounds(clamp(px + 18, 65, 88), 38, 18, 24, isHome),
      color: '#a855f7', // Purple
    });

    // ⚡ Channel Run
    zones.push({
      type: 'channel-run',
      label: 'Tusuk Celah Bek (Channel Run)',
      bounds: makeBounds(clamp(px + 20, 68, 88), isLeft ? 24 : 58, 16, 18, isHome),
      color: '#f59e0b', // Amber
    });

    return zones;
  }

  // STRIKERS / FORWARDS (ST, F9)
  // 🎯 Box Finishing
  zones.push({
    type: 'box-finish',
    label: 'Area Kotak Penalti (Finishing)',
    bounds: makeBounds(78, 34, 18, 32, isHome),
    color: '#ef4444', // Red
  });

  // ⚡ Channel Run
  zones.push({
    type: 'channel-run',
    label: 'Tusuk Celah CB-FB (Channel Run)',
    bounds: makeBounds(clamp(px + 14, 68, 88), isLeft ? 24 : 58, 16, 18, isHome),
    color: '#f59e0b', // Amber
  });

  // 🔽 False 9 Drop-off
  zones.push({
    type: 'drop-in',
    label: 'False 9 Drop (Jemput Bola)',
    bounds: makeBounds(clamp(px - 18, 42, 60), 38, 20, 24, isHome),
    color: '#8b5cf6', // Purple
  });

  return zones;
}
