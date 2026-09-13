import { describe, it, expect } from 'vitest';
import {
  easeInOutCubic,
  interpolateAngle,
  getTotalAnimationDuration,
  computeInterpolatedFrame,
} from './interpolation';
import { TacticalKeyframe } from '../types/tactics';

describe('interpolation utils', () => {
  it('eases in and out monotonically from 0 to 1', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('interpolates angles along the shortest arc', () => {
    // 350 to 10 should cross 0 (diff is +20, halfway is 0)
    const midAngle = interpolateAngle(350, 10, 0.5);
    expect(midAngle).toBeCloseTo(0);
  });

  it('calculates total animation duration', () => {
    const frames: TacticalKeyframe[] = [
      { id: '1', name: 'F1', players: [], ball: { id: 'b', x: 0, y: 0 }, duration: 2.0 },
      { id: '2', name: 'F2', players: [], ball: { id: 'b', x: 10, y: 10 }, duration: 3.0 },
      { id: '3', name: 'F3', players: [], ball: { id: 'b', x: 20, y: 20 }, duration: 1.5 },
    ];
    // 2 segments: 2.0 + 3.0 = 5.0
    expect(getTotalAnimationDuration(frames)).toBe(5.0);
  });

  it('computes interpolated player positions at progress 0.5', () => {
    const frames: TacticalKeyframe[] = [
      {
        id: '1',
        name: 'F1',
        players: [{ id: 'p1', team: 'home', number: 9, name: 'ST', x: 20, y: 40, rotation: 0, isBench: false }],
        ball: { id: 'b', x: 20, y: 40 },
        duration: 2.0,
      },
      {
        id: '2',
        name: 'F2',
        players: [{ id: 'p1', team: 'home', number: 9, name: 'ST', x: 60, y: 80, rotation: 180, isBench: false }],
        ball: { id: 'b', x: 60, y: 80 },
        duration: 2.0,
      },
    ];

    const result = computeInterpolatedFrame(frames, 0.5);
    expect(result).not.toBeNull();
    const p = result!.players[0];
    expect(p.x).toBeCloseTo(40, 0); // halfway between 20 and 60
    expect(p.y).toBeCloseTo(60, 0); // halfway between 40 and 80
  });

  it('respects player start delay for staggered runs', () => {
    const frames: TacticalKeyframe[] = [
      {
        id: '1',
        name: 'F1',
        players: [{ id: 'p1', team: 'home', number: 9, name: 'ST', x: 20, y: 40, rotation: 0, isBench: false, delay: 1.0 }],
        ball: { id: 'b', x: 20, y: 40 },
        duration: 2.0,
      },
      {
        id: '2',
        name: 'F2',
        players: [{ id: 'p1', team: 'home', number: 9, name: 'ST', x: 60, y: 80, rotation: 0, isBench: false }],
        ball: { id: 'b', x: 60, y: 80 },
        duration: 2.0,
      },
    ];

    // At progress 0.25 (elapsed = 0.5s, delay is 1.0s), player hasn't started yet!
    const earlyResult = computeInterpolatedFrame(frames, 0.25);
    expect(earlyResult!.players[0].x).toBe(20);
    expect(earlyResult!.players[0].y).toBe(40);
  });
});
