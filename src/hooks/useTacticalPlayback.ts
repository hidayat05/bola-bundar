import { useEffect, useRef } from 'react';
import { useTacticsStore } from '../store/useTacticsStore';
import { PlayerToken, TacticalKeyframe } from '../types/tactics';

// Smooth cubic ease-in-out
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Shortest path angle interpolation (in degrees)
function interpolateAngle(a: number, b: number, t: number): number {
  const diff = (((b - a + 540) % 360) - 180);
  const result = a + diff * t;
  return ((result % 360) + 360) % 360;
}

export function useTacticalPlayback() {
  const {
    frames,
    isPlaying,
    playbackSpeed,
    playbackTargetFrame,
    setPlaybackTargetFrame,
    setIsPlaying,
    setInterpolatedFrame,
    setPlaybackProgress,
    setActiveFrame,
  } = useTacticsStore();

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      setInterpolatedFrame(null);
      setPlaybackProgress(0);
      startTimeRef.current = null;
      return;
    }

    // Calculate segment durations
    // Transition i is between frames[i] and frames[i+1]
    const segmentDurations = frames.slice(0, -1).map((f) => {
      const baseDuration = f.duration || 1.5;
      return (baseDuration / playbackSpeed) * 1000; // in milliseconds
    });

    const totalDuration = segmentDurations.reduce((acc, d) => acc + d, 0);

    // If playbackTargetFrame is specified, determine when animation should conclude
    const currentTargetFrame = useTacticsStore.getState().playbackTargetFrame;
    let targetElapsed = totalDuration;
    if (
      currentTargetFrame !== null &&
      currentTargetFrame > 0 &&
      currentTargetFrame < frames.length
    ) {
      targetElapsed = 0;
      for (let i = 0; i < currentTargetFrame; i++) {
        targetElapsed += segmentDurations[i];
      }
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        let initialElapsed = 0;
        const currentActive = useTacticsStore.getState().activeFrameIndex;
        // If active frame is before the last frame, start playback from current active frame!
        if (currentActive < segmentDurations.length) {
          for (let i = 0; i < currentActive; i++) {
            initialElapsed += segmentDurations[i];
          }
        }
        startTimeRef.current = timestamp - initialElapsed;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= targetElapsed) {
        // Animation reached target frame or finished all frames
        const finalFrameIndex =
          currentTargetFrame !== null ? currentTargetFrame : frames.length - 1;
        setIsPlaying(false);
        setInterpolatedFrame(null);
        setPlaybackProgress(currentTargetFrame !== null ? 1 : Math.min(1, elapsed / totalDuration));
        setActiveFrame(finalFrameIndex);
        setPlaybackTargetFrame(null);
        startTimeRef.current = null;
        return;
      }

      // Find current active transition segment
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

      // Interpolate players
      const interpolatedPlayers: PlayerToken[] = frameA.players.map((pA) => {
        const pB = frameB.players.find((p) => p.id === pA.id);
        if (!pB) return { ...pA };

        const dx = pB.x - pA.x;
        const dy = pB.y - pA.y;
        const moveDist = Math.hypot(dx, dy);

        let startRot = pA.rotation;
        let endRot = pB.rotation;

        // If player moved across the pitch and rotation wasn't manually changed,
        // orient token facing their sprint direction for realistic running visuals!
        if (moveDist > 2.5 && pA.rotation === pB.rotation) {
          const runAngle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          startRot = runAngle;
          endRot = runAngle;
        }

        return {
          ...pA,
          x: pA.x + dx * easedT,
          y: pA.y + dy * easedT,
          rotation: interpolateAngle(startRot, endRot, easedT),
          isBench: rawProgress > 0.5 ? pB.isBench : pA.isBench,
        };
      });

      // Also check for players present in frameB but not frameA
      for (const pB of frameB.players) {
        if (!interpolatedPlayers.some((p) => p.id === pB.id)) {
          interpolatedPlayers.push({ ...pB });
        }
      }

      // Interpolate ball with natural rolling spin
      const ballA = frameA.ball;
      const ballB = frameB.ball;
      const ballDx = ballB.x - ballA.x;
      const ballDy = ballB.y - ballA.y;
      const ballDist = Math.hypot(ballDx, ballDy);

      // Pre-accumulate base spin from earlier segments so transitions are continuous
      let baseSpin = ballA.rotation || 0;
      for (let s = 0; s < segIndex; s++) {
        const b0 = frames[s].ball;
        const b1 = frames[s + 1].ball;
        const dX = b1.x - b0.x;
        const d = Math.hypot(dX, b1.y - b0.y);
        const dir = dX >= 0 ? 1 : -1;
        baseSpin += d * 28 * dir;
      }

      const currentDir = ballDx >= 0 ? 1 : -1;
      const currentSegSpin = ballDist * 28 * currentDir * easedT;
      const ballRotation = ((baseSpin + currentSegSpin) % 360 + 360) % 360;

      // Calculate 3D rolling axis perpendicular to trajectory on the pitch
      const rollAxis: [number, number, number] = ballDist > 0.05
        ? [-ballDy / ballDist, ballDx / ballDist, 0]
        : [0, 1, 0];

      const interpolatedBall = {
        id: ballA.id,
        x: ballA.x + ballDx * easedT,
        y: ballA.y + ballDy * easedT,
        rotation: ballRotation,
        rotationAxis: rollAxis,
      };

      // Set interpolated frame for live canvas rendering
      const activeMeta = rawProgress < 0.5 ? frameA : frameB;
      const currentInterp: TacticalKeyframe = {
        id: `interp-${segIndex}`,
        name: `Tween ${segIndex + 1} -> ${segIndex + 2}`,
        phase: activeMeta.phase,
        strategyName: activeMeta.strategyName,
        strategyInstruction: activeMeta.strategyInstruction,
        strategyPresetId: activeMeta.strategyPresetId,
        players: interpolatedPlayers,
        ball: interpolatedBall,
        drawings: rawProgress < 0.5 ? frameA.drawings : frameB.drawings,
        duration: frameA.duration,
        activeSegmentIndex: segIndex,
        rawProgress: rawProgress,
      };

      setInterpolatedFrame(currentInterp);
      setPlaybackProgress(elapsed / totalDuration);

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [
    isPlaying,
    frames,
    playbackSpeed,
    playbackTargetFrame,
    setPlaybackTargetFrame,
    setIsPlaying,
    setInterpolatedFrame,
    setPlaybackProgress,
    setActiveFrame,
  ]);
}
