import { PlayerToken, TacticalKeyframe } from '../types/tactics';

// Smooth cubic ease-in-out
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Shortest path angle interpolation (in degrees)
export function interpolateAngle(a: number, b: number, t: number): number {
  const diff = (((b - a + 540) % 360) - 180);
  const result = a + diff * t;
  return ((result % 360) + 360) % 360;
}

// Total duration in seconds across all segments
export function getTotalAnimationDuration(frames: TacticalKeyframe[]): number {
  if (!frames || frames.length <= 1) return 0;
  return frames.slice(0, -1).reduce((acc, f) => acc + (f.duration || 1.5), 0);
}

/**
 * Compute an interpolated keyframe for any arbitrary progress [0, 1].
 * Supports staggered runs (player.delay), ball 3D spin, and lofted pass arcs.
 */
export function computeInterpolatedFrame(
  frames: TacticalKeyframe[],
  progress: number
): TacticalKeyframe | null {
  if (!frames || frames.length === 0) return null;
  if (frames.length === 1) return frames[0];

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const segmentDurations = frames.slice(0, -1).map((f) => (f.duration || 1.5) * 1000);
  const totalDuration = segmentDurations.reduce((acc, d) => acc + d, 0);

  if (totalDuration <= 0) return frames[0];

  const elapsed = clampedProgress * totalDuration;

  let accumulated = 0;
  let segIndex = 0;
  let segLocalTime = 0;
  let segDuration = segmentDurations[0];

  for (let i = 0; i < segmentDurations.length; i++) {
    const d = segmentDurations[i];
    if (elapsed < accumulated + d || i === segmentDurations.length - 1) {
      segIndex = i;
      segDuration = d;
      segLocalTime = Math.max(0, elapsed - accumulated);
      break;
    }
    accumulated += d;
  }

  const rawProgress = Math.min(1, Math.max(0, segLocalTime / segDuration));
  const easedT = easeInOutCubic(rawProgress);

  const frameA = frames[segIndex];
  const frameB = frames[segIndex + 1];

  // Interpolate players with staggered timing
  const interpolatedPlayers: PlayerToken[] = frameA.players.map((pA) => {
    const pB = frameB.players.find((p) => p.id === pA.id);
    if (!pB) return { ...pA };

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const moveDist = Math.hypot(dx, dy);

    // Staggered / Sequenced Run: compute individual player progress if delay is set
    const playerDelayMs = Math.max(0, (pA.delay || 0) * 1000);
    let playerEasedT = easedT;
    if (playerDelayMs > 0 && segDuration > playerDelayMs) {
      if (segLocalTime < playerDelayMs) {
        playerEasedT = 0; // Has not started running yet
      } else {
        const playerLocalProgress = Math.min(
          1,
          Math.max(0, (segLocalTime - playerDelayMs) / (segDuration - playerDelayMs))
        );
        playerEasedT = easeInOutCubic(playerLocalProgress);
      }
    }

    let startRot = pA.rotation;
    let endRot = pB.rotation;

    if (moveDist > 2.5 && pA.rotation === pB.rotation) {
      const runAngle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      startRot = runAngle;
      endRot = runAngle;
    }

    return {
      ...pA,
      x: pA.x + dx * playerEasedT,
      y: pA.y + dy * playerEasedT,
      rotation: interpolateAngle(startRot, endRot, playerEasedT),
      isBench: rawProgress > 0.5 ? pB.isBench : pA.isBench,
    };
  });

  for (const pB of frameB.players) {
    if (!interpolatedPlayers.some((p) => p.id === pB.id)) {
      interpolatedPlayers.push({ ...pB });
    }
  }

  // Interpolate ball with 3D rolling spin
  const ballA = frameA.ball;
  const ballB = frameB.ball;
  const ballDx = ballB.x - ballA.x;
  const ballDy = ballB.y - ballA.y;
  const ballDist = Math.hypot(ballDx, ballDy);

  let baseSpin = frames[0]?.ball?.rotation || 0;
  for (let s = 0; s < segIndex; s++) {
    const b0 = frames[s].ball;
    const b1 = frames[s + 1].ball;
    const d = Math.hypot(b1.x - b0.x, b1.y - b0.y);
    baseSpin += d * 38;
  }

  const currentSegSpin = ballDist * 38 * easedT;
  const ballRotation = ((baseSpin + currentSegSpin) % 360 + 360) % 360;

  const rollAxis: [number, number, number] = ballDist > 0.05
    ? [-ballDy / ballDist, ballDx / ballDist, 0]
    : (ballA.rotationAxis || [0, 1, 0]);

  // 3D Lofted Pass elevation arc
  const hasLoftedDrawing = frameA.drawings?.some((d) => d.type === 'lofted-pass');
  const isLongAirPass = ballDist > 38;
  const isLofted = hasLoftedDrawing || isLongAirPass;
  const passElevation = isLofted ? Math.sin(rawProgress * Math.PI) : 0;

  const interpolatedBall = {
    id: ballA.id,
    x: ballA.x + ballDx * easedT,
    y: ballA.y + ballDy * easedT,
    rotation: ballRotation,
    rotationAxis: rollAxis,
    elevation: passElevation,
  };

  return {
    ...frameA,
    name: `Playback: ${frameA.name} → ${frameB.name}`,
    players: interpolatedPlayers,
    ball: interpolatedBall,
    activeSegmentIndex: segIndex,
    rawProgress,
  };
}
