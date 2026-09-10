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

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= totalDuration) {
        // Animation finished
        setIsPlaying(false);
        setInterpolatedFrame(null);
        setPlaybackProgress(1);
        setActiveFrame(frames.length - 1);
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
        if (elapsed <= accumulated + d) {
          segIndex = i;
          segDuration = d;
          segLocalTime = elapsed - accumulated;
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

        return {
          ...pA,
          x: pA.x + (pB.x - pA.x) * easedT,
          y: pA.y + (pB.y - pA.y) * easedT,
          rotation: interpolateAngle(pA.rotation, pB.rotation, easedT),
          isBench: rawProgress > 0.5 ? pB.isBench : pA.isBench,
        };
      });

      // Also check for players present in frameB but not frameA
      for (const pB of frameB.players) {
        if (!interpolatedPlayers.some((p) => p.id === pB.id)) {
          interpolatedPlayers.push({ ...pB });
        }
      }

      // Interpolate ball
      const ballA = frameA.ball;
      const ballB = frameB.ball;
      const interpolatedBall = {
        id: ballA.id,
        x: ballA.x + (ballB.x - ballA.x) * easedT,
        y: ballA.y + (ballB.y - ballA.y) * easedT,
      };

      // Set interpolated frame for live canvas rendering
      const currentInterp: TacticalKeyframe = {
        id: `interp-${segIndex}`,
        name: `Tween ${segIndex + 1} -> ${segIndex + 2}`,
        players: interpolatedPlayers,
        ball: interpolatedBall,
        drawings: rawProgress < 0.5 ? frameA.drawings : frameB.drawings,
        duration: frameA.duration,
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
    setIsPlaying,
    setInterpolatedFrame,
    setPlaybackProgress,
    setActiveFrame,
  ]);
}
